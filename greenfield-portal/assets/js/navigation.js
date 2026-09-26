/* One canonical navigation model prevents individual pages drifting apart. */
if(!document.querySelector('script[src^="/assets/js/shared-site-shell.js"]')){
  const sharedShellScript=document.createElement('script');
  sharedShellScript.src='/assets/js/shared-site-shell.js?v=20260727-4';
  sharedShellScript.defer=true;
  document.head.append(sharedShellScript);
}
const navigation=document.querySelector('.primary-navigation');
const navigationEscape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const current=location.pathname.replace(/\/$/,'')||'/';
const normaliseNavigationPath=value=>value.replace(/\/index\.html$/,'/').replace(/\.html$/,'').replace(/\/$/,'')||'/';
const markActiveNavigation=()=>{
  navigation?.querySelectorAll('a[href]').forEach(link=>{
    const target=new URL(link.href,location.origin);
    const isCurrent=target.origin===location.origin&&normaliseNavigationPath(target.pathname)===normaliseNavigationPath(current);
    link.classList.toggle('active',isCurrent);
    if(isCurrent)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
  });
};
if(navigation){
  const renderNavFromData = (navData) => {
    const items = navData.navigation || [];
    navigation.innerHTML = `<ul class="navigation-list">${items.map(item => {
      const active = current === item.href || (item.href !== '/' && current.startsWith(item.href));
      const sub = item.submenu || [];
      if (!sub.length) {
        return `<li><a class="navigation-link ${active ? 'active' : ''}" href="${navigationEscape(item.href)}">${navigationEscape(item.label)}</a></li>`;
      }
      const isSubActive = sub.some(s => current === s[1]);
      return `<li class="navigation-item dropdown">
        <button class="navigation-link dropdown-trigger ${active || isSubActive ? 'active' : ''}" type="button" aria-expanded="false">${navigationEscape(item.label)}<span class="dropdown-icon" aria-hidden="true"></span></button>
        <div class="dropdown-menu">${(()=>{let group='';return sub.map(s=>{const heading=s[2]&&s[2]!==group?`<strong class="dropdown-menu-heading">${navigationEscape(s[2])}</strong>`:'';group=s[2]||group;return`${heading}<a href="${navigationEscape(s[1])}">${navigationEscape(s[0])}</a>`}).join('')})()}</div>
      </li>`;
    }).join('')}<li id="account-navigation"><a class="navigation-link" href="/login">Sign in</a></li></ul>`;
    markActiveNavigation();
  };

  fetch('/assets/data/methodology.json')
    .then(r => r.json())
    .then(async data=>{const {loadNavigation}=await import('/assets/js/navigation-model.js');data.navigation=await loadNavigation(data.navigation);return data})
    .then(renderNavFromData)
    .catch(() => {
      /* Documented Minimal Legacy Fallback for Offline / Error Recovery */
      navigation.innerHTML = `<ul class="navigation-list">
        <li><a class="navigation-link ${current === '/' ? 'active' : ''}" href="/">Home</a></li>
        <li><a class="navigation-link ${current.startsWith('/transformation') ? 'active' : ''}" href="/transformation/">Transformation</a></li>
        <li><a class="navigation-link ${current.startsWith('/lifecycle') ? 'active' : ''}" href="/lifecycle/">Solution Lifecycle</a></li>
        <li><a class="navigation-link ${current.startsWith('/standards') ? 'active' : ''}" href="/standards/">Standards</a></li>
        <li><a class="navigation-link ${current.includes('knowledge') ? 'active' : ''}" href="/pages/knowledge-discovery.html">Knowledge</a></li>
        <li><a class="navigation-link ${current.startsWith('/case-studies') ? 'active' : ''}" href="/case-studies/">Case Studies</a></li>
        <li><a class="navigation-link ${current.startsWith('/deliverables') ? 'active' : ''}" href="/deliverables/">Deliverables</a></li>
        <li><a class="navigation-link ${current.startsWith('/tools') ? 'active' : ''}" href="/tools/">Tools</a></li>
        <li><a class="navigation-link ${current.includes('about') ? 'active' : ''}" href="/pages/about.html">About</a></li>
        <li id="account-navigation"><a class="navigation-link" href="/login">Sign in</a></li>
      </ul>`;
      markActiveNavigation();
    });
}
const managedNavigationReady = Promise.resolve();
const menuButton=document.querySelector('.mobile-menu-button');
const dropdowns=[...document.querySelectorAll('.dropdown')];
const submenuGroups=[...document.querySelectorAll('.submenu-group')];

