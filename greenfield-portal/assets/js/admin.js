const state={data:null,content:{pages:[],page_catalog:[],templates:[],menu:[],resolved_menu:[],resources:[]},parity:{pages:[],workflows:[],roles:[],assignments:[],assets:[],showcase:[],index_jobs:[],page_analytics:[],auth:{}},people:[],theme:null};
let themeDirty=false;
let activeThemePanel='hero';
const $=selector=>document.querySelector(selector);
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const api=async(url,options={})=>{const response=await fetch(url,options);const result=await response.json();if(!response.ok)throw new Error(result.error||'Request failed.');return result};

// Progressive Admin UI: keeps older static shells compatible while exposing the new managed models.
const libraryHeading=[...document.querySelectorAll('.admin-section-nav span')].find(node=>node.textContent.trim()==='Libraries');
const demoNav=document.querySelector('[data-admin-section="demos"]');
if(demoNav&&!document.querySelector('[data-admin-section="people"]'))demoNav.insertAdjacentHTML('afterend','<button data-admin-section="people">People &amp; leadership</button>');
const usersPanel=document.querySelector('[data-admin-panel="users"]');
if(usersPanel&&!document.querySelector('[data-admin-panel="people"]'))usersPanel.insertAdjacentHTML('beforebegin','<section class="admin-panel hidden" data-admin-panel="people"><div class="admin-panel-heading"><div><h2>People &amp; leadership</h2><p>Manage profiles used on the homepage and About page.</p></div><button id="new-person" class="button button-primary">Add profile</button></div><div id="people-list" class="admin-library-grid"></div><p id="people-message" class="form-message" aria-live="polite"></p></section>');
document.body.insertAdjacentHTML('beforeend','<dialog id="people-dialog" class="admin-dialog"><form id="people-form" method="dialog"><div class="admin-panel-heading"><div><h2>Edit profile</h2><p>Public profile information is reused across the portal.</p></div><button type="button" data-close-person aria-label="Close">×</button></div><input name="id" type="hidden"><label>Name<input name="name" required maxlength="120"></label><label>Display name<input name="display_name" required maxlength="120"></label><label>Designation<input name="designation" maxlength="200"></label><label>Short bio<textarea name="short_bio" rows="3"></textarea></label><label>Full bio<textarea name="full_bio" rows="6"></textarea></label><div class="form-columns"><label>Email<input name="email" type="email"></label><label>Phone<input name="phone"></label><label>LinkedIn URL<input name="linkedin_url" type="url"></label><label>Profile image URL<input name="profile_image_url"></label><label>Location<input name="location"></label><label>Display order<input name="display_order" type="number" min="0"></label><label>CTA label<input name="cta_label"></label><label>CTA URL<input name="cta_url"></label></div><label>Specialties <small>Comma separated</small><input name="specialties"></label><label><input name="is_active" type="checkbox" checked> Active</label><label><input name="public_visibility" type="checkbox" checked> Publicly visible</label><button class="button button-primary" type="submit">Save profile</button><p id="people-form-message" class="form-message" aria-live="polite"></p></form></dialog>');
const peopleSubmit=document.querySelector('#people-form .button-primary');
peopleSubmit?.insertAdjacentHTML('beforebegin','<fieldset class="leadership-fields"><legend>Leadership publishing</legend><div class="form-columns"><label>First name<input name="first_name"></label><label>Middle name<input name="middle_name"></label><label>Last name<input name="last_name"></label><label>Profile slug<input name="slug" pattern="[a-z0-9-]+"></label><label>Capability line<input name="capability_line" required maxlength="500"></label><label>Leadership category<input name="leadership_category" value="Executive Leadership"></label><label>Person type<input name="person_type" value="Executive"></label><label>Status<select name="status"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label><label>Website URL<input name="website_url" type="url"></label></div><label>Expertise <small>Comma separated</small><input name="expertise"></label><div class="form-columns"><label><input name="show_on_leadership" type="checkbox" checked> Show on Leadership page</label><label><input name="featured_homepage" type="checkbox"> Feature on homepage</label><label><input name="email_public" type="checkbox"> Display email publicly</label><label><input name="phone_public" type="checkbox"> Display phone publicly</label><label><input name="linkedin_public" type="checkbox" checked> Display LinkedIn publicly</label><label><input name="website_public" type="checkbox"> Display website publicly</label></div><label>Executive photograph<input name="photo_file" type="file" accept="image/jpeg,image/png,image/webp"></label><label>Photograph alternative text<input name="photo_alt_text" maxlength="240"></label><div id="person-photo-preview"></div></fieldset>');
const showcaseForm=document.querySelector('#showcase-form');
if(showcaseForm&&!showcaseForm.elements.exploded_alt)showcaseForm.querySelector('.button-primary').insertAdjacentHTML('beforebegin','<fieldset data-exploded-media><legend>Exploded-view image</legend><div id="exploded-preview"></div><label>Replace image<input name="exploded_view_file" type="file" accept="image/png,image/jpeg,image/webp"></label><label>Alternative text<input name="exploded_alt" maxlength="300"></label><label>Caption<input name="exploded_caption" maxlength="500"></label><button id="remove-exploded" class="button button-danger hidden" type="button">Remove image</button></fieldset>');

async function loadDashboard(){
  const response=await fetch('/api/admin/dashboard');
  if(response.status===403){location.href='/login?next=/admin';return}
  state.data=await response.json();
  const contentResponse=await fetch('/api/admin/content');
  if(contentResponse.ok)state.content=await contentResponse.json();
  const parityResponse=await fetch('/api/admin/parity');
  if(parityResponse.ok)state.parity=await parityResponse.json();
  const showcaseResponse=await fetch('/api/admin/showcase');
  if(showcaseResponse.ok)state.parity.showcase=(await showcaseResponse.json()).items||[];
  const peopleResponse=await fetch('/api/admin/people');
  if(peopleResponse.ok)state.people=(await peopleResponse.json()).people||[];
  const themeResponse=await fetch('/api/admin/theme');
  if(themeResponse.ok)state.theme=await themeResponse.json();
  render();
}

function render(){
  const {summary,config,users,events}=state.data;
  $('#total-views').textContent=summary.total_views||0;$('#unique-visitors').textContent=summary.unique_visitors||0;$('#registered-visitors').textContent=summary.registered_visitors||0;
  $('#registration-enabled').checked=config.registration_enabled;$('#copy-enabled').checked=config.copy_deterrence_enabled;$('#preview-words').value=config.preview_words;$('#public-paths').value=config.public_paths.join('\n');
  renderUserManagement(users);
  $('#events-body').innerHTML=events.map(event=>`<tr><td>${formatDate(event.occurred_at)}</td><td>${escapeHtml(event.name||'Guest')}</td><td>${escapeHtml(event.email||'Anonymous')}</td><td>${escapeHtml(event.path)}</td><td>${escapeHtml([event.city,event.country].filter(Boolean).join(', ')||'Unknown')}</td><td title="${escapeHtml(event.user_agent)}">${escapeHtml(shortAgent(event.user_agent))}</td></tr>`).join('');
  renderMenus();renderPages();renderTemplates();renderResources();
  renderParity();renderPeople();
  renderTheme();
}

