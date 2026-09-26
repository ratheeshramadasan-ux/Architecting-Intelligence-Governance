const discoverDashboardEscape=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));

document.addEventListener("DOMContentLoaded",async()=>{
  const root=document.querySelector("#discover-dashboard-root");
  try{
    const data=await fetch("/assets/data/discover-content.json").then(response=>{
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      return response.json();
    });
    const view=document.body.dataset.dashboard;
    root.className="dashboard-shell methodology-wrap";
    root.innerHTML=dashboardHeader(view)+(
      view==="executive"?executiveView(data):
      view==="programme"?programmeView(data):
      architectureView(data)
    );
    if(view==="programme")wireProgrammeTabs();
  }catch(error){
    root.innerHTML=`<div class="methodology-error">The Discover dashboard could not be loaded. ${discoverDashboardEscape(error.message)}</div>`;
  }
});

function dashboardHeader(view){
  const titles={executive:"Discover Executive Dashboard",programme:"Discover Programme Dashboard",architecture:"Enterprise Architecture Discovery Dashboard"};
  return `<nav class="breadcrumbs dark-breadcrumbs" aria-label="Breadcrumb"><a href="/transformation/">Transformation</a><span>/</span><a href="/transformation/stage-1-discover/">Discover</a><span>/</span><span>${discoverDashboardEscape(titles[view])}</span></nav>
    <span class="eyebrow dark">Stage 1 control view</span><h1 class="dashboard-title">${discoverDashboardEscape(titles[view])}</h1>
    <p class="dashboard-notice">This is a methodology readiness view. Counts describe the canonical discovery framework; enterprise evidence status changes only when verified records are collected.</p>`;
}

function executiveView(data){
  return `<div class="dashboard-kpis">
    ${kpi("Discovery domains",data.domains.length,"Defined and ready for evidence collection")}
    ${kpi("Evidence requirements",data.evidence.length,"Each has owner, source and validation method")}
    ${kpi("Required deliverables",data.deliverables.length,"Mandatory at Discovery Approval")}
    ${kpi("Gate readiness","0%","No enterprise evidence has been asserted")}
  </div><div class="dashboard-grid">
    <section><h2>Progress and evidence</h2><ul><li>${data.domains.length} domain discovery plans defined</li><li>${data.evidence.length} evidence requirements catalogued</li><li>${data.workshops.length} facilitated workshops available</li></ul><a href="/transformation/stage-1-discover/search/">Search the evidence model →</a></section>
    <section><h2>Outstanding work</h2><ul><li>Assign named enterprise evidence owners</li><li>Collect and validate source records</li><li>Produce and approve all ${data.deliverables.length} mandatory deliverables</li></ul></section>
    <section><h2>Risks and decisions</h2><ul><li>Unverified or stale evidence lowers baseline confidence.</li><li>Shadow AI requires protected, non-punitive discovery channels.</li><li>Conflicting sources require an accountable owner decision.</li></ul></section>
    <section><h2>Readiness decision</h2><div class="approval-state"><span>${discoverDashboardEscape(data.gate.id)}</span><strong>${discoverDashboardEscape(data.gate.name)}</strong><p>${discoverDashboardEscape(data.gate.question)}</p></div></section>
  </div>`;
}

