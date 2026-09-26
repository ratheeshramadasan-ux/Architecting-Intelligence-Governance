if(!document.querySelector('script[src^="/assets/js/people.js"]')){const peopleScript=document.createElement('script');peopleScript.src='/assets/js/people.js?v=20260924-1';peopleScript.defer=true;document.head.appendChild(peopleScript)}

if(!document.querySelector('script[src^="/assets/js/shared-site-shell.js"]')){
  const sharedShellScript=document.createElement('script');
  sharedShellScript.src='/assets/js/shared-site-shell.js?v=20260727-4';
  sharedShellScript.defer=true;
  document.head.append(sharedShellScript);
}

const methodologyState={data:null};
const escapeMethodology=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));

document.addEventListener("DOMContentLoaded",async()=>{
  try{
    const response=await fetch("/assets/data/methodology.json",{headers:{Accept:"application/json"}});
    if(!response.ok)throw new Error("Methodology data is unavailable.");
    methodologyState.data=await response.json();
    const {loadNavigation}=await import("/assets/js/navigation-model.js");
    methodologyState.data.navigation=await loadNavigation(methodologyState.data.navigation);
    if(document.body.dataset.methodologyPage==="mobilise"){
      const mobiliseResponse=await fetch("/assets/data/mobilise-content.json",{headers:{Accept:"application/json"}});
      if(!mobiliseResponse.ok)throw new Error("Complete Mobilise content is unavailable.");
      methodologyState.mobiliseContent=await mobiliseResponse.json();
    }
    renderMethodologyShell(methodologyState.data);
    if(["overview","lifecycle"].includes(document.body.dataset.methodologyPage))renderLifecycle(methodologyState.data.stages);
    if(document.body.dataset.methodologyPage==="mobilise")renderMobilise(methodologyState.data.mobilise,methodologyState.mobiliseContent);
    setupMethodologyInteractions();
    setupPageSubmenu();
    setupCopyDeterrence();
    setupSharedStageNavigation();
  }catch(error){
    document.querySelector("#main-content")?.insertAdjacentHTML("afterbegin",`<div class="methodology-error" role="alert"><strong>The methodology could not be loaded.</strong><span>${escapeMethodology(error.message)}</span></div>`);
  }
});

window.setupSharedStageNavigation=function setupSharedStageNavigation(){
  const nav=document.querySelector(".stage-nav");if(!nav||nav.dataset.enhanced)return;nav.dataset.enhanced="true";
  const toggle=nav.querySelector(".stage-nav-toggle"),links=[...nav.querySelectorAll("nav a[href^='#']")];
  toggle?.addEventListener("click",()=>{const open=toggle.getAttribute("aria-expanded")!=="true";toggle.setAttribute("aria-expanded",String(open));nav.classList.toggle("open",open)});
  links.forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");toggle?.setAttribute("aria-expanded","false")}));
  if(!("IntersectionObserver" in window))return;
  const observer=new IntersectionObserver(entries=>{const active=entries.filter(x=>x.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];if(active)links.forEach(a=>{if(a.hash===`#${active.target.id}`)a.setAttribute("aria-current","location");else a.removeAttribute("aria-current")})},{rootMargin:"-18% 0px -68% 0px"});
  links.map(a=>document.querySelector(a.hash)).filter(Boolean).forEach(x=>observer.observe(x));
};

