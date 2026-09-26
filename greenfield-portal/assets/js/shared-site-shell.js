(() => {
  if(window.__architectingSharedShellReady)return;
  window.__architectingSharedShellReady=true;
  if(!document.querySelector('link[href^="/assets/css/shared-site-shell.css"]')){
    const link=document.createElement("link");
    link.rel="stylesheet";
    link.href="/assets/css/shared-site-shell.css?v=20260914-1";
    document.head.append(link);
  }
  const ensureSharedSiteShell=()=>{
    if(document.body.classList.contains("admin-page"))return;
    const body=document.body;
    const main=body.querySelector(":scope > main");
    if(!main)return;
    const headers=[...body.querySelectorAll(":scope > header")];
    const preferredHeader=headers.find(header=>header.id==="methodology-header")||headers[0];
    headers.forEach(header=>{if(header!==preferredHeader)header.remove()});
    const footers=[...body.querySelectorAll(":scope > footer")];
    const preferredFooter=footers.find(footer=>footer.id==="methodology-footer")||footers[0]||document.createElement("footer");
    footers.forEach(footer=>{if(footer!==preferredFooter)footer.remove()});
    if(!preferredFooter.isConnected)body.append(preferredFooter);
    body.classList.add("application-shell");
    body.dataset.sharedShell="true";
    preferredHeader?.setAttribute("data-shell-region","header");
    main.setAttribute("data-shell-region","main");
    preferredFooter.setAttribute("data-shell-region","footer");
    preferredHeader?.querySelector(".methodology-utility,.utility-bar")?.setAttribute("data-shell-region","topbar");
    preferredHeader?.querySelector(".methodology-header-main,.header-container")?.setAttribute("data-shell-region","primary-header");
    return {body,header:preferredHeader,main,footer:preferredFooter};
  };
  const renderSharedSiteFooter=()=>{
    const shell=ensureSharedSiteShell();
    if(!shell)return;
    const footer=shell.footer;
    footer.classList.add("shared-enterprise-footer");
    footer.setAttribute("aria-label","Architecting Intelligence site footer");
    footer.innerHTML=`
      <div class="shared-footer-inner">
        <div class="shared-footer-identity">
          <img src="/assets/images/ratheesh-technology-logo-transparent.png?v=20260925-1" alt="Ratheesh Technology Ltd." width="1906" height="825">
          <strong>Architecting Intelligence</strong>
        </div>
        <p>&copy; 2026 Ratheesh Technology Ltd.</p><nav aria-label="Footer"><a href="/pages/about.html">About</a><a href="/transformation/">Roadmap</a><a href="/pages/contact.html">Contact</a></nav>
      </div>`;
  };
  window.ensureSharedSiteShell=ensureSharedSiteShell;
  window.renderSharedSiteFooter=renderSharedSiteFooter;
  renderSharedSiteFooter();
  document.addEventListener("DOMContentLoaded",renderSharedSiteFooter);
})();
