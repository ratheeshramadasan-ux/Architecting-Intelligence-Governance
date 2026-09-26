import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir="../../downloads";
const outputFile=`${outputDir}/Enterprise_AI_Governance_RACI_Metrics_Template.xlsx`;
const qaDir="../raci_metrics_artifacts";
const wb=Workbook.create();
const NAVY="#102A4C", GOLD="#A67C2E", PALE="#EEF2F5", CREAM="#F8F7F3", INK="#172D42", MUTED="#607080", GREEN="#DDECE5", RED="#F4DDDA", AMBER="#F3E8D4";

function base(sh,title,subtitle,lastCol){
  sh.showGridLines=false;
  sh.getRange(`A1:${lastCol}1`).merge(); sh.getRange("A1").values=[[title]];
  sh.getRange(`A1:${lastCol}1`).format={fill:NAVY,font:{name:"Aptos Display",size:16,bold:true,color:"#FFFFFF"},rowHeight:32,verticalAlignment:"center"};
  sh.getRange(`A2:${lastCol}2`).merge(); sh.getRange("A2").values=[[subtitle]];
  sh.getRange(`A2:${lastCol}2`).format={font:{name:"Aptos",size:9,italic:true,color:MUTED},rowHeight:28,wrapText:true,verticalAlignment:"center"};
  sh.freezePanes.freezeRows(4);
}
function writeTable(sh,headers,rows,lastCol){
  sh.getRange(`A4:${lastCol}${4+rows.length}`).values=[headers,...rows];
  sh.getRange(`A4:${lastCol}4`).format={fill:PALE,font:{bold:true,color:NAVY},borders:{bottom:{style:"medium",color:GOLD}},wrapText:true,rowHeight:29,verticalAlignment:"center"};
  sh.getRange(`A5:${lastCol}${4+rows.length}`).format={font:{name:"Aptos",size:9,color:INK},wrapText:true,verticalAlignment:"top",borders:{insideHorizontal:{style:"thin",color:"#E2E7EB"}}};
}
function widths(sh,map){for(const [col,w] of Object.entries(map)) sh.getRange(`${col}:${col}`).format.columnWidth=w;}

let sh=wb.worksheets.add("Start Here"); base(sh,"Enterprise AI Governance RACI Metrics Template","Ratheesh Technology Ltd. — instructions, definitions, operating rules and workbook navigation.","H");
writeTable(sh,["Step","Action","Purpose","Primary sheet","Minimum completion standard","Owner","Review point","Output"],[
[1,"Define the governance roles and named role holders.","Make accountability traceable to people and functions.","Role Directory","Every active role has a role holder, delegate and authority level.","AI Governance Lead","Mobilization","Approved role directory"],
[2,"Tailor the enterprise decision catalogue.","Confirm the decisions that require explicit accountability.","Decision RACI","Each decision has exactly one A and at least one R.","Executive Sponsor","Operating-model approval","Decision-rights matrix"],
[3,"Tailor lifecycle activities and control ownership.","Embed RACI across intake, design, validation, deployment, monitoring and retirement.","Lifecycle RACI","All mandatory gates and material controls have accountable owners.","AI Governance Office","Lifecycle launch","Lifecycle responsibility model"],
[4,"Record operational decision events.","Measure whether accountability works in practice.","Decision Log","Actual decision, SLA, outcome, evidence and escalation recorded.","Committee Secretary","Each meeting / decision","Auditable decision record"],
[5,"Maintain metrics and thresholds.","Define what good governance performance means.","Metric Catalogue","Every metric has formula, source, target, threshold and response owner.","Governance Reporting Lead","Quarterly","Approved KPI/KRI catalogue"],
[6,"Review the dashboard and diagnostic checks.","Identify missing accountability, overload, delays and weak evidence.","Dashboard","Exceptions assigned and tracked to closure.","AI Steering Committee","Monthly / quarterly","Management action record"]
],"H"); widths(sh,{A:8,B:34,C:31,D:20,E:38,F:22,G:22,H:26});
sh.getRange("A13:H13").merge(); sh.getRange("A13").values=[["RACI operating rules"]]; sh.getRange("A13:H13").format={fill:NAVY,font:{bold:true,color:"#FFFFFF"},rowHeight:24};
const rules=[
"A = Accountable: one role owns the outcome and final decision. Avoid multiple A assignments.",
"R = Responsible: one or more roles perform the work and assemble the decision evidence.",
"C = Consulted: provides required expertise before the decision or activity is completed.",
"I = Informed: receives the decision or outcome after it is made; I is not an approval role.",
"AR may be used only when the accountable owner also performs the work; it still counts as one accountable role.",
"Risk acceptance must remain independent from the team creating the exposure, and emergency authority must be explicit."
]; sh.getRange("A14:H19").merge(true); sh.getRange("A14:A19").values=rules.map(x=>[x]); sh.getRange("A14:H19").format={fill:CREAM,font:{color:INK},wrapText:true,rowHeight:24};

