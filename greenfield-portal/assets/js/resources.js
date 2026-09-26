const resourceEscape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const resourceFormatBytes=value=>{const bytes=Number(value)||0;if(bytes<1024)return`${bytes} B`;if(bytes<1048576)return`${(bytes/1024).toFixed(1)} KB`;return`${(bytes/1048576).toFixed(1)} MB`};

fetch('/api/resources').then(response=>response.json()).then(({resources})=>{
  if(!resources?.length)return;
  const container=document.querySelector('.legacy-content .container');
  if(!container)return;
  const section=document.createElement('section');
  section.className='managed-resources';
  section.innerHTML=`<div class="managed-resources-heading"><span>Published from Admin</span><h2>Latest resources</h2></div><div class="res-grid">${resources.map(item=>`<article class="res-card"><div class="res-icon" data-format="${resourceEscape(item.file_name.split('.').pop()?.toUpperCase()||'FILE')}" aria-hidden="true"></div><div class="res-body"><div class="res-name">${resourceEscape(item.title)}</div><div class="res-desc">${resourceEscape(item.description)}</div><div class="res-meta"><span class="res-badge">${resourceEscape(item.category||item.content_type)}</span><span class="res-badge">${resourceFormatBytes(item.size_bytes)}</span><a class="dl-btn" href="/downloads/${item.id}">Download file →</a></div></div></article>`).join('')}</div>`;
  container.prepend(section);
}).catch(()=>{});
