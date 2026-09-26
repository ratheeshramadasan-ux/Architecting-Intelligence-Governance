const detailEscape=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const detailList=items=>`<ul>${items.map(item=>`<li>${detailEscape(item)}</li>`).join("")}</ul>`;

document.addEventListener("DOMContentLoaded",async()=>{
  const root=document.querySelector("#mobilise-detail-root");
  try{
    const response=await fetch("/assets/data/mobilise-content.json");
    if(!response.ok)throw new Error("Mobilise guidance is unavailable.");
    const data=await response.json();
    const kind=document.body.dataset.contentKind,slug=document.body.dataset.contentSlug;
    const collection=kind==="workstream"?data.workstreams:kind==="deliverable"?data.deliverables:data.workshops;
    const item=collection.find(entry=>entry.slug===slug);
    if(!item)throw new Error("This Mobilise page was not found.");
    root.className="";
    if(kind==="workstream")renderWorkstream(root,item,data);
    if(kind==="deliverable")renderDeliverable(root,item,data);
    if(kind==="workshop")renderWorkshop(root,item,data);
    wireAssistantDialog();
  }catch(error){
    root.className="methodology-wrap methodology-section";
    root.innerHTML=`<div class="methodology-error" role="alert"><strong>Unable to load this guidance.</strong><span>${detailEscape(error.message)}</span></div>`;
  }
});

function detailHero(kind,item,summary){
  const label=kind==="workstream"?"Mobilise workstream":kind==="deliverable"?`${item.id} · ${item.type}`:"Mobilise workshop";
  return `<section class="detail-hero"><div class="methodology-wrap"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/transformation/">Transformation</a><span>/</span><a href="/transformation/stage-0-mobilise/">Mobilise</a><span>/</span><span>${detailEscape(item.name)}</span></nav><span class="eyebrow">${detailEscape(label)}</span><h1>${detailEscape(item.name)}</h1><p class="hero-lead">${detailEscape(summary)}</p></div></section>`;
}

function pageShell(main,aside){
  return `<div class="detail-layout methodology-wrap"><article class="detail-content">${main}</article><aside class="detail-aside">${aside}</aside></div>`;
}

function renderWorkstream(root,item,data){
  const relatedDeliverables=item.deliverables.map(slug=>data.deliverables.find(d=>d.slug===slug)).filter(Boolean);
  root.innerHTML=detailHero("workstream",item,item.summary)+pageShell(`
    <section id="summary"><span class="content-kicker">Executive summary</span><h2>Establish ${detailEscape(item.name.toLowerCase())} before discovery begins.</h2><p>${detailEscape(item.summary)} The workstream turns leadership intent into named activities, evidence and governed outputs.</p></section>
    <section><h2>Plain-language explanation</h2><p>This workstream makes sure the organisation knows what it is trying to achieve, who must contribute, who validates the result and which records prove that the work is complete.</p></section>
    <section><h2>Business value</h2><p>Clear mobilisation reduces decision delay, repeated information requests, unowned risk and investment in solutions that do not support agreed outcomes.</p></section>
    <section><h2>Activities and journey</h2><ol class="journey-steps">${item.activities.map((activity,index)=>`<li><span>${index+1}</span><strong>${detailEscape(activity)}</strong><em>${index===0?"Start with available evidence":index===item.activities.length-1?"Confirm output, owner and approval":"Record decisions and dependencies"}</em></li>`).join("")}</ol><div class="future-visual"><span>Future interactive walkthrough</span><p>This reserved component will animate evidence moving from activity to deliverable to gate without changing the deterministic process definition.</p></div></section>
    <section><h2>Inputs</h2>${detailList(item.inputs)}</section>
    <section><h2>Outputs</h2>${detailList(item.outputs)}</section>
    <section><h2>Workstream RACI</h2><div class="compact-raci">${item.raci.map(row=>`<div><strong>${detailEscape(row[0])}</strong><span><b>A</b> ${detailEscape(row[1])}</span><span><b>R</b> ${detailEscape(row[2])}</span><span><b>C</b> ${detailEscape(row[3])}</span></div>`).join("")}</div></section>
    <section><h2>Enterprise examples</h2><div class="sector-grid"><div><h3>Public sector</h3><p>${detailEscape(data.common.publicSector)}</p></div><div><h3>Private sector</h3><p>${detailEscape(data.common.privateSector)}</p></div></div></section>
    <section><h2>Common pitfalls</h2>${detailList(data.common.pitfalls)}</section>
    <section><h2>Success criteria</h2>${detailList(data.common.success)}</section>
    <section><h2>References and related knowledge</h2>${detailList(data.references)}</section>
  `,`<div class="aside-card"><span>Accountability</span><dl><dt>Owner</dt><dd>${detailEscape(item.owner)}</dd><dt>Validator</dt><dd>${detailEscape(item.validator)}</dd></dl></div>
    <div class="aside-card"><span>Related deliverables</span>${relatedDeliverables.map(d=>`<a href="/transformation/stage-0-mobilise/deliverables/${detailEscape(d.slug)}/">${detailEscape(d.name)}</a>`).join("")}</div>
    <div class="aside-card"><span>Related stages</span>${item.relatedStages.map(stage=>`<p>${detailEscape(stage)}</p>`).join("")}</div>
    ${assistantButton(item.assistant,`Create guided support for ${item.name}. ${item.assistant}. Ask for enterprise context, identify missing evidence and return a draft that requires human validation.`)}`);
}

