import fs from "node:fs";
import path from "node:path";

const root=path.resolve("greenfield-portal"),errors=[];
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
  const full=path.join(dir,entry.name);
  if(entry.isDirectory()&&["work","downloads","index_files"].includes(entry.name))return[];
  return entry.isDirectory()?walk(full):entry.isFile()&&/\.(?:html|js|css|json|md|xml)$/i.test(entry.name)&&!entry.name.endsWith(".bak")?[full]:[];
});
const mojibake=/(?:Ã‚|Ãƒ|Ã¢|ï¿½|Ã‚Â·|Ã¢â€ â€™|Ã¢â‚¬)/u;
for(const file of walk(root)){
  const text=fs.readFileSync(file,"utf8");
  if(mojibake.test(text))errors.push(path.relative(root,file).replaceAll("\\","/"));
}
console.log(`Encoding validation: ${errors.length} rendered-source files with mojibake.`);
for(const file of errors)console.error(`ERROR ${file}`);
if(errors.length)process.exitCode=1;