function closeSubmenus(except=null){submenuGroups.forEach(group=>{if(group===except)return;group.classList.remove('open');group.querySelector('.submenu-trigger')?.setAttribute('aria-expanded','false')})}
function closeDropdowns(except=null){document.querySelectorAll('.dropdown').forEach(dropdown=>{if(dropdown===except)return;dropdown.classList.remove('open');dropdown.querySelector('.dropdown-trigger')?.setAttribute('aria-expanded','false')});if(!except)closeSubmenus()}
function closeMenu(){navigation?.classList.remove('open');menuButton?.setAttribute('aria-expanded','false');menuButton?.setAttribute('aria-label','Open navigation menu');closeDropdowns()}

menuButton?.addEventListener('click',()=>{const open=navigation.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu');if(!open)closeDropdowns()});
submenuGroups.forEach(group=>{const trigger=group.querySelector('.submenu-trigger');trigger?.addEventListener('click',event=>{event.stopPropagation();const open=!group.classList.contains('open');closeSubmenus(group);group.classList.toggle('open',open);trigger.setAttribute('aria-expanded',String(open))})});
document.addEventListener('click',event=>{const trigger=event.target.closest('.dropdown-trigger');if(trigger){event.stopPropagation();const dropdown=trigger.closest('.dropdown');const open=!dropdown.classList.contains('open');document.querySelectorAll('.dropdown').forEach(item=>{if(item!==dropdown){item.classList.remove('open');item.querySelector('.dropdown-trigger')?.setAttribute('aria-expanded','false')}});dropdown.classList.toggle('open',open);trigger.setAttribute('aria-expanded',String(open));return}if(!event.target.closest('.dropdown'))closeDropdowns();if(window.innerWidth<=1080&&!event.target.closest('.site-header'))closeMenu()});
document.addEventListener('keydown',event=>{
  const trigger=event.target.closest?.('.dropdown-trigger');
  if(event.key==='ArrowDown'&&trigger){
    event.preventDefault();
    const dropdown=trigger.closest('.dropdown');
    closeDropdowns(dropdown);
    dropdown.classList.add('open');
    trigger.setAttribute('aria-expanded','true');
    dropdown.querySelector('.dropdown-menu a,.dropdown-menu button')?.focus();
    return;
  }
  const menu=event.target.closest?.('.dropdown-menu');
  if(menu&&['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
    const items=[...menu.querySelectorAll('a,button')].filter(item=>!item.disabled);
    if(!items.length)return;
    event.preventDefault();
    const currentIndex=items.indexOf(document.activeElement);
    const nextIndex=event.key==='Home'?0:event.key==='End'?items.length-1:
      event.key==='ArrowDown'?(currentIndex+1)%items.length:(currentIndex-1+items.length)%items.length;
    items[nextIndex].focus();
    return;
  }
  if(event.key==='Escape'){
    const openTrigger=document.querySelector('.dropdown.open>.dropdown-trigger');
    const mobileWasOpen=navigation?.classList.contains('open');
    closeMenu();
    if(openTrigger)openTrigger.focus();else if(mobileWasOpen)menuButton?.focus();
  }
});
window.addEventListener('resize',()=>{if(window.innerWidth>1080)closeMenu()});

managedNavigationReady.then(()=>fetch('/api/auth/me',{headers:{Accept:'application/json'}})).then(response=>response.json()).then(({user})=>{
  const account=document.querySelector('#account-navigation');
  if(!account||!user)return;
  account.className='navigation-item dropdown account-dropdown';
  account.innerHTML=`<button class="navigation-link dropdown-trigger" type="button" aria-expanded="false">${user.name.split(/\s+/)[0]}<span class="dropdown-icon" aria-hidden="true"></span></button><div class="dropdown-menu dropdown-menu-right">${user.role==='admin'?'<a href="/admin">Administration</a>':''}<button class="account-logout" type="button">Sign out</button></div>`;
  account.querySelector('.account-logout').addEventListener('click',async()=>{await fetch('/api/auth/logout',{method:'POST'});location.href='/'});
}).catch(()=>{});

fetch('/api/public-config').then(response=>response.json()).then(config=>{
  if(!config.copyDeterrenceEnabled)return;
  document.documentElement.classList.add('copy-deterrence');
  document.addEventListener('copy',event=>{if(!event.target.closest('input,textarea'))event.preventDefault()});
  document.addEventListener('cut',event=>{if(!event.target.closest('input,textarea'))event.preventDefault()});
  document.addEventListener('contextmenu',event=>{if(!event.target.closest('input,textarea'))event.preventDefault()});
  document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&['c','x','s','p','u'].includes(event.key.toLowerCase())&&!event.target.closest('input,textarea'))event.preventDefault()});
}).catch(()=>{});