function renderDeliverable(root,item,data){
  const related=item.related.map(slug=>data.deliverables.find(d=>d.slug===slug)).filter(Boolean);
  root.innerHTML=detailHero("deliverable",item,item.purpose)+pageShell(`
    <section><span class="content-kicker">Executive summary</span><h2>A governed record for an accountable enterprise decision.</h2><p>${detailEscape(item.purpose)}</p></section>
    <section><h2>Why it matters</h2><p>${detailEscape(item.why)}</p></section>
    <section><h2>When to create it</h2><p>${detailEscape(item.when)}</p></section>
    <section><h2>Required inputs</h2>${detailList(item.inputs)}</section>
    <section><h2>Example structure</h2><ol class="template-structure">${item.structure.map((section,index)=>`<li><span>${index+1}</span><div><strong>${detailEscape(section)}</strong><p>Record verified information, source, owner, assumptions and review status.</p></div></li>`).join("")}</ol></section>
    <section><h2>Enterprise examples and considerations</h2><div class="sector-grid"><div><h3>Public sector</h3><p>${detailEscape(item.publicSector)}</p></div><div><h3>Private sector</h3><p>${detailEscape(item.privateSector)}</p></div></div></section>
    <section><h2>Common mistakes</h2>${detailList(item.mistakes)}</section>
    <section><h2>Success criteria</h2>${detailList(item.success)}</section>
    <section><h2>Approval requirements</h2><p>${detailEscape(item.approval)}</p></section>
    <section><h2>Related knowledge and references</h2>${detailList(data.references)}</section>
  `,`<div class="aside-card"><span>Deliverable record</span><dl><dt>ID</dt><dd>${detailEscape(item.id)}</dd><dt>Type</dt><dd>${detailEscape(item.type)}</dd><dt>Owner</dt><dd>${detailEscape(item.owner)}</dd><dt>Approver</dt><dd>${detailEscape(item.approver)}</dd></dl></div>
    <a class="button primary full" href="${detailEscape(item.template)}" download>Download template starter</a>
    <div class="aside-card"><span>Related deliverables</span>${related.map(d=>`<a href="/transformation/stage-0-mobilise/deliverables/${detailEscape(d.slug)}/">${detailEscape(d.name)}</a>`).join("")}</div>
    ${assistantButton(`Generate ${item.name}`,item.ai)}`);
}

