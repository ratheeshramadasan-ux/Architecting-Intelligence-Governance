const knowledgeForm=document.querySelector('#knowledge-search-form');
const knowledgeQuery=document.querySelector('#knowledge-query');
const knowledgeAudience=document.querySelector('#knowledge-audience');
const knowledgeStatus=document.querySelector('#knowledge-status');
const knowledgeResults=document.querySelector('#knowledge-results');
const categoryContainer=document.querySelector('#knowledge-categories');
const knowledgeEscape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

let taxonomyData = null;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/assets/data/knowledge-taxonomy.json');
    if (res.ok) {
      taxonomyData = await res.json();
      renderTaxonomyCategories(taxonomyData);
    }
  } catch (e) {
    /* Safe fallback if taxonomy JSON is unavailable */
  }

  const initial = new URLSearchParams(location.search);
  const q = initial.get('q');
  const cat = initial.get('cat');
  if (q) {
    if (knowledgeQuery) knowledgeQuery.value = q;
    if (knowledgeAudience && ['executive','practitioner','technical'].includes(initial.get('audience'))) {
      knowledgeAudience.value = initial.get('audience');
    }
    performClientSearch(q);
  } else if (cat && taxonomyData) {
    renderCategoryArticles(cat);
  }
});

function renderTaxonomyCategories(data) {
  if (!categoryContainer) return;
  const categories = data.categories || [];
  const articles = data.articles || [];

  categoryContainer.innerHTML = categories.map(cat => {
    const catArticles = articles.filter(a => a.primaryCategory === cat.id || (a.secondaryCategories && a.secondaryCategories.includes(cat.id)));
    if (!catArticles.length) return ''; // Hide empty metadata groups per Pass 4 requirement
    return `<div class="knowledge-category-card" style="background:var(--surface2,#f8fafc); padding:1.25rem; border-radius:8px; border:1px solid var(--rule,#e2e8f0); margin-bottom:1rem;">
      <h3 style="margin-top:0;">${knowledgeEscape(cat.title)}</h3>
      <p style="font-size:0.85rem; color:var(--ink2,#475569);">${knowledgeEscape(cat.summary)}</p>
      <ul style="margin:0.5rem 0 0 1.25rem; padding:0; font-size:0.9rem;">
        ${catArticles.map(art => `<li><a href="${knowledgeEscape(art.href)}">${knowledgeEscape(art.title)}</a> <span style="font-size:0.75rem; color:var(--ink3,#64748b);">[${knowledgeEscape(art.contentType)}]</span></li>`).join('')}
      </ul>
    </div>`;
  }).join('');
}

function renderCategoryArticles(catId) {
  if (!taxonomyData) return;
  const cat = taxonomyData.categories.find(c => c.id === catId);
  const articles = taxonomyData.articles.filter(a => a.primaryCategory === catId || (a.secondaryCategories && a.secondaryCategories.includes(catId)));
  if (!knowledgeResults) return;
  
  knowledgeStatus.textContent = cat ? `Category: ${cat.title} (${articles.length} articles)` : `Category Filter (${articles.length} articles)`;
  knowledgeResults.innerHTML = articles.map(art => `
    <article class="knowledge-result">
      <div class="knowledge-result-heading">
        <div><span>${knowledgeEscape(art.contentType)} · ${knowledgeEscape(art.complexity)}</span><h2>${knowledgeEscape(art.title)}</h2></div>
        <small>Audience: ${knowledgeEscape((art.audience||[]).join(', '))}</small>
      </div>
      <p class="knowledge-answer">${knowledgeEscape(art.summary)}</p>
      ${art.transformationStages&&art.transformationStages.length?`<p style="font-size:0.8rem; color:var(--ink3,#64748b);">Transformation Stages: ${art.transformationStages.map(s => `Stage ${s}`).join(', ')}</p>`:''}
      <div class="knowledge-result-links">
        <a href="${knowledgeEscape(art.href)}">Open article →</a>
      </div>
    </article>
  `).join('');
}

knowledgeForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const query = knowledgeQuery.value.trim();
  if (query.length < 2) return;
  knowledgeForm.classList.add('is-loading');
  knowledgeStatus.textContent = 'Searching published knowledge…';
  knowledgeResults.replaceChildren();
  performClientSearch(query);
  knowledgeForm.classList.remove('is-loading');
});

async function performClientSearch(query) {
  try {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    let results = [];
    if (taxonomyData) {
      results = taxonomyData.articles.filter(art => {
        const text = (art.title + ' ' + art.summary + ' ' + (art.keywords||[]).join(' ')).toLowerCase();
        return terms.some(t => text.includes(t));
      });
    }
    if (!results.length) {
      const index = await fetch('/assets/data/platform-search-index.json').then(r => r.json());
      results = index.records.filter(item => {
        const text = JSON.stringify(item).toLowerCase();
        return terms.some(t => text.includes(t));
      }).slice(0, 12);
    }

    knowledgeStatus.textContent = `${results.length} published platform result${results.length === 1 ? '' : 's'}.`;
    knowledgeResults.innerHTML = results.map(item => `
      <article class="knowledge-result">
        <div class="knowledge-result-heading">
          <div><span>${knowledgeEscape(item.contentType || item.type || 'Article')}</span><h2>${knowledgeEscape(item.title)}</h2></div>
          <small>${knowledgeEscape(item.stage || item.capability || 'Platform Guidance')}</small>
        </div>
        <p class="knowledge-answer">${knowledgeEscape(item.summary)}</p>
        <div class="knowledge-result-links">
          <a href="${knowledgeEscape(item.href)}">Open guidance →</a>
        </div>
      </article>
    `).join('') || '<div class="knowledge-empty"><h2>Evidence is not available yet</h2><p>Try a broader topic, capability, role or stage.</p></div>';
  } catch (error) {
    knowledgeStatus.textContent = 'Search is temporarily unavailable.';
  }
}