function renderUserManagement(users){
  const administrators=users.filter(user=>user.role==='admin');
  const members=users.filter(user=>user.role!=='admin');
  const currentId=Number(state.data.admin?.id);
  $('#admin-count').textContent=administrators.length;
  $('#member-count').textContent=members.length;
  $('#disabled-count').textContent=users.filter(user=>user.status==='disabled').length;
  $('#administrators-body').innerHTML=administrators.map(user=>`<tr><td>${escapeHtml(user.name)}</td><td>${escapeHtml(user.email)}</td><td><span class="admin-status ${user.status}">${escapeHtml(user.status)}</span></td><td>${formatDate(user.last_login_at)}</td><td class="admin-table-actions">${user.id===currentId?'<span class="admin-current-user">Current administrator</span>':`<button data-role-change="${user.id}" data-next-role="member">Remove admin</button>`}<button data-password-reset="${user.id}">Create reset link</button></td></tr>`).join('')||'<tr><td colspan="5">No administrators found.</td></tr>';
  $('#users-body').innerHTML=members.map(user=>`<tr><td>${escapeHtml(user.name)}</td><td>${escapeHtml(user.email)}</td><td><span class="admin-status ${user.status}">${escapeHtml(user.status)}</span></td><td>${formatDate(user.created_at)}</td><td>${formatDate(user.last_login_at)}</td><td class="admin-table-actions"><button data-role-change="${user.id}" data-next-role="admin">Make admin</button><button data-user-id="${user.id}" data-next-status="${user.status==='active'?'disabled':'active'}">${user.status==='active'?'Disable':'Enable'}</button><button data-password-reset="${user.id}">Create reset link</button></td></tr>`).join('')||'<tr><td colspan="6">No registered members found.</td></tr>';
}

function renderTheme(){
  if(!state.theme)return;
  const config=state.theme.current;
  Object.entries(config.global).forEach(([name,value])=>{const input=$(`#theme-form [name="${name}"]`);if(input)input.value=value});
  $('#theme-status').textContent=state.theme.draft?`Draft v${state.theme.draft.version_number}`:state.theme.published?`Published v${state.theme.published.version_number}`:'Approved baseline';
  renderThemePanel();
  renderThemeContrast(state.theme.contrast||[]);
  $('#theme-history').innerHTML=(state.theme.history||[]).map(version=>`<article class="admin-record"><div><h3>Version ${version.version_number} · ${escapeHtml(version.status)}</h3><p>${formatDate(version.published_at||version.created_at)} · ${escapeHtml(version.change_note||'No change note')}</p></div><div class="admin-record-actions">${version.status==='superseded'?`<button type="button" data-theme-rollback="${version.id}">Rollback</button>`:''}</div></article>`).join('')||'<p class="empty-state">No published theme versions yet.</p>';
}
function renderThemePanel(){
  const panel=state.theme.current.panels[$('#theme-panel').value];
  const options=(values,current)=>values.map(value=>`<option value="${value}"${value===current?' selected':''}>${value.replaceAll('_',' ')}</option>`).join('');
  $('#theme-panel-controls').innerHTML=`<label>Panel preset<select name="p_preset">${options(['Light','Dark','Image','Accent','Neutral'],panel.preset)}</select></label><label>Background colour<input name="p_background" type="color" value="${panel.background}"></label><label>Text colour<input name="p_text" type="color" value="${panel.text}"></label><label>Heading colour<input name="p_heading" type="color" value="${panel.heading}"></label><label>Accent colour<input name="p_accent" type="color" value="${panel.accent}"></label><label>Background image<input name="p_background_image" value="${escapeHtml(panel.background_image)}" placeholder="/assets/images/..."></label><label>Overlay strength<input name="p_overlay" type="range" min="0" max="90" value="${panel.overlay}"></label><label>Mode<select name="p_mode">${options(['light','dark'],panel.mode)}</select></label><label>Density<select name="p_density">${options(['compact','standard','spacious'],panel.density)}</select></label><label>Heading<select name="p_heading_size">${options(['small','standard','emphasis'],panel.heading_size)}</select></label><label>Border visibility<select name="p_border">${options(['visible','hidden'],panel.border?'visible':'hidden')}</select></label><label>Card treatment<select name="p_card_treatment">${options(['flat','surface','outlined','elevated'],panel.card_treatment)}</select></label><label>Content width<select name="p_content_width">${options(['narrow','standard','wide'],panel.content_width)}</select></label>`;
}
function readThemePanel(){
  if(!state.theme)return;
  const panel=state.theme.current.panels[$('#theme-panel').value],form=$('#theme-form');
  ['preset','background','text','heading','accent','background_image','overlay','mode','density','heading_size','card_treatment','content_width'].forEach(key=>{const input=form.elements[`p_${key}`];if(input)panel[key]=key==='overlay'?Number(input.value):input.value});
  panel.border=form.elements.p_border?.value==='visible';
}
function readTheme(){
  readThemePanel();
  const form=$('#theme-form');
  Object.keys(state.theme.current.global).forEach(key=>{if(form.elements[key])state.theme.current.global[key]=form.elements[key].value});
  return state.theme.current;
}
function renderThemeContrast(results){
  $('#theme-contrast').innerHTML=results.map(item=>`<span class="${item.pass?'pass':'fail'}">${escapeHtml(item.label)}: ${item.ratio}:1 · ${item.pass?'Pass':'Fail'}</span>`).join('');
}

