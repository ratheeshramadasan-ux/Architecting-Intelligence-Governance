import fs from "node:fs";
import path from "node:path";
import {spawnSync} from "node:child_process";

const roots=["greenfield-portal/assets/js","scripts","src"];
const files=roots.flatMap(root=>fs.readdirSync(root,{recursive:true,withFileTypes:true})
  .filter(entry=>entry.isFile()&&/\.(?:js|mjs|cjs)$/.test(entry.name))
  .map(entry=>path.join(entry.parentPath,entry.name)));
const failures=[];
for(const file of files){
  const result=spawnSync(process.execPath,["--check",file],{encoding:"utf8"});
  if(result.status!==0)failures.push({file,error:(result.stderr||result.stdout).trim()});
}
console.log(`JavaScript syntax validation: ${files.length} files checked; ${failures.length} failures.`);
for(const failure of failures)console.error(`${failure.file}\n${failure.error}`);
if(failures.length)process.exitCode=1;
