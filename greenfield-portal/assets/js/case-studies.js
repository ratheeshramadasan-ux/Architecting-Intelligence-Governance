const caseStudyEscape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const caseStudyBytes=value=>{const bytes=Number(value)||0;if(bytes<1048576)return`${Math.max(1,Math.round(bytes/1024))} KB`;return`${(bytes/1048576).toFixed(1)} MB`};

const caseStudyLink=link=>`<a class="case-button" href="${caseStudyEscape(link.url)}">${caseStudyEscape(link.label)}</a>`;
const caseStudyNumber=study=>Number(window.caseStudyIdentity?.normalize(study)?.number||999);
const renderCaseStudy=study=>{const identity=window.caseStudyIdentity?.normalize(study)||study;const exploded=(study.media||[]).find(asset=>asset.asset_type==='exploded_view');return `<article class="case-card" id="${caseStudyEscape(study.slug)}">
  ${study.cover_image_url?`<img class="case-cover" src="${caseStudyEscape(study.cover_image_url)}" alt="Cover of ${caseStudyEscape(identity.displayTitle||study.title)}">`:''}
  <div class="case-card-content"><span class="case-number">${caseStudyEscape(identity.taxonomy||study.category||'Case study')}</span>
  <h2>${caseStudyEscape(identity.displayTitle||study.title)}</h2><p class="case-business-context">${caseStudyEscape(identity.businessContext||study.description)}</p>
  ${identity.businessContext&&study.description?`<p>${caseStudyEscape(study.description)}</p>`:''}
  ${study.outcomes?.length?`<div class="case-outcomes">${study.outcomes.map(value=>`<span>${caseStudyEscape(value)}</span>`).join('')}</div>`:''}
  <div class="case-tags">${(study.tags||[]).map(tag=>`<span>${caseStudyEscape(tag)}</span>`).join('')}</div>
  ${exploded?`<figure class="case-exploded-view"><a href="${caseStudyEscape(exploded.url)}" target="_blank" rel="noopener"><img src="${caseStudyEscape(exploded.url)}" alt="${caseStudyEscape(exploded.alt_text)}" loading="lazy"></a>${exploded.caption?`<figcaption>${caseStudyEscape(exploded.caption)}</figcaption>`:''}</figure>`:''}
  <div class="case-actions">${study.download_url?`<a class="case-button primary" href="${caseStudyEscape(study.download_url)}">Download PDF</a>`:''}${(study.related_links||[]).map(caseStudyLink).join('')}</div>
  </div></article>`};

const preview=new URLSearchParams(location.search).get('preview');
fetch(`/api/showcase${preview?`?preview=${encodeURIComponent(preview)}`:''}`,{headers:{Accept:'application/json'},cache:'no-store'})
  .then(response=>response.ok?response.json():Promise.reject(new Error('Case studies are unavailable.')))
  .then(({case_studies:studies=[],demos=[]})=>{
    const cases=document.querySelector('#case-study-collection');
    if(cases&&studies.length)cases.innerHTML=[...studies].sort((a,b)=>caseStudyNumber(a)-caseStudyNumber(b)||a.display_order-b.display_order).map(renderCaseStudy).join('');
    const demoContainer=document.querySelector('#demo-collection');
    if(demoContainer&&demos.length)demoContainer.innerHTML=demos.map((demo,index)=>`<a class="case-button ${index===0?'primary':''}" href="${caseStudyEscape(demo.target_url)}"${/^https:\/\//i.test(demo.target_url)?' target="_blank" rel="noopener noreferrer"':''}>${caseStudyEscape(demo.title)}</a>`).join('');
  }).catch(error=>console.warn('Using static case-study and demo fallback.',error));