sh=wb.worksheets.add("Role Directory"); base(sh,"Governance Role Directory","Name role holders, delegates, authority and capacity before assigning RACI codes.","L");
const roles=[
["RL-01","Board / Audit Committee","Oversight","","","Enterprise appetite, material risk and independent oversight","Oversight","Quarterly","Active","","",.2],
["RL-02","Executive Sponsor","Executive","","","Strategy, funding, final escalation and residual risk authority","Approve","Monthly","Active","","",.4],
["RL-03","AI Steering Committee","Governance","","","Portfolio prioritization, high-risk approvals, standards and exceptions","Approve","Monthly","Active","","",.6],
["RL-04","AI Governance Office","Governance","","","Framework operation, orchestration, reporting, evidence and enablement","Operate","Continuous","Active","","",1],
["RL-05","Business / Product Owner","First Line","","","Value, outcomes, affected stakeholders and residual business risk","Own","Per use case","Active","","",.8],
["RL-06","Enterprise Risk / Compliance","Second Line","","","Risk method, challenge, acceptance routing and regulatory alignment","Challenge","Per gate","Active","","",.7],
["RL-07","Privacy / Legal","Second Line","","","Privacy, legal, IP, transparency and regulatory requirements","Challenge","Per gate","Active","","",.5],
["RL-08","Cybersecurity","Second Line","","","Threat assessment, security control approval and incident response","Challenge","Per gate","Active","","",.7],
["RL-09","Enterprise Architecture","Design Authority","","","Architecture standards, integration boundaries and technical decisions","Approve","Per gate","Active","","",.65],
["RL-10","Data Owner / Data Governance","First / Second Line","","","Data purpose, quality, classification, lineage, retention and access","Approve","Per gate","Active","","",.6],
["RL-11","Model / Validation Lead","Independent Validation","","","Independent performance, fairness, robustness and model-risk validation","Validate","Per release","Active","","",.6],
["RL-12","Delivery / Engineering","First Line","","","Design, build, test evidence, deployment and remediation","Execute","Continuous","Active","","",1],
["RL-13","Operations / Service Owner","First Line","","","Production monitoring, incident, change, resilience and retirement","Operate","Continuous","Active","","",.8],
["RL-14","Vendor / Procurement Owner","First / Second Line","","","Due diligence, contract controls, concentration, exit and service obligations","Approve","Onboarding / annual","Active","","",.45],
["RL-15","Internal Audit","Third Line","","","Independent assurance over governance design and operating effectiveness","Assure","Risk based","Active","","",.3]
];
writeTable(sh,["Role ID","Governance role","Line / forum","Named holder","Delegate","Mandate / accountability","Authority type","Review cadence","Status","Email / contact","Notes","Capacity %"],roles,"L"); widths(sh,{A:10,B:28,C:20,D:22,E:22,F:44,G:18,H:20,I:14,J:25,K:28,L:13}); sh.getRange("I5:I104").dataValidation={rule:{type:"list",values:["Active","Interim","Vacant","Retired"]}}; sh.getRange("L5:L104").format.numberFormat="0%";

