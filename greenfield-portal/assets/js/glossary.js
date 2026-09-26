const glossarySearch=document.querySelector('#glossary-search');
const glossaryEntries=[...document.querySelectorAll('.glossary-entry')];
const glossaryStatus=document.querySelector('#glossary-status');
const filterGlossary=()=>{
  const query=glossarySearch.value.trim().toLocaleLowerCase();
  let visible=0;
  glossaryEntries.forEach(entry=>{
    const match=!query||entry.textContent.toLocaleLowerCase().includes(query);
    entry.hidden=!match;
    if(match)visible+=1;
  });
  document.querySelectorAll('.glossary-group').forEach(group=>{
    group.hidden=![...group.querySelectorAll('.glossary-entry')].some(entry=>!entry.hidden);
  });
  glossaryStatus.textContent=`Showing ${visible} of ${glossaryEntries.length} terms`;
};
glossarySearch?.addEventListener('input',filterGlossary);
filterGlossary();