function renderMenus(){
  const roots=state.content.menu.filter(item=>!item.parent_id);
  $('#menu-editor').innerHTML=roots.length?roots.map((root,index)=>menuRow(root,index,null)+state.content.menu.filter(item=>item.parent_id===root.id).map((child,childIndex)=>menuRow(child,childIndex,String(root.id))).join('')).join(''):'<p class="empty-state">No managed menu exists yet. Add the first item or seed it from the current public navigation.</p>';
  const resolved=state.content.resolved_menu||[];
  const resolvedRoots=resolved.filter(item=>!item.parent_id);
  $('#resolved-menu').innerHTML=resolvedRoots.length?resolvedRoots.map(root=>resolvedMenuRow(root)+resolved.filter(item=>String(item.parent_id)===String(root.id)).map(child=>resolvedMenuRow(child,true)).join('')).join(''):'<p class="empty-state">The current public menu could not be resolved.</p>';
  const showcase=state.parity.showcase||[];
  $('#content-menu-controls').innerHTML=showcase.length?showcase.map(item=>contentMenuControl(item)).join(''):'<p class="empty-state">No case studies or demos are available.</p>';
}
function contentMenuControl(item){
  const enabled=Boolean(item.include_in_navigation);
  const effective=enabled&&item.status==='published';
  return `<div class="resolved-menu-row is-generated"><span><strong>${escapeHtml(item.title)}</strong><small>${item.content_type==='demo'?'Demo':'Case study'} · ${escapeHtml(item.status)}${enabled&&!effective?' · will appear after publication':''}</small></span><span class="admin-status ${effective?'published':'archived'}">${effective?'Visible in menu':'Hidden from menu'}</span><button type="button" data-showcase-menu-toggle="${item.id}" data-menu-enabled="${enabled?'true':'false'}">${enabled?'Disable':'Enable'}</button></div>`;
}
function resolvedMenuRow(item,isChild=false){
  const generated=String(item.id||'').startsWith('showcase-');
  return `<div class="resolved-menu-row${isChild?' is-child':''}${generated?' is-generated':''}"><span><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.url)}</small></span><span class="admin-status ${generated?'published':'approved'}">${generated?'Generated from content':'Editable menu'}</span>${generated?`<button type="button" data-open-section="${String(item.url||'').includes('/enterprise-architecture/')?'demos':'case-studies'}">Edit content</button>`:'<span></span>'}</div>`;
}
function menuRow(item,position,parentKey){
  return `<div class="menu-editor-row ${parentKey?'is-child':''}" data-menu-key="${item.id}" data-parent-key="${parentKey??''}"><span class="drag-handle" aria-hidden="true">⋮⋮</span><input data-field="label" aria-label="Menu label" value="${escapeHtml(item.label)}"><input data-field="url" aria-label="Menu URL" value="${escapeHtml(item.url)}" placeholder="/pages/page.html"><select data-field="visibility"><option value="visible"${item.visibility==='visible'?' selected':''}>Visible</option><option value="hidden"${item.visibility==='hidden'?' selected':''}>Hidden</option></select><button type="button" data-menu-up title="Move up">↑</button><button type="button" data-menu-down title="Move down">↓</button><button type="button" data-menu-child title="Add submenu">＋</button><button type="button" data-menu-remove title="Remove">×</button></div>`;
}
function readMenu(){
  return [...document.querySelectorAll('.menu-editor-row')].map((row,position)=>({key:row.dataset.menuKey,parentKey:row.dataset.parentKey||null,label:row.querySelector('[data-field=label]').value,url:row.querySelector('[data-field=url]').value,visibility:row.querySelector('[data-field=visibility]').value,position}));
}

function renderPages(){
  const query=$('#page-search').value.trim().toLowerCase();
  const pages=(state.content.page_catalog||[]).filter(page=>!query||`${page.title} ${page.path}`.toLowerCase().includes(query));
  $('#page-list').innerHTML=pages.length?pages.map(page=>`<article class="page-catalog-row" data-page-path="${escapeHtml(page.path)}">
    <button class="page-catalog-edit" type="button" data-page-customize><strong>${escapeHtml(page.title)}</strong><span>${escapeHtml(page.path)} · ${page.managed_id?escapeHtml(page.status):'static source'}</span></button>
    <label>Page visibility<select data-page-visibility aria-label="Visibility for ${escapeHtml(page.title)}"><option value="visible"${page.visibility==='visible'?' selected':''}>Visible</option><option value="hidden"${page.visibility==='hidden'?' selected':''}>Hidden</option></select></label>
    <label class="page-signin-control"><input type="checkbox" data-page-signin${page.requires_sign_in?' checked':''}> Require sign-in</label>
    <button class="button button-secondary page-access-save" type="button" data-page-access-save>Save access</button>
  </article>`).join(''):'<p class="empty-state">No pages match this search.</p>';
  $('#page-template').innerHTML='<option value="">No template</option>'+state.content.templates.map(item=>`<option value="${item.id}">${escapeHtml(item.name)}</option>`).join('');
}
function openPage(page={}){
  $('#page-form').classList.remove('hidden');$('#page-id').value=page.id||'';$('#page-title').value=page.title||'';$('#page-slug').value=page.slug||'';$('#page-source-path').value=page.source_path||'';$('#page-summary').value=page.summary||'';$('#page-template').value=page.template_id||'';$('#page-body').value=page.body_html||'<section id="overview"><h2>Overview</h2><p>Start writing here.</p></section>';
  const nav=parseJson(page.left_nav_json,[]);const style=parseJson(page.style_json,{});
  $('#page-left-nav').value=nav.map(item=>`${item.label} | ${item.id}`).join('\n');$('#page-font-body').value=style.font_body||'DM Sans';$('#page-font-heading').value=style.font_heading||'Fraunces';$('#page-primary').value=style.primary||'#08264a';$('#page-accent').value=style.accent||'#c3912f';
  const hero=parseJson(page.hero_json,{});const related=parseJson(page.related_pages_json,[]);
  $('#page-workflow').value=page.workflow_state||page.status||'draft';$('#page-seo-title').value=page.seo_title||'';$('#page-seo-description').value=page.seo_description||'';$('#page-canonical').value=page.canonical_url||'';$('#page-hero-headline').value=hero.headline||'';$('#page-hero-description').value=hero.description||'';$('#page-hero-image').value=hero.image||'';$('#page-related').value=related.join('\n');$('#page-change-note').value='';
  const url=page.source_path||(page.slug?`/pages/${page.slug}.html`:'');$('#page-preview').classList.toggle('hidden',!url);$('#page-preview').href=url;
}

