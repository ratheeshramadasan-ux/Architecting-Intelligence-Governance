document.addEventListener("DOMContentLoaded",async()=>{
  const form=document.querySelector("#mobilise-search-form"),input=document.querySelector("#mobilise-search-query"),status=document.querySelector("#mobilise-search-status"),results=document.querySelector("#mobilise-search-results");
  let records=[];
  try{records=(await (await fetch("/assets/data/mobilise-search-index.json")).json()).records}catch{status.textContent="The Mobilise index is unavailable.";return}
  const render=query=>{
    const terms=query.toLowerCase().split(/[^a-z0-9]+/).filter(term=>term.length>1);
    if(!terms.length){status.textContent=`${records.length} Mobilise records are indexed.`;results.innerHTML="";return}
    const matches=records.map(record=>{
      const text=`${record.title} ${record.summary} ${record.keywords}`.toLowerCase();
      return {record,score:terms.reduce((score,term)=>score+(record.title.toLowerCase().includes(term)?5:0)+(text.includes(term)?1:0),0)};
    }).filter(item=>item.score>0).sort((a,b)=>b.score-a.score||a.record.title.localeCompare(b.record.title));
    status.textContent=matches.length?`${matches.length} grounded Mobilise result${matches.length===1?"":"s"}.`:"No Mobilise guidance matches this query.";
    results.innerHTML=matches.map(({record})=>`<a href="${record.href}"><span>${record.type}</span><strong>${record.title}</strong><p>${record.summary}</p><em>Open guidance →</em></a>`).join("");
  };
  form.addEventListener("submit",event=>{event.preventDefault();render(input.value.trim());history.replaceState(null,"",`?q=${encodeURIComponent(input.value.trim())}`)});
  const initial=new URLSearchParams(location.search).get("q");if(initial){input.value=initial;render(initial)}else render("");
});
