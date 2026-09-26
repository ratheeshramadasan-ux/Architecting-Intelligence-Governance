(()=>{
  const escape=value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const initialise=async()=>{
    if(document.documentElement.dataset.peopleInitialised)return;document.documentElement.dataset.peopleInitialised="true";
    let people=[];try{const response=await fetch("/api/people");if(response.ok)people=(await response.json()).people||[]}catch{}
    const home=document.querySelector("[data-people-home],body.executive-home .author-section");
    const featured=people.filter(person=>person.featured_homepage);
    if(home&&featured.length){home.className="home-leadership methodology-wrap";home.innerHTML=`<div class="section-heading"><span>04 · Leadership</span><h2>Enterprise experience behind the framework</h2><a href="/about/leadership">Meet Our Leadership →</a></div><div class="home-people-list">${featured.map(person=>`<article><img src="${escape(person.profile_image_url||'/assets/images/profile-placeholder.svg')}" alt="${escape(person.photo_alt_text||person.display_name)}" loading="lazy"><div><strong>${escape(person.display_name)}</strong><small>${escape(person.designation)}</small><p>${escape(person.capability_line)}</p><a href="/about/leadership/${escape(person.slug)}">View Profile →</a></div></article>`).join("")}</div>`;}
    let list=document.querySelector("[data-leadership-list]");
    if(!list&&document.body.dataset.methodologyPage==='about'){const governance=document.querySelector('.governance-callout');if(governance){governance.insertAdjacentHTML('beforebegin','<section aria-labelledby="leadership-title"><span class="content-kicker">Leadership</span><h2 id="leadership-title">People behind the platform</h2><div class="leadership-grid" data-leadership-list><p>Loading leadership profiles…</p></div></section>');list=document.querySelector('[data-leadership-list]')}}
    if(list)list.innerHTML=people.length?people.map(person=>`<article class="profile-card"><img src="${escape(person.profile_image_url||'/assets/images/profile-placeholder.svg')}" alt="${escape(person.photo_alt_text||person.display_name)}" loading="lazy"><div><span>${escape(person.leadership_category||'Leadership')}</span><h3>${escape(person.display_name)}</h3><strong>${escape(person.designation)}</strong><p>${escape(person.capability_line)}</p>${person.short_bio?`<p>${escape(person.short_bio)}</p>`:''}<nav>${person.linkedin_url?`<a href="${escape(person.linkedin_url)}">LinkedIn</a>`:""}<a href="/about/leadership/${escape(person.slug)}">View Profile →</a></nav></div></article>`).join(""):"<p>Leadership profiles are currently unavailable.</p>";
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initialise,{once:true});else initialise();
})();