function renderParity(){
  const parity=state.parity;
  const pages=parity.pages||[];
  const record=(page,actions='')=>`<article class="admin-record"><div><h3>${escapeHtml(page.title)}</h3><p>${escapeHtml(page.source_path||`/pages/${page.slug}.html`)} · Updated ${formatDate(page.updated_at)}</p></div><div class="admin-record-actions"><span class="admin-status ${escapeHtml(page.workflow_state)}">${escapeHtml(page.workflow_state.replace('_',' '))}</span>${actions}</div></article>`;
  $('#workflow-list').innerHTML=pages.length?pages.map(page=>record(page,`<button data-workflow-id="${page.id}" data-workflow-state="in_review">Submit</button><button data-workflow-id="${page.id}" data-workflow-state="approved">Approve</button>`)).join(''):'<p class="empty-state">No managed pages yet.</p>';
  $('#publishing-list').innerHTML=pages.length?pages.map(page=>record(page,`<button data-workflow-id="${page.id}" data-workflow-state="published">Publish</button><button data-workflow-id="${page.id}" data-workflow-state="archived">Archive</button>`)).join(''):'<p class="empty-state">No managed pages yet.</p>';
  $('#version-page').innerHTML='<option value="">Choose a page</option>'+pages.map(page=>`<option value="${page.id}">${escapeHtml(page.title)}</option>`).join('');
  const documents=(parity.assets||[]).filter(asset=>!['image','video','audio'].includes(asset.asset_kind));
  const media=(parity.assets||[]).filter(asset=>['image','video','audio'].includes(asset.asset_kind));
  const caseStudies=(parity.showcase||[]).filter(item=>item.content_type==='case_study');
  const demos=(parity.showcase||[]).filter(item=>item.content_type==='demo');
  const otherDocuments=documents.filter(asset=>asset.category!=='Case Study');
  $('#case-study-library').innerHTML=renderShowcase(caseStudies);$('#demo-library').innerHTML=renderShowcase(demos);$('#document-library').innerHTML=renderLibrary(otherDocuments);$('#media-library').innerHTML=renderLibrary(media);
  $('#indexed-pages').textContent=pages.filter(page=>page.workflow_state==='published').length;
  $('#indexed-knowledge').textContent=parity.indexed_knowledge||0;
  $('#index-status').textContent=parity.index_jobs?.[0]?.status||'Not run';
  $('#index-jobs').innerHTML=(parity.index_jobs||[]).map(job=>`<article class="admin-record"><div><h3>${escapeHtml(job.scope)} index</h3><p>${job.records_indexed} records · ${formatDate(job.requested_at)}</p></div><span class="admin-status ${job.status}">${job.status}</span></article>`).join('')||'<p class="empty-state">No index jobs recorded.</p>';
  $('#page-analytics-body').innerHTML=(parity.page_analytics||[]).map(item=>`<tr><td>${escapeHtml(item.path)}</td><td>${item.views}</td></tr>`).join('');
  document.querySelectorAll('[data-copy-metric]').forEach(node=>node.textContent=$(`#${node.dataset.copyMetric}`)?.textContent||'0');
  $('#role-list').innerHTML=(parity.roles||[]).map(role=>`<article class="admin-record"><div><h3>${escapeHtml(role.name)}</h3><p>${escapeHtml(role.description)}<br>${escapeHtml(parseJson(role.permissions_json,[]).join(' · '))}</p></div><div class="admin-record-actions"><select data-role-user="${role.id}" aria-label="User for ${escapeHtml(role.name)}"><option value="">Assign user</option>${state.data.users.map(user=>`<option value="${user.id}">${escapeHtml(user.name)}</option>`).join('')}</select><button data-assign-role="${role.id}">Assign</button></div></article>`).join('');
  const auth=parity.auth||{};$('#auth-status').innerHTML=`<article><h3>Password authentication</h3><p>${auth.password?'Enabled':'Unavailable'} · minimum 10 characters · PBKDF2 protected</p></article><article><h3>Google authentication</h3><p>${auth.google?'Configured':'Not configured'}</p></article><article><h3>Sessions</h3><p>Secure, HTTP-only, SameSite cookies · ${auth.session_days||7} day lifetime</p></article><article><h3>Registration</h3><p>${state.data.config.registration_enabled?'Enabled':'Closed'} by system configuration</p></article>`;
  $('#system-summary').innerHTML=`<article><h3>Public paths</h3><p>${state.data.config.public_paths.length} routes are explicitly public.</p></article><article><h3>Guest preview</h3><p>${state.data.config.preview_words} words before authentication.</p></article><article><h3>Copy deterrence</h3><p>${state.data.config.copy_deterrence_enabled?'Enabled':'Disabled'}; server access remains authoritative.</p></article>`;
}
function renderLibrary(items){return items.length?items.map(asset=>`<article class="admin-library-card"><span class="admin-status ${asset.status}">${asset.status}</span><h3>${escapeHtml(asset.title)}</h3><p>${escapeHtml(asset.description||asset.file_name)}</p><dl><dt>Type</dt><dd>${escapeHtml(asset.asset_kind)}</dd><dt>Version</dt><dd>${escapeHtml(asset.version_label)}</dd><dt>Visibility</dt><dd>${escapeHtml(asset.visibility)}</dd><dt>Size</dt><dd>${formatBytes(asset.size_bytes)}</dd></dl></article>`).join(''):'<p class="empty-state">No assets in this library.</p>'}
function renderShowcase(items){return items.length?items.map(item=>`<article class="admin-library-card" data-showcase-id="${item.id}"><span class="admin-status ${item.status}">${escapeHtml(item.status)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description||item.category)}</p><dl><dt>Slug</dt><dd>${escapeHtml(item.slug)}</dd><dt>Order</dt><dd>${item.display_order}</dd><dt>Visibility</dt><dd>${escapeHtml(item.visibility)}</dd><dt>Menu</dt><dd>${item.include_in_navigation?'Included':'Not included'}</dd>${item.file?`<dt>Storage</dt><dd>${escapeHtml(item.file.storage_provider)}</dd><dt>Object key / path</dt><dd>${escapeHtml(item.file.object_key||'—')}</dd><dt>File</dt><dd>${escapeHtml(item.file.file_name||'—')}</dd><dt>Size</dt><dd>${formatBytes(item.file.size_bytes)}</dd><dt>Content type</dt><dd>${escapeHtml(item.file.content_type||'—')}</dd><dt>Uploaded</dt><dd>${formatDate(item.file.uploaded_at)}</dd><dt>Watermark</dt><dd>${item.file.watermark_requested?'Requested; processing not implemented':'Not requested'}</dd>`:''}</dl><div class="admin-record-actions"><button type="button" data-showcase-edit>Edit</button><a class="button button-secondary" href="/case-studies/?preview=${item.id}" target="_blank">Preview</a>${item.file?.review_route?`<a class="button button-secondary" href="${escapeHtml(item.file.review_route)}" target="_blank">Review file</a>`:''}${item.status==='published'?`<button type="button" data-showcase-status="draft">Unpublish</button>`:`<button type="button" data-showcase-status="published">Publish</button>`}<button type="button" data-showcase-status="archived">Archive</button></div></article>`).join(''):'<p class="empty-state">No items have been created.</p>'}

function showcasePayload(form){const data=new FormData(form);return{content_type:data.get('content_type'),slug:data.get('slug'),title:data.get('title'),description:data.get('description'),category:data.get('category'),cover_image_url:data.get('cover_image_url'),target_url:data.get('target_url'),visibility:data.get('visibility'),display_order:Number(data.get('display_order'))||0,tags:String(data.get('tags')||'').split(',').map(value=>value.trim()).filter(Boolean),outcomes:String(data.get('outcomes')||'').split(/\r?\n/).map(value=>value.trim()).filter(Boolean),featured:data.has('featured'),include_in_navigation:data.has('include_in_navigation')}}
function openShowcase(item={content_type:'demo'}){const form=$('#showcase-form');form.reset();form.elements.id.value=item.id||'';form.elements.content_type.value=item.content_type||'demo';form.elements.title.value=item.title||'';form.elements.slug.value=item.slug||'';form.elements.slug.readOnly=Boolean(item.id);form.elements.description.value=item.description||'';form.elements.category.value=item.category||'';form.elements.cover_image_url.value=item.cover_image_url||'';form.elements.target_url.value=item.target_url||'';form.elements.visibility.value=item.visibility||'public';form.elements.display_order.value=item.display_order||0;form.elements.tags.value=(item.tags||[]).join(', ');form.elements.outcomes.value=(item.outcomes||[]).join('\n');form.elements.featured.checked=Boolean(item.featured);form.elements.include_in_navigation.checked=Boolean(item.include_in_navigation);form.querySelector('[data-demo-url]').hidden=(item.content_type||'demo')!=='demo';$('#showcase-dialog-title').textContent=item.id?`Edit ${item.content_type==='demo'?'demo':'case study'}`:'Add demo';$('#showcase-dialog').showModal()}

