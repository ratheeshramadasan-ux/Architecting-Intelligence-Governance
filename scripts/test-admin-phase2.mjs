import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn, spawnSync } from "node:child_process";

const root=new URL("..",import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/,value=>value.slice(1));
const wrangler=join(root,"node_modules","wrangler","bin","wrangler.js");
const state=await mkdtemp(join(tmpdir(),"portal-phase2-"));
const port=8798;
const origin=`http://127.0.0.1:${port}`;
let worker;
function run(args){const result=spawnSync(process.execPath,[wrangler,...args],{cwd:root,encoding:"utf8"});if(result.status!==0)throw new Error(`${result.stdout}\n${result.stderr}`);return result.stdout}
function hash(value){return createHash("sha256").update(value).digest("base64url")}
async function waitForWorker(){for(let i=0;i<80;i++){try{if((await fetch(`${origin}/api/showcase`)).ok)return}catch{}await new Promise(resolve=>setTimeout(resolve,250))}throw new Error("Isolated Worker did not become ready.")}
async function api(path,{token,method="GET",body}={}){const headers={Accept:"application/json",...(token?{Cookie:`portal_session=${token}`}:{})};let requestBody;if(body instanceof FormData){headers.Origin=origin;requestBody=body}else if(body!==undefined){headers.Origin=origin;headers["Content-Type"]="application/json";requestBody=JSON.stringify(body)}return fetch(`${origin}${path}`,{method,headers,body:requestBody})}

