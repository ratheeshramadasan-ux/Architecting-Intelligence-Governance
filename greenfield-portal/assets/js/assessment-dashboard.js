const adEscape=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
document.addEventListener("DOMContentLoaded",async()=>{
  const root=document.querySelector("#assessment-dashboard-root");
  try{
    const data=await fetch("/assets/data/assessment-framework.json").then(r=>r.json());
    const dimensions=["Governance","Security","Architecture","Data","Operations","AI","Automation","Risk","Readiness"];
    root.className="";
    root.innerHTML=`<section class="detail-hero"><div class="methodology-wrap"><nav class="breadcrumbs"><a href="/assessments/">Assessments</a><span>/</span><span>Dashboard</span></nav><span class="eyebrow">Executive assessment view</span><h1>Enterprise Assessment Dashboard</h1><p class="hero-lead">A reusable dashboard structure for evidence-supported scores, risks, priorities and trends.</p></div></section>
    <div class="methodology-wrap dashboard-shell"><p class="dashboard-notice"><strong>No enterprise assessment data has been loaded.</strong> All values remain “Not assessed” until evidence is verified and an accountable owner approves the result.</p>
    <div class="dashboard-kpis"><article><span>Overall enterprise score</span><strong>Not assessed</strong><small>Evidence required</small></article><article><span>Assessments available</span><strong>${data.assessments.length}</strong><small>Reusable definitions</small></article><article><span>Top risks</span><strong>Pending</strong><small>Requires completed assessments</small></article><article><span>Top priorities</span><strong>Pending</strong><small>Requires approved findings</small></article></div>
    <section class="assessment-scoreboard"><h2>Enterprise dimensions</h2>${dimensions.map(x=>`<div><strong>${x}</strong><span>Not assessed</span><progress max="100" value="0" aria-label="${x} score, not assessed"></progress></div>`).join("")}</section>
    <div class="dashboard-grid"><section><h2>Top risks</h2><p class="empty-state">Risk findings will appear after evidence-supported assessments are approved.</p></section><section><h2>Top priorities</h2><p class="empty-state">Priorities will appear after recommendations have accountable owners.</p></section><section><h2>Trend placeholders</h2><div class="trend-placeholder" aria-label="No trend data available">Baseline → Reassessment → Improvement</div></section><section><h2>Confidence</h2><p>Scores must display High, Medium, Low or Unverified confidence separately from maturity.</p></section></div></div>`;
  }catch(error){root.innerHTML=`<div class="methodology-error">${adEscape(error.message)}</div>`}
});
