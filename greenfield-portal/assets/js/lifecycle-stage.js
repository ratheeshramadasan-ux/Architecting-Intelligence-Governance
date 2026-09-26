const se=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const sl=a=>`<ul>${a.map(x=>`<li>${se(x)}</li>`).join("")}</ul>`;
const cards=(a,label)=>`<div class="lifecycle-content-grid">${a.map((x,i)=>`<article><span>${label} ${i+1}</span><h3>${se(x)}</h3></article>`).join("")}</div>`;

document.addEventListener("DOMContentLoaded",async()=>{
  const root=document.querySelector("#lifecycle-stage-root");
  if(!root) return;
  try{
    const [response,methodologyResponse,taxonomyResponse,solutionResponse,standardsResponse]=await Promise.all([
      fetch("/assets/data/lifecycle-stage-content.json"),
      fetch("/assets/data/methodology.json"),
      fetch("/assets/data/knowledge-taxonomy.json").catch(()=>null),
      fetch("/assets/data/solution-lifecycle.json").catch(()=>null),
      fetch("/assets/data/standards-alignment.json").catch(()=>null)
    ]);
    if(!response.ok||!methodologyResponse.ok)throw Error("Stage content is unavailable.");
    const data=await response.json();
    const methodology=await methodologyResponse.json();
    const taxonomy=taxonomyResponse&&taxonomyResponse.ok?await taxonomyResponse.json():null;
    const solutionData=solutionResponse&&solutionResponse.ok?await solutionResponse.json():null;
    const standardsData=standardsResponse&&standardsResponse.ok?await standardsResponse.json():null;

    const currentStageNum=document.body.dataset.stageNumber;
    const content=data.stages.find(x=>String(x.number)===currentStageNum);
    const meta=methodology.stages.find(x=>String(x.number)===currentStageNum||String(x.id)===currentStageNum);
    if(!content||!meta)throw Error("Stage configuration was not found.");

    const stageIndex=methodology.stages.findIndex(x=>x.id===meta.id);
    const previousStage=stageIndex>0?methodology.stages[stageIndex-1]:null;
    const nextStage=stageIndex<methodology.stages.length-1?methodology.stages[stageIndex+1]:null;

    const s={
      ...content,
      ...meta,
      displayNumber: meta.displayNumber || (meta.id + 1),
      phase: meta.phase || "Transformation Stage",
      previous: previousStage?{name:`Stage ${previousStage.displayNumber} — ${previousStage.name}`,href:previousStage.href}:{name:"Transformation Overview",href:"/transformation/"},
      next: nextStage?{name:`Stage ${nextStage.displayNumber} — ${nextStage.name}`,href:nextStage.href}:{name:"14-Stage Visual Map",href:"/journey/"}
    };

    const menu=[
      ["overview","Overview","Purpose, executive question, and why this stage is distinct."],
      ["questions","Executive Questions","The leadership questions this stage is designed to answer."],
      ["workspaces","Workspaces & Activities","The major work areas, owners, and core activities within this stage."],
      ["evidence","Inputs & Deliverables","What this stage needs to start, and the evidence it produces."],
      ["decisions","Decisions & Accountability","The gate decision, required evidence, and accountable roles."],
      ["governance","Governance, Risks & Dependencies","Controls, risk indicators, dependencies, and feedback re-entry paths."],
      ["context","Related Context & Standards","Linked solution steps, applicable standards, and knowledge articles."],
      ["criteria","Entry, Exit & Measures","Criteria to enter this stage, exit it, and measure success."],
      ["guidance","Practical Guidance","How to apply this stage and configure it for your organisation."]
    ];

    /* Context Panel Data Derivation */
    const relatedSolutionSteps=solutionData?solutionData.steps.filter(st=>st.transformationStageRef===s.displayNumber||st.transformationStageRef===s.id):[];
    const relatedArticles=taxonomy?taxonomy.articles.filter(art=>art.transformationStages&&art.transformationStages.includes(s.displayNumber)):[];
    const relatedStandards=[];
    if(standardsData&&standardsData.categories){
      standardsData.categories.forEach(cat=>{
        cat.items.forEach(st=>{
          if(st.relatedTransformationStages&&st.relatedTransformationStages.includes(s.displayNumber)){
            relatedStandards.push(st);
          }
        });
      });
    }

    root.className="";
    root.removeAttribute("role");
    root.innerHTML=`<section class="stage-hero">
      <div class="methodology-wrap">
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <a href="/">Home</a><span>/</span>
          <a href="/transformation/">Enterprise AI Transformation</a><span>/</span>
          <span>Stage ${s.displayNumber} — ${se(s.name)}</span>
        </nav>
        <div class="stage-hero-grid">
          <div>
            <span class="eyebrow">Stage ${s.displayNumber} of 14 · ${se(s.phase)}</span>
            <h1>Stage ${s.displayNumber} — ${se(s.name)}</h1>
            <p class="hero-lead">${se(s.intro)}</p>
          </div>
          <aside class="stage-gate-summary">
            <span>Primary Stage Output</span>
            <strong>${se(s.output)}</strong>
            <p>Exit Gate: ${se(s.gate)}</p>
          </aside>
        </div>
      </div>
    </section>

    <div class="stage-layout methodology-wrap">
      <aside class="stage-nav" aria-label="${se(s.name)} sections">
        <div class="stage-nav-header">
          <span class="stage-nav-label">On This Page</span>
          <p class="stage-nav-subtitle">Stage ${s.displayNumber} — ${se(s.name)}</p>
        </div>
        <button class="stage-nav-toggle" type="button" aria-expanded="false" aria-controls="stage-section-links">Sections <span aria-hidden="true">+</span></button>
        <nav id="stage-section-links">${menu.map(x=>`<a href="#${x[0]}" class="stage-nav-link"><span class="stage-nav-link-title">${x[1]}</span><span class="stage-nav-link-desc">${x[2]}</span></a>`).join("")}</nav>
      </aside>

      <div class="stage-content">
        <section id="overview" class="stage-section">
          <div class="section-heading">
            <span>Purpose and Intended Outcome</span>
            <h2>${se(s.intro)}</h2>
            <p><strong>Executive Question:</strong> ${se(s.executiveQuestion)}</p>
          </div>
          <div class="lifecycle-three-grid">
            <article><h3>Why this stage matters</h3><p>${se(s.why)}</p></article>
            <article><h3>Why it is separate</h3><p>${se(s.separation)}</p></article>
            <article><h3>Failure it prevents</h3><p>${se(s.prevents)}</p></article>
          </div>
          <div class="stage-overview-grid">
            <div><h3>Primary Output</h3><p>${se(s.output)}</p></div>
            <div><h3>Lifecycle Traceability</h3><p>Builds on ${se(s.previous.name)} and hands ${se(s.output)} to ${se(s.next.name)}.</p></div>
          </div>
        </section>

        <section id="questions" class="stage-section">
          <div class="section-heading">
            <span>Key Questions Addressed</span>
            <h2>Questions Leadership Must Resolve</h2>
          </div>
          ${sl(s.questions)}
        </section>

        <section id="workspaces" class="stage-section">
          <div class="section-heading">
            <span>Major Work Areas</span>
            <h2>Connected Workspaces and Activities</h2>
          </div>
          ${cards(s.workspaces,"Workspace")}
          <div class="question-panel">
            <h3>Core Activities</h3>
            ${sl(s.activities)}
          </div>
        </section>

        <section id="evidence" class="stage-section">
          <div class="section-heading">
            <span>Traceable Evidence</span>
            <h2>Inputs and Executive Deliverables</h2>
          </div>
          <div class="stage-overview-grid">
            <div><h3>Inputs Required</h3>${sl(s.inputs)}</div>
            <div><h3>Executive Deliverables Produced</h3>${sl(s.deliverables)}</div>
          </div>
        </section>

        <section id="decisions" class="stage-section">
          <div class="section-heading">
            <span>Decision Point & Exit Gate</span>
            <h2>${se(s.gate)}</h2>
          </div>
          <div class="gate-panel">
            <div class="gate-question">
              <span>Required Gate Decision</span>
              <h3>Approve, approve with conditions, return for rework, defer or stop.</h3>
            </div>
            <div class="gate-columns">
              <div><h3>Roles and Accountabilities</h3>${sl(s.roles)}</div>
              <div>
                <h3>Decision Evidence & Rationale</h3>
                <p>Output: <strong>${se(s.output)}</strong></p>
                <p>Record rationale, conditions, residual risk, decision owner and approval date.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="governance" class="stage-section">
          <div class="section-heading">
            <span>Continuous Control</span>
            <h2>Governance, Risks and Dependencies</h2>
          </div>
          <div class="lifecycle-three-grid">
            <article><h3>Governance Considerations</h3>${sl(s.governance)}</article>
            <article><h3>Risks and Controls</h3>${sl(s.risks)}</article>
            <article><h3>Dependencies</h3>${sl(s.dependencies)}</article>
          </div>
          ${s.feedbackPaths&&s.feedbackPaths.length?`<div class="question-panel" style="margin-top:1.5rem;">
            <h3>Non-Linear Feedback & Re-entry Paths</h3>
            <ul>${s.feedbackPaths.map(fp=>`<li><a href="${se(fp.target)}">${se(fp.label)} →</a></li>`).join("")}</ul>
          </div>`:""}
        </section>

        <section id="context" class="stage-section">
          <div class="section-heading">
            <span>Related Context & Mapping</span>
            <h2>Connected Solution Steps, Standards and Guidance</h2>
          </div>
          <div class="lifecycle-three-grid">
            ${relatedSolutionSteps.length?`<article>
              <h3>AI Solution Lifecycle Steps</h3>
              <ul>${relatedSolutionSteps.map(st=>`<li><a href="/lifecycle/#${se(st.slug)}">Step ${st.step} — ${se(st.title)}</a></li>`).join("")}</ul>
            </article>`:""}
            ${relatedStandards.length?`<article>
              <h3>Applicable Standards & Frameworks</h3>
              <ul>${relatedStandards.map(st=>`<li><a href="${se(st.href)}">${se(st.name)} (${se(st.issuingBody)})</a></li>`).join("")}</ul>
            </article>`:""}
            ${relatedArticles.length?`<article>
              <h3>Knowledge Centre Articles</h3>
              <ul>${relatedArticles.map(art=>`<li><a href="${se(art.href)}">${se(art.title)}</a></li>`).join("")}</ul>
            </article>`:""}
          </div>
        </section>

        <section id="criteria" class="stage-section">
          <div class="section-heading">
            <span>Stage Control</span>
            <h2>Entry, Exit and Success Measures</h2>
          </div>
          <div class="lifecycle-three-grid">
            <article><h3>Entry Criteria</h3>${sl(s.entry)}</article>
            <article><h3>Exit Criteria</h3>${sl(s.exit)}</article>
            <article><h3>Success Measures</h3>${sl(s.measures)}</article>
          </div>
        </section>

        <section id="guidance" class="stage-section">
          <div class="section-heading">
            <span>Practical Implementation</span>
            <h2>Apply the Stage in your Organisation</h2>
            <p>${se(s.guidance)}</p>
          </div>
          <div class="question-panel">
            <h3>Organisation-Specific Configuration</h3>
            ${sl(s.configuration)}
          </div>
          <div class="resource-links">
            ${s.links.map(x=>`<a href="${se(x[1])}"><span>Portal Resource</span><strong>${se(x[0])}</strong></a>`).join("")}
          </div>
        </section>

        <nav class="stage-next" aria-label="Transformation sequence navigation">
          <a href="${se(s.previous.href)}">
            <span>Previous Stage</span>
            <strong>${se(s.previous.name)}</strong>
          </a>
          <a href="/journey/">
            <span>Visual Map</span>
            <strong>Return to 14-Stage Map</strong>
          </a>
          <a href="${se(s.next.href)}">
            <span>Next Stage</span>
            <strong>${se(s.next.name)}</strong>
          </a>
        </nav>
      </div>
    </div>`;

    window.setupSharedStageNavigation?.();
  }catch(e){
    root.innerHTML=`<div class="methodology-error" role="alert"><strong>The stage could not be loaded.</strong><span>${se(e.message)}</span></div>`;
  }
});
