import fs from "node:fs";

const cp1252=new Map([
  [0x20ac,0x80],[0x201a,0x82],[0x0192,0x83],[0x201e,0x84],[0x2026,0x85],
  [0x2020,0x86],[0x2021,0x87],[0x02c6,0x88],[0x2030,0x89],[0x0160,0x8a],
  [0x2039,0x8b],[0x0152,0x8c],[0x017d,0x8e],[0x2018,0x91],[0x2019,0x92],
  [0x201c,0x93],[0x201d,0x94],[0x2022,0x95],[0x2013,0x96],[0x2014,0x97],
  [0x02dc,0x98],[0x2122,0x99],[0x0161,0x9a],[0x203a,0x9b],[0x0153,0x9c],
  [0x017e,0x9e],[0x0178,0x9f]
]);
const files=process.argv.slice(2);
if(!files.length)throw new Error("Pass one or more UTF-8 text files.");
const score=value=>(value.match(/[ÃÂâð]|ï¿½|\uFFFD/g)||[]).length;
function decodeOnce(value){
  const bytes=[];
  for(const char of value){
    const code=char.codePointAt(0);
    if(code<=0xff)bytes.push(code);
    else if(cp1252.has(code))bytes.push(cp1252.get(code));
    else return value;
  }
  const decoded=Buffer.from(bytes).toString("utf8");
  return decoded.includes("\uFFFD")?value:decoded;
}
function repair(value){
  let current=value;
  for(let pass=0;pass<3;pass++){
    const next=current.replace(/[^\s<>"'`=(){}\[\];,:]+/gu,token=>{
      if(!/[ÃÂâð]|ï¿½/u.test(token))return token;
      const decoded=decodeOnce(token);
      return score(decoded)<score(token)?decoded:token;
    });
    if(next===current)break;
    current=next;
  }
  return current;
}
for(const file of files){
  const before=fs.readFileSync(file,"utf8"),after=repair(before);
  if(after!==before){fs.writeFileSync(file,after,"utf8");console.log(`Repaired ${file}`)}
}
