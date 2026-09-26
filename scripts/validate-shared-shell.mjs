import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

const [shellScript, shellCss, methodologyCss, worker] = await Promise.all([
  read("greenfield-portal/assets/js/shared-site-shell.js"),
  read("greenfield-portal/assets/css/shared-site-shell.css"),
  read("greenfield-portal/assets/css/methodology-v10.css"),
  read("src/worker.js")
]);

assert.match(shellScript, /body\.classList\.add\("application-shell"\)/);
assert.match(shellScript, /body\.dataset\.sharedShell="true"/);
assert.match(shellScript, /headers\.forEach\(header=>\{if\(header!==preferredHeader\)header\.remove\(\)\}\)/);
assert.match(shellScript, /footers\.forEach\(footer=>\{if\(footer!==preferredFooter\)footer\.remove\(\)\}\)/);
assert.match(shellScript, /setAttribute\("data-shell-region","main"\)/);

assert.match(shellCss, /html\{width:100%;height:100%;overflow:hidden\}/);
assert.match(shellCss, /body\.application-shell\{[\s\S]*height:100dvh;[\s\S]*overflow:hidden;/);
assert.match(shellCss, /\[data-shell-region="main"\]\{[\s\S]*overflow-x:hidden;[\s\S]*overflow-y:auto;/);
assert.doesNotMatch(shellCss, /body:has\([^}]+overflow-y:visible/);
assert.doesNotMatch(methodologyCss, /html,body\{height:100%;overflow:hidden\}/);

assert.match(worker, /shared-site-shell\.css\?v=20260728-5/);
assert.match(worker, /shared-site-shell\.js\?v=20260728-5/);
assert.match(worker, /\$\{main\}<footer><\/footer>/);

console.log("Shared shell static contract: PASS");
