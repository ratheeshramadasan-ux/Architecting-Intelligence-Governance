import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "file:///C:/Users/rathe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";
const root=new URL("../",import.meta.url); const input=new URL("../downloads/Enterprise_AI_Governance_Greenfield_Implementation_Toolkit.xlsx",import.meta.url).pathname.replace(/^\/(.:)/,"$1");
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(input));
const out=new URL("../work/greenfield_artifacts/xlsx/",import.meta.url); await fs.mkdir(out,{recursive:true});
const summary=await wb.inspect({kind:"workbook,sheet,formula",maxChars:12000,tableMaxRows:8,tableMaxCols:14,options:{maxResults:200}}); await fs.writeFile(new URL("inspection.txt",out),summary.ndjson||String(summary));
for(const sh of wb.worksheets.items){const png=await wb.render({sheetName:sh.name,autoCrop:"all",scale:.8,format:"png"}); await fs.writeFile(new URL(`${sh.name.replace(/[^a-z0-9]+/gi,"_")}.png`,out),new Uint8Array(await png.arrayBuffer()));}
console.log(wb.worksheets.items.map(s=>s.name).join("\n"));