function programmeView(data){
  const tabs=["domains","deliverables","workshops","evidence","dependencies","risks"];
  const panels={
    domains:tracker(data.domains,"Domain",x=>x.summary, x=>`/transformation/stage-1-discover/domains/${x.slug}/`),
    deliverables:tracker(data.deliverables,"Deliverable",x=>`${x.owner} · ${x.approver}`,x=>`/transformation/stage-1-discover/deliverables/${x.slug}/`),
    workshops:tracker(data.workshops,"Workshop",x=>`${x.duration} · ${x.facilitator}`,x=>`/transformation/stage-1-discover/workshops/${x.slug}/`),
    evidence:`<p>${data.evidence.length} evidence requirements across ${data.domains.length} domains.</p>${tracker(data.domains,"Evidence",x=>`${data.evidence.filter(e=>e.domain===x.slug).length} requirements`,x=>`/transformation/stage-1-discover/domains/${x.slug}/`)}`,
    dependencies:`<ul>${data.traceability.sequence.map((x,i)=>`<li><strong>${i+1}. ${discoverDashboardEscape(x)}</strong></li>`).join("")}</ul>`,
    risks:"<ul><li>Unavailable or contradictory source evidence</li><li>Unclear ownership and validation authority</li><li>Incomplete shadow technology disclosure</li><li>Discovery conclusions unsupported by traceable evidence</li></ul>"
  };
  return `<div class="dashboard-kpis">${kpi("Domains",data.domains.length,"Canonical scope")}${kpi("Deliverables",data.deliverables.length,"Gate evidence")}${kpi("Workshops",data.workshops.length,"Facilitated sessions")}${kpi("Evidence records",data.evidence.length,"Collection requirements")}</div>
    <div class="programme-tabs" role="tablist">${tabs.map((tab,i)=>`<button role="tab" aria-selected="${i===0}" aria-controls="panel-${tab}" id="tab-${tab}">${tab}</button>`).join("")}</div>
    <div id="programme-panels">${tabs.map((tab,i)=>`<section id="panel-${tab}" role="tabpanel" aria-labelledby="tab-${tab}" ${i?"hidden":""}><h2>${tab[0].toUpperCase()+tab.slice(1)}</h2>${panels[tab]}</section>`).join("")}</div>`;
}

function architectureView(data){
  const groups=[
    ["Applications","applications-systems","application-portfolio"],["Integrations","integration-apis","integration-catalogue"],
    ["Data","data-information","data-inventory"],["Infrastructure","infrastructure-hosting","infrastructure-assessment"],
    ["AI","ai-landscape","ai-capability-inventory"],["Automation","automation-landscape","automation-inventory"]
  ];
  return `<div class="dashboard-kpis">${kpi("Architecture domains",groups.length,"Core technical views")}${kpi("Evidence requirements",groups.reduce((n,g)=>n+data.evidence.filter(e=>e.domain===g[1]).length,0),"Across architecture views")}${kpi("Technical debt","Catalogue ready","No enterprise records asserted")}${kpi("Baseline confidence","Not assessed","Requires validated evidence")}</div>
    <div class="dashboard-grid">${groups.map(([name,domain,deliverable])=>`<section><span class="content-kicker">${discoverDashboardEscape(name)}</span><h2>${discoverDashboardEscape(name)} landscape</h2><p>${data.evidence.filter(e=>e.domain===domain).length} structured evidence requirements are ready for collection.</p><a href="/transformation/stage-1-discover/domains/${domain}/">Open domain →</a><a href="/transformation/stage-1-discover/deliverables/${deliverable}/">Open deliverable →</a></section>`).join("")}
    <section><span class="content-kicker">Cross-cutting</span><h2>Technical debt</h2><p>Consolidate obsolescence, unsupported platforms, integration fragility, data quality and security remediation into one governed register.</p><a href="/transformation/stage-1-discover/deliverables/technical-debt-register/">Open register →</a></section></div>`;
}

function kpi(label,value,note){return `<article><span>${discoverDashboardEscape(label)}</span><strong>${discoverDashboardEscape(value)}</strong><small>${discoverDashboardEscape(note)}</small></article>`}
function tracker(items,label,note,href){return `<div class="tracker-list">${items.map((item,i)=>`<a href="${href(item)}"><span>${discoverDashboardEscape(item.id||`${label} ${i+1}`)}</span><strong>${discoverDashboardEscape(item.name)}</strong><em>${discoverDashboardEscape(note(item))}</em></a>`).join("")}</div>`}
function wireProgrammeTabs(){
  document.querySelectorAll('[role="tab"]').forEach(tab=>tab.addEventListener("click",()=>{
    document.querySelectorAll('[role="tab"]').forEach(x=>x.setAttribute("aria-selected",String(x===tab)));
    document.querySelectorAll('[role="tabpanel"]').forEach(panel=>panel.hidden=panel.id!==tab.getAttribute("aria-controls"));
  }));
}