function renderTemplates(){
  $('#template-list').innerHTML=state.content.templates.map(item=>`<button type="button" data-template-id="${item.id}"><strong>${escapeHtml(item.name)}</strong><span>${item.layout} · ${item.font_heading} / ${item.font_body}</span></button>`).join('');
}
function openTemplate(item={}){
  $('#template-form').classList.remove('hidden');$('#template-id').value=item.id||'';$('#template-name').value=item.name||'';$('#template-description').value=item.description||'';$('#template-layout').value=item.layout||'left-nav';$('#template-width').value=item.content_width||1180;$('#template-font-body').value=item.font_body||'DM Sans';$('#template-font-heading').value=item.font_heading||'Fraunces';$('#template-primary').value=item.color_primary||'#08264a';$('#template-accent').value=item.color_accent||'#c3912f';
}

function renderResources(){
  $('#resource-list').innerHTML=state.content.resources?.length?state.content.resources.map(item=>`<button type="button" data-resource-id="${item.id}"><strong>${escapeHtml(item.title)}</strong><span>${item.status} · ${escapeHtml(item.category||item.file_name)} · ${formatBytes(item.size_bytes)}</span></button>`).join(''):'<p class="empty-state">No uploaded resources yet.</p>';
}
function openResource(item={}){
  $('#resource-form').classList.remove('hidden');$('#resource-id').value=item.id||'';$('#resource-title').value=item.title||'';$('#resource-description').value=item.description||'';$('#resource-category').value=item.category||'';$('#resource-status').value=item.status||'draft';$('#resource-position').value=item.position||0;$('#resource-file').required=!item.id;$('#resource-file').disabled=Boolean(item.id);
  $('#resource-download').classList.toggle('hidden',!item.id);$('#delete-resource').classList.toggle('hidden',!item.id);if(item.id)$('#resource-download').href=`/downloads/${item.id}`;
}

function formatDate(value){return value?new Date(`${value.replace(' ','T')}Z`).toLocaleString():'—'}
function renderPeople(){const root=$('#people-list');if(!root)return;root.innerHTML=state.people.length?state.people.map(person=>`<article class="admin-library-card" data-person-id="${person.id}"><img src="${escapeHtml(person.profile_image_url||'/assets/images/profile-placeholder.svg')}" alt="" width="72" height="72"><span class="admin-status ${person.status==='published'&&person.is_active?'published':'archived'}">${escapeHtml(person.status||'draft')}</span><h3>${escapeHtml(person.display_name)}</h3><p>${escapeHtml(person.designation||person.short_bio)}</p><dl><dt>Category</dt><dd>${escapeHtml(person.leadership_category||'—')}</dd><dt>Homepage</dt><dd>${person.featured_homepage?'Yes':'No'}</dd><dt>Order</dt><dd>${person.display_order}</dd></dl><a href="/about/leadership/${escapeHtml(person.slug||person.stable_id)}" target="_blank">Preview</a> <button type="button" data-person-edit>Edit</button></article>`).join(''):'<p class="empty-state">No leadership profiles have been created.</p>'}
function openPerson(person={}){const form=$('#people-form');form.reset();['id','name','display_name','designation','short_bio','full_bio','email','phone','linkedin_url','profile_image_url','location','display_order','cta_label','cta_url','first_name','middle_name','last_name','slug','capability_line','leadership_category','person_type','status','website_url','photo_alt_text'].forEach(name=>{if(form.elements[name])form.elements[name].value=person[name]??(name==='display_order'?100:'')});form.elements.specialties.value=(person.specialties||[]).join(', ');form.elements.expertise.value=(person.specialties||[]).join(', ');['is_active','public_visibility','show_on_leadership','featured_homepage','email_public','phone_public','linkedin_public','website_public'].forEach(name=>form.elements[name].checked=person[name]??['is_active','public_visibility','show_on_leadership','linkedin_public'].includes(name));$('#person-photo-preview').innerHTML=person.profile_image_url?`<img src="${escapeHtml(person.profile_image_url)}" alt="" width="120" height="120">`:'';$('#people-dialog').showModal()}
function personPayload(form){const data=new FormData(form);return{name:data.get('name'),display_name:data.get('display_name'),designation:data.get('designation'),short_bio:data.get('short_bio'),full_bio:data.get('full_bio'),email:data.get('email'),phone:data.get('phone'),linkedin_url:data.get('linkedin_url'),profile_image_url:data.get('profile_image_url'),specialties:String(data.get('specialties')||'').split(',').map(value=>value.trim()).filter(Boolean),location:data.get('location'),cta_label:data.get('cta_label'),cta_url:data.get('cta_url'),display_order:Number(data.get('display_order'))||0,is_active:data.has('is_active'),public_visibility:data.has('public_visibility')}}
function shortAgent(value){if(!value)return'Unknown';if(value.includes('Edg/'))return'Edge';if(value.includes('Chrome/'))return'Chrome';if(value.includes('Firefox/'))return'Firefox';if(value.includes('Safari/'))return'Safari';return value.slice(0,35)}
function parseJson(value,fallback){try{return JSON.parse(value||'')}catch{return fallback}}
function formatBytes(value){const bytes=Number(value)||0;if(bytes<1024)return`${bytes} B`;if(bytes<1048576)return`${(bytes/1024).toFixed(1)} KB`;return`${(bytes/1048576).toFixed(1)} MB`}

