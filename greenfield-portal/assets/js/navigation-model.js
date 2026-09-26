const isSafeHref=value=>typeof value==="string"&&(value.startsWith("/")||/^https:\/\//i.test(value));

export function normalizePublicNavigation(value){
  if(!Array.isArray(value))return[];
  return value.filter(item=>item&&item.visibility!=="hidden"&&item.label&&isSafeHref(item.href)).map(item=>({
    label:String(item.label),href:String(item.href),
    submenu:(Array.isArray(item.children)?item.children:[])
      .filter(child=>child&&child.visibility!=="hidden"&&child.label&&isSafeHref(child.href))
      .sort((a,b)=>(Number(a.position)||0)-(Number(b.position)||0))
      .map(child=>[String(child.label),String(child.href),String(child.group||"")]),
    position:Number(item.position)||0,
  })).sort((a,b)=>a.position-b.position);
}

export async function loadNavigation(fallbackNavigation){
  try{
    const response=await fetch("/api/navigation",{headers:{Accept:"application/json"},cache:"no-store"});
    if(!response.ok)throw new Error(`Navigation API returned ${response.status}.`);
    const body=await response.json();
    const normalized=normalizePublicNavigation(body.navigation);
    if(!normalized.length)throw new Error("Navigation API returned no usable items.");
    return normalized;
  }catch(error){
    console.warn("Using methodology navigation fallback.",error);
    return Array.isArray(fallbackNavigation)?fallbackNavigation:[];
  }
}