function renderMethodologyShell(data){
  const current=location.pathname;
  const isHomepage=current==="/"||current==="/index.html";
  const logoAsset=isHomepage?"/assets/images/ratheesh-technology-logo-dark-header.png?v=20260924-1":"/assets/images/ratheesh-technology-logo-transparent.png?v=20260727-8";
  const logoDimensions=isHomepage?'width="2172" height="724"':'width="1906" height="825"';
  const header=document.querySelector("#methodology-header");
  header.className=`methodology-header ${isHomepage?'site-header--dark':'site-header--light'}`;
  header.innerHTML=`<div class="methodology-utility"><div class="methodology-wrap"><span>Enterprise AI Transformation Methodology</span><div class="methodology-account-links"><span>Approved baseline · ${escapeMethodology(data.version)}</span><a href="/admin">Administration</a><a href="/login">Sign in</a></div></div></div>
  <div class="methodology-header-main methodology-wrap"><a class="methodology-brand" href="/" aria-label="Ratheesh Technology Ltd. — Architecting Intelligence home"><img src="${logoAsset}" alt="Ratheesh Technology Ltd. — AI Implementation and Governance" ${logoDimensions}></a>
  <button class="methodology-menu-button" type="button" aria-expanded="false" aria-controls="methodology-navigation"><span></span><span></span><span></span><span class="sr-only">Open navigation</span></button>
  <nav id="methodology-navigation" class="methodology-navigation" aria-label="Primary navigation"><ul>${data.navigation.map(item=>renderMethodologyNavigationItem(item,current)).join("")}</ul></nav><div class="global-header-actions"><button type="button" data-global-search aria-label="Search Architecting Intelligence"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m16.2 16.2 4 4"></path></svg></button><a href="/login">Sign in</a></div></div>`;
  const footer=document.querySelector("#methodology-footer")||document.querySelector("body > footer");
  if(footer){
    footer.id="methodology-footer";
    footer.innerHTML=`<div class="methodology-wrap methodology-footer-inner"><div class="methodology-footer-brand"><img src="/assets/images/ratheesh-technology-logo-transparent.png?v=20260727-8" alt="Ratheesh Technology Ltd." width="1906" height="825"><p><strong>Architecting Intelligence</strong><span>${escapeMethodology(data.identity.statement)}</span></p></div><div><span>Methodology version ${escapeMethodology(data.version)}</span><span>© 2026 Ratheesh Technology Ltd.</span></div></div>`;
  }
  window.renderSharedSiteFooter?.();
  setupGlobalPortalSearch();
}

function setupGlobalPortalSearch(){
  const trigger=document.querySelector("[data-global-search]");if(!trigger)return;
  const open=async()=>{
    if(window.openPortalSearch){window.openPortalSearch();return}
    let dialog=document.querySelector("#global-search-dialog");
    if(!dialog){
      dialog=document.createElement("dialog");dialog.id="global-search-dialog";dialog.className="global-search-dialog";
      dialog.innerHTML='<div class="global-search-head"><div><span>Global search</span><h2>Search Architecting Intelligence</h2></div><button type="button" data-search-close aria-label="Close search">×</button></div><form role="search"><label for="global-search-query">Search the portal</label><div><input id="global-search-query" type="search" minlength="2" autocomplete="off" placeholder="Search architecture, governance, deliverables…"><button type="submit">Search</button></div></form><p data-search-status role="status" aria-live="polite"></p><div class="global-search-results"></div>';
      document.body.append(dialog);dialog.querySelector("[data-search-close]").addEventListener("click",()=>dialog.close());dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close()});
      let records=[];try{const response=await fetch("/assets/data/platform-search-index.json");const data=await response.json();records=data.records||[]}catch{}
      dialog.querySelector("form").addEventListener("submit",event=>{event.preventDefault();const query=dialog.querySelector("input").value.trim(),terms=query.toLowerCase().split(/\s+/).filter(Boolean);const matches=records.map(item=>({...item,score:terms.reduce((score,term)=>score+(JSON.stringify(item).toLowerCase().includes(term)?1:0),0)})).filter(item=>item.score).sort((a,b)=>b.score-a.score).slice(0,12);dialog.querySelector("[data-search-status]").textContent=query.length<2?"Enter at least two characters.":`${matches.length} result${matches.length===1?"":"s"} for “${query}”`;dialog.querySelector(".global-search-results").innerHTML=query.length<2?"":matches.map(item=>`<a href="${escapeMethodology(item.href)}"><span>${escapeMethodology(item.type)}</span><strong>${escapeMethodology(item.title)}</strong><p>${escapeMethodology(item.summary)}</p></a>`).join("")||"<p>No direct match. Try a broader topic.</p>"});
    }
    if(!dialog.open)dialog.showModal();queueMicrotask(()=>dialog.querySelector("input")?.focus());
  };
  trigger.addEventListener("click",open);document.addEventListener("keydown",event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k"){event.preventDefault();open()}});
}