function renderWorkshop(root,item,data){
  root.innerHTML=detailHero("workshop",item,item.objective)+pageShell(`
    <section><span class="content-kicker">Workshop objective</span><h2>${detailEscape(item.objective)}</h2><p>A workshop is complete only when outputs, open questions, owners and decisions are recorded.</p></section>
    <section><h2>Preparation</h2>${detailList(item.preparation)}</section>
    <section><h2>Time-boxed agenda</h2><ol class="journey-steps">${item.agenda.map((step,index)=>`<li><span>${index+1}</span><strong>${detailEscape(step)}</strong><em>${index===0?"10 minutes":index===item.agenda.length-1?"20 minutes":"Time-box to fit the approved duration"}</em></li>`).join("")}</ol></section>
    <section><h2>Discussion questions</h2>${detailList(item.questions)}</section>
    <section><h2>Expected outputs</h2>${detailList(item.outputs)}</section>
    <section><h2>Decisions required</h2>${detailList(item.decisions)}</section>
    <section><h2>Public- and private-sector considerations</h2><div class="sector-grid"><div><h3>Public sector</h3><p>${detailEscape(data.common.publicSector)}</p></div><div><h3>Private sector</h3><p>${detailEscape(data.common.privateSector)}</p></div></div></section>
    <section><h2>Success criteria</h2>${detailList(["Required participants or authorised delegates attend","Evidence and assumptions are visible","Outputs have named owners","Decisions and dissent are recorded","Follow-up actions have dates"])}</section>
  `,`<div class="aside-card"><span>Workshop details</span><dl><dt>Duration</dt><dd>${detailEscape(item.duration)}</dd><dt>Facilitator</dt><dd>${detailEscape(item.facilitator)}</dd></dl></div><div class="aside-card"><span>Participants</span>${item.participants.map(value=>`<p>${detailEscape(value)}</p>`).join("")}</div>${assistantButton("Generate workshop agenda",item.assistant)}`);
}

function assistantButton(label,prompt){
  return `<button class="assistant-launch" type="button" data-assistant-label="${detailEscape(label)}" data-assistant-prompt="${detailEscape(prompt)}"><span>Guided AI assistance</span><strong>${detailEscape(label)}</strong><em>Design only · no AI backend</em></button>`;
}

function wireAssistantDialog(){
  document.body.insertAdjacentHTML("beforeend",`<dialog id="assistant-dialog" class="assistant-dialog"><form method="dialog"><button class="dialog-close" aria-label="Close">×</button><span class="content-kicker">Guided prompt builder</span><h2 id="assistant-title">AI assistance</h2><p>This interaction prepares a grounded prompt. It does not call an AI service or approve the resulting artifact.</p><label for="assistant-context">Enterprise context and verified evidence</label><textarea id="assistant-context" rows="7" placeholder="Describe the organisation, business need, known evidence, owners, constraints and open questions. Do not include sensitive information unless an approved AI service is configured."></textarea><label for="assistant-prompt">Prepared prompt</label><textarea id="assistant-prompt" rows="10" readonly></textarea><div class="dialog-actions"><button id="copy-assistant-prompt" class="button primary" type="button">Copy prepared prompt</button><button class="button secondary">Close</button></div><p id="assistant-copy-status" role="status" aria-live="polite"></p></form></dialog>`);
  const dialog=document.querySelector("#assistant-dialog");
  document.querySelectorAll(".assistant-launch").forEach(button=>button.addEventListener("click",()=>{
    dialog.dataset.basePrompt=button.dataset.assistantPrompt;
    dialog.querySelector("#assistant-title").textContent=button.dataset.assistantLabel;
    updatePreparedPrompt(dialog);
    dialog.showModal();
  }));
  dialog.querySelector("#assistant-context").addEventListener("input",()=>updatePreparedPrompt(dialog));
  dialog.querySelector("#copy-assistant-prompt").addEventListener("click",async()=>{
    try{await navigator.clipboard.writeText(dialog.querySelector("#assistant-prompt").value);dialog.querySelector("#assistant-copy-status").textContent="Prepared prompt copied."}
    catch{dialog.querySelector("#assistant-copy-status").textContent="Copy is unavailable. Select the prompt text manually."}
  });
}

function updatePreparedPrompt(dialog){
  const context=dialog.querySelector("#assistant-context").value.trim()||"[Add verified enterprise context here]";
  dialog.querySelector("#assistant-prompt").value=`${dialog.dataset.basePrompt}\n\nEnterprise context:\n${context}\n\nRequired response controls:\n- Separate verified facts, assumptions and missing evidence.\n- Use ranges instead of unsupported precision.\n- Identify owner, reviewers and required approver.\n- Map the draft to related Mobilise deliverables and the Mobilisation Approval Gate.\n- Mark the result DRAFT — HUMAN REVIEW REQUIRED.`;
}
