export default {
  async fetch(request, env) {
    const response=await env.ASSETS.fetch(request);
    const headers=new Headers(response.headers);
    headers.set("Cache-Control","no-store, no-cache, must-revalidate");
    headers.set("Pragma","no-cache");
    headers.set("Expires","0");
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  }
};