/* Restore nested disclosure controls removed from the legacy inline scripts. */
document.querySelectorAll('.drill').forEach((drill,index)=>{
  const button=drill.querySelector('.drill-btn');
  const content=drill.querySelector('.drill-content');
  if(!button||!content)return;
  const contentId=`drill-content-${index+1}`;
  content.id=contentId;
  button.type='button';
  button.setAttribute('aria-controls',contentId);
  button.setAttribute('aria-expanded','false');
  const state=button.querySelector('span');
  if(state)state.textContent='Expand';
  button.addEventListener('click',()=>{
    const open=drill.classList.toggle('open');
    button.setAttribute('aria-expanded',String(open));
    if(state)state.textContent=open?'Collapse':'Expand';
  });
});

document.querySelectorAll('.qcard').forEach((card,index)=>{
  const button=card.querySelector('.qtop');
  const content=card.querySelector('.qbody');
  if(!button||!content)return;
  const contentId=`review-answer-${index+1}`;
  content.id=contentId;
  button.type='button';
  button.setAttribute('aria-controls',contentId);
  button.setAttribute('aria-expanded','false');
  button.addEventListener('click',()=>{
    const open=card.classList.toggle('open');
    button.setAttribute('aria-expanded',String(open));
  });
});

/* Interactive zoom and hand-pan controls for architecture infographics. */
document.querySelectorAll('.infographic-viewport').forEach(viewport=>{
  const canvas=viewport.querySelector('.infographic-canvas');
  const tools=viewport.previousElementSibling;
  const output=tools?.querySelector('output');
  let scale=1,x=0,y=0,dragging=false,startX=0,startY=0;
  const render=()=>{
    canvas.style.transform=`translate(${x}px,${y}px) scale(${scale})`;
    if(output)output.textContent=`${Math.round(scale*100)}%`;
    viewport.classList.toggle('is-zoomed',scale>1);
  };
  const zoom=(next,originX=viewport.clientWidth/2,originY=viewport.clientHeight/2)=>{
    const previous=scale;
    scale=Math.min(3,Math.max(1,next));
    if(scale===1){x=0;y=0}else{
      const ratio=scale/previous;
      x=originX-(originX-x)*ratio;
      y=originY-(originY-y)*ratio;
    }
    render();
  };
  tools?.addEventListener('click',event=>{
    const action=event.target.closest('button')?.dataset.infographicAction;
    if(action==='in')zoom(scale+.25);
    if(action==='out')zoom(scale-.25);
    if(action==='reset'){scale=1;x=0;y=0;render()}
  });
  viewport.addEventListener('wheel',event=>{
    event.preventDefault();
    const rect=viewport.getBoundingClientRect();
    zoom(scale+(event.deltaY<0?.2:-.2),event.clientX-rect.left,event.clientY-rect.top);
  },{passive:false});
  viewport.addEventListener('pointerdown',event=>{
    if(scale<=1)return;
    dragging=true;startX=event.clientX-x;startY=event.clientY-y;
    viewport.setPointerCapture(event.pointerId);viewport.classList.add('is-dragging');
  });
  viewport.addEventListener('pointermove',event=>{
    if(!dragging)return;
    x=event.clientX-startX;y=event.clientY-startY;render();
  });
  const endDrag=()=>{dragging=false;viewport.classList.remove('is-dragging')};
  viewport.addEventListener('pointerup',endDrag);
  viewport.addEventListener('pointercancel',endDrag);
  render();
});

/* Build an accessible section navigator for substantial concept-led pages. */
const longPageContainer=document.querySelector('.inner-page .legacy-content>:is(.container,.container-narrow,.article-body)');
let longPageSections=longPageContainer?[...longPageContainer.querySelectorAll('.concept')]:[];
let longPageType='concept';

