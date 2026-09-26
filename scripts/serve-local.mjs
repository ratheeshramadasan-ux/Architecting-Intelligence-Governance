import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root=path.resolve("greenfield-portal");
const port=Number(process.env.PORT||8787);
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".svg":"image/svg+xml"};
http.createServer((request,response)=>{
  const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname);
  let target=path.resolve(root,`.${pathname}`);
  if(!target.startsWith(root)){response.writeHead(403);response.end("Forbidden");return}
  if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,"index.html");
  else if(!path.extname(target)&&fs.existsSync(`${target}.html`))target=`${target}.html`;
  if(!fs.existsSync(target)||!fs.statSync(target).isFile()){response.writeHead(404,{"content-type":"text/plain; charset=utf-8"});response.end("Not found");return}
  response.writeHead(200,{"content-type":types[path.extname(target).toLowerCase()]||"application/octet-stream"});
  fs.createReadStream(target).pipe(response);
}).listen(port,"127.0.0.1",()=>console.log(`Local portal: http://127.0.0.1:${port}/`));