const roleHeaders=roles.slice(1,13).map(r=>r[1]);
const decisions=[
["D-01","Approve enterprise AI strategy and principles","Strategy","Enterprise","High","Executive Sponsor","Quarterly","30","AI Steering Committee","Charter, strategy and decision record","Executive Sponsor","A","C","R","C","C","C","C","C","C","I","I","I","I","I","I"],
["D-02","Approve AI governance policy and mandatory standards","Policy","Enterprise","High","Executive Sponsor","Annual / change","30","AI Steering Committee","Policy, control catalogue and consultation record","AI Governance Office","I","A","R","R","C","R","C","C","C","C","C","I","I","C","I"],
["D-03","Classify use-case risk tier and governance pathway","Risk","Use case","High","Enterprise Risk / Compliance","Per intake","10","AI Governance Office","Intake, risk assessment and classification rationale","AI Governance Office","I","I","C","A","R","R","C","C","C","C","C","C","I","C","I"],
["D-04","Approve high-risk use case to proceed to design","Portfolio","Use case","Critical","AI Steering Committee","Per use case","20","Executive Sponsor","Business case, risk tier and conditions","Business / Product Owner","I","C","A","R","R","R","C","C","C","C","C","I","I","C","I"],
["D-05","Approve target architecture and technical control design","Architecture","Use case","High","Enterprise Architecture","Per design","15","AI Steering Committee","Architecture decision record, data flow and threat model","Delivery / Engineering","I","I","C","C","C","C","C","R","A","R","C","R","C","C","I"],
["D-06","Approve security and privacy readiness","Security / Privacy","Use case","High","Cybersecurity","Per release","15","AI Steering Committee","Security tests, privacy assessment and remediation closure","Delivery / Engineering","I","I","C","C","C","C","R","A","C","R","C","R","C","C","I"],
["D-07","Approve independent validation result","Validation","Use case","High","Model / Validation Lead","Per release / material change","15","AI Steering Committee","Validation report and limitations","Model / Validation Lead","I","I","C","C","C","C","C","C","C","C","A","R","C","I","I"],
["D-08","Authorize production deployment","Release","Use case","Critical","Business / Product Owner","Per release","10","Executive Sponsor","Gate pack, residual risk, monitoring and rollback readiness","Operations / Service Owner","I","I","C","A","C","C","C","C","R","C","R","R","R","C","I"],
["D-09","Accept residual high or material risk","Risk Acceptance","Use case","Critical","Executive Sponsor","Per exception / release","10","Board / Audit Committee","Residual risk statement, treatment, expiry and conditions","Enterprise Risk / Compliance","I","A","C","R","C","R","C","C","C","C","C","I","I","I","I"],
["D-10","Approve policy or control exception","Exception","Enterprise / use case","High","AI Steering Committee","Per exception","10","Executive Sponsor","Exception rationale, compensating controls, owner and expiry","AI Governance Office","I","C","A","R","R","R","C","C","C","C","C","C","I","C","I"],
["D-11","Suspend system or invoke kill switch","Incident","Production","Critical","Business / Product Owner","Event driven","0","Executive Sponsor","Incident trigger, containment evidence and notification record","Operations / Service Owner","I","I","I","A","R","R","C","R","C","C","C","R","R","C","I"],
["D-12","Close a material assurance finding","Assurance","Enterprise / use case","High","Enterprise Risk / Compliance","Per finding","20","Audit Committee","Remediation evidence, retest and closure approval","Control Owner","I","I","C","R","C","A","C","C","C","C","C","R","R","C","R"]
];
sh=wb.worksheets.add("Decision RACI"); base(sh,"Enterprise AI Decision RACI","Detailed decision rights across enterprise governance, lifecycle gates, risk acceptance, incidents and assurance.","AE");
writeTable(sh,["Decision ID","Decision / authority","Domain","Scope","Criticality","Default accountable role","Cadence / trigger","Decision SLA days","Escalation forum","Required evidence","Evidence owner",...roles.map(r=>r[1]),"A count","R count","C count","I count","RACI health"],decisions.map(r=>[...r,null,null,null,null,null]),"AE");
widths(sh,{A:10,B:42,C:18,D:18,E:14,F:24,G:22,H:14,I:24,J:42,K:24,L:16,M:16,N:16,O:16,P:16,Q:16,R:16,S:16,T:16,U:16,V:16,W:16,X:16,Y:16,Z:12,AA:12,AB:12,AC:12,AD:12,AE:18});
sh.getRange("L5:Z104").dataValidation={rule:{type:"list",values:["","A","R","C","I","AR"]}};
for(let row=5;row<=64;row++){sh.getRange(`AA${row}`).formulas=[[`=IF(B${row}="","",COUNTIF(L${row}:Z${row},"A")+COUNTIF(L${row}:Z${row},"AR"))`]]; sh.getRange(`AB${row}`).formulas=[[`=IF(B${row}="","",COUNTIF(L${row}:Z${row},"R")+COUNTIF(L${row}:Z${row},"AR"))`]]; sh.getRange(`AC${row}`).formulas=[[`=IF(B${row}="","",COUNTIF(L${row}:Z${row},"C"))`]]; sh.getRange(`AD${row}`).formulas=[[`=IF(B${row}="","",COUNTIF(L${row}:Z${row},"I"))`]]; sh.getRange(`AE${row}`).formulas=[[`=IF(B${row}="","",IF(AND(AA${row}=1,AB${row}>=1),"Healthy",IF(AA${row}=0,"Missing A",IF(AA${row}>1,"Multiple A","Missing R"))))`]];}
sh.getRange("AA4:AE64").format.fill=CREAM; sh.getRange("AE5:AE64").conditionalFormats.add("containsText",{text:"Healthy",format:{fill:GREEN,font:{color:"#215B42",bold:true}}}); sh.getRange("AE5:AE64").conditionalFormats.add("containsText",{text:"Missing",format:{fill:RED,font:{color:"#8A2F28",bold:true}}}); sh.getRange("AE5:AE64").conditionalFormats.add("containsText",{text:"Multiple",format:{fill:AMBER,font:{color:"#835816",bold:true}}});

