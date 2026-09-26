const ae=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const list=items=>`<ul>${items.map(x=>`<li>${ae(x)}</li>`).join("")}</ul>`;
document.addEventListener("DOMContentLoaded",async()=>{
  const root=document.querySelector("#assessment-detail-root");
  try{
    const data=await fetch("/assets/data/assessment-framework.json").then(r=>r.json()),item=data.assessments.find(x=>x.slug===document.body.dataset.assessment);
    if(!item)throw new Error("Assessment not found.");
    root.className="";
    root.innerHTML=`<section class="detail-hero"><div class="methodology-wrap"><nav class="breadcrumbs"><a href="/assessments/">Assessments</a><span>/</span><a href="/assessments/library/">Library</a><span>/</span><span>${ae(item.name)}</span></nav><span class="eyebrow">${item.id} · ${ae(item.type)}</span><h1>${ae(item.name)}</h1><p class="hero-lead">${ae(item.purpose)}</p></div></section>
    <div class="detail-layout methodology-wrap"><article class="detail-content">
    ${section("Purpose and business value",`<p>${ae(item.purpose)}</p><p>${ae(item.value)}</p>`)}
    ${section("Assessment objectives",list(item.objectives))}${section("Scope",list(item.scope))}
    ${section("Assessment questions",`<ol>${item.questions.map(x=>`<li>${ae(x)}</li>`).join("")}</ol>`)}
    ${section("Evidence required",list(item.evidence))}
    ${section("Scoring approach",`<dl class="assessment-definition"><dt>Scale</dt><dd>${ae(item.scoring.scale)}</dd><dt>Method</dt><dd>${ae(item.scoring.method)}</dd><dt>Aggregation</dt><dd>${ae(item.scoring.aggregation)}</dd><dt>Confidence</dt><dd>${ae(item.scoring.confidence)}</dd></dl>`)}
    ${section("Shared maturity model",`<div class="maturity-grid">${data.maturity.map(x=>`<article><span>Level ${x.level}</span><h3>${ae(x.name)}</h3><p>${ae(x.definition)}</p></article>`).join("")}</div>`)}
    ${section("Risk interpretation",list(item.risk))}${section("Recommendations",list(item.recommendations))}
    ${section("Traceability",`<div class="traceability-flow">${data.traceability.map(x=>`<span>${ae(x)}</span>`).join("")}</div>`)}
    </article><aside class="detail-aside"><div class="aside-card"><span>Accountability</span><dl><dt>Owner</dt><dd>${ae(item.owner)}</dd><dt>Primary stage</dt><dd>${ae(item.primaryStage)}</dd><dt>Capability</dt><dd>${ae(item.topic)}</dd></dl></div><div class="aside-card"><span>Related stages</span>${item.relatedStages.map(x=>`<p>${ae(x)}</p>`).join("")}</div><div class="aside-card"><span>Related deliverables</span>${item.relatedDeliverables.map(x=>`<p>${ae(x)}</p>`).join("")}</div><button class="assistant-launch" type="button"><span>Guided AI assistance</span><strong>Open prompt builders</strong><em>Design only · no AI execution</em></button></aside></div>`;
    wireAssistant(data,item);
  }catch(error){root.innerHTML=`<div class="methodology-error">${ae(error.message)}</div>`}
});
const section=(title,body)=>`<section><h2>${title}</h2>${body}</section>`;
function wireAssistant(data,item){
  document.body.insertAdjacentHTML("beforeend",`<dialog class="assistant-dialog" id="assessment-assistant"><form method="dialog"><button class="dialog-close" aria-label="Close">×</button><span class="content-kicker">Human-reviewed prompt builder</span><h2>${ae(item.name)}</h2><label for="assessment-action">Action</label><select id="assessment-action">${data.prompts.map(x=>`<option value="${x.id}">${ae(x.name)}</option>`).join("")}</select><label for="assessment-context">Verified context and evidence</label><textarea id="assessment-context" rows="6"></textarea><label for="assessment-prompt">Prepared prompt</label><textarea id="assessment-prompt" rows="11" readonly></textarea><div class="dialog-actions"><button id="assessment-copy" class="button primary" type="button">Copy prompt</button><button class="button secondary">Close</button></div><p id="assessment-status" role="status"></p></form></dialog>`);
  const dialog=document.querySelector("#assessment-assistant"),action=dialog.querySelector("#assessment-action"),context=dialog.querySelector("#assessment-context"),output=dialog.querySelector("#assessment-prompt");
  const update=()=>{const selected=data.prompts.find(x=>x.id===action.value);output.value=`Assessment: ${item.name}\nPurpose: ${item.purpose}\nAction: ${selected.instruction}\n\nVerified evidence and context:\n${context.value||"[Add verified context]"}\n\nRequirements:\n- Separate facts, assumptions, conflicts and missing evidence.\n- Cite evidence source, owner, date and confidence.\n- Use the shared five-level maturity model.\n- Do not invent scores, risks, costs or findings.\n- Mark output DRAFT — HUMAN VALIDATION REQUIRED.`};
  action.addEventListener("change",update);context.addEventListener("input",update);document.querySelector(".assistant-launch").addEventListener("click",()=>{update();dialog.showModal()});dialog.querySelector("#assessment-copy").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(output.value);dialog.querySelector("#assessment-status").textContent="Prompt copied."}catch{dialog.querySelector("#assessment-status").textContent="Select and copy the prompt manually."}});
}
