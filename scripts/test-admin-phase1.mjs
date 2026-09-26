import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { sanitizeManagedHtml } from "../src/worker.js";

const root=new URL("..",import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/,value=>value.slice(1));
const wrangler=join(root,"node_modules","wrangler","bin","wrangler.js");
const state=await mkdtemp(join(tmpdir(),"portal-phase1-"));
const port=8797;
const origin=`http://127.0.0.1:${port}`;
let worker;

function run(args){
  const result=spawnSync(process.execPath,[wrangler,...args],{cwd:root,encoding:"utf8"});
  if(result.status!==0)throw new Error(`${result.stdout}\n${result.stderr}`);
  return result.stdout;
}
function hash(value){return createHash("sha256").update(value).digest("base64url")}
async function waitForWorker(){
  for(let i=0;i<60;i++){
    try{const response=await fetch(`${origin}/api/navigation`);if(response.ok)return}catch{}
    await new Promise(resolve=>setTimeout(resolve,250));
  }
  throw new Error("Isolated Worker did not become ready.");
}
async function api(path,{token,method="GET",body}={}){
  return fetch(`${origin}${path}`,{method,headers:{Accept:"application/json",...(body?{"Content-Type":"application/json",Origin:origin}:{}),...(token?{Cookie:`portal_session=${token}`}:{})},body:body?JSON.stringify(body):undefined});
}

try{
  run(["d1","migrations","apply","architecting-ai-portal","--local","--persist-to",state]);
  const adminToken="phase1-admin-session";
  const editorToken="phase1-editor-session";
  const sql=`
    INSERT INTO users(name,email,password_hash,password_salt,role,status) VALUES('Phase 1 Admin','phase1-breakglass@example.test','x','x','admin','active');
    INSERT INTO users(name,email,password_hash,password_salt,role,status) VALUES('Phase 1 Editor','phase1-editor@example.test','x','x','member','active');
    INSERT INTO sessions(user_id,token_hash,expires_at) SELECT id,'${hash(adminToken)}',datetime('now','+1 day') FROM users WHERE email='phase1-breakglass@example.test';
    INSERT INTO sessions(user_id,token_hash,expires_at) SELECT id,'${hash(editorToken)}',datetime('now','+1 day') FROM users WHERE email='phase1-editor@example.test';
    INSERT INTO user_access_roles(user_id,role_id,assigned_by)
      SELECT e.id,r.id,a.id FROM users e,users a,access_roles r
      WHERE e.email='phase1-editor@example.test' AND a.email='phase1-breakglass@example.test' AND r.key='editor';`;
  const seedFile=join(state,"test-seed.sql");
  await writeFile(seedFile,sql,"utf8");
  run(["d1","execute","architecting-ai-portal","--local","--persist-to",state,"--file",seedFile]);

  worker=spawn(process.execPath,[wrangler,"dev","--local","--port",String(port),"--persist-to",state,"--var","ADMIN_EMAILS:phase1-breakglass@example.test"],{cwd:root,stdio:["ignore","pipe","pipe"]});
  await waitForWorker();

  const anonymousNavigation=await api("/api/navigation");
  assert.equal(anonymousNavigation.status,200,"anonymous navigation remains public");
  const baseline=await anonymousNavigation.json();
  assert.equal(baseline.navigation.length,9,"reconciled public navigation is active");
  assert.ok(baseline.items.length>=69,"all normalized navigation records are exposed, including additive managed-profile links");
  assert.ok(baseline.items.some(item=>item.url==="/about/leadership"),"published Leadership directory is exposed in About navigation without per-person top-level links");

  assert.equal((await api("/api/admin/dashboard")).status,403,"anonymous Admin access is denied");
  assert.equal((await fetch(`${origin}/`)).status,200,"anonymous public route remains available");
  assert.equal((await api("/api/admin/dashboard",{token:editorToken})).status,200,"assigned editor can view dashboard");
  assert.equal((await api("/api/admin/menu",{token:editorToken,method:"PUT",body:{items:baseline.items}})).status,403,"editor cannot publish navigation");
  const draftPage=await api("/api/admin/pages",{token:editorToken,method:"POST",body:{title:"Phase 1 sanitizer test",slug:"phase-1-sanitizer-test",workflow_state:"draft",body_html:'<p onclick="steal()">Safe</p><script>alert(1)</script>'}});
  assert.equal(draftPage.status,201,"editor can create draft content");
  const draftBody=await draftPage.json();
  assert.doesNotMatch(draftBody.body_html,/script|onclick/i,"Admin persistence uses parser-based sanitization");
  assert.equal((await api(`/api/admin/pages/${draftBody.id}`,{token:editorToken,method:"PUT",body:{...draftBody,workflow_state:"published"}})).status,403,"editor cannot bypass publish permission through page save");

  const invalid=baseline.items.map(item=>({...item}));
  invalid[1].key=invalid[0].key;
  const failed=await api("/api/admin/menu",{token:adminToken,method:"PUT",body:{items:invalid}});
  assert.equal(failed.status,400,"invalid publication is rejected");
  const afterFailure=await (await api("/api/navigation")).json();
  assert.equal(afterFailure.publicationVersion,baseline.publicationVersion,"failed publication preserves active version");

  const changed=baseline.items.map(item=>({...item}));
  changed[0].label="Home test publication";
  const published=await api("/api/admin/menu",{token:adminToken,method:"PUT",body:{items:changed,change_note:"Phase 1 integration test"}});
  assert.equal(published.status,200,"break-glass administrator can publish");
  const afterPublish=await (await api("/api/navigation")).json();
  assert.ok(afterPublish.publicationVersion>baseline.publicationVersion,"publication creates a new immutable version");
  assert.equal(afterPublish.navigation[0].label,"Home test publication","published navigation persists");

  const restored=await api("/api/admin/menu",{token:adminToken,method:"PUT",body:{items:baseline.items,change_note:"Restore integration baseline"}});
  assert.equal(restored.status,200,"baseline can be republished without deleting history");

  const dirty='<p onclick="steal()">Safe</p><script>alert(1)</script><a href="javascript:alert(2)">bad</a><img src="/ok.png" onerror="alert(3)">';
  const clean=sanitizeManagedHtml(dirty);
  assert.doesNotMatch(clean,/script|onclick|onerror|javascript:/i,"managed HTML removes executable content");
  assert.match(clean,/Safe/,"managed HTML preserves allowed content");

  console.log("PASS navigation persistence");
  console.log("PASS failed publication rollback");
  console.log("PASS anonymous public/Admin access boundaries");
  console.log("PASS assigned-role and break-glass permissions");
  console.log("PASS parser-based managed HTML sanitization");
}finally{
  if(worker){worker.kill();await Promise.race([new Promise(resolve=>worker.once("exit",resolve)),new Promise(resolve=>setTimeout(resolve,2000))])}
  for(let attempt=0;attempt<5;attempt++){try{await rm(state,{recursive:true,force:true});break}catch(error){if(attempt===4)throw error;await new Promise(resolve=>setTimeout(resolve,300))}}
}