sh=wb.worksheets.add("Lifecycle RACI"); base(sh,"AI Lifecycle Activity RACI","Control ownership across the eight lifecycle gates. Extend rows for enterprise-specific activities.","V");
const activities=[
["L-01","01 Intake","Register use case, owner, value and intended outcome","Mandatory","Business / Product Owner","Intake record","Per use case","R","C","C","A","R","C","I","I","I","C","I","C","I","C","I"],
["L-02","02 Assess","Classify risk, regulation, affected stakeholders and pathway","Mandatory","Enterprise Risk / Compliance","Risk assessment","Per use case / change","I","I","C","R","R","A","R","C","C","R","C","C","I","C","I"],
["L-03","03 Design","Approve architecture, data flows, controls and human oversight","Mandatory","Enterprise Architecture","Architecture decision record","Per design / material change","I","I","C","C","C","C","C","R","A","R","C","R","C","C","I"],
["L-04","04 Develop","Build system and maintain traceable design and test evidence","Mandatory","Delivery / Engineering","Model/system card and test evidence","Continuous","I","I","I","A","C","C","C","C","C","C","C","R","C","C","I"],
["L-05","05 Validate","Independently validate performance, fairness, robustness and limitations","Risk based","Model / Validation Lead","Validation report","Per release / change","I","I","C","C","C","C","C","C","C","C","A","R","I","I","I"],
["L-06","06 Deploy","Approve release, monitoring, rollback and support readiness","Mandatory","Business / Product Owner","Production approval record","Per release","I","I","C","A","C","C","C","C","R","C","R","R","R","C","I"],
["L-07","07 Monitor","Monitor performance, drift, controls, incidents and outcomes","Mandatory","Operations / Service Owner","Dashboard, alerts and incident evidence","Continuous","I","I","C","A","C","C","C","R","C","R","C","R","R","C","I"],
["L-08","08 Retire","Close access, data, models, vendors and retained evidence","Mandatory","Business / Product Owner","Retirement record","Per retirement","I","I","C","A","R","C","C","R","R","R","I","R","R","R","I"]
]; writeTable(sh,["Activity ID","Lifecycle gate","Activity / control outcome","Requirement","Default accountable role","Required evidence","Frequency / trigger",...roles.map(r=>r[1])],activities,"V"); widths(sh,{A:10,B:16,C:42,D:16,E:24,F:36,G:22,H:15,I:15,J:15,K:15,L:15,M:15,N:15,O:15,P:15,Q:15,R:15,S:15,T:15,U:15,V:15}); sh.getRange("H5:V104").dataValidation={rule:{type:"list",values:["","A","R","C","I","AR"]}};