function renderMethodologyNavigationItem(item,current){
  const submenu = item.submenu || [];
  const active = isCurrentMethodologyLink(current, item.href);
  if (!submenu.length) return `<li><a href="${escapeMethodology(item.href)}"${active ? ' aria-current="page"' : ""}>${escapeMethodology(item.label)}</a></li>`;
  const submenuId = `submenu-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return `<li class="methodology-nav-item"><a href="${escapeMethodology(item.href)}"${active ? ' aria-current="page"' : ""}>${escapeMethodology(item.label)}</a><button class="methodology-submenu-toggle" type="button" aria-expanded="false" aria-controls="${submenuId}" aria-label="Open ${escapeMethodology(item.label)} submenu"><span aria-hidden="true"></span></button><div id="${submenuId}" class="methodology-submenu">${submenu.map(link => {const target=new URL(link[1],location.origin),exact=target.pathname===location.pathname&&target.hash===location.hash;return `<a href="${escapeMethodology(link[1])}"${exact?' aria-current="location" class="is-current"':''}>${escapeMethodology(link[0])}</a>`}).join("")}</div></li>`;
}

function isCurrentMethodologyLink(current,href){
  if(href==="/" ) return current==="/" || current==="/index.html";
  return current===href || current===href.replace(/\/$/,"") || current.startsWith(href);
}

function renderLifecycle(stages){
  const lifecycleGrid=document.querySelector("#lifecycle-grid");
  if(!lifecycleGrid)return;
  queueMicrotask(()=>upgradeLifecycleMap(stages));
  lifecycleGrid.innerHTML=stages.map(stage=>{
    const available=stage.status==="available";
    const content=`<span class="stage-number">Stage ${stage.number}</span><h3>${escapeMethodology(stage.name)}</h3><p>${escapeMethodology(stage.purpose)}</p><dl><div><dt>Primary output</dt><dd>${escapeMethodology(stage.output)}</dd></div><div><dt>Exit decision</dt><dd>${escapeMethodology(stage.gate)}</dd></div></dl><span class="stage-status ${available?"available":"planned"}">${available?"Available now":"Planned"}</span>`;
    return available?`<a class="lifecycle-card available" href="${escapeMethodology(stage.href)}">${content}<span class="card-action">Open stage →</span></a>`:`<article class="lifecycle-card" aria-label="Stage ${stage.number} ${escapeMethodology(stage.name)}, planned">${content}</article>`;
  }).join("");
}

function upgradeLifecycleMap(stages){
  const lifecycleGrid=document.querySelector("#lifecycle-grid");if(!lifecycleGrid)return;
  if(!lifecycleGrid.closest(".journey-map-scroll")){
    const scroll=document.createElement("div"),canvas=document.createElement("div");
    scroll.className="journey-map-scroll";canvas.className="journey-map-canvas";
    canvas.innerHTML='<div class="journey-map-phases" aria-label="Transformation phases"><span>Phase 1 <small>Foundation (1–3)</small></span><span>Phase 2 <small>Strategy & Governance (4–6)</small></span><span>Phase 3 <small>Architecture & Delivery (7–9)</small></span><span>Phase 4 <small>Execution & Scale (10–14)</small></span></div>';
    lifecycleGrid.parentNode.insertBefore(scroll,lifecycleGrid);scroll.append(canvas);canvas.append(lifecycleGrid);
  }
  lifecycleGrid.innerHTML=stages.map(stage=>{
    const displayNum = stage.displayNumber || (stage.id !== undefined ? stage.id + 1 : stage.number + 1);
    return `<article class="lifecycle-card available" aria-label="Stage ${displayNum} ${escapeMethodology(stage.name)}">
      <span class="stage-number"><small>Stage</small>${displayNum}</span>
      <h3>${escapeMethodology(stage.name)}</h3>
      <span class="stage-status available">${escapeMethodology(stage.phase || 'Transformation Stage')}</span>
      <button class="lifecycle-info" type="button" data-lifecycle-stage="${stage.number}">View Info</button>
      <a class="card-action" href="${escapeMethodology(stage.href)}">Open Stage ${displayNum} →</a>
    </article>`;
  }).join("");
  let dialog=document.querySelector(".lifecycle-map-dialog");
  if(!dialog){
    dialog=document.createElement("dialog");
    dialog.className="lifecycle-map-dialog";
    dialog.setAttribute("aria-labelledby","lifecycle-map-title");
    dialog.innerHTML='<button class="lifecycle-map-close" type="button" aria-label="Close stage information">×</button><div class="lifecycle-map-body"></div>';
    document.body.append(dialog);
    dialog.querySelector(".lifecycle-map-close").addEventListener("click",()=>dialog.close());
    dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close()});
  }
  lifecycleGrid.addEventListener("click",event=>{
    const trigger=event.target.closest(".lifecycle-info");
    if(!trigger)return;
    const stage=stages.find(item=>String(item.number)===trigger.dataset.lifecycleStage || String(item.id)===trigger.dataset.lifecycleStage);
    if(!stage)return;
    const displayNum = stage.displayNumber || (stage.id !== undefined ? stage.id + 1 : stage.number + 1);
    dialog.querySelector(".lifecycle-map-body").innerHTML=`<span class="content-kicker">Stage ${displayNum} of 14 · ${escapeMethodology(stage.phase || 'Transformation Stage')}</span>
      <h2 id="lifecycle-map-title">Stage ${displayNum} — ${escapeMethodology(stage.name)}</h2>
      <p>${escapeMethodology(stage.purpose)}</p>
      <dl><div><dt>Primary Output</dt><dd>${escapeMethodology(stage.output)}</dd></div><div><dt>Exit Decision Gate</dt><dd>${escapeMethodology(stage.gate)}</dd></div></dl>
      ${stage.href?`<a class="button primary" href="${escapeMethodology(stage.href)}">Open Stage ${displayNum} Workspace →</a>`:'<p class="journey-planned">Detailed workspace content is planned.</p>'}`;
    dialog.showModal();
  });
}

function renderMobilise(stage,content){
  fillList("#entry-criteria",stage.entryCriteria);
  fillList("#stage-outcomes",stage.outcomes);
  fillList("#stage-questions",stage.questions);
  document.querySelector("#workstream-list").innerHTML=content.workstreams.map((item,index)=>`<article class="workstream-card">
    <button type="button" aria-expanded="${index===0}" aria-controls="workstream-${escapeMethodology(item.slug)}"><span><small>Workstream ${String(index+1).padStart(2,"0")}</small><strong>${escapeMethodology(item.name)}</strong><em>${escapeMethodology(item.summary)}</em></span><span aria-hidden="true">${index===0?"−":"+"}</span></button>
    <div id="workstream-${escapeMethodology(item.slug)}" class="workstream-body"${index===0?"":" hidden"}><div><h4>Activities</h4><ul>${item.activities.map(value=>`<li>${escapeMethodology(value)}</li>`).join("")}</ul></div><div><h4>Accountability</h4><dl><dt>Owner</dt><dd>${escapeMethodology(item.owner)}</dd><dt>Validator</dt><dd>${escapeMethodology(item.validator)}</dd></dl></div><div><h4>Produces</h4><ul>${item.outputs.map(value=>`<li>${escapeMethodology(value)}</li>`).join("")}</ul><a class="inline-action" href="/transformation/stage-0-mobilise/workstreams/${escapeMethodology(item.slug)}/">Open complete workspace →</a></div></div>
  </article>`).join("");
  renderDeliverables(content.deliverables);
  document.querySelector("#workshop-list").innerHTML=content.workshops.map(item=>`<a href="/transformation/stage-0-mobilise/workshops/${escapeMethodology(item.slug)}/"><span>${escapeMethodology(item.duration)}</span><h3>${escapeMethodology(item.name)}</h3><p>${escapeMethodology(item.objective)}</p><strong>Open workshop guide →</strong></a>`).join("");
  renderRaci(stage.raci);
  renderGate({...stage.gate,mandatoryEvidence:content.deliverables.map(item=>item.id)},content.deliverables);
  renderChecklist(stage.exitChecklist);
}

function fillList(selector,items){document.querySelector(selector).innerHTML=items.map(item=>`<li>${escapeMethodology(item)}</li>`).join("")}

function renderDeliverables(deliverables,filter="all"){
  const visible=filter==="all"?deliverables:deliverables.filter(item=>item.type===filter);
  document.querySelector("#deliverable-list").innerHTML=visible.map(item=>`<article class="deliverable-card" data-type="${escapeMethodology(item.type)}">
    <div class="deliverable-heading"><span>${escapeMethodology(item.id)} · ${escapeMethodology(item.type)}</span><span class="criticality">${escapeMethodology(item.criticality)}</span><h3>${escapeMethodology(item.name)}</h3><p>${escapeMethodology(item.purpose)}</p></div>
    <dl class="deliverable-owners"><div><dt>Owner</dt><dd>${escapeMethodology(item.owner)}</dd></div><div><dt>Approver</dt><dd>${escapeMethodology(item.approver)}</dd></div></dl>
    <details><summary>Success criteria</summary><ul>${item.success.map(value=>`<li>${escapeMethodology(value)}</li>`).join("")}</ul></details>
    <details><summary>Reusable template structure</summary><ol>${item.structure.map(value=>`<li>${escapeMethodology(value)}</li>`).join("")}</ol></details>
    <a class="inline-action" href="/transformation/stage-0-mobilise/deliverables/${escapeMethodology(item.slug)}/">Open complete guidance →</a>
  </article>`).join("")||'<p class="empty-state">No deliverables match this filter.</p>';
}

function renderRaci(raci){
  const table=document.querySelector("#raci-table");
  table.innerHTML=`<thead><tr><th scope="col">Activity</th>${raci.roles.map(role=>`<th scope="col"><span>${escapeMethodology(role)}</span></th>`).join("")}</tr></thead><tbody>${raci.activities.map(row=>`<tr><th scope="row">${escapeMethodology(row.activity)}</th>${row.assignments.map(value=>`<td${value.includes("A")?' class="accountable"':""}>${escapeMethodology(value)}</td>`).join("")}</tr>`).join("")}</tbody>`;
}

function renderGate(gate,deliverables){
  const names=new Map(deliverables.map(item=>[item.id,item.name]));
  document.querySelector("#gate-panel").innerHTML=`<div class="gate-question"><span>${escapeMethodology(gate.id)} · ${escapeMethodology(gate.forum)}</span><h3>${escapeMethodology(gate.question)}</h3><p><strong>Decision owner:</strong> ${escapeMethodology(gate.decisionOwner)}</p></div><div class="gate-columns"><div><h4>Mandatory evidence</h4><ol>${gate.mandatoryEvidence.map(id=>`<li><span>${escapeMethodology(id)}</span>${escapeMethodology(names.get(id)||id)}</li>`).join("")}</ol></div><div><h4>Permitted decisions</h4><ul>${gate.decisions.map(decision=>`<li>${escapeMethodology(decision)}</li>`).join("")}</ul><p class="gate-rule">Missing mandatory evidence defaults to <strong>Rework required</strong>. Conditions require an owner and due date.</p></div></div>`;
}

function renderChecklist(items){
  const saved=readChecklistState();
  document.querySelector("#exit-checklist").innerHTML=items.map(item=>`<label class="checklist-item"><input type="checkbox" value="${escapeMethodology(item.id)}"${saved.includes(item.id)?" checked":""}><span class="checkmark" aria-hidden="true"></span><span><small>${escapeMethodology(item.id)} · ${escapeMethodology(item.criticality)}</small><strong>${escapeMethodology(item.requirement)}</strong><em>Evidence: ${escapeMethodology(item.evidence)}</em></span></label>`).join("");
  updateChecklist(items);
}

function readChecklistState(){
  try{return JSON.parse(localStorage.getItem("architecting-ai:mobilise-checklist")||"[]")}catch{return[]}
}

function updateChecklist(items){
  const checked=[...document.querySelectorAll("#exit-checklist input:checked")].map(input=>input.value);
  localStorage.setItem("architecting-ai:mobilise-checklist",JSON.stringify(checked));
  const applicable=items.filter(item=>item.criticality!=="recommended").length;
  const evidenced=items.filter(item=>item.criticality!=="recommended"&&checked.includes(item.id)).length;
  const percentage=applicable?Math.round(evidenced/applicable*100):0;
  document.querySelector("#checklist-count").textContent=`${evidenced} of ${applicable}`;
  const progress=document.querySelector("#checklist-progress");progress.value=percentage;progress.textContent=`${percentage}%`;
}

function setupMethodologyInteractions(){
  const menuButton=document.querySelector(".methodology-menu-button");
  menuButton?.addEventListener("click",()=>{
    const open=document.querySelector(".methodology-navigation").classList.toggle("open");
    menuButton.setAttribute("aria-expanded",String(open));
    menuButton.querySelector(".sr-only").textContent=open?"Close navigation":"Open navigation";
  });
  const closeMethodologySubmenus=except=>document.querySelectorAll(".methodology-nav-item.open").forEach(item=>{if(item===except)return;item.classList.remove("open");const toggle=item.querySelector(".methodology-submenu-toggle");toggle?.setAttribute("aria-expanded","false")});
  document.querySelectorAll(".methodology-submenu-toggle").forEach(toggle=>toggle.addEventListener("click",event=>{
    event.stopPropagation();const item=toggle.closest(".methodology-nav-item"),open=!item.classList.contains("open");closeMethodologySubmenus(item);item.classList.toggle("open",open);toggle.setAttribute("aria-expanded",String(open));
  }));
  document.addEventListener("click",event=>{if(!event.target.closest(".methodology-nav-item"))closeMethodologySubmenus()});
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape"){
      document.querySelector(".methodology-navigation")?.classList.remove("open");
      closeMethodologySubmenus();
      menuButton?.setAttribute("aria-expanded","false");
      menuButton?.focus();
    }
  });
  const stageToggle=document.querySelector(".stage-nav-toggle");
  stageToggle?.addEventListener("click",()=>{
    const open=document.querySelector(".stage-nav").classList.toggle("open");
    stageToggle.setAttribute("aria-expanded",String(open));
    stageToggle.lastElementChild.textContent=open?"−":"+";
  });
  document.querySelectorAll(".workstream-card>button").forEach(button=>button.addEventListener("click",()=>{
    const expanded=button.getAttribute("aria-expanded")==="true";
    button.setAttribute("aria-expanded",String(!expanded));
    button.lastElementChild.textContent=expanded?"+":"−";
    document.querySelector(`#${CSS.escape(button.getAttribute("aria-controls"))}`).hidden=expanded;
  }));
  document.querySelector("#deliverable-filter")?.addEventListener("change",event=>renderDeliverables(methodologyState.mobiliseContent.deliverables,event.target.value));
  document.querySelector("#exit-checklist")?.addEventListener("change",()=>updateChecklist(methodologyState.data.mobilise.exitChecklist));
  document.querySelector("#clear-checklist")?.addEventListener("click",()=>{
    localStorage.removeItem("architecting-ai:mobilise-checklist");
    document.querySelectorAll("#exit-checklist input").forEach(input=>input.checked=false);
    updateChecklist(methodologyState.data.mobilise.exitChecklist);
  });
}

