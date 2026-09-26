const apEscape=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
document.addEventListener("DOMContentLoaded",async()=>{
  const root=document.querySelector("#assessment-framework-root");
  try{
    const data=await fetch("/assets/data/assessment-framework.json").then(r=>r.json());
    root.className="";
    root.innerHTML=`<section class="detail-hero"><div class="methodology-wrap"><span class="eyebrow">Cross-stage enterprise capability</span><h1>Enterprise Assessment Framework</h1><p class="hero-lead">Define once. Apply consistently from discovery evidence through operations and continuous improvement.</p><div class="hero-actions"><a class="button primary" href="/assessments/library/">Browse assessments</a><a class="button secondary" href="/assessments/dashboard/">Open executive dashboard</a></div></div></section>
    <div class="methodology-wrap assessment-shell">
      <section><span class="content-kicker">Reusable platform structure</span><h2>One evidence-led assessment language</h2><div class="assessment-entity-grid">${data.entities.map(x=>`<span>${apEscape(x)}</span>`).join("")}</div></section>
      <section><h2>Shared maturity model</h2><div class="maturity-grid">${data.maturity.map(x=>`<article><span>Level ${x.level}</span><h3>${apEscape(x.name)}</h3><p>${apEscape(x.definition)}</p></article>`).join("")}</div></section>
      <section><h2>Assessment traceability</h2><div class="traceability-flow">${data.traceability.map(x=>`<span>${apEscape(x)}</span>`).join("")}</div><p class="dashboard-notice">Maturity, risk and confidence remain separate. No score is valid without traceable evidence and accountable human approval.</p></section>
      <section><h2>Complete assessment catalogue</h2><div class="assessment-card-grid">${data.assessments.map(x=>`<a href="/assessments/${x.slug}/"><span>${x.id} · ${apEscape(x.type)}</span><h3>${apEscape(x.name)}</h3><p>${apEscape(x.purpose)}</p><small>${apEscape(x.primaryStage)} · ${apEscape(x.owner)}</small></a>`).join("")}</div></section>
      <section><h2>Governed prompt builders</h2><div class="method-grid four">${data.prompts.map(x=>`<article><strong>${x.id.slice(0,2).toUpperCase()}</strong><h3>${apEscape(x.name)}</h3><p>${apEscape(x.instruction)} Human validation is mandatory.</p></article>`).join("")}</div></section>
    </div>`;
  }catch(error){root.innerHTML=`<div class="methodology-error">${apEscape(error.message)}</div>`}
});