sh=wb.worksheets.add("Decision Log"); base(sh,"Governance Decision & Escalation Log","Record actual decisions so accountability, timeliness, evidence and escalation metrics can be measured.","Q");
const logRows=[
["EV-001","D-03","Example: classify document-processing use case","2026-07-01","AI Governance Office","Enterprise Risk / Compliance","Approved","2026-07-08",7,10,null,"No","Complete","","","Closed","Example row — replace or retain as guidance"]
]; writeTable(sh,["Event ID","Decision ID","Decision subject","Request date","Requestor","Accountable role","Outcome","Decision date","Elapsed days","SLA days","Within SLA","Escalated?","Evidence status","Evidence link","Conditions / actions","Action status","Notes"],logRows,"Q"); widths(sh,{A:11,B:11,C:38,D:14,E:24,F:25,G:20,H:14,I:12,J:12,K:14,L:14,M:17,N:32,O:38,P:17,Q:35});
for(let row=5;row<=104;row++) sh.getRange(`K${row}`).formulas=[[`=IF(OR(D${row}="",H${row}=""),"",IF(I${row}<=J${row},"Yes","No"))`]];
sh.getRange("D5:D104").format.numberFormat="yyyy-mm-dd"; sh.getRange("H5:H104").format.numberFormat="yyyy-mm-dd"; sh.getRange("G5:G104").dataValidation={rule:{type:"list",values:["Pending","Approved","Approved with Conditions","Rejected","Deferred","Suspended","Closed"]}}; sh.getRange("L5:L104").dataValidation={rule:{type:"list",values:["No","Yes"]}}; sh.getRange("M5:M104").dataValidation={rule:{type:"list",values:["Missing","Partial","Complete","Verified"]}}; sh.getRange("P5:P104").dataValidation={rule:{type:"list",values:["Open","In Progress","Blocked","Closed"]}};

