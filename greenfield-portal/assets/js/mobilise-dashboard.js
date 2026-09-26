document.addEventListener("DOMContentLoaded",async()=>{
  const root=document.querySelector("#mobilise-dashboard-root");
  try{
    const [content,methodology]=await Promise.all([fetch("/assets/data/mobilise-content.json").then(r=>r.json()),fetch("/assets/data/methodology.json").then(r=>r.json())]);
    const view=document.body.dataset.dashboard;
    root.className="";
    view==="executive"?renderExecutive(root,content,methodology.mobilise):renderProgramme(root,content,methodology.mobilise);
  }catch{root.innerHTML='<div class="methodology-error">Dashboard data is unavailable.</div>'}
});
const dashEscape=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const checkedState=()=>{try{return JSON.parse(localStorage.getItem("architecting-ai:mobilise-checklist")||"[]")}catch{return[]}};

function dashboardHero(title,lead){return `<section class="detail-hero"><div class="methodology-wrap"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/transformation/">Transformation</a><span>/</span><a href="/transformation/stage-0-mobilise/">Mobilise</a><span>/</span><span>${dashEscape(title)}</span></nav><span class="eyebrow">Role view · Local planning state</span><h1>${dashEscape(title)}</h1><p class="hero-lead">${dashEscape(lead)}</p></div></section>`}
function readiness(stage){const checked=checkedState(),applicable=stage.exitChecklist.filter(i=>i.criticality!=="recommended");return {done:applicable.filter(i=>checked.includes(i.id)).length,total:applicable.length,percent:Math.round(applicable.filter(i=>checked.includes(i.id)).length/applicable.length*100)}}

function renderExecutive(root,content,stage){
  const ready=readiness(stage),outstanding=content.deliverables.length-Math.min(content.deliverables.length,ready.done),risks=stage.exitChecklist.filter(i=>i.criticality==="mandatory"&&!checkedState().includes(i.id)).slice(0,5);
  root.innerHTML=dashboardHero("Mobilise Executive Dashboard","A concise view of readiness, outstanding evidence, approvals, risk and the next decision.")+`<section class="dashboard-shell methodology-wrap"><div class="dashboard-kpis"><article><span>Mobilisation progress</span><strong>${ready.percent}%</strong><progress value="${ready.percent}" max="100">${ready.percent}%</progress></article><article><span>Outstanding deliverables</span><strong>${outstanding}</strong><small>Planning indicator derived from local checklist evidence</small></article><article><span>Pending approval</span><strong>GATE-0</strong><small>Mobilisation Approval</small></article><article><span>Next milestone</span><strong>Mobilisation Review</strong><small>After mandatory evidence is validated</small></article></div><div class="dashboard-grid"><section><h2>Key readiness gaps</h2>${risks.length?`<ul>${risks.map(i=>`<li><strong>${dashEscape(i.id)}</strong>${dashEscape(i.requirement)}</li>`).join("")}</ul>`:"<p>All mandatory local checklist items are marked evidenced. Formal validation and approval are still required.</p>"}</section><section><h2>Open decisions</h2><ul><li>Approve mandate and scope</li><li>Confirm funding path and owner</li><li>Approve risk appetite and AI principles</li><li>Authorise enterprise discovery</li></ul></section><section><h2>Approval status</h2><div class="approval-state"><span>Current default</span><strong>Rework required until evidence is complete</strong><p>The dashboard cannot make or infer the gate decision.</p></div></section><section><h2>Executive actions</h2><a href="/transformation/stage-0-mobilise/workshops/mobilisation-review/">Prepare Mobilisation Review</a><a href="/transformation/stage-0-mobilise/deliverables/executive-briefing-pack/">Open Executive Briefing Pack</a><a href="/transformation/stage-0-mobilise/#gate">Review gate evidence</a></section></div></section>`;
}

function renderProgramme(root,content,stage){
  const ready=readiness(stage);
  root.innerHTML=dashboardHero("Mobilise Programme Manager Workspace","Track activities, deliverables, workshops, decisions, RAID and approval readiness from one practical Day 1 view.")+`<section class="dashboard-shell methodology-wrap"><div class="dashboard-kpis"><article><span>Stage readiness</span><strong>${ready.percent}%</strong><progress value="${ready.percent}" max="100">${ready.percent}%</progress></article><article><span>Workstreams</span><strong>${content.workstreams.length}</strong><small>All defined and traceable</small></article><article><span>Deliverables</span><strong>${content.deliverables.length}</strong><small>Template starters available</small></article><article><span>Workshops</span><strong>${content.workshops.length}</strong><small>Agenda and decision guidance available</small></article></div><div class="programme-tabs" role="tablist" aria-label="Programme views">${["activities","deliverables","raci","workshops","decisions","raid","approval"].map((tab,index)=>`<button role="tab" aria-selected="${index===0}" aria-controls="panel-${tab}" id="tab-${tab}">${tab[0].toUpperCase()+tab.slice(1)}</button>`).join("")}</div><div id="programme-panels">${programmePanels(content,stage)}</div></section>`;
  root.querySelectorAll('[role="tab"]').forEach(button=>button.addEventListener("click",()=>{root.querySelectorAll('[role="tab"]').forEach(tab=>tab.setAttribute("aria-selected",String(tab===button)));root.querySelectorAll('[role="tabpanel"]').forEach(panel=>panel.hidden=panel.id!==button.getAttribute("aria-controls"));button.focus()}));
}

function programmePanels(content,stage){
  const panels={
    activities:`<div class="tracker-list">${content.workstreams.map((w,index)=>`<a href="/transformation/stage-0-mobilise/workstreams/${w.slug}/"><span>${String(index+1).padStart(2,"0")}</span><strong>${dashEscape(w.name)}</strong><em>${dashEscape(w.owner)}</em></a>`).join("")}</div>`,
    deliverables:`<div class="tracker-list">${content.deliverables.map(d=>`<a href="/transformation/stage-0-mobilise/deliverables/${d.slug}/"><span>${dashEscape(d.id)}</span><strong>${dashEscape(d.name)}</strong><em>${dashEscape(d.approver)}</em></a>`).join("")}</div>`,
    raci:`<p>Use the validated stage-level RACI to confirm one accountable role for every activity.</p><a class="button primary" href="/transformation/stage-0-mobilise/#raci">Open Stage 0 RACI</a>`,
    workshops:`<div class="tracker-list">${content.workshops.map(w=>`<a href="/transformation/stage-0-mobilise/workshops/${w.slug}/"><span>${dashEscape(w.duration)}</span><strong>${dashEscape(w.name)}</strong><em>${dashEscape(w.facilitator)}</em></a>`).join("")}</div>`,
    decisions:`<ul><li>Mandate and scope approval</li><li>Governance and decision-right approval</li><li>Funding-path approval</li><li>Risk appetite and AI-principle approval</li><li>Mobilisation gate decision</li></ul>`,
    raid:`<p>The RAID Register is the canonical Mobilise record for risks, assumptions, issues and dependencies.</p><a class="button primary" href="/transformation/stage-0-mobilise/deliverables/raid-register/">Open RAID Register guidance</a>`,
    approval:`<p>Formal approval requires all mandatory evidence, validated checklist items, recorded conditions and an authorised gate decision.</p><a class="button primary" href="/transformation/stage-0-mobilise/#gate">Review gate and exit checklist</a>`
  };
  return Object.entries(panels).map(([key,value],index)=>`<section role="tabpanel" id="panel-${key}" aria-labelledby="tab-${key}"${index===0?"":" hidden"}><h2>${key[0].toUpperCase()+key.slice(1)}</h2>${value}</section>`).join("");
}