if(longPageContainer&&longPageSections.length<2){
  longPageSections=[...longPageContainer.querySelectorAll('.qsection')];
  longPageType='review';
}
if(longPageContainer&&longPageSections.length<2){
  longPageSections=[...longPageContainer.querySelectorAll('h2')].filter(heading=>!heading.closest('.pg-header'));
  longPageType='heading';
}
if(longPageContainer&&longPageSections.length<2){
  longPageSections=[...longPageContainer.querySelectorAll('.content-block h3')];
  longPageType='heading';
}

if(longPageContainer&&longPageSections.length>=2){
  const pageTitle=document.querySelector('.pg-title,.article-hero h1,.page-agentic h1,.legacy-content h1')?.textContent.trim()||document.title.split('|')[0].trim();
  const sectionNav=document.createElement('aside');
  sectionNav.className='section-nav';
  sectionNav.setAttribute('aria-label',`${pageTitle} sections`);

  const sectionContext=document.createElement('div');
  sectionContext.className='section-nav-context';
  sectionContext.innerHTML=`<span>Current page</span><strong>${pageTitle}</strong>`;

  const sectionToggle=document.createElement('button');
  sectionToggle.className='section-nav-toggle';
  sectionToggle.type='button';
  sectionToggle.setAttribute('aria-expanded','false');
  sectionToggle.innerHTML=`<span><small>On this page</small>${pageTitle}</span><span aria-hidden="true">+</span>`;

  const sectionList=document.createElement('ol');
  sectionList.className='section-nav-list';

  longPageSections.forEach((section,index)=>{
    const title=(longPageType==='concept'?section.querySelector('.c-title')?.textContent:
      longPageType==='review'?section.querySelector('.qsec-title')?.textContent:section.textContent)?.trim()||`Section ${index+1}`;
    let description=(longPageType==='concept'?section.querySelector('.c-preview')?.textContent:
      longPageType==='review'?section.querySelector('.qsec-sub')?.textContent:
      section.nextElementSibling?.matches('p')?section.nextElementSibling.textContent:
      section.closest('section,.content-block')?.querySelector('p')?.textContent)?.trim()||'';
    if(!description&&longPageType==='heading'){
      let sibling=section.nextElementSibling;
      while(sibling&&!sibling.matches('h2')){
        const paragraph=sibling.matches('p')?sibling:sibling.querySelector?.('p');
        if(paragraph){description=paragraph.textContent.trim();break}
        sibling=sibling.nextElementSibling;
      }
    }
    if(!description)description=`Key guidance and implementation considerations for ${title}.`;
    const id=`section-${index+1}-${title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,42)}`;
    section.id=section.id||id;
    const item=document.createElement('li');
    const link=document.createElement('a');
    link.href=`#${section.id}`;
    link.innerHTML=`<strong>${title}</strong>${description?`<span>${description}</span>`:''}`;
    link.addEventListener('click',()=>{
      if(window.matchMedia('(max-width:980px)').matches){
        sectionNav.classList.remove('open');
        sectionToggle.setAttribute('aria-expanded','false');
        sectionToggle.lastElementChild.textContent='+';
      }
    });
    item.appendChild(link);
    sectionList.appendChild(item);
  });

  sectionToggle.addEventListener('click',()=>{
    const open=sectionNav.classList.toggle('open');
    sectionToggle.setAttribute('aria-expanded',String(open));
    sectionToggle.lastElementChild.textContent=open?'−':'+';
  });

  const sectionContent=document.createElement('div');
  sectionContent.className='section-nav-content';
  while(longPageContainer.firstChild)sectionContent.appendChild(longPageContainer.firstChild);
  sectionNav.append(sectionContext,sectionToggle,sectionList);
  longPageContainer.classList.add('has-section-nav');
  longPageContainer.append(sectionNav,sectionContent);

  const mainScroller=document.querySelector('main');
  const sectionLinks=[...sectionList.querySelectorAll('a')];
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      sectionLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')===`#${entry.target.id}`));
    });
  },{root:mainScroller,rootMargin:'-12% 0px -72% 0px',threshold:0});
  longPageSections.forEach(section=>observer.observe(section));

  /* Keep one section highlighted between observer bands and near page end. */
  const updateActiveSection=()=>{
    const scrollerTop=mainScroller?.getBoundingClientRect().top||0;
    let current=longPageSections[0];
    longPageSections.forEach(section=>{
      if(section.getBoundingClientRect().top<=scrollerTop+150)current=section;
    });
    sectionLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')===`#${current.id}`));
  };
  mainScroller?.addEventListener('scroll',updateActiveSection,{passive:true});
  updateActiveSection();
}