sh=wb.worksheets.add("Metric Catalogue"); base(sh,"RACI Governance Metric Catalogue","Definitions, formulas, targets, thresholds, ownership, interpretation and management response.","N");
const metrics=[
["RACI-01","Single-accountable-owner compliance","Control KPI","Decisions with exactly one A / active decisions","Decision RACI",">= 98%","< 95%","Monthly","AI Governance Lead","Governance design clarity","Repair decisions with missing or multiple A; obtain Steering Committee approval.","Governance, Compliance & Oversight","Enterprise","Active"],
["RACI-02","Responsible-role coverage","Control KPI","Decisions with one or more R / active decisions","Decision RACI",">= 98%","< 95%","Monthly","AI Governance Lead","Execution ownership","Assign at least one capable R and verify capacity.","Governance, Compliance & Oversight","Enterprise","Active"],
["RACI-03","Lifecycle accountability coverage","Control KPI","Lifecycle activities with one A / active lifecycle activities","Lifecycle RACI","100%","< 98%","Monthly","Lifecycle Governance Owner","End-to-end accountability","Resolve gaps before the affected lifecycle gate is used.","Agentic AI Governance Framework","Lifecycle","Active"],
["RACI-04","Decision SLA attainment","Performance KPI","Completed decisions within SLA / completed decisions","Decision Log",">= 90%","< 80%","Monthly","Committee Secretary","Governance responsiveness","Analyze bottlenecks, missing evidence and quorum delays.","AI Governance","Operations","Active"],
["RACI-05","Escalation rate","Risk indicator","Escalated decision events / completed decision events","Decision Log","<= 15%","> 25%","Monthly","AI Governance Lead","Ambiguity or unresolved conflict","Review decision rights and repeat escalation causes.","AI Governance","Operations","Active"],
["RACI-06","Evidence completeness","Control KPI","Completed decisions with Complete or Verified evidence / completed decisions","Decision Log",">= 95%","< 90%","Monthly","Governance Evidence Owner","Auditability","Block closure until evidence is complete or exception approved.","Assurance","Evidence","Active"],
["RACI-07","Open conditional actions","Risk indicator","Approved-with-conditions events with actions not closed","Decision Log","0 overdue","> 3 overdue","Monthly","Business / Product Owner","Residual execution risk","Escalate overdue material conditions to risk acceptance authority.","Assurance","Actions","Active"],
["RACI-08","Vacant accountable roles","Risk indicator","Active roles marked Vacant or without a named holder","Role Directory","0","> 0 critical roles","Monthly","Executive Sponsor","Governance continuity","Appoint interim owner and define delegation immediately.","Operating Model","People","Active"],
["RACI-09","Role overload concentration","Capacity KRI","A assignments held by top role / all A assignments","Decision RACI","<= 25%","> 40%","Quarterly","Executive Sponsor","Key-person and decision bottleneck risk","Delegate authority or redesign forums and role boundaries.","Operating Model","Capacity","Active"],
["RACI-10","Consultation effectiveness","Quality KPI","Decisions returned due to missed consultation / completed decisions","Decision Log","<= 5%","> 10%","Quarterly","AI Governance Lead","Quality of C-role engagement","Update required consultations and submission checklist.","AI Governance","Quality","Active"],
["RACI-11","Decision reversal rate","Outcome KRI","Decisions reversed within review period / completed decisions","Decision Log","<= 3%","> 8%","Quarterly","AI Steering Committee","Decision quality and evidence sufficiency","Perform root-cause analysis and strengthen decision criteria.","Assurance","Quality","Active"],
["RACI-12","RACI review currency","Control KPI","RACI rows reviewed within required cadence / active rows","Decision RACI / Lifecycle RACI",">= 95%","< 90%","Quarterly","AI Governance Office","Operating-model currency","Trigger owner attestation after organizational or regulatory change.","Governance, Compliance & Oversight","Maintenance","Active"]
]; writeTable(sh,["Metric ID","Metric","Type","Definition / formula","Source","Target","Amber / red threshold","Cadence","Metric owner","What it reveals","Required management response","Portal model reference","Scope","Status"],metrics,"N"); widths(sh,{A:11,B:30,C:17,D:44,E:24,F:15,G:20,H:15,I:24,J:32,K:48,L:31,M:18,N:14}); sh.getRange("N5:N104").dataValidation={rule:{type:"list",values:["Active","Draft","Retired"]}};