document.querySelectorAll('[data-admin-section]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-admin-section]').forEach(item=>item.classList.toggle('active',item===button));document.querySelectorAll('[data-admin-panel]').forEach(panel=>panel.classList.toggle('hidden',panel.dataset.adminPanel!==button.dataset.adminSection))}));
document.querySelectorAll('[data-admin-tab]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-admin-tab]').forEach(item=>item.classList.toggle('active',item===button));['administrators','users','events'].forEach(name=>$(`#${name}-table`)?.classList.toggle('hidden',button.dataset.adminTab!==name))}));
$('#new-person')?.addEventListener('click',()=>openPerson());
$('[data-close-person]')?.addEventListener('click',()=>$('#people-dialog').close());
$('#people-list')?.addEventListener('click',event=>{const card=event.target.closest('[data-person-id]');if(card&&event.target.closest('[data-person-edit]'))openPerson(state.people.find(person=>person.id===Number(card.dataset.personId)))});
$('#people-form')?.addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget;let id=form.elements.id.value;try{const saved=await api(id?`/api/admin/people/${id}`:'/api/admin/people',{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(personPayload(form))});id=id||saved.id;const leadership={first_name:form.elements.first_name.value,middle_name:form.elements.middle_name.value,last_name:form.elements.last_name.value,display_name:form.elements.display_name.value,slug:form.elements.slug.value||form.elements.display_name.value,designation:form.elements.designation.value,capability_line:form.elements.capability_line.value,leadership_category:form.elements.leadership_category.value,person_type:form.elements.person_type.value,status:form.elements.status.value,website_url:form.elements.website_url.value,expertise:form.elements.expertise.value.split(',').map(value=>value.trim()).filter(Boolean),show_on_leadership:form.elements.show_on_leadership.checked,featured_homepage:form.elements.featured_homepage.checked,email_public:form.elements.email_public.checked,phone_public:form.elements.phone_public.checked,linkedin_public:form.elements.linkedin_public.checked,website_public:form.elements.website_public.checked};await api(`/api/admin/people/${id}/leadership`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(leadership)});const file=form.elements.photo_file.files[0];if(file){const upload=new FormData();upload.append('file',file);upload.append('alt_text',form.elements.photo_alt_text.value||`${form.elements.display_name.value}, ${form.elements.designation.value}`);await api(`/api/admin/people/${id}/photo`,{method:'POST',body:upload})}$('#people-dialog').close();await loadDashboard();openAdminSection('people')}catch(error){$('#people-form-message').textContent=error.message}});
$('#config-form').addEventListener('submit',async event=>{event.preventDefault();const body={registration_enabled:$('#registration-enabled').checked,copy_deterrence_enabled:$('#copy-enabled').checked,preview_words:Number($('#preview-words').value),public_paths:$('#public-paths').value.split(/\r?\n/).map(value=>value.trim()).filter(Boolean)};try{const result=await api('/api/admin/config',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});$('#config-message').textContent='Configuration saved.';state.data.config=result.config}catch(error){$('#config-message').textContent=error.message}});
$('#theme-panel').addEventListener('change',event=>{const next=event.target.value;event.target.value=activeThemePanel;readThemePanel();activeThemePanel=next;event.target.value=activeThemePanel;renderThemePanel()});
$('#theme-form').addEventListener('input',()=>{themeDirty=true});
$('#theme-form').addEventListener('submit',async event=>{event.preventDefault();try{const result=await api('/api/admin/theme/draft',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({config:readTheme(),change_note:$('#theme-change-note').value})});themeDirty=false;$('#theme-message').textContent='Draft theme saved.';renderThemeContrast(result.contrast);await loadDashboard()}catch(error){$('#theme-message').textContent=error.message}});
$('#theme-publish-button').addEventListener('click',async()=>{if(!confirm('Publish the current draft theme to the public portal?'))return;try{await api('/api/admin/theme/publish',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});themeDirty=false;$('#theme-message').textContent='Theme published.';await loadDashboard()}catch(error){$('#theme-message').textContent=error.message}});
$('#theme-reset').addEventListener('click',async()=>{if(!confirm('Reset the draft to the approved visual baseline?'))return;try{await api('/api/admin/theme/reset',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});themeDirty=false;$('#theme-message').textContent='Approved baseline restored as a draft.';await loadDashboard()}catch(error){$('#theme-message').textContent=error.message}});
$('#theme-history').addEventListener('click',async event=>{const button=event.target.closest('[data-theme-rollback]');if(!button||!confirm('Publish a new version from this prior theme?'))return;try{await api('/api/admin/theme/rollback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({version_id:Number(button.dataset.themeRollback)})});themeDirty=false;$('#theme-message').textContent='Prior theme restored as a new published version.';await loadDashboard()}catch(error){$('#theme-message').textContent=error.message}});
addEventListener('beforeunload',event=>{if(!themeDirty)return;event.preventDefault();event.returnValue=''});
document.querySelector('[data-admin-panel="users"]').addEventListener('click',async event=>{
  const statusButton=event.target.closest('button[data-user-id]');
  const roleButton=event.target.closest('button[data-role-change]');
  const resetButton=event.target.closest('[data-password-reset]');
  const message=$('#user-management-message');
  try{
    if(statusButton){
      await api(`/api/admin/users/${statusButton.dataset.userId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:statusButton.dataset.nextStatus})});
      await loadDashboard();
    }else if(roleButton){
      const action=roleButton.dataset.nextRole==='admin'?'grant administrator access to':'remove administrator access from';
      if(!confirm(`Are you sure you want to ${action} this user?`))return;
      await api(`/api/admin/users/${roleButton.dataset.roleChange}/role`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({role:roleButton.dataset.nextRole})});
      await loadDashboard();
    }else if(resetButton){
      const result=await api(`/api/admin/users/${resetButton.dataset.passwordReset}/password-reset`,{method:'POST'});
      await navigator.clipboard.writeText(`${location.origin}${result.reset_path}`);
      message.textContent='A 30-minute password reset link was copied to the clipboard.';
    }
  }catch(error){message.textContent=error.message}
});

$('#add-menu-item').addEventListener('click',()=>{$('#menu-editor').insertAdjacentHTML('beforeend',menuRow({id:`new-${Date.now()}`,label:'New menu',url:'',visibility:'visible'},document.querySelectorAll('.menu-editor-row').length,null))});
$('#menu-editor').addEventListener('click',event=>{const row=event.target.closest('.menu-editor-row');if(!row)return;if(event.target.closest('[data-menu-remove]'))row.remove();if(event.target.closest('[data-menu-child]'))row.insertAdjacentHTML('afterend',menuRow({id:`new-${Date.now()}`,label:'New submenu',url:'',visibility:'visible'},0,row.dataset.menuKey));if(event.target.closest('[data-menu-up]')){const previous=row.previousElementSibling;if(previous)previous.before(row)}if(event.target.closest('[data-menu-down]')){const next=row.nextElementSibling;if(next)next.after(row)}});
$('#save-menu').addEventListener('click',async()=>{try{await api('/api/admin/menu',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:readMenu()})});$('#menu-message').textContent='Menu published.';await loadDashboard()}catch(error){$('#menu-message').textContent=error.message}});
$('#content-menu-controls').addEventListener('click',async event=>{const button=event.target.closest('[data-showcase-menu-toggle]');if(!button)return;button.disabled=true;try{const enabled=button.dataset.menuEnabled!=='true';await api(`/api/admin/showcase/${button.dataset.showcaseMenuToggle}/navigation`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({enabled})});$('#menu-message').textContent=`Content menu link ${enabled?'enabled':'disabled'}.`;await loadDashboard();openAdminSection('menus')}catch(error){button.disabled=false;$('#menu-message').textContent=error.message}});

$('#new-page').addEventListener('click',()=>openPage());
$('#import-page').addEventListener('click',async()=>{const path=prompt('Enter an existing page path, for example /pages/architecture.html');if(!path)return;try{openPage(await api(`/api/admin/page-source?path=${encodeURIComponent(path)}`))}catch(error){alert(error.message)}});
$('#page-search').addEventListener('input',renderPages);
$('#page-list').addEventListener('click',async event=>{
  const row=event.target.closest('.page-catalog-row');
  if(!row)return;
  const catalogPage=state.content.page_catalog.find(page=>page.path===row.dataset.pagePath);
  if(!catalogPage)return;
  if(event.target.closest('[data-page-customize]')){
    const managed=state.content.pages.find(page=>page.id===Number(catalogPage.managed_id));
    if(managed){openPage(managed);return}
    try{openPage(await api(`/api/admin/page-source?path=${encodeURIComponent(catalogPage.source_path||catalogPage.path)}`))}
    catch(error){$('#page-access-message').textContent=error.message}
    return;
  }
  if(event.target.closest('[data-page-access-save]')){
    const button=event.target.closest('[data-page-access-save]');
    button.disabled=true;
    try{
      const saved=await api('/api/admin/page-access',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        path:catalogPage.path,title:catalogPage.title,
        visibility:row.querySelector('[data-page-visibility]').value,
        requires_sign_in:row.querySelector('[data-page-signin]').checked,
      })});
      Object.assign(catalogPage,saved);
      $('#page-access-message').textContent=`Access saved for ${catalogPage.title}.`;
      renderPages();
    }catch(error){$('#page-access-message').textContent=error.message;button.disabled=false}
  }
});
$('#page-title').addEventListener('input',()=>{if(!$('#page-id').value&&!$('#page-slug').dataset.edited)$('#page-slug').value=$('#page-title').value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')});
$('#page-slug').addEventListener('input',()=>{$('#page-slug').dataset.edited='true'});
$('#page-form').addEventListener('submit',async event=>{event.preventDefault();const id=$('#page-id').value;const left_nav=$('#page-left-nav').value.split(/\r?\n/).map(line=>{const [label,id]=line.split('|').map(value=>value.trim());return{label,id}}).filter(item=>item.label&&item.id);const body={title:$('#page-title').value,slug:$('#page-slug').value,source_path:$('#page-source-path').value,summary:$('#page-summary').value,template_id:$('#page-template').value,workflow_state:$('#page-workflow').value,body_html:$('#page-body').value,left_nav,seo_title:$('#page-seo-title').value,seo_description:$('#page-seo-description').value,canonical_url:$('#page-canonical').value,hero:{headline:$('#page-hero-headline').value,description:$('#page-hero-description').value,image:$('#page-hero-image').value},related_pages:$('#page-related').value.split(/\r?\n/).map(value=>value.trim()).filter(Boolean),change_note:$('#page-change-note').value,style:{font_body:$('#page-font-body').value,font_heading:$('#page-font-heading').value,primary:$('#page-primary').value,accent:$('#page-accent').value}};try{await api(id?`/api/admin/pages/${id}`:'/api/admin/pages',{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});$('#page-message').textContent='Versioned page revision saved.';await loadDashboard()}catch(error){$('#page-message').textContent=error.message}});

$('#new-template').addEventListener('click',()=>openTemplate());
$('#template-list').addEventListener('click',event=>{const button=event.target.closest('[data-template-id]');if(button)openTemplate(state.content.templates.find(item=>item.id===Number(button.dataset.templateId)))});
$('#template-form').addEventListener('submit',async event=>{event.preventDefault();const id=$('#template-id').value;const body={name:$('#template-name').value,description:$('#template-description').value,layout:$('#template-layout').value,content_width:Number($('#template-width').value),font_body:$('#template-font-body').value,font_heading:$('#template-font-heading').value,color_primary:$('#template-primary').value,color_accent:$('#template-accent').value};try{await api(id?`/api/admin/templates/${id}`:'/api/admin/templates',{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});$('#template-message').textContent='Template saved.';await loadDashboard()}catch(error){$('#template-message').textContent=error.message}});

$('#new-resource').addEventListener('click',()=>openResource());
$('#resource-list').addEventListener('click',event=>{const button=event.target.closest('[data-resource-id]');if(button)openResource(state.content.resources.find(item=>item.id===Number(button.dataset.resourceId)))});
$('#resource-form').addEventListener('submit',async event=>{event.preventDefault();const id=$('#resource-id').value;try{if(id){const body={title:$('#resource-title').value,description:$('#resource-description').value,category:$('#resource-category').value,status:$('#resource-status').value,position:Number($('#resource-position').value)};await api(`/api/admin/resources/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})}else{await api('/api/admin/resources',{method:'POST',body:new FormData(event.currentTarget)})}$('#resource-message').textContent='Resource saved.';event.currentTarget.reset();event.currentTarget.classList.add('hidden');await loadDashboard()}catch(error){$('#resource-message').textContent=error.message}});
$('#delete-resource').addEventListener('click',async()=>{const id=$('#resource-id').value;if(!id||!confirm('Delete this resource and its uploaded file?'))return;try{await api(`/api/admin/resources/${id}`,{method:'DELETE'});$('#resource-form').classList.add('hidden');await loadDashboard()}catch(error){$('#resource-message').textContent=error.message}});

function openAdminSection(name){const button=document.querySelector(`[data-admin-section="${name}"]`);if(button)button.click()}
document.querySelectorAll('[data-open-section]').forEach(button=>button.addEventListener('click',()=>openAdminSection(button.dataset.openSection)));
async function updateWorkflow(pageId,nextState,note=''){
  if(!pageId)throw new Error('Save the page before changing workflow.');
  await api(`/api/admin/pages/${pageId}/workflow`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({state:nextState,note})});
  await loadDashboard();
}
$('#page-submit-review').addEventListener('click',async()=>{try{await updateWorkflow($('#page-id').value,'in_review',$('#page-change-note').value);$('#page-message').textContent='Page submitted for review.'}catch(error){$('#page-message').textContent=error.message}});
$('#page-archive').addEventListener('click',async()=>{if(!confirm('Archive this page? Existing data and versions will be retained.'))return;try{await updateWorkflow($('#page-id').value,'archived',$('#page-change-note').value);$('#page-message').textContent='Page archived.'}catch(error){$('#page-message').textContent=error.message}});
const deletePageButton=document.createElement('button');deletePageButton.id='page-delete';deletePageButton.className='button button-danger';deletePageButton.type='button';deletePageButton.textContent='Delete page';$('#page-archive').after(deletePageButton);
deletePageButton.addEventListener('click',async()=>{const id=$('#page-id').value;if(!id){$('#page-message').textContent='Save the page before deleting it.';return}if(!confirm('Delete this page from publication? It will be archived and all content and versions will be retained.'))return;try{await api(`/api/admin/pages/${id}`,{method:'DELETE'});$('#page-message').textContent='Page deleted from publication and retained in the archive.';await loadDashboard()}catch(error){$('#page-message').textContent=error.message}});
['#workflow-list','#publishing-list'].forEach(selector=>$(selector).addEventListener('click',async event=>{const button=event.target.closest('[data-workflow-id]');if(!button)return;button.disabled=true;try{await updateWorkflow(button.dataset.workflowId,button.dataset.workflowState)}catch(error){button.disabled=false;alert(error.message)}}));

$('#version-page').addEventListener('change',async event=>{const id=event.target.value;if(!id){$('#version-list').innerHTML='';return}try{const result=await api(`/api/admin/pages/${id}/versions`);$('#version-list').innerHTML=result.versions.map(version=>`<article class="admin-record"><div><h3>Version ${version.version_number} · ${escapeHtml(version.title)}</h3><p>${formatDate(version.created_at)} · ${escapeHtml(version.created_by_name||'System')} · ${escapeHtml(version.change_note||'No change note')}</p></div><button data-restore-version="${version.id}">Restore as draft</button></article>`).join('')||'<p class="empty-state">No versions saved.</p>'}catch(error){$('#version-message').textContent=error.message}});
$('#version-list').addEventListener('click',async event=>{const button=event.target.closest('[data-restore-version]');if(!button||!confirm('Restore this version as the current draft? A new revision will be created on the next save.'))return;try{await api(`/api/admin/versions/${button.dataset.restoreVersion}/restore`,{method:'POST'});$('#version-message').textContent='Version restored as draft.';await loadDashboard()}catch(error){$('#version-message').textContent=error.message}});

document.querySelectorAll('[data-new-library]').forEach(button=>button.addEventListener('click',()=>{const media=button.dataset.newLibrary==='media';$('#library-form').reset();$('#library-form [name=asset_kind]').value=media?'image':'document';$('#library-dialog').showModal()}));
$('[data-close-dialog]').addEventListener('click',()=>$('#library-dialog').close());
$('#library-form').addEventListener('submit',async event=>{event.preventDefault();try{await api('/api/admin/library',{method:'POST',body:new FormData(event.currentTarget)});$('#library-message').textContent='Asset uploaded as a protected draft.';$('#library-dialog').close();await loadDashboard()}catch(error){$('#library-message').textContent=error.message}});

$('[data-new-case-study]').addEventListener('click',()=>{$('#case-study-form').reset();$('#case-study-form [name=asset_kind]').value='document';$('#case-study-form [name=category]').value='Case Study';$('#case-study-form [name=version_label]').value='1.0';$('#case-study-form [name=visibility]').value='public';$('#case-study-form [name=download_enabled]').checked=true;$('#case-study-dialog').showModal()});
$('[data-close-case-study]').addEventListener('click',()=>$('#case-study-dialog').close());
$('#case-study-form').addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget;const file=form.elements.file.files[0];if(!file||(!file.name.toLowerCase().endsWith('.pdf')&&file.type!=='application/pdf')){$('#case-study-upload-message').textContent='Choose a PDF file.';return}try{const result=await api('/api/admin/library',{method:'POST',body:new FormData(form)});if(result.showcase_id)await api(`/api/admin/showcase/${result.showcase_id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({content_type:'case_study',title:form.elements.title.value,description:form.elements.description.value,category:'Case Study',cover_image_url:form.elements.cover_image_url.value,visibility:form.elements.visibility.value,display_order:Number(form.elements.display_order.value)||100,tags:String(form.elements.tags.value||'').split(',').map(value=>value.trim()).filter(Boolean),featured:form.elements.featured.checked,include_in_navigation:form.elements.include_in_navigation.checked})});$('#case-study-dialog').close();$('#case-study-message').textContent='Case study and original PDF saved as a draft.';await loadDashboard();openAdminSection('case-studies')}catch(error){$('#case-study-upload-message').textContent=error.message}});

const handleShowcaseClick=async(event,section,messageSelector)=>{const card=event.target.closest('[data-showcase-id]');if(!card)return;const item=(state.parity.showcase||[]).find(record=>record.id===Number(card.dataset.showcaseId));if(!item)return;if(event.target.closest('[data-showcase-edit]')){openShowcase(item);return}const button=event.target.closest('[data-showcase-status]');if(!button)return;button.disabled=true;try{await api(`/api/admin/showcase/${item.id}/status`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:button.dataset.showcaseStatus})});$(messageSelector).textContent=`${item.title} is now ${button.dataset.showcaseStatus}.`;await loadDashboard();openAdminSection(section)}catch(error){button.disabled=false;$(messageSelector).textContent=error.message}};
$('#case-study-library').addEventListener('click',event=>handleShowcaseClick(event,'case-studies','#case-study-message'));
$('#demo-library').addEventListener('click',event=>handleShowcaseClick(event,'demos','#demo-message'));
$('[data-new-demo]').addEventListener('click',()=>openShowcase({content_type:'demo',visibility:'public',display_order:100}));
$('[data-close-showcase]').addEventListener('click',()=>$('#showcase-dialog').close());
$('#showcase-form').addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget;let id=form.elements.id.value;try{const saved=await api(id?`/api/admin/showcase/${id}`:'/api/admin/showcase',{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(showcasePayload(form))});id=id||saved.id;const image=form.elements.exploded_view_file?.files?.[0];if(image){if(!id)throw new Error('Save the case study before uploading its image.');const media=new FormData();media.set('file',image);media.set('asset_type','exploded_view');media.set('alt_text',form.elements.exploded_alt.value);media.set('caption',form.elements.exploded_caption.value);await api(`/api/admin/showcase/${id}/media`,{method:'POST',body:media})}$('#showcase-dialog').close();await loadDashboard();openAdminSection(form.elements.content_type.value==='demo'?'demos':'case-studies')}catch(error){$('#showcase-form-message').textContent=error.message}});
$('#remove-exploded')?.addEventListener('click',async()=>{const id=$('#showcase-form').elements.id.value;if(!id||!confirm('Remove this exploded-view image? The case study and PDF will remain intact.'))return;try{await api(`/api/admin/showcase/${id}/media/exploded_view`,{method:'DELETE'});$('#showcase-dialog').close();await loadDashboard();openAdminSection('case-studies')}catch(error){$('#showcase-form-message').textContent=error.message}});
$('#case-study-library').addEventListener('click',event=>{if(!event.target.closest('[data-showcase-edit]'))return;const card=event.target.closest('[data-showcase-id]'),item=(state.parity.showcase||[]).find(record=>record.id===Number(card?.dataset.showcaseId)),media=(item?.media||[]).find(asset=>asset.asset_type==='exploded_view'),form=$('#showcase-form');if(!form.elements.exploded_alt)return;form.elements.exploded_alt.value=media?.alt_text||'';form.elements.exploded_caption.value=media?.caption||'';$('#exploded-preview').innerHTML=media?`<img src="${escapeHtml(media.url)}" alt="${escapeHtml(media.alt_text)}" style="max-width:100%;height:auto"><p>${escapeHtml(media.file_name)} · ${formatBytes(media.size_bytes)} · ${escapeHtml(media.object_key)}</p>`:'<p>No exploded-view image uploaded.</p>';$('#remove-exploded').classList.toggle('hidden',!media)});

$('#rebuild-index').addEventListener('click',async()=>{const button=$('#rebuild-index');button.disabled=true;try{await api('/api/admin/search/rebuild',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scope:'all'})});await loadDashboard()}catch(error){alert(error.message)}finally{button.disabled=false}});
$('#role-list').addEventListener('click',async event=>{const button=event.target.closest('[data-assign-role]');if(!button)return;const select=document.querySelector(`[data-role-user="${button.dataset.assignRole}"]`);if(!select.value)return;try{await api(`/api/admin/users/${select.value}/roles`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({role_ids:[Number(button.dataset.assignRole)]})});await loadDashboard()}catch(error){alert(error.message)}});
$('#authoring-form').addEventListener('submit',async event=>{event.preventDefault();try{const result=await api('/api/admin/authoring/assist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({topic:$('#authoring-topic').value,audience:$('#authoring-audience').value,objective:$('#authoring-objective').value})});$('#authoring-output').value=result.brief;$('#authoring-message').textContent=result.notice}catch(error){$('#authoring-message').textContent=error.message}});

loadDashboard().catch(error=>{document.body.insertAdjacentHTML('beforeend',`<p class="admin-fatal">${escapeHtml(error.message)}</p>`)});