try{
  run(["d1","migrations","apply","architecting-ai-portal","--local","--persist-to",state]);
  const case04Key="library/document/case04/original.pdf";
  const case04Pdf=join(state,"case-study-04.pdf");
  await writeFile(case04Pdf,new Uint8Array([37,80,68,70,45,49,46,52,10,37,80,104,97,115,101,50]));
  run(["r2","object","put",`architecting-ai-resources/${case04Key}`,"--file",case04Pdf,"--content-type","application/pdf","--local","--persist-to",state]);
  const adminToken="phase2-admin-session",editorToken="phase2-editor-session";
  const seedSql=`
    INSERT INTO users(name,email,password_hash,password_salt,role,status) VALUES('Phase 2 Admin','phase2-breakglass@example.test','x','x','admin','active');
    INSERT INTO users(name,email,password_hash,password_salt,role,status) VALUES('Phase 2 Editor','phase2-editor@example.test','x','x','member','active');
    INSERT INTO sessions(user_id,token_hash,expires_at) SELECT id,'${hash(adminToken)}',datetime('now','+1 day') FROM users WHERE email='phase2-breakglass@example.test';
    INSERT INTO sessions(user_id,token_hash,expires_at) SELECT id,'${hash(editorToken)}',datetime('now','+1 day') FROM users WHERE email='phase2-editor@example.test';
    INSERT INTO user_access_roles(user_id,role_id,assigned_by) SELECT e.id,r.id,a.id FROM users e,users a,access_roles r WHERE e.email='phase2-editor@example.test' AND a.email='phase2-breakglass@example.test' AND r.key='editor';
    INSERT INTO library_assets(title,description,asset_kind,category,tags_json,file_name,object_key,content_type,size_bytes,version_label,visibility,related_pages_json,download_enabled,watermark_enabled,status,uploaded_by)
      SELECT 'Case Study 04 - Agentic Commission Operations','Commission operations controlled by governed agents.','document','Case Study','["Agentic AI","Commission Operations"]','case-study-04.pdf','${case04Key}','application/pdf',16,'1.0','public','[]',1,1,'published',id FROM users WHERE email='phase2-breakglass@example.test';`;
  const seedFile=join(state,"seed.sql");await writeFile(seedFile,seedSql,"utf8");
  run(["d1","execute","architecting-ai-portal","--local","--persist-to",state,"--file",seedFile]);
  run(["d1","execute","architecting-ai-portal","--local","--persist-to",state,"--file",join(root,"migrations","0015_showcase_content.sql")]);

  worker=spawn(process.execPath,[wrangler,"dev","--local","--port",String(port),"--persist-to",state,"--var","ADMIN_EMAILS:phase2-breakglass@example.test"],{cwd:root,stdio:["ignore","pipe","pipe"]});
  await waitForWorker();

  const initial=await (await api("/api/showcase")).json();
  assert.equal(initial.case_studies.length,4,"three static studies and reconciled Case Study 04 form one collection");
  assert.equal(initial.demos.length,3,"three legacy demos are migrated");
  const case04=initial.case_studies.find(item=>item.slug==="agentic-commission-operations");
  assert.ok(case04,"Case Study 04 is visible in the main collection");
  assert.match(case04.download_url,/^\/library-downloads\/\d+$/,"Case Study 04 preserves its authorized PDF route without assuming a database sequence");
  const nav=await (await api("/api/navigation")).json();
  const showcaseMenu=nav.navigation.find(item=>item.href==="/case-studies/");
  assert.ok(showcaseMenu.children.some(item=>item.href==="/case-studies/#agentic-commission-operations"),"Case Study 04 appears in the optional submenu");
  assert.equal((await fetch(`${origin}/enterprise-architecture/banking-agent-demo/`)).status,200,"legacy demo URL remains valid");
  assert.equal((await fetch(`${origin}/downloads/case-studies/enterprise-dental-claims-hyperautomation.pdf`)).status,200,"legacy static PDF URL remains valid");

  const adminCollection=await (await api("/api/admin/showcase",{token:adminToken})).json();
  const adminContent=await (await api("/api/admin/content",{token:adminToken})).json();
  assert.ok(adminContent.menu.every(item=>!String(item.id).startsWith("showcase-")),"editable Admin menu excludes generated showcase records");
  assert.ok(adminContent.resolved_menu.some(item=>item.url==="/case-studies/#agentic-commission-operations"),"Admin resolved menu shows Case Study 04");
  assert.ok(adminContent.resolved_menu.some(item=>String(item.id).startsWith("showcase-")),"Admin labels generated showcase navigation separately");
  const adminCase04=adminCollection.items.find(item=>item.slug==="agentic-commission-operations");
  assert.equal((await api(`/api/admin/showcase/${adminCase04.id}/navigation`,{token:adminToken,method:"PATCH",body:{enabled:false}})).status,200,"Admin can disable a generated menu entry");
  let toggledNav=await (await api("/api/navigation")).json();
  assert.ok(!toggledNav.navigation.find(item=>item.href==="/case-studies/").children.some(item=>item.href==="/case-studies/#agentic-commission-operations"),"disabled generated entry leaves public navigation");
  assert.equal((await api(`/api/admin/showcase/${adminCase04.id}/navigation`,{token:adminToken,method:"PATCH",body:{enabled:true}})).status,200,"Admin can re-enable a generated menu entry");
  toggledNav=await (await api("/api/navigation")).json();
  assert.ok(toggledNav.navigation.find(item=>item.href==="/case-studies/").children.some(item=>item.href==="/case-studies/#agentic-commission-operations"),"re-enabled generated entry returns to public navigation");
  assert.equal(adminCase04.file.storage_provider,"R2");
  assert.equal(adminCase04.file.object_key,case04Key);
  assert.equal(adminCase04.file.content_type,"application/pdf");
  assert.equal(adminCase04.file.size_bytes,16);
  assert.ok(adminCase04.file.uploaded_at&&adminCase04.file.review_route&&adminCase04.file.authorized_download_url,"Admin exposes upload, review and authorized download metadata");
  assert.equal(adminCase04.file.watermark_processing,"not_implemented","watermark state is reported honestly");
  const pdfResponse=await fetch(`${origin}${case04.download_url}`);
  assert.equal(pdfResponse.status,200);
  assert.equal(pdfResponse.headers.has("X-Document-Watermark-Policy"),false,"download does not claim unimplemented watermark enforcement");

  const uploadForm=new FormData();
  uploadForm.set("asset_kind","document");uploadForm.set("category","Case Study");uploadForm.set("title","Uploaded Phase 2 Case Study");
  uploadForm.set("description","Uploaded through the Admin API.");uploadForm.set("version_label","1.0");uploadForm.set("visibility","public");
  uploadForm.set("download_enabled","on");uploadForm.set("tags","Testing, R2");uploadForm.set("file",new File([new Uint8Array([37,80,68,70,45,50])],"phase2-upload.pdf",{type:"application/pdf"}));
  const uploadResponse=await api("/api/admin/library",{token:adminToken,method:"POST",body:uploadForm});
  assert.equal(uploadResponse.status,201,"Admin can upload a case-study PDF");
  const uploaded=await uploadResponse.json();
  assert.ok(uploaded.showcase_id,"case-study upload creates one linked showcase record");
  assert.equal((await api(`/api/admin/showcase/${uploaded.showcase_id}`,{token:adminToken,method:"PUT",body:{content_type:"case_study",title:"Uploaded Phase 2 Case Study",description:"Uploaded through the Admin API.",category:"Testing",display_order:1,featured:true,include_in_navigation:true,visibility:"public"}})).status,200);
  assert.equal((await api(`/api/admin/showcase/${uploaded.showcase_id}/status`,{token:adminToken,method:"PATCH",body:{status:"published"}})).status,200);
  const afterCasePublish=await (await api("/api/showcase")).json();
  assert.equal(afterCasePublish.case_studies[0].id,uploaded.showcase_id,"featured case-study ordering is persisted");
  assert.ok((await (await api("/api/navigation")).json()).navigation.find(item=>item.href==="/case-studies/").children.some(item=>item.label==="Uploaded Phase 2 Case Study"),"published case-study navigation inclusion is automatic");
  assert.equal((await api(`/api/admin/showcase/${uploaded.showcase_id}/status`,{token:adminToken,method:"PATCH",body:{status:"draft"}})).status,200,"case study can be unpublished without deleting its PDF");

  const demoCreate=await api("/api/admin/showcase",{token:adminToken,method:"POST",body:{content_type:"demo",title:"Phase 2 Demo",description:"Isolated demo",category:"Testing",target_url:"/enterprise-architecture/banking-agent-demo/",display_order:5,include_in_navigation:true,visibility:"public"}});
  assert.equal(demoCreate.status,201);
  const demo=await demoCreate.json();
  assert.equal((await api(`/api/admin/showcase/${demo.id}/status`,{token:editorToken,method:"PATCH",body:{status:"published"}})).status,403,"editor cannot publish demos");
  assert.equal((await api(`/api/showcase?preview=${demo.id}`,{token:adminToken})).status,200,"Admin can preview a draft demo");
  assert.equal((await api(`/api/admin/showcase/${demo.id}/status`,{token:adminToken,method:"PATCH",body:{status:"published"}})).status,200);
  let publicData=await (await api("/api/showcase")).json();
  assert.ok(publicData.demos.some(item=>item.id===demo.id),"published demo appears publicly");
  let updatedNav=await (await api("/api/navigation")).json();
  assert.ok(updatedNav.navigation.find(item=>item.href==="/case-studies/").children.some(item=>item.title==="Phase 2 Demo"||item.label==="Phase 2 Demo"),"published demo appears in navigation");

  const restrictedUpdate={content_type:"demo",title:"Phase 2 Demo",description:"Restricted demo",category:"Testing",target_url:"/enterprise-architecture/banking-agent-demo/",display_order:5,include_in_navigation:true,visibility:"restricted"};
  assert.equal((await api(`/api/admin/showcase/${demo.id}`,{token:adminToken,method:"PUT",body:restrictedUpdate})).status,200);
  publicData=await (await api("/api/showcase")).json();
  assert.equal(publicData.demos.some(item=>item.id===demo.id),false,"restricted demos are hidden from anonymous visitors");
  assert.equal((await api(`/api/showcase?preview=${demo.id}`,{token:adminToken})).status,200,"restricted draft/public preview remains authorized");

  assert.equal((await api(`/api/admin/showcase/${demo.id}/status`,{token:adminToken,method:"PATCH",body:{status:"archived"}})).status,200);
  publicData=await (await api("/api/showcase")).json();
  assert.equal(publicData.demos.some(item=>item.id===demo.id),false,"archived demos leave the public collection");
  updatedNav=await (await api("/api/navigation")).json();
  assert.equal(updatedNav.publicationVersion,nav.publicationVersion,"showcase changes do not rewrite the Phase 1 base publication");
  assert.equal(updatedNav.navigation.find(item=>item.href==="/case-studies/").children.some(item=>item.label==="Phase 2 Demo"),false,"archiving removes the derived navigation entry");

  console.log("PASS deterministic reconciliation and Case Study 04 visibility");
  console.log("PASS case-study/demo ordering and dynamic navigation");
  console.log("PASS demo create, preview, publish, restriction, unpublish/archive controls");
  console.log("PASS isolated R2 metadata and authorized PDF delivery");
  console.log("PASS legacy demo and PDF URL compatibility");
  console.log("PASS Phase 1 navigation publication remains unchanged");
}finally{
  if(worker){worker.kill();await Promise.race([new Promise(resolve=>worker.once("exit",resolve)),new Promise(resolve=>setTimeout(resolve,2000))])}
  for(let attempt=0;attempt<5;attempt++){try{await rm(state,{recursive:true,force:true});break}catch(error){if(attempt===4)throw error;await new Promise(resolve=>setTimeout(resolve,300))}}
}