function setupPageSubmenu(){
  if(document.body.dataset.methodologyPage==="home")return;
  if(document.querySelector("#lifecycle-stage-root"))return;
  if(document.querySelector(".stage-nav,.page-submenu"))return;
  const main=document.querySelector("#main-content");
  if(!main)return;
  const sectionDescription=heading=>{
    const container=heading.closest("section,.content-block,.concept,.qsection")||heading.parentElement;
    const candidates=[
      heading.nextElementSibling,
      container?.querySelector(".section-heading p,.section-intro,.lead,.intro"),
      container?.querySelector("p")
    ];
    const description=candidates.find(element=>element?.matches?.("p,.section-intro,.lead,.intro")&&element.textContent.trim());
    return description?.textContent.trim().replace(/\s+/g," ")||`Explore the key guidance, decisions, and practical considerations covered in ${heading.textContent.trim()}.`;
  };
  const build=()=>{
    let headings=[...main.querySelectorAll(".detail-content>section>h2,.assessment-shell>section>h2,.platform-section-shell h2,.dashboard-shell>section>h2,.methodology-section .section-heading>h2")];
    if(headings.length<2)headings=[...main.querySelectorAll(".legacy-content .article-body h2,.legacy-content>.container h2,.legacy-content>.container-narrow h2")].filter(heading=>!heading.closest(".article-hero,.pg-header"));
    if(headings.length<2)headings=[...main.querySelectorAll(".legacy-content .concept .c-title")];
    if(headings.length<2)headings=[...main.querySelectorAll(".legacy-content .qsection .qsec-title")];
    if(headings.length<2)headings=[...main.querySelectorAll(".legacy-content .content-block h3")];
    if(headings.length<1)headings=[...main.querySelectorAll("h1")];
    const unique=[...new Set(headings)].filter(heading=>heading.textContent.trim());
    if(unique.length<1)return false;
    unique.forEach((heading,index)=>{
      if(!heading.id){
        const slug=heading.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||`section-${index+1}`;
        heading.id=`page-${slug}-${index+1}`;
      }
      heading.style.scrollMarginTop="64px";
    });
    const nav=document.createElement("nav");
    nav.className="page-submenu stage-nav shared-section-nav";
    const pageTitle=main.querySelector("h1")?.textContent.trim()||document.title.split("|")[0].trim();
    nav.setAttribute("aria-label",`${pageTitle} page sections`);
    const linksId=`page-section-links-${Math.random().toString(36).slice(2,8)}`;
    nav.innerHTML=`<strong>${escapeMethodology(pageTitle)}</strong><button class="stage-nav-toggle" type="button" aria-expanded="false" aria-controls="${linksId}">On this page <span aria-hidden="true">+</span></button><nav id="${linksId}">${unique.map(heading=>`<a href="#${escapeMethodology(heading.id)}"><b>${escapeMethodology(heading.textContent.trim())}</b><span>${escapeMethodology(sectionDescription(heading))}</span></a>`).join("")}</nav>`;
    document.body.classList.add("has-page-submenu");
    const hero=main.querySelector(":scope > .ux-hero,:scope > .platform-hero,:scope > .methodology-hero,:scope > .stage-hero,:scope > .detail-hero,.legacy-content > .article-hero");
    const host=hero?.parentElement||main;
    const layout=document.createElement("div");
    const content=document.createElement("div");
    layout.className="page-reading-layout";
    content.className="page-reading-content";
    layout.append(nav,content);
    if(hero){
      while(hero.nextSibling)content.append(hero.nextSibling);
      hero.insertAdjacentElement("afterend",layout);
    }else{
      while(host.firstChild)content.append(host.firstChild);
      host.append(layout);
    }
    return true;
  };
  if(build())return;
  const observer=new MutationObserver(()=>{if(build())observer.disconnect()});
  observer.observe(main,{childList:true,subtree:true});
}

function setupCopyDeterrence(){
  const isEditable=target=>target instanceof Element&&Boolean(target.closest("input,textarea,select,[contenteditable='true']"));
  ["copy","cut","contextmenu"].forEach(type=>document.addEventListener(type,event=>{if(!isEditable(event.target))event.preventDefault()}));
  document.addEventListener("keydown",event=>{
    if(isEditable(event.target)||!(event.ctrlKey||event.metaKey))return;
    if(["c","x","s","p","u"].includes(event.key.toLowerCase()))event.preventDefault();
  });
}