sh=wb.worksheets.add("Dashboard"); base(sh,"RACI Governance Dashboard","Formula-driven summary of accountability design and operational decision performance.","J");
sh.getRange("A4:D4").values=[["Metric","Current","Target","Status"]]; sh.getRange("A4:D4").format={fill:PALE,font:{bold:true,color:NAVY},borders:{bottom:{style:"medium",color:GOLD}}};
const dashLabels=[["Single-A compliance"],["Responsible-role coverage"],["Lifecycle A coverage"],["Decision SLA attainment"],["Escalation rate"],["Evidence completeness"],["Vacant / unnamed active roles"],["Open decision actions"]]; sh.getRange("A5:A12").values=dashLabels;
sh.getRange("B5").formulas=[[`=IFERROR(COUNTIF('Decision RACI'!$AE$5:$AE$64,"Healthy")/COUNTIF('Decision RACI'!$B$5:$B$64,"<>"),0)`]];
sh.getRange("B6").formulas=[[`=IFERROR(COUNTIF('Decision RACI'!$AB$5:$AB$64,">=1")/COUNTIF('Decision RACI'!$B$5:$B$64,"<>"),0)`]];
sh.getRange("B7").formulas=[[`=IFERROR(MIN(1,COUNTIF('Lifecycle RACI'!$H$5:$V$64,"A")/COUNTIF('Lifecycle RACI'!$C$5:$C$64,"<>")),0)`]];
sh.getRange("B8").formulas=[[`=IFERROR(COUNTIF('Decision Log'!$K$5:$K$104,"Yes")/COUNTIF('Decision Log'!$G$5:$G$104,"<>"),0)`]];
sh.getRange("B9").formulas=[[`=IFERROR(COUNTIF('Decision Log'!$L$5:$L$104,"Yes")/COUNTIF('Decision Log'!$G$5:$G$104,"<>"),0)`]];
sh.getRange("B10").formulas=[[`=IFERROR((COUNTIF('Decision Log'!$M$5:$M$104,"Complete")+COUNTIF('Decision Log'!$M$5:$M$104,"Verified"))/COUNTIF('Decision Log'!$G$5:$G$104,"<>"),0)`]];
sh.getRange("B11").formulas=[[`=COUNTIF('Role Directory'!$I$5:$I$104,"Vacant")+COUNTIFS('Role Directory'!$I$5:$I$104,"Active",'Role Directory'!$D$5:$D$104,"")`]];
sh.getRange("B12").formulas=[[`=COUNTIF('Decision Log'!$P$5:$P$104,"Open")+COUNTIF('Decision Log'!$P$5:$P$104,"In Progress")+COUNTIF('Decision Log'!$P$5:$P$104,"Blocked")`]];
sh.getRange("C5:C12").values=[[.98],[.98],[1],[.9],[.15],[.95],[0],[0]];
for(let r=5;r<=10;r++) sh.getRange(`D${r}`).formulas=[[r===9?`=IF(B${r}<=C${r},"On target","Attention")`:`=IF(B${r}>=C${r},"On target","Attention")`]];
for(let r=11;r<=12;r++) sh.getRange(`D${r}`).formulas=[[`=IF(B${r}=C${r},"On target","Attention")`]];
sh.getRange("B5:C10").format.numberFormat="0%"; sh.getRange("B11:C12").format.numberFormat="0"; sh.getRange("A5:D12").format={borders:{insideHorizontal:{style:"thin",color:"#E2E7EB"}},rowHeight:25}; sh.getRange("D5:D12").conditionalFormats.add("containsText",{text:"On target",format:{fill:GREEN,font:{bold:true,color:"#215B42"}}}); sh.getRange("D5:D12").conditionalFormats.add("containsText",{text:"Attention",format:{fill:RED,font:{bold:true,color:"#8A2F28"}}}); widths(sh,{A:34,B:16,C:16,D:18,E:3,F:24,G:18,H:18,I:18,J:18});
sh.getRange("F4:J4").merge(); sh.getRange("F4").values=[["Executive interpretation"]]; sh.getRange("F4:J4").format={fill:NAVY,font:{bold:true,color:"#FFFFFF"}};
sh.getRange("F5:J9").merge(); sh.getRange("F5").values=[["Use the dashboard as a governance-system health view. Design metrics expose missing or competing accountability; operational metrics show whether decisions are timely, evidenced and properly escalated. Any red condition requires a named action owner, due date and governing-forum review—not simply a revised spreadsheet."]]; sh.getRange("F5:J9").format={fill:CREAM,font:{color:INK},wrapText:true,verticalAlignment:"top"};

for(const s of wb.worksheets.items){const used=s.getUsedRange(); if(used) used.format.font={name:"Aptos",size:9,color:INK}; s.getRange("A1").format.font={name:"Aptos Display",size:16,bold:true,color:"#FFFFFF"};}
await fs.mkdir(outputDir,{recursive:true}); await fs.mkdir(qaDir,{recursive:true});
const xlsx=await SpreadsheetFile.exportXlsx(wb); await xlsx.save(outputFile);
const key=await wb.inspect({kind:"region,formula",sheetId:"Dashboard",range:"A1:J12",maxChars:10000,options:{maxResults:100}}); await fs.writeFile(`${qaDir}/dashboard_inspection.txt`,key.ndjson||String(key));
const errors=await wb.inspect({kind:"match",searchTerm:"#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",options:{useRegex:true,maxResults:300},summary:"final formula error scan"}); await fs.writeFile(`${qaDir}/formula_errors.txt`,errors.ndjson||String(errors));
for(const s of wb.worksheets.items){const png=await wb.render({sheetName:s.name,autoCrop:"all",scale:.8,format:"png"}); await fs.writeFile(`${qaDir}/${s.name.replace(/[^a-z0-9]+/gi,"_")}.png`,new Uint8Array(await png.arrayBuffer()));}
console.log(outputFile);
