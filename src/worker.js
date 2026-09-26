import sanitizeHtml from "sanitize-html";

const SESSION_COOKIE = "portal_session";
const STATIC_CONTENT_PAGES = [
  { path: "/", source_path: "/index.html", title: "Home" },
  { path: "/pages/about.html", title: "About" },
  { path: "/pages/agentic-ai.html", title: "Agentic AI Governance Framework" },
  { path: "/pages/ai-adoption.html", title: "AI Adoption and Enterprise Tool Migration" },
  { path: "/pages/ai-architecture.html", title: "AI Architecture and Runtime Implementation" },
  { path: "/pages/ai-automation-spectrum.html", title: "Enterprise AI Automation Spectrum" },
  { path: "/pages/ai-governance.html", title: "Governance, Compliance and Oversight" },
  { path: "/pages/ai-infrastructure-architecture.html", title: "AI Infrastructure Architecture" },
  { path: "/pages/ai-rpa-prioritization.html", title: "AI and RPA Opportunity Prioritization" },
  { path: "/pages/architecture.html", title: "Enterprise Architecture" },
  { path: "/pages/assurance.html", title: "Enterprise AI Assurance" },
  { path: "/pages/automation.html", title: "Automation Framework" },
  { path: "/pages/contact.html", title: "Contact" },
  { path: "/pages/data-security.html", title: "Data Security and Privacy" },
  { path: "/pages/document-processing.html", title: "Intelligent Document Processing" },
  { path: "/pages/executive-career-portfolio.html", title: "Executive Career Portfolio" },
  { path: "/pages/governance-integration.html", title: "Governance Integration Model" },
  { path: "/pages/greenfield-implementation.html", title: "Greenfield AI Governance Blueprint" },
  { path: "/pages/knowledge-discovery.html", title: "Knowledge Discovery" },
  { path: "/pages/operational-risk.html", title: "Operational and Behavioural Risk" },
  { path: "/pages/resources.html", title: "Resources and Downloads" },
  { path: "/pages/ai-technology-glossary.html", title: "AI and Technology Glossary" },
  { path: "/pages/security-review.html", title: "Security and Architecture Review" },
  { path: "/pages/solutions.html", title: "Solutions" },
  { path: "/pages/vendor-assurance.html", title: "Vendor, Infrastructure and Lifecycle" },
  { path: "/case-studies/index.html", title: "Enterprise AI Case Studies" },
];
const DEFAULT_CONFIG = {
  registration_enabled: true,
  public_paths: [
    "/",
    "/index.html",
    "/pages/about.html",
    "/pages/contact.html",
    "/pages/executive-career-portfolio.html",
    "/pages/executive-career-portfolio",
    "/case-studies/",
    "/case-studies/index.html",
  ],
  preview_words: 55,
  copy_deterrence_enabled: true,
};
const APPROVED_THEME = {
  global: {
    primary: "#202224", accent: "#b18a45", background: "#f4f0e7", surface: "#fffdf8",
    text: "#252729", muted: "#676762", border: "#d8d0c1", navigation_background: "#e8e4dc",
    heading_font: "Georgia", body_font: "Arial", base_font_size: "16px", heading_scale: "standard",
    spacing_density: "compact", border_radius: "8px", shadow_intensity: "medium",
  },
  panels: {
    hero: { preset: "Image", background: "#202224", text: "#fffdf8", heading: "#fffdf8", accent: "#b18a45", background_image: "/assets/images/home-consulting-banner.png", overlay: 70, mode: "dark", density: "compact", heading_size: "emphasis", border: false, card_treatment: "surface", content_width: "standard" },
    journey: { preset: "Light", background: "#f4f0e7", text: "#252729", heading: "#202224", accent: "#b18a45", background_image: "", overlay: 0, mode: "light", density: "compact", heading_size: "standard", border: true, card_treatment: "surface", content_width: "standard" },
    explorer: { preset: "Dark", background: "#202224", text: "#fffdf8", heading: "#fffdf8", accent: "#b18a45", background_image: "", overlay: 0, mode: "dark", density: "compact", heading_size: "standard", border: false, card_treatment: "surface", content_width: "standard" },
    call_to_action: { preset: "Neutral", background: "#e8e4dc", text: "#252729", heading: "#202224", accent: "#b18a45", background_image: "", overlay: 0, mode: "light", density: "compact", heading_size: "standard", border: true, card_treatment: "flat", content_width: "standard" },
  },
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    try {
      if (url.pathname.startsWith("/api/")) return await handleApi(request, env, url);
      if (url.pathname === "/login.html") return redirectWithQuery(url, "/login");
      if (url.pathname === "/register.html") return redirectWithQuery(url, "/register");
      if (url.pathname === "/login" || url.pathname === "/register") return env.ASSETS.fetch(request);
      if (url.pathname.startsWith("/admin-library-downloads/")) return serveAdminLibraryDownload(request, env, url);
      if (url.pathname.startsWith("/admin")) return serveAdmin(request, env, url);
      if (url.pathname.startsWith("/downloads/")) return serveResourceDownload(request, env, url);
      if (url.pathname.startsWith("/library-downloads/")) return serveLibraryDownload(request, env, url);
      if (url.pathname.startsWith("/showcase-media/")) return serveShowcaseMedia(request, env, url);
      if (url.pathname.startsWith("/leadership-media/")) return serveLeadershipMedia(request, env, url);
      if (url.pathname === "/about/leadership" || url.pathname === "/about/leadership/") return serveLeadershipDirectory(request, env, url);
      if (url.pathname.startsWith("/about/leadership/")) return servePersonProfile(request, env, url);
      if (url.pathname.startsWith("/people/")) {
        const slug=url.pathname.slice("/people/".length).replace(/\/$/,"");
        return Response.redirect(new URL(`/about/leadership/${encodeURIComponent(slug)}`,url),301);
      }

      const user = await currentUser(request, env);
      const pageAccess = await getPageAccess(env, url.pathname);
      if (pageAccess?.visibility === "hidden" && user?.role !== "admin") return new Response("Page not found.", { status: 404 });
      const config = await getConfig(env);
      const response = await serveManagedPage(request, env, url) || await env.ASSETS.fetch(request);
      if (!response.ok || !isHtml(response)) return response;

      ctx.waitUntil(logAccess(request, env, url.pathname, user));
      if (pageAccess) {
        if (user || !Number(pageAccess.requires_sign_in)) return addPortalHeaders(response);
        return gatedResponse(response, url.pathname, config.preview_words);
      }
      if (user || isPublicPath(url.pathname, config.public_paths)) return addPortalHeaders(response);
      return gatedResponse(response, url.pathname, config.preview_words);
    } catch (error) {
      console.error(JSON.stringify({ event: "request_error", message: error instanceof Error ? error.message : String(error) }));
      if (url.pathname.startsWith("/api/")) return json({ error: "The portal could not complete this request. Please try again." }, 500);
      return new Response("The portal is temporarily unavailable.", { status: 500 });
    }
  },
};

async function handleApi(request, env, url) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  const path = url.pathname;
  if (path === "/api/public-config" && request.method === "GET") {
    const config = await getConfig(env);
    return json({ copyDeterrenceEnabled: config.copy_deterrence_enabled });
  }
  if (path === "/api/theme" && request.method === "GET") {
    const preview = url.searchParams.get("preview") === "1";
    let record = null;
    if (preview) {
      const user = await requirePermission(request, env, "theme.manage");
      if (user instanceof Response) return user;
      record = await env.DB.prepare("SELECT * FROM theme_versions WHERE status='draft' ORDER BY version_number DESC LIMIT 1").first();
    }
    if (!record) record = await env.DB.prepare("SELECT * FROM theme_versions WHERE status='published' ORDER BY version_number DESC LIMIT 1").first();
    const config = record ? validateTheme(parseJsonObject(record.config_json)) : APPROVED_THEME;
    return json({ version: record?.version_number || 0, status: preview ? "preview" : (record?.status || "baseline"), config, css_variables: themeCssVariables(config) });
  }
  if (path === "/api/navigation" && request.method === "GET") {
    const navigationUser = await currentUser(request,env);
    const [publication, homeAccess, contactAccess] = await Promise.all([
      getPublishedNavigation(env,{ user:navigationUser, includeShowcase:true }),
      getPageAccess(env, "/"),
      getPageAccess(env, "/pages/contact.html"),
    ]);
    return json({
      schemaVersion: publication.schemaVersion,
      publicationVersion: publication.version,
      source: publication.source,
      navigation: publication.navigation,
      items: flattenNavigation(publication.navigation),
      fixedVisibility: {
        home: homeAccess?.visibility !== "hidden",
        contact: contactAccess?.visibility !== "hidden",
      },
    });
  }
  if (path === "/api/resources" && request.method === "GET") {
    const rows = await env.DB.prepare("SELECT id,title,description,category,file_name,content_type,size_bytes FROM resources WHERE status='published' ORDER BY position,title").all();
    return json({ resources: rows.results });
  }
  if (path === "/api/case-studies" && request.method === "GET") {
    const user = await currentUser(request, env);
    const collection = await getPublicShowcase(env,user,{ type:"case_study", previewId:url.searchParams.get("preview") });
    return json({ case_studies:collection.items, fallback:false });
  }
  if (path === "/api/showcase" && request.method === "GET") {
    const user = await currentUser(request,env);
    const collection = await getPublicShowcase(env,user,{ previewId:url.searchParams.get("preview") });
    return json({ case_studies:collection.items.filter(item=>item.content_type==="case_study"), demos:collection.items.filter(item=>item.content_type==="demo"), preview:collection.preview });
  }
  if (path === "/api/people" && request.method === "GET") {
    const rows=await env.DB.prepare(`SELECT p.*,pm.id photo_media_id,pm.alt_text photo_alt_text
      FROM people_profiles p LEFT JOIN person_media pm ON pm.person_id=p.id AND pm.media_type='profile_photo'
      WHERE p.status='published' AND p.is_active=1 AND p.public_visibility=1 AND p.show_on_leadership=1 ORDER BY p.display_order,p.id`).all();
    return json({ people:rows.results.map(serializePersonPublic) });
  }
  if (path === "/api/knowledge/search" && request.method === "GET") {
    return searchKnowledge(env, url);
  }
  if (path.startsWith("/api/knowledge/objects/") && request.method === "GET") {
    return getKnowledgeObject(env, decodeURIComponent(path.slice("/api/knowledge/objects/".length)));
  }
  if (path === "/api/knowledge/feedback" && request.method === "POST") {
    assertSameOrigin(request);
    return saveKnowledgeFeedback(request, env);
  }
  if (path === "/api/auth/providers" && request.method === "GET") {
    return json({ google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) });
  }
  if (path === "/api/auth/google" && request.method === "GET") {
    return startGoogleAuth(request, env, url);
  }
  if (path === "/api/auth/google/callback" && request.method === "GET") {
    return finishGoogleAuth(request, env, url);
  }
  if (path === "/api/auth/me" && request.method === "GET") {
    const user = await currentUser(request, env);
    return json({ user: user ? publicUser(user) : null });
  }
  if (path === "/api/auth/register" && request.method === "POST") {
    assertSameOrigin(request);
    const config = await getConfig(env);
    if (!config.registration_enabled) return json({ error: "Registration is currently closed." }, 403);
    const body = await readJson(request);
    const name = String(body.name || "").trim().slice(0, 100);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    if (name.length < 2 || !validEmail(email) || password.length < 10) return json({ error: "Use your name, a valid email, and a password of at least 10 characters." }, 400);
    const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (existing) return json({ error: "An account already exists for this email." }, 409);
    const salt = randomToken(16);
    const passwordHash = await hashPassword(password, salt);
    const role = isAdminEmail(email, env) ? "admin" : "member";
    const result = await env.DB.prepare("INSERT INTO users (name,email,password_hash,password_salt,role) VALUES (?,?,?,?,?)")
      .bind(name, email, passwordHash, salt, role).run();
    return createSessionResponse(env, Number(result.meta.last_row_id), { name, email, role });
  }
  if (path === "/api/auth/login" && request.method === "POST") {
    assertSameOrigin(request);
    const body = await readJson(request);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
    if (!user) {
      const count = await env.DB.prepare("SELECT COUNT(*) AS total FROM users").first();
      if (Number(count?.total) === 0) return json({ error: "No local portal account exists yet. Use Create a free account once, then sign in with that local account." }, 401);
      return json({ error: "Email or password is incorrect." }, 401);
    }
    if (user.status !== "active" || !(await constantTimeEqual(user.password_hash, await hashPassword(password, user.password_salt)))) {
      return json({ error: "Email or password is incorrect." }, 401);
    }
    await env.DB.prepare("UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?").bind(user.id).run();
    return createSessionResponse(env, user.id, user);
  }
  if (path === "/api/auth/logout" && request.method === "POST") {
    assertSameOrigin(request);
    const token = cookieValue(request, SESSION_COOKIE);
    if (token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(token)).run();
    return json({ ok: true }, 200, { "Set-Cookie": expiredSessionCookie() });
  }
  if (path === "/api/auth/profile" && request.method === "PUT") {
    assertSameOrigin(request);
    const user = await currentUser(request, env);
    if (!user) return json({ error: "Sign in required." }, 401);
    const body = await readJson(request);
    const name = String(body.name || "").trim().slice(0,100);
    if (name.length < 2) return json({ error: "Enter your full name." }, 400);
    await env.DB.prepare("UPDATE users SET name=? WHERE id=?").bind(name,user.id).run();
    return json({ user: { ...publicUser(user), name } });
  }
  if (path === "/api/auth/password" && request.method === "PUT") {
    assertSameOrigin(request);
    const user = await currentUser(request, env);
    if (!user) return json({ error: "Sign in required." }, 401);
    const body = await readJson(request);
    const record = await env.DB.prepare("SELECT password_hash,password_salt,auth_provider FROM users WHERE id=?").bind(user.id).first();
    const currentPassword = String(body.current_password || "");
    const nextPassword = String(body.new_password || "");
    if (nextPassword.length < 10) return json({ error: "The new password must contain at least 10 characters." }, 400);
    if (record.auth_provider !== "google" && !(await constantTimeEqual(record.password_hash, await hashPassword(currentPassword, record.password_salt)))) {
      return json({ error: "Current password is incorrect." }, 403);
    }
    const salt = randomToken(16);
    await env.DB.prepare("UPDATE users SET password_hash=?,password_salt=?,auth_provider=CASE WHEN auth_provider='google' THEN 'password+google' ELSE auth_provider END WHERE id=?")
      .bind(await hashPassword(nextPassword,salt),salt,user.id).run();
    await env.DB.prepare("DELETE FROM sessions WHERE user_id=?").bind(user.id).run();
    return json({ ok: true }, 200, { "Set-Cookie": expiredSessionCookie() });
  }
  if (path === "/api/auth/password-reset" && request.method === "POST") {
    assertSameOrigin(request);
    const body = await readJson(request);
    const token = String(body.token || "");
    const password = String(body.password || "");
    if (password.length < 10) return json({ error: "The new password must contain at least 10 characters." }, 400);
    const reset = await env.DB.prepare(`SELECT * FROM password_reset_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at>CURRENT_TIMESTAMP`)
      .bind(await sha256(token)).first();
    if (!reset) return json({ error: "This reset link is invalid or expired." }, 400);
    const salt = randomToken(16);
    await env.DB.batch([
      env.DB.prepare("UPDATE users SET password_hash=?,password_salt=?,auth_provider=CASE WHEN auth_provider='google' THEN 'password+google' ELSE auth_provider END WHERE id=?").bind(await hashPassword(password,salt),salt,reset.user_id),
      env.DB.prepare("UPDATE password_reset_tokens SET used_at=CURRENT_TIMESTAMP WHERE id=?").bind(reset.id),
      env.DB.prepare("DELETE FROM sessions WHERE user_id=?").bind(reset.user_id),
    ]);
    return json({ ok: true });
  }

  const permission = adminPermissionFor(path, request.method);
  const admin = await requirePermission(request, env, permission);
  if (admin instanceof Response) return admin;
  if (path === "/api/admin/dashboard" && request.method === "GET") {
    const [users, events, summary, config] = await Promise.all([
      env.DB.prepare("SELECT id,name,email,role,status,created_at,last_login_at FROM users ORDER BY created_at DESC LIMIT 250").all(),
      env.DB.prepare(`SELECT e.id,e.path,e.country,e.city,e.user_agent,e.occurred_at,u.name,u.email
        FROM access_events e LEFT JOIN users u ON u.id=e.user_id ORDER BY e.occurred_at DESC LIMIT 500`).all(),
      env.DB.prepare(`SELECT COUNT(*) total_views, COUNT(DISTINCT COALESCE(CAST(user_id AS TEXT),ip_hash)) unique_visitors,
        COUNT(DISTINCT user_id) registered_visitors FROM access_events WHERE occurred_at >= datetime('now','-30 days')`).first(),
      getConfig(env),
    ]);
    return json({ admin: publicUser(admin), users: users.results, events: events.results, summary, config });
  }
  if (path === "/api/admin/parity" && request.method === "GET") {
    const [pages, workflows, roles, assignments, assets, jobs, pageAnalytics, knowledgeCount] = await Promise.all([
      env.DB.prepare(`SELECT p.id,p.title,p.slug,p.source_path,p.status,p.updated_at,
        COALESCE(s.workflow_state,p.status) workflow_state,s.seo_title,s.seo_description,s.canonical_url,
        s.hero_json,s.related_pages_json,s.scheduled_publish_at,s.published_at,s.archived_at
        FROM content_pages p LEFT JOIN content_page_settings s ON s.page_id=p.id ORDER BY p.updated_at DESC`).all(),
      env.DB.prepare(`SELECT w.*,p.title FROM content_workflow_events w JOIN content_pages p ON p.id=w.page_id
        ORDER BY w.occurred_at DESC LIMIT 250`).all(),
      env.DB.prepare("SELECT * FROM access_roles ORDER BY system_role DESC,name").all(),
      env.DB.prepare("SELECT ur.user_id,ur.role_id,r.key,r.name FROM user_access_roles ur JOIN access_roles r ON r.id=ur.role_id").all(),
      env.DB.prepare("SELECT * FROM library_assets ORDER BY updated_at DESC LIMIT 500").all(),
      env.DB.prepare("SELECT * FROM search_index_jobs ORDER BY requested_at DESC LIMIT 30").all(),
      env.DB.prepare("SELECT path,COUNT(*) views FROM access_events WHERE occurred_at>=datetime('now','-30 days') GROUP BY path ORDER BY views DESC LIMIT 100").all(),
      env.DB.prepare("SELECT COUNT(*) total FROM knowledge_objects WHERE status='published'").first(),
    ]);
    return json({
      pages: pages.results, workflows: workflows.results, roles: roles.results,
      assignments: assignments.results, assets: assets.results, index_jobs: jobs.results,
      page_analytics: pageAnalytics.results, indexed_knowledge: Number(knowledgeCount?.total || 0),
      auth: { password: true, google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET), session_days: 7 },
    });
  }
  if (path === "/api/admin/theme" && request.method === "GET") {
    const [draft, published, history] = await Promise.all([
      env.DB.prepare("SELECT * FROM theme_versions WHERE status='draft' ORDER BY version_number DESC LIMIT 1").first(),
      env.DB.prepare("SELECT * FROM theme_versions WHERE status='published' ORDER BY version_number DESC LIMIT 1").first(),
      env.DB.prepare(`SELECT t.id,t.version_number,t.status,t.change_note,t.baseline,t.created_at,t.published_at,
        creator.name created_by_name,publisher.name published_by_name
        FROM theme_versions t LEFT JOIN users creator ON creator.id=t.created_by
        LEFT JOIN users publisher ON publisher.id=t.published_by ORDER BY t.version_number DESC LIMIT 30`).all(),
    ]);
    const active = draft || published;
    const config = active ? validateTheme(parseJsonObject(active.config_json)) : APPROVED_THEME;
    return json({
      draft: draft ? { ...draft, config: validateTheme(parseJsonObject(draft.config_json)) } : null,
      published: published ? { ...published, config: validateTheme(parseJsonObject(published.config_json)) } : null,
      current: config, history: history.results, contrast: themeContrast(config),
      permissions: { manage: true, publish: true },
    });
  }
  if (path === "/api/admin/theme/draft" && request.method === "PUT") {
    assertSameOrigin(request);
    const body = await readJson(request);
    const config = validateTheme(body.config);
    const contrast = themeContrast(config);
    if (!contrast.every(result => result.pass)) return json({ error: "Theme colours do not meet required WCAG contrast.", contrast }, 400);
    const existing = await env.DB.prepare("SELECT id,version_number FROM theme_versions WHERE status='draft'").first();
    let id = existing?.id;
    if (existing) {
      await env.DB.prepare("UPDATE theme_versions SET config_json=?,change_note=?,created_by=?,created_at=CURRENT_TIMESTAMP WHERE id=?")
        .bind(JSON.stringify(config),String(body.change_note||"").trim().slice(0,500),admin.id,id).run();
    } else {
      const next = await nextThemeVersion(env);
      const result = await env.DB.prepare("INSERT INTO theme_versions(version_number,status,config_json,change_note,created_by) VALUES(?,'draft',?,?,?)")
        .bind(next,JSON.stringify(config),String(body.change_note||"").trim().slice(0,500),admin.id).run();
      id = Number(result.meta.last_row_id);
    }
    await auditAdmin(env,admin.id,"theme.draft_saved","theme",id,{ contrast });
    return json({ ok:true,id,config,contrast });
  }
  if (path === "/api/admin/theme/publish" && request.method === "POST") {
    assertSameOrigin(request);
    const draft = await env.DB.prepare("SELECT * FROM theme_versions WHERE status='draft'").first();
    if (!draft) return json({ error:"Save a draft theme before publishing." },400);
    await env.DB.batch([
      env.DB.prepare("UPDATE theme_versions SET status='superseded' WHERE status='published'"),
      env.DB.prepare("UPDATE theme_versions SET status='published',published_by=?,published_at=CURRENT_TIMESTAMP WHERE id=?").bind(admin.id,draft.id),
    ]);
    await auditAdmin(env,admin.id,"theme.published","theme",draft.id,{ version_number:draft.version_number });
    return json({ ok:true,version:draft.version_number });
  }
  if (path === "/api/admin/theme/rollback" && request.method === "POST") {
    assertSameOrigin(request);
    const body = await readJson(request);
    const source = await env.DB.prepare("SELECT * FROM theme_versions WHERE id=? AND status IN ('published','superseded')").bind(Number(body.version_id)).first();
    if (!source) return json({ error:"Choose a valid published theme version." },404);
    const next = await nextThemeVersion(env);
    await env.DB.batch([
      env.DB.prepare("DELETE FROM theme_versions WHERE status='draft'"),
      env.DB.prepare("UPDATE theme_versions SET status='superseded' WHERE status='published'"),
      env.DB.prepare("INSERT INTO theme_versions(version_number,status,config_json,change_note,created_by,published_by,published_at) VALUES(?,'published',?,?,?,?,CURRENT_TIMESTAMP)")
        .bind(next,source.config_json,`Rollback to version ${source.version_number}`,admin.id,admin.id),
    ]);
    await auditAdmin(env,admin.id,"theme.rolled_back","theme",source.id,{ source_version:source.version_number,new_version:next });
    return json({ ok:true,version:next });
  }
  if (path === "/api/admin/theme/reset" && request.method === "POST") {
    assertSameOrigin(request);
    const next = await nextThemeVersion(env);
    await env.DB.prepare("DELETE FROM theme_versions WHERE status='draft'").run();
    const result = await env.DB.prepare("INSERT INTO theme_versions(version_number,status,config_json,change_note,baseline,created_by) VALUES(?,'draft',?,'Reset to approved baseline',1,?)")
      .bind(next,JSON.stringify(APPROVED_THEME),admin.id).run();
    await auditAdmin(env,admin.id,"theme.baseline_reset","theme",Number(result.meta.last_row_id),{ version_number:next });
    return json({ ok:true,version:next,config:APPROVED_THEME,contrast:themeContrast(APPROVED_THEME) });
  }
  if (path === "/api/admin/config" && request.method === "PUT") {
    assertSameOrigin(request);
    const body = await readJson(request);
    const config = validateConfig(body);
    await env.DB.batch(Object.entries(config).map(([key, value]) =>
      env.DB.prepare("INSERT INTO portal_config(key,value,updated_at) VALUES(?,?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP")
        .bind(key, JSON.stringify(value))));
    return json({ config });
  }
  if (path.startsWith("/api/admin/users/") && request.method === "PATCH") {
    assertSameOrigin(request);
    const id = Number(path.split("/").pop());
    const body = await readJson(request);
    const status = body.status === "disabled" ? "disabled" : "active";
    if (!Number.isInteger(id) || id === admin.id) return json({ error: "You cannot change your own account here." }, 400);
    await env.DB.prepare("UPDATE users SET status=? WHERE id=?").bind(status, id).run();
    if (status === "disabled") await env.DB.prepare("DELETE FROM sessions WHERE user_id=?").bind(id).run();
    return json({ ok: true });
  }
  if (path.match(/^\/api\/admin\/users\/\d+\/role$/) && request.method === "PUT") {
    assertSameOrigin(request);
    const userId = Number(path.split("/")[4]);
    const body = await readJson(request);
    const role = body.role === "admin" ? "admin" : "member";
    const target = await env.DB.prepare("SELECT id,email,role,status FROM users WHERE id=?").bind(userId).first();
    if (!target) return json({ error: "User not found." }, 404);
    if (userId === admin.id && role !== "admin") return json({ error: "You cannot remove your own administrator access." }, 400);
    if (target.role === "admin" && role === "member") {
      const count = await env.DB.prepare("SELECT COUNT(*) AS total FROM users WHERE role='admin' AND status='active'").first();
      if (Number(count?.total) <= 1) return json({ error: "At least one active administrator is required." }, 400);
    }
    await env.DB.batch([
      env.DB.prepare("UPDATE users SET role=? WHERE id=?").bind(role, userId),
      env.DB.prepare("DELETE FROM sessions WHERE user_id=?").bind(userId),
    ]);
    await auditAdmin(env, admin.id, role === "admin" ? "administrator.granted" : "administrator.revoked", "user", userId, { email: target.email });
    return json({ ok: true, role });
  }
  if (path.match(/^\/api\/admin\/users\/\d+\/roles$/) && request.method === "PUT") {
    assertSameOrigin(request);
    const userId = Number(path.split("/")[4]);
    const body = await readJson(request);
    const roleIds = [...new Set((Array.isArray(body.role_ids) ? body.role_ids : []).map(Number).filter(Number.isInteger))].slice(0, 20);
    const valid = roleIds.length ? await env.DB.prepare(`SELECT id FROM access_roles WHERE id IN (${roleIds.map(() => "?").join(",")})`).bind(...roleIds).all() : { results: [] };
    await env.DB.prepare("DELETE FROM user_access_roles WHERE user_id=?").bind(userId).run();
    if (valid.results.length) await env.DB.batch(valid.results.map(role => env.DB.prepare("INSERT INTO user_access_roles(user_id,role_id,assigned_by) VALUES(?,?,?)").bind(userId,role.id,admin.id)));
    await auditAdmin(env, admin.id, "roles.assigned", "user", userId, { role_ids: valid.results.map(role => role.id) });
    return json({ ok: true, role_ids: valid.results.map(role => role.id) });
  }
  if (path.match(/^\/api\/admin\/users\/\d+\/password-reset$/) && request.method === "POST") {
    assertSameOrigin(request);
    const userId = Number(path.split("/")[4]);
    const user = await env.DB.prepare("SELECT id,email FROM users WHERE id=?").bind(userId).first();
    if (!user) return json({ error: "User not found." }, 404);
    const token = randomToken(32);
    const expires = new Date(Date.now()+30*60*1000).toISOString();
    await env.DB.prepare("INSERT INTO password_reset_tokens(user_id,token_hash,expires_at,created_by) VALUES(?,?,?,?)")
      .bind(userId,await sha256(token),expires,admin.id).run();
    await auditAdmin(env, admin.id, "password_reset.created", "user", userId, {});
    return json({ reset_path: `/login?reset=${encodeURIComponent(token)}`, expires_at: expires });
  }
  if (path === "/api/admin/content" && request.method === "GET") {
    const [pages, templates, menu, resolvedMenu, resources, access] = await Promise.all([
      env.DB.prepare(`SELECT p.*,COALESCE(s.workflow_state,p.status) workflow_state,s.seo_title,s.seo_description,
        s.canonical_url,s.hero_json,s.related_pages_json,s.scheduled_publish_at
        FROM content_pages p LEFT JOIN content_page_settings s ON s.page_id=p.id ORDER BY p.updated_at DESC`).all(),
      env.DB.prepare("SELECT * FROM page_templates ORDER BY name").all(),
      getPublishedNavigation(env,{ includeShowcase:false }),
      getPublishedNavigation(env,{ user:admin,includeShowcase:true }),
      env.DB.prepare("SELECT * FROM resources ORDER BY position,title").all(),
      env.DB.prepare("SELECT * FROM page_access ORDER BY path").all(),
    ]);
    const pageCatalog = buildPageCatalog(pages.results, access.results);
    return json({
      pages: pages.results,
      page_catalog: pageCatalog,
      templates: templates.results,
      menu: flattenNavigation(menu.navigation),
      resolved_menu: flattenNavigation(resolvedMenu.navigation),
      navigation_version: menu.version,
      resources: resources.results,
    });
  }
  if (path === "/api/admin/page-access" && request.method === "PATCH") {
    assertSameOrigin(request);
    const input = await readJson(request);
    const pagePath = safeAccessPath(input.path);
    if (!pagePath) return json({ error: "Choose a valid portal page." }, 400);
    const known = STATIC_CONTENT_PAGES.find(page => page.path === pagePath);
    const managed = await env.DB.prepare("SELECT title FROM content_pages WHERE source_path=? OR '/pages/'||slug||'.html'=?")
      .bind(pagePath === "/" ? "/index.html" : pagePath, pagePath).first();
    if (!known && !managed) return json({ error: "Page was not found." }, 404);
    const title = String(input.title || managed?.title || known?.title || pagePath).trim().slice(0, 160);
    const visibility = input.visibility === "hidden" ? "hidden" : "visible";
    const requiresSignIn = input.requires_sign_in ? 1 : 0;
    await env.DB.prepare(`INSERT INTO page_access(path,title,visibility,requires_sign_in,updated_at)
      VALUES(?,?,?,?,CURRENT_TIMESTAMP)
      ON CONFLICT(path) DO UPDATE SET title=excluded.title,visibility=excluded.visibility,
        requires_sign_in=excluded.requires_sign_in,updated_at=CURRENT_TIMESTAMP`)
      .bind(pagePath, title, visibility, requiresSignIn).run();
    return json({ path: pagePath, title, visibility, requires_sign_in: requiresSignIn });
  }
  if (path === "/api/admin/menu" && request.method === "PUT") {
    assertSameOrigin(request);
    const body = await readJson(request);
    let items;
    try { items = validateMenu(body.items); }
    catch (error) { return json({ error:error instanceof Error ? error.message : "Navigation is invalid." },400); }
    const navigation = menuItemsToNavigation(items);
    const published = await publishNavigation(env, admin, navigation, String(body.change_note || "Admin navigation update"));
    return json({ ok: true, version: published.version, content_hash: published.contentHash, navigation });
  }
  if (path === "/api/admin/page-source" && request.method === "GET") {
    const requestedPath = safeEditableSourcePath(url.searchParams.get("path"));
    if (!requestedPath) return json({ error: "Choose a valid portal content page." }, 400);
    const sourcePath = requestedPath === "/" ? "/index.html" : requestedPath;
    const assetUrl = new URL(assetRoutePath(sourcePath), url);
    const response = await env.ASSETS.fetch(new Request(assetUrl, request));
    if (!response.ok) return json({ error: "Page was not found." }, 404);
    const html = await response.text();
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
    const title = sourcePath === "/index.html" ? "Home" : plainText(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || sourcePath.split("/").pop().replace(".html", ""));
    return json({ title, slug: sourcePath === "/index.html" ? "home" : sourcePath.split("/").pop().replace(/\.html$/i, ""), source_path: sourcePath, status: "published", body_html: main?.[1]?.trim() || "" });
  }
  if (path === "/api/admin/pages" && request.method === "POST") {
    assertSameOrigin(request);
    const page = validatePage(await readJson(request));
    if (page.workflow_state === "published") { const allowed=await requirePermission(request,env,"content.publish"); if (allowed instanceof Response) return allowed; }
    const result = await env.DB.prepare(`INSERT INTO content_pages(title,slug,source_path,template_id,status,summary,body_html,left_nav_json,style_json)
      VALUES(?,?,?,?,?,?,?,?,?)`).bind(page.title,page.slug,page.source_path,page.template_id,page.status,page.summary,page.body_html,JSON.stringify(page.left_nav),JSON.stringify(page.style)).run();
    const pageId = Number(result.meta.last_row_id);
    await savePageAdministration(env, pageId, page, admin.id, null);
    await ensurePageAccess(env, page);
    return json({ id: pageId, ...page }, 201);
  }
  if (path.match(/^\/api\/admin\/pages\/\d+$/) && request.method === "DELETE") {
    assertSameOrigin(request);
    const id = Number(path.split("/").pop());
    const page = await env.DB.prepare("SELECT id,title,status FROM content_pages WHERE id=?").bind(id).first();
    if (!page) return json({ error: "Page not found." }, 404);
    const previous = await env.DB.prepare("SELECT workflow_state FROM content_page_settings WHERE page_id=?").bind(id).first();
    const previousState = previous?.workflow_state || page.status || "draft";
    await env.DB.batch([
      env.DB.prepare("UPDATE content_pages SET status='draft',updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(id),
      env.DB.prepare(`INSERT INTO content_page_settings(page_id,workflow_state,archived_at,updated_by,updated_at)
        VALUES(?,'archived',CURRENT_TIMESTAMP,?,CURRENT_TIMESTAMP)
        ON CONFLICT(page_id) DO UPDATE SET workflow_state='archived',archived_at=CURRENT_TIMESTAMP,
          updated_by=excluded.updated_by,updated_at=CURRENT_TIMESTAMP`).bind(id,admin.id),
      env.DB.prepare("INSERT INTO content_workflow_events(page_id,from_state,to_state,note,actor_id) VALUES(?,?,'archived',?,?)")
        .bind(id,previousState,"Soft-deleted from page management; content and versions retained.",admin.id),
    ]);
    await auditAdmin(env, admin.id, "page.soft_deleted", "page", id, { previous_state: previousState });
    return json({ ok: true, retained: true, workflow_state: "archived" });
  }
  if (path.startsWith("/api/admin/pages/") && request.method === "PUT") {
    assertSameOrigin(request);
    const id = Number(path.split("/").pop());
    const page = validatePage(await readJson(request));
    if (page.workflow_state === "published") { const allowed=await requirePermission(request,env,"content.publish"); if (allowed instanceof Response) return allowed; }
    await env.DB.prepare(`UPDATE content_pages SET title=?,slug=?,source_path=?,template_id=?,status=?,summary=?,body_html=?,left_nav_json=?,style_json=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .bind(page.title,page.slug,page.source_path,page.template_id,page.status,page.summary,page.body_html,JSON.stringify(page.left_nav),JSON.stringify(page.style),id).run();
    const previous = await env.DB.prepare("SELECT workflow_state FROM content_page_settings WHERE page_id=?").bind(id).first();
    await savePageAdministration(env, id, page, admin.id, previous?.workflow_state || null);
    await ensurePageAccess(env, page);
    return json({ id, ...page });
  }
  if (path.match(/^\/api\/admin\/pages\/\d+\/workflow$/) && request.method === "PATCH") {
    assertSameOrigin(request);
    const pageId = Number(path.split("/")[4]);
    const body = await readJson(request);
    const state = validWorkflowState(body.state);
    const transitionPermission = state === "published" ? "content.publish" : state === "approved" ? "content.approve" : state === "in_review" ? "content.review" : "content.edit";
    const allowed=await requirePermission(request,env,transitionPermission);
    if (allowed instanceof Response) return allowed;
    const page = await env.DB.prepare("SELECT id,title FROM content_pages WHERE id=?").bind(pageId).first();
    if (!page) return json({ error: "Page not found." }, 404);
    const previous = await env.DB.prepare("SELECT workflow_state FROM content_page_settings WHERE page_id=?").bind(pageId).first();
    await env.DB.prepare(`INSERT INTO content_page_settings(page_id,workflow_state,updated_by,updated_at)
      VALUES(?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(page_id) DO UPDATE SET workflow_state=excluded.workflow_state,
      published_at=CASE WHEN excluded.workflow_state='published' THEN CURRENT_TIMESTAMP ELSE published_at END,
      archived_at=CASE WHEN excluded.workflow_state='archived' THEN CURRENT_TIMESTAMP ELSE NULL END,
      updated_by=excluded.updated_by,updated_at=CURRENT_TIMESTAMP`).bind(pageId,state,admin.id).run();
    await env.DB.prepare("INSERT INTO content_workflow_events(page_id,from_state,to_state,note,actor_id) VALUES(?,?,?,?,?)")
      .bind(pageId,previous?.workflow_state || "draft",state,String(body.note || "").trim().slice(0,500),admin.id).run();
    await env.DB.prepare("UPDATE content_pages SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?")
      .bind(state === "published" ? "published" : "draft",pageId).run();
    await auditAdmin(env, admin.id, `content.${state}`, "page", pageId, { title: page.title });
    return json({ ok: true, workflow_state: state });
  }
  if (path.match(/^\/api\/admin\/pages\/\d+\/versions$/) && request.method === "GET") {
    const pageId = Number(path.split("/")[4]);
    const versions = await env.DB.prepare(`SELECT v.id,v.page_id,v.version_number,v.title,v.summary,v.change_note,
      v.created_at,u.name created_by_name FROM content_versions v LEFT JOIN users u ON u.id=v.created_by
      WHERE v.page_id=? ORDER BY v.version_number DESC`).bind(pageId).all();
    return json({ versions: versions.results });
  }
  if (path.match(/^\/api\/admin\/versions\/\d+\/restore$/) && request.method === "POST") {
    assertSameOrigin(request);
    const versionId = Number(path.split("/")[4]);
    const version = await env.DB.prepare("SELECT * FROM content_versions WHERE id=?").bind(versionId).first();
    if (!version) return json({ error: "Version not found." }, 404);
    const metadata = parseJsonObject(version.metadata_json);
    await env.DB.prepare("UPDATE content_pages SET title=?,summary=?,body_html=?,status='draft',updated_at=CURRENT_TIMESTAMP WHERE id=?")
      .bind(version.title,version.summary,version.body_html,version.page_id).run();
    await env.DB.prepare(`INSERT INTO content_page_settings(page_id,workflow_state,seo_title,seo_description,canonical_url,hero_json,related_pages_json,updated_by,updated_at)
      VALUES(?,'draft',?,?,?,?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(page_id) DO UPDATE SET workflow_state='draft',
      seo_title=excluded.seo_title,seo_description=excluded.seo_description,canonical_url=excluded.canonical_url,
      hero_json=excluded.hero_json,related_pages_json=excluded.related_pages_json,updated_by=excluded.updated_by,updated_at=CURRENT_TIMESTAMP`)
      .bind(version.page_id,metadata.seo_title||"",metadata.seo_description||"",metadata.canonical_url||"",JSON.stringify(metadata.hero||{}),JSON.stringify(metadata.related_pages||[]),admin.id).run();
    await auditAdmin(env, admin.id, "version.restored", "page", version.page_id, { version_id: versionId });
    return json({ ok: true });
  }
  if (path === "/api/admin/templates" && request.method === "POST") {
    assertSameOrigin(request);
    const template = validateTemplate(await readJson(request));
    const result = await env.DB.prepare(`INSERT INTO page_templates(name,description,layout,font_body,font_heading,color_primary,color_accent,content_width)
      VALUES(?,?,?,?,?,?,?,?)`).bind(...Object.values(template)).run();
    return json({ id: Number(result.meta.last_row_id), ...template }, 201);
  }
  if (path.startsWith("/api/admin/templates/") && request.method === "PUT") {
    assertSameOrigin(request);
    const id = Number(path.split("/").pop());
    const template = validateTemplate(await readJson(request));
    await env.DB.prepare(`UPDATE page_templates SET name=?,description=?,layout=?,font_body=?,font_heading=?,color_primary=?,color_accent=?,content_width=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .bind(...Object.values(template),id).run();
    return json({ id, ...template });
  }
  if (path === "/api/admin/showcase" && request.method === "GET") {
    const rows=await env.DB.prepare(`SELECT s.*,a.file_name,a.object_key,a.content_type file_content_type,a.size_bytes,a.version_label,
      a.download_enabled,a.watermark_enabled,a.created_at file_uploaded_at
      FROM showcase_items s LEFT JOIN library_assets a ON a.id=s.asset_id ORDER BY s.content_type,s.display_order,s.id`).all();
    const media=await getShowcaseMedia(env,rows.results.map(item=>item.id),true);
    const items=await Promise.all(rows.results.map(async item=>{
      const r2=item.object_key?await env.RESOURCE_FILES.head(item.object_key):null;
      return {...serializeShowcaseItem(item,admin,{ admin:true,r2 }),media:media.get(item.id)||[]};
    }));
    return json({ items });
  }
  if (path === "/api/admin/showcase" && request.method === "POST") {
    assertSameOrigin(request);
    const input=validateShowcaseInput(await readJson(request));
    const slug=await uniqueShowcaseSlug(env,input.slug||slugify(input.title));
    const stableId=`admin-${input.content_type}-${crypto.randomUUID()}`;
    const result=await env.DB.prepare(`INSERT INTO showcase_items
      (stable_id,content_type,slug,title,description,category,cover_image_url,target_url,legacy_url,asset_id,
       tags_json,outcomes_json,related_links_json,featured,display_order,include_in_navigation,visibility,status,created_by,updated_by)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'draft',?,?)`).bind(stableId,input.content_type,slug,input.title,input.description,input.category,
      input.cover_image_url,input.target_url,input.legacy_url,input.asset_id,JSON.stringify(input.tags),JSON.stringify(input.outcomes),
      JSON.stringify(input.related_links),input.featured,input.display_order,input.include_in_navigation,input.visibility,admin.id,admin.id).run();
    const id=Number(result.meta.last_row_id);
    await auditAdmin(env,admin.id,"showcase.created","showcase",id,{ content_type:input.content_type,slug });
    return json({ id,stable_id:stableId,slug,status:"draft" },201);
  }
  if (path.match(/^\/api\/admin\/showcase\/\d+$/) && request.method === "PUT") {
    assertSameOrigin(request);
    const id=Number(path.split("/").pop());
    const existing=await env.DB.prepare("SELECT * FROM showcase_items WHERE id=?").bind(id).first();
    if(!existing)return json({ error:"Showcase item not found." },404);
    const input=validateShowcaseInput(await readJson(request),existing);
    await env.DB.prepare(`UPDATE showcase_items SET title=?,description=?,category=?,cover_image_url=?,target_url=?,legacy_url=?,
      tags_json=?,outcomes_json=?,related_links_json=?,featured=?,display_order=?,include_in_navigation=?,visibility=?,updated_by=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .bind(input.title,input.description,input.category,input.cover_image_url,input.target_url,input.legacy_url,JSON.stringify(input.tags),
        JSON.stringify(input.outcomes),JSON.stringify(input.related_links),input.featured,input.display_order,input.include_in_navigation,input.visibility,admin.id,id).run();
    await auditAdmin(env,admin.id,"showcase.updated","showcase",id,{ slug:existing.slug });
    return json({ ok:true,id,slug:existing.slug });
  }
  if (path.match(/^\/api\/admin\/showcase\/\d+\/status$/) && request.method === "PATCH") {
    assertSameOrigin(request);
    const id=Number(path.split("/")[4]);
    const body=await readJson(request);
    const status=["draft","published","archived"].includes(body.status)?body.status:"draft";
    if(status==="published") { const allowed=await requirePermission(request,env,"showcase.publish");if(allowed instanceof Response)return allowed; }
    const item=await env.DB.prepare("SELECT id,asset_id FROM showcase_items WHERE id=?").bind(id).first();
    if(!item)return json({ error:"Showcase item not found." },404);
    const statements=[env.DB.prepare(`UPDATE showcase_items SET status=?,published_at=CASE WHEN ?='published' THEN CURRENT_TIMESTAMP ELSE published_at END,
      updated_by=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(status,status,admin.id,id)];
    if(item.asset_id) statements.push(env.DB.prepare("UPDATE library_assets SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(status,item.asset_id));
    await env.DB.batch(statements);
    await auditAdmin(env,admin.id,`showcase.${status}`,"showcase",id,{});
    return json({ ok:true,id,status });
  }
  if (path.match(/^\/api\/admin\/showcase\/\d+\/navigation$/) && request.method === "PATCH") {
    assertSameOrigin(request);
    const id=Number(path.split("/")[4]);
    const body=await readJson(request);
    const include=body.enabled===true?1:0;
    const item=await env.DB.prepare("SELECT id,title,status FROM showcase_items WHERE id=?").bind(id).first();
    if(!item)return json({ error:"Showcase item not found." },404);
    await env.DB.prepare("UPDATE showcase_items SET include_in_navigation=?,updated_by=?,updated_at=CURRENT_TIMESTAMP WHERE id=?")
      .bind(include,admin.id,id).run();
    await auditAdmin(env,admin.id,include?"showcase.navigation_enabled":"showcase.navigation_disabled","showcase",id,{ title:item.title,status:item.status });
    return json({ ok:true,id,enabled:Boolean(include),effective:item.status==="published"&&Boolean(include) });
  }
  if (path.match(/^\/api\/admin\/showcase\/\d+\/media$/) && request.method === "POST") {
    assertSameOrigin(request);
    const showcaseId=Number(path.split("/")[4]);
    const showcase=await env.DB.prepare("SELECT id,stable_id FROM showcase_items WHERE id=? AND content_type='case_study'").bind(showcaseId).first();
    if(!showcase)return json({ error:"Case study not found." },404);
    const form=await request.formData(),file=form.get("file"),assetType="exploded_view";
    if(!(file instanceof File)||!file.size)return json({ error:"Choose an Exploded View image." },400);
    if(!["image/png","image/jpeg","image/webp"].includes(file.type)||file.size>20*1024*1024)return json({ error:"Use a PNG, JPEG or WebP image up to 20 MB." },400);
    const altText=String(form.get("alt_text")||"").trim().slice(0,300),caption=String(form.get("caption")||"").trim().slice(0,500);
    if(altText.length<10)return json({ error:"Provide descriptive alternative text." },400);
    const objectKey=`showcase/${showcase.stable_id}/${assetType}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
    await env.RESOURCE_FILES.put(objectKey,file.stream(),{httpMetadata:{contentType:file.type,contentDisposition:`inline; filename="${safeFileName(file.name)}"`},customMetadata:{visibility:"public",assetType}});
    let assetId=null;
    try{
      const asset=await env.DB.prepare(`INSERT INTO library_assets(title,description,asset_kind,category,tags_json,file_name,object_key,content_type,size_bytes,version_label,visibility,related_pages_json,download_enabled,watermark_enabled,status,uploaded_by)
        VALUES(?,?,'image','Case Study Visual','["exploded_view"]',?,?,?,?,?,'public',?,0,0,'published',?)`)
        .bind(`${showcase.stable_id} Exploded View`,caption,safeFileName(file.name),objectKey,file.type,file.size,"1.0",JSON.stringify([`/case-studies/#${showcase.stable_id}`]),admin.id).run();
      assetId=Number(asset.meta.last_row_id);
      const previous=await env.DB.prepare("SELECT sm.asset_id,a.object_key FROM showcase_media sm JOIN library_assets a ON a.id=sm.asset_id WHERE sm.showcase_id=? AND sm.asset_type=?").bind(showcaseId,assetType).first();
      await env.DB.prepare(`INSERT INTO showcase_media(showcase_id,asset_id,asset_type,alt_text,caption,created_by,updated_by)
        VALUES(?,?,?,?,?,?,?) ON CONFLICT(showcase_id,asset_type) DO UPDATE SET asset_id=excluded.asset_id,alt_text=excluded.alt_text,caption=excluded.caption,updated_by=excluded.updated_by,updated_at=CURRENT_TIMESTAMP`)
        .bind(showcaseId,assetId,assetType,altText,caption,admin.id,admin.id).run();
      if(previous){await env.RESOURCE_FILES.delete(previous.object_key);await env.DB.prepare("DELETE FROM library_assets WHERE id=?").bind(previous.asset_id).run();}
      await auditAdmin(env,admin.id,"showcase.media_updated","showcase",showcaseId,{asset_type:assetType,asset_id:assetId});
      return json({ok:true,asset_id:assetId},201);
    }catch(error){await env.RESOURCE_FILES.delete(objectKey);if(assetId)await env.DB.prepare("DELETE FROM library_assets WHERE id=?").bind(assetId).run().catch(()=>{});throw error;}
  }
  if (path.match(/^\/api\/admin\/showcase\/\d+\/media\/exploded_view$/) && request.method === "DELETE") {
    assertSameOrigin(request);const showcaseId=Number(path.split("/")[4]);
    const current=await env.DB.prepare("SELECT sm.asset_id,a.object_key FROM showcase_media sm JOIN library_assets a ON a.id=sm.asset_id WHERE sm.showcase_id=? AND sm.asset_type='exploded_view'").bind(showcaseId).first();
    if(!current)return json({error:"Exploded View not found."},404);
    await env.DB.prepare("DELETE FROM showcase_media WHERE showcase_id=? AND asset_type='exploded_view'").bind(showcaseId).run();
    await env.RESOURCE_FILES.delete(current.object_key);await env.DB.prepare("DELETE FROM library_assets WHERE id=?").bind(current.asset_id).run();
    await auditAdmin(env,admin.id,"showcase.media_removed","showcase",showcaseId,{asset_type:"exploded_view"});return json({ok:true});
  }
  if (path === "/api/admin/people" && request.method === "GET") {
    const rows=await env.DB.prepare(`SELECT p.*,pm.id photo_media_id,pm.alt_text photo_alt_text,a.object_key photo_object_key,a.file_name photo_file_name,a.content_type photo_content_type,a.size_bytes photo_size_bytes,a.created_at photo_uploaded_at
      FROM people_profiles p LEFT JOIN person_media pm ON pm.person_id=p.id AND pm.media_type='profile_photo' LEFT JOIN library_assets a ON a.id=pm.asset_id ORDER BY p.display_order,p.id`).all();return json({people:rows.results.map(serializePerson)});
  }
  if (path === "/api/admin/people" && request.method === "POST") {
    assertSameOrigin(request);const person=validatePerson(await readJson(request));
    const stableId=`person-${slugify(person.name)}-${crypto.randomUUID().slice(0,8)}`;
    if(!person[11])person[11]="View executive profile";
    if(!person[12])person[12]=`/people/${stableId}/`;
    const result=await env.DB.prepare(`INSERT INTO people_profiles(stable_id,name,display_name,designation,short_bio,full_bio,email,phone,linkedin_url,profile_image_url,specialties_json,location,cta_label,cta_url,display_order,is_active,public_visibility,created_by,updated_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(stableId,...person,admin.id,admin.id).run();await auditAdmin(env,admin.id,"people.created","person",Number(result.meta.last_row_id),{});return json({id:Number(result.meta.last_row_id)},201);
  }
  if (path.match(/^\/api\/admin\/people\/\d+$/) && request.method === "PUT") {
    assertSameOrigin(request);const id=Number(path.split("/").pop()),person=validatePerson(await readJson(request));
    await env.DB.prepare(`UPDATE people_profiles SET name=?,display_name=?,designation=?,short_bio=?,full_bio=?,email=?,phone=?,linkedin_url=?,profile_image_url=?,specialties_json=?,location=?,cta_label=?,cta_url=?,display_order=?,is_active=?,public_visibility=?,updated_by=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .bind(...person,admin.id,id).run();await auditAdmin(env,admin.id,"people.updated","person",id,{});return json({ok:true,id});
  }
  if (path.match(/^\/api\/admin\/people\/\d+\/leadership$/) && request.method === "PATCH") {
    assertSameOrigin(request);const id=Number(path.split("/")[4]),source=await readJson(request),slug=slugify(source.slug||source.display_name||"");
    if(!slug)return json({error:"A valid profile slug is required."},400);if(!String(source.designation||"").trim()||!String(source.capability_line||"").trim())return json({error:"Designation and capability line are required."},400);
    const duplicate=await env.DB.prepare("SELECT id FROM people_profiles WHERE slug=? AND id<>?").bind(slug,id).first();if(duplicate)return json({error:"Profile slug already exists."},409);
    const status=["draft","published","archived"].includes(source.status)?source.status:"draft";
    await env.DB.prepare(`UPDATE people_profiles SET first_name=?,middle_name=?,last_name=?,slug=?,designation=?,capability_line=?,leadership_category=?,person_type=?,show_on_leadership=?,featured_homepage=?,status=?,published_at=CASE WHEN ?='published' THEN COALESCE(published_at,CURRENT_TIMESTAMP) ELSE published_at END,website_url=?,email_public=?,phone_public=?,linkedin_public=?,website_public=?,cta_label='View Profile',cta_url=?,updated_by=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(String(source.first_name||"").trim(),String(source.middle_name||"").trim(),String(source.last_name||"").trim(),slug,String(source.designation).trim().slice(0,180),String(source.capability_line).trim().slice(0,500),String(source.leadership_category||"Executive Leadership").trim().slice(0,120),String(source.person_type||"Executive").trim().slice(0,80),source.show_on_leadership===false?0:1,source.featured_homepage?1:0,status,status,String(source.website_url||"").trim().slice(0,500),source.email_public?1:0,source.phone_public?1:0,source.linkedin_public?1:0,source.website_public?1:0,`/about/leadership/${slug}`,admin.id,id).run();
    const expertise=(Array.isArray(source.expertise)?source.expertise:[]).map(value=>String(value).trim().slice(0,100)).filter(Boolean).slice(0,30);await env.DB.prepare("DELETE FROM person_expertise WHERE person_id=?").bind(id).run();for(let index=0;index<expertise.length;index++)await env.DB.prepare("INSERT INTO person_expertise(person_id,title,display_order) VALUES(?,?,?)").bind(id,expertise[index],index+1).run();
    await auditAdmin(env,admin.id,`leadership.${status}`,"person",id,{slug});return json({ok:true,id,slug});
  }
  if (path.match(/^\/api\/admin\/people\/\d+\/photo$/) && request.method === "POST") {
    assertSameOrigin(request);const id=Number(path.split("/")[4]),form=await request.formData(),file=form.get("file"),alt=String(form.get("alt_text")||"").trim();
    if(!(file instanceof File)||!file.size)return json({error:"Choose a photograph."},400);
    if(!["image/jpeg","image/png","image/webp"].includes(file.type))return json({error:"Use JPG, PNG or WEBP."},415);
    if(file.size>5*1024*1024)return json({error:"Photographs must be 5 MB or smaller."},413);
    if(alt.length<3)return json({error:"Alternative text is required."},400);
    const profile=await env.DB.prepare("SELECT COALESCE(slug,stable_id) slug FROM people_profiles WHERE id=?").bind(id).first();if(!profile)return json({error:"Executive not found."},404);
    const old=await env.DB.prepare("SELECT pm.asset_id,a.object_key FROM person_media pm JOIN library_assets a ON a.id=pm.asset_id WHERE pm.person_id=? AND pm.media_type='profile_photo'").bind(id).first();
    const objectKey=`leadership/${profile.slug}/profile/${crypto.randomUUID()}-${safeFileName(file.name)}`;await env.RESOURCE_FILES.put(objectKey,file.stream(),{httpMetadata:{contentType:file.type}});
    const asset=await env.DB.prepare(`INSERT INTO library_assets(title,description,asset_kind,category,tags_json,file_name,object_key,content_type,size_bytes,visibility,download_enabled,watermark_enabled,status) VALUES(?,?,?,?,?,?,?,?,?,'public',0,0,'published')`).bind(`${profile.slug} profile photograph`,alt,"image","Leadership media",'["leadership","profile photograph"]',safeFileName(file.name),objectKey,file.type,file.size).run();
    const assetId=Number(asset.meta.last_row_id);await env.DB.prepare(`INSERT INTO person_media(person_id,asset_id,media_type,alt_text,created_by) VALUES(?,?,'profile_photo',?,?) ON CONFLICT(person_id,media_type) DO UPDATE SET asset_id=excluded.asset_id,alt_text=excluded.alt_text,created_by=excluded.created_by,created_at=CURRENT_TIMESTAMP`).bind(id,assetId,alt,admin.id).run();
    if(old){await env.RESOURCE_FILES.delete(old.object_key);await env.DB.prepare("DELETE FROM library_assets WHERE id=?").bind(old.asset_id).run();}
    await auditAdmin(env,admin.id,"leadership.photo_updated","person",id,{asset_id:assetId});return json({ok:true,url:`/leadership-media/${id}`},201);
  }
  if (path.match(/^\/api\/admin\/people\/\d+\/photo$/) && request.method === "DELETE") {
    assertSameOrigin(request);const id=Number(path.split("/")[4]),old=await env.DB.prepare("SELECT pm.asset_id,a.object_key FROM person_media pm JOIN library_assets a ON a.id=pm.asset_id WHERE pm.person_id=? AND pm.media_type='profile_photo'").bind(id).first();if(!old)return json({error:"Photograph not found."},404);
    await env.DB.prepare("DELETE FROM person_media WHERE person_id=? AND media_type='profile_photo'").bind(id).run();await env.RESOURCE_FILES.delete(old.object_key);await env.DB.prepare("DELETE FROM library_assets WHERE id=?").bind(old.asset_id).run();await auditAdmin(env,admin.id,"leadership.photo_removed","person",id,{});return json({ok:true});
  }
  if (path === "/api/admin/resources" && request.method === "POST") {
    assertSameOrigin(request);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.size) return json({ error: "Choose a file to upload." }, 400);
    if (file.size > 25 * 1024 * 1024) return json({ error: "Files must be 25 MB or smaller." }, 413);
    const metadata = validateResource(form);
    const objectKey = `resources/${crypto.randomUUID()}/${safeFileName(file.name)}`;
    await env.RESOURCE_FILES.put(objectKey, file.stream(), { httpMetadata: { contentType: file.type || "application/octet-stream", contentDisposition: `attachment; filename="${safeFileName(file.name)}"` } });
    try {
      const result = await env.DB.prepare(`INSERT INTO resources(title,description,category,file_name,object_key,content_type,size_bytes,status,position)
        VALUES(?,?,?,?,?,?,?,?,?)`).bind(metadata.title,metadata.description,metadata.category,safeFileName(file.name),objectKey,file.type||"application/octet-stream",file.size,metadata.status,metadata.position).run();
      return json({ id: Number(result.meta.last_row_id) }, 201);
    } catch (error) {
      await env.RESOURCE_FILES.delete(objectKey);
      throw error;
    }
  }
  if (path.startsWith("/api/admin/resources/") && request.method === "PUT") {
    assertSameOrigin(request);
    const id = Number(path.split("/").pop());
    const metadata = validateResource(await readJson(request));
    await env.DB.prepare("UPDATE resources SET title=?,description=?,category=?,status=?,position=?,updated_at=CURRENT_TIMESTAMP WHERE id=?")
      .bind(metadata.title,metadata.description,metadata.category,metadata.status,metadata.position,id).run();
    return json({ ok: true });
  }
  if (path.startsWith("/api/admin/resources/") && request.method === "DELETE") {
    assertSameOrigin(request);
    const id = Number(path.split("/").pop());
    const resource = await env.DB.prepare("SELECT object_key FROM resources WHERE id=?").bind(id).first();
    if (!resource) return json({ error: "Resource not found." }, 404);
    await env.RESOURCE_FILES.delete(resource.object_key);
    await env.DB.prepare("DELETE FROM resources WHERE id=?").bind(id).run();
    return json({ ok: true });
  }
  if (path === "/api/admin/library" && request.method === "POST") {
    assertSameOrigin(request);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.size) return json({ error: "Choose a file to upload." }, 400);
    if (file.size > 100 * 1024 * 1024) return json({ error: "Library files must be 100 MB or smaller." }, 413);
    const asset = validateLibraryAsset(form, file);
    const objectKey = `library/${asset.asset_kind}/${crypto.randomUUID()}/${safeFileName(file.name)}`;
    await env.RESOURCE_FILES.put(objectKey, file.stream(), {
      httpMetadata: { contentType: file.type || "application/octet-stream", contentDisposition: `attachment; filename="${safeFileName(file.name)}"` },
      customMetadata: { visibility: asset.visibility, downloadEnabled: String(asset.download_enabled), watermarkEnabled: String(asset.watermark_enabled) },
    });
    let assetId=null;
    try {
      const result = await env.DB.prepare(`INSERT INTO library_assets(title,description,asset_kind,category,tags_json,file_name,object_key,
        content_type,size_bytes,version_label,visibility,related_pages_json,download_enabled,watermark_enabled,status,uploaded_by)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(asset.title,asset.description,asset.asset_kind,asset.category,
        JSON.stringify(asset.tags),safeFileName(file.name),objectKey,file.type||"application/octet-stream",file.size,
        asset.version_label,asset.visibility,JSON.stringify(asset.related_pages),asset.download_enabled,asset.watermark_enabled,"draft",admin.id).run();
      assetId=Number(result.meta.last_row_id);
      let showcaseId=null;
      if(asset.category==="Case Study"){
        const slug=await uniqueShowcaseSlug(env,slugify(asset.title));
        const showcase=await env.DB.prepare(`INSERT INTO showcase_items
          (stable_id,content_type,slug,title,description,category,target_url,legacy_url,asset_id,tags_json,display_order,visibility,status,created_by,updated_by)
          VALUES(?,'case_study',?,?,?,?,?,?,?, ?,?,?,'draft',?,?)`)
          .bind(`library-case-study-${assetId}`,slug,asset.title,asset.description,"Case Study",`/case-studies/#${slug}`,`/case-studies/#${slug}`,assetId,
            JSON.stringify(asset.tags),100+assetId,asset.visibility,admin.id,admin.id).run();
        showcaseId=Number(showcase.meta.last_row_id);
      }
      await auditAdmin(env, admin.id, "library.uploaded", "asset", assetId, { file_name: file.name, asset_kind: asset.asset_kind,showcase_id:showcaseId });
      return json({ id:assetId,showcase_id:showcaseId }, 201);
    } catch (error) {
      if(assetId) await env.DB.prepare("DELETE FROM library_assets WHERE id=?").bind(assetId).run().catch(()=>{});
      await env.RESOURCE_FILES.delete(objectKey);
      throw error;
    }
  }
  if (path.match(/^\/api\/admin\/library\/\d+$/) && request.method === "PATCH") {
    assertSameOrigin(request);
    const id = Number(path.split("/").pop());
    const body = await readJson(request);
    const status = ["draft","published","archived"].includes(body.status) ? body.status : "draft";
    const visibility = ["public","authenticated","restricted"].includes(body.visibility) ? body.visibility : "authenticated";
    const linkedShowcase=await env.DB.prepare("SELECT id FROM showcase_items WHERE asset_id=?").bind(id).first();
    if(linkedShowcase&&status==="published") { const allowed=await requirePermission(request,env,"showcase.publish");if(allowed instanceof Response)return allowed; }
    await env.DB.prepare(`UPDATE library_assets SET status=?,visibility=?,download_enabled=?,watermark_enabled=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
      .bind(status,visibility,body.download_enabled!==false?1:0,body.watermark_enabled?1:0,id).run();
    await env.DB.prepare(`UPDATE showcase_items SET status=?,visibility=?,updated_by=?,updated_at=CURRENT_TIMESTAMP,
      published_at=CASE WHEN ?='published' THEN CURRENT_TIMESTAMP ELSE published_at END WHERE asset_id=?`)
      .bind(status,visibility,admin.id,status,id).run();
    await auditAdmin(env, admin.id, "library.updated", "asset", id, { status, visibility });
    return json({ ok: true });
  }
  if (path === "/api/admin/search/rebuild" && request.method === "POST") {
    assertSameOrigin(request);
    const body = await readJson(request);
    const scope = ["all","pages","knowledge","documents"].includes(body.scope) ? body.scope : "all";
    const counts = await Promise.all([
      env.DB.prepare("SELECT COUNT(*) total FROM content_pages WHERE status='published'").first(),
      env.DB.prepare("SELECT COUNT(*) total FROM knowledge_objects WHERE status='published'").first(),
      env.DB.prepare("SELECT COUNT(*) total FROM library_assets WHERE status='published'").first(),
    ]);
    const total = counts.reduce((sum,row)=>sum+Number(row?.total||0),0);
    const result = await env.DB.prepare(`INSERT INTO search_index_jobs(scope,status,records_indexed,requested_by,completed_at,message)
      VALUES(?,'completed',?,?,CURRENT_TIMESTAMP,?)`).bind(scope,total,admin.id,"Index inventory validated and marked current.").run();
    await auditAdmin(env, admin.id, "search.rebuilt", "search_index", Number(result.meta.last_row_id), { scope, records: total });
    return json({ id: Number(result.meta.last_row_id), status: "completed", records_indexed: total });
  }
  if (path === "/api/admin/authoring/assist" && request.method === "POST") {
    assertSameOrigin(request);
    const body = await readJson(request);
    const topic = String(body.topic || "").trim().slice(0,160);
    const objective = String(body.objective || "").trim().slice(0,1000);
    const audience = ["Executive","Practitioner","Technical"].includes(body.audience) ? body.audience : "Practitioner";
    if (topic.length < 3 || objective.length < 10) return json({ error: "Provide a topic and a clear editorial objective." }, 400);
    const brief = buildGovernedAuthoringBrief(topic, audience, objective);
    await auditAdmin(env, admin.id, "authoring.brief_created", "draft", null, { topic, audience });
    return json({ brief, notice: "Draft generated from the governed editorial template. Human review and source validation are required." });
  }
  return json({ error: "Not found." }, 404);
}

async function searchKnowledge(env, url) {
  const query = String(url.searchParams.get("q") || "").trim().replace(/\s+/g, " ").slice(0, 240);
  const audience = ["executive", "practitioner", "technical"].includes(url.searchParams.get("audience"))
    ? url.searchParams.get("audience") : "practitioner";
  if (query.length < 2) return json({ query, audience, results: [], completeness: "insufficient_query", message: "Enter at least two characters." });

  const terms = [...new Set(query.toLowerCase().split(/[^a-z0-9]+/).filter(term => term.length > 1))].slice(0, 8);
  const patterns = terms.map(term => `%${term}%`);
  const clauses = patterns.map(() => `(LOWER(canonical_name) LIKE ? OR LOWER(COALESCE(acronym,'')) LIKE ? OR LOWER(aliases_json) LIKE ? OR LOWER(search_keywords) LIKE ? OR LOWER(one_line_definition) LIKE ? OR LOWER(plain_language_explanation) LIKE ?)`);
  const bindings = patterns.flatMap(pattern => [pattern, pattern, pattern, pattern, pattern, pattern]);
  const sql = `SELECT id,canonical_name,slug,acronym,object_type,one_line_definition,plain_language_explanation,
    executive_summary,technical_explanation,business_value,implementation_json,operations_json,risk_quality_json,
    source_path,updated_at,
    (CASE WHEN LOWER(canonical_name)=? THEN 100 ELSE 0 END +
     CASE WHEN LOWER(COALESCE(acronym,''))=? THEN 80 ELSE 0 END +
     ${patterns.map(() => `CASE WHEN LOWER(canonical_name) LIKE ? THEN 12 ELSE 0 END`).join(" + ")} +
     ${patterns.map(() => `CASE WHEN LOWER(search_keywords) LIKE ? THEN 5 ELSE 0 END`).join(" + ")}) AS relevance
    FROM knowledge_objects
    WHERE status='published' AND (${clauses.join(" OR ")})
    ORDER BY relevance DESC, canonical_name LIMIT 12`;
  const exact = query.toLowerCase();
  const scoreBindings = [exact, exact, ...patterns, ...patterns];
  const rows = await env.DB.prepare(sql).bind(...scoreBindings, ...bindings).all();
  const ids = rows.results.map(row => row.id);
  const evidence = ids.length ? await env.DB.prepare(
    `SELECT object_id,id,source_title,source_type,source_url,publisher,publication_date,claim_supported,reliability
     FROM knowledge_evidence WHERE object_id IN (${ids.map(() => "?").join(",")}) ORDER BY id`
  ).bind(...ids).all() : { results: [] };
  const evidenceByObject = Object.groupBy
    ? Object.groupBy(evidence.results, item => item.object_id)
    : evidence.results.reduce((all, item) => ((all[item.object_id] ||= []).push(item), all), {});
  const results = rows.results.map(row => ({
    ...row,
    answer: knowledgeAnswerForAudience(row, audience),
    implementation: safeJsonValue(row.implementation_json, {}),
    operations: safeJsonValue(row.operations_json, {}),
    risks: safeJsonValue(row.risk_quality_json, {}),
    evidence: evidenceByObject[row.id] || [],
    grounding: (evidenceByObject[row.id] || []).length ? "source_evidence" : "platform_reviewed_content",
    implementation_json: undefined,
    operations_json: undefined,
    risk_quality_json: undefined,
  }));
  return json({
    query, audience, results,
    completeness: results.length ? "partial" : "no_evidence",
    message: results.length
      ? "Results are drawn only from published canonical knowledge objects. Generative synthesis and semantic embeddings are not enabled yet."
      : "The published knowledge base does not contain enough evidence to answer this question.",
    searchMode: "keyword_and_terminology",
  });
}

async function getKnowledgeObject(env, slug) {
  if (!/^[a-z0-9-]{2,120}$/.test(slug)) return json({ error: "Knowledge object was not found." }, 404);
  const object = await env.DB.prepare("SELECT * FROM knowledge_objects WHERE slug=? AND status='published'").bind(slug).first();
  if (!object) return json({ error: "Knowledge object was not found." }, 404);
  const [relationships, evidence] = await Promise.all([
    env.DB.prepare(`SELECT r.relationship_type,r.description,r.confidence,
      CASE WHEN r.source_id=? THEN target.slug ELSE source.slug END related_slug,
      CASE WHEN r.source_id=? THEN target.canonical_name ELSE source.canonical_name END related_name,
      CASE WHEN r.source_id=? THEN 'outgoing' ELSE 'incoming' END direction
      FROM knowledge_relationships r
      JOIN knowledge_objects source ON source.id=r.source_id
      JOIN knowledge_objects target ON target.id=r.target_id
      WHERE (r.source_id=? OR r.target_id=?) AND source.status='published' AND target.status='published'
      ORDER BY r.relationship_type,related_name`).bind(object.id, object.id, object.id, object.id, object.id).all(),
    env.DB.prepare("SELECT * FROM knowledge_evidence WHERE object_id=? ORDER BY id").bind(object.id).all(),
  ]);
  return json({ object: parseKnowledgeObject(object), relationships: relationships.results, evidence: evidence.results });
}

async function saveKnowledgeFeedback(request, env) {
  const body = await readJson(request);
  const query = String(body.query || "").trim().slice(0, 240);
  const resultIds = Array.isArray(body.resultIds) ? body.resultIds.filter(id => typeof id === "string").slice(0, 20) : [];
  const helpful = body.helpful === true ? 1 : body.helpful === false ? 0 : null;
  const comment = String(body.comment || "").trim().slice(0, 1000) || null;
  if (query.length < 2 || helpful === null) return json({ error: "A query and helpful rating are required." }, 400);
  const user = await currentUser(request, env);
  await env.DB.prepare("INSERT INTO knowledge_search_feedback(query,result_ids_json,helpful,comment,user_id) VALUES(?,?,?,?,?)")
    .bind(query, JSON.stringify(resultIds), helpful, comment, user?.id || null).run();
  return json({ ok: true }, 201);
}

function knowledgeAnswerForAudience(row, audience) {
  if (audience === "executive") return row.executive_summary || row.one_line_definition;
  if (audience === "technical") return row.technical_explanation || row.plain_language_explanation;
  return row.plain_language_explanation;
}

function parseKnowledgeObject(object) {
  const parsed = { ...object };
  for (const key of ["aliases_json","architecture_json","governance_json","security_json","implementation_json","operations_json","risk_quality_json","learning_json","audience_levels_json"]) {
    parsed[key.replace(/_json$/, "")] = safeJsonValue(parsed[key], key === "aliases_json" || key === "audience_levels_json" ? [] : {});
    delete parsed[key];
  }
  return parsed;
}

function safeJsonValue(value, fallback) {
  try { return JSON.parse(value); } catch { return fallback; }
}

async function serveResourceDownload(request, env, url) {
  const id = Number(url.pathname.split("/").filter(Boolean).pop());
  if (!Number.isInteger(id)) return env.ASSETS.fetch(request);
  const resource = await env.DB.prepare("SELECT * FROM resources WHERE id=? AND status='published'").bind(id).first();
  if (!resource) return new Response("Not found.", { status: 404 });
  const object = await env.RESOURCE_FILES.get(resource.object_key, { range: request.headers });
  if (!object) return new Response("File unavailable.", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Content-Disposition", `attachment; filename="${safeFileName(resource.file_name)}"`);
  headers.set("ETag", object.httpEtag);
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(object.body, { headers });
}

async function serveLibraryDownload(request, env, url) {
  const id = Number(url.pathname.split("/").pop());
  if (!Number.isInteger(id)) return new Response("Not found.", { status: 404 });
  const asset = await env.DB.prepare("SELECT * FROM library_assets WHERE id=? AND status='published'").bind(id).first();
  if (!asset) return new Response("Not found.", { status: 404 });
  const user = await currentUser(request, env);
  if (asset.visibility === "authenticated" && !user) return Response.redirect(new URL(`/login?next=${encodeURIComponent(url.pathname)}`, url), 302);
  if (asset.visibility === "restricted" && user?.role !== "admin") return new Response("Access denied.", { status: 403 });
  if (!Number(asset.download_enabled) && user?.role !== "admin") return new Response("Downloads are disabled for this asset.", { status: 403 });
  const object = await env.RESOURCE_FILES.get(asset.object_key);
  if (!object) return new Response("File not found.", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Content-Disposition", `attachment; filename="${safeFileName(asset.file_name)}"`);
  headers.set("Cache-Control", asset.visibility === "public" ? "public, max-age=300" : "private, no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(object.body, { headers });
}

async function servePersonProfile(request,env,url){
  if(request.method!=="GET"&&request.method!=="HEAD")return new Response("Method not allowed.",{status:405});
  const stableId=decodeURIComponent(url.pathname.slice("/about/leadership/".length)).replace(/\/$/,"");
  if(!stableId)return Response.redirect(`${url.origin}/about/leadership`,302);
  const row=await env.DB.prepare(`SELECT p.*,pm.id photo_media_id,pm.alt_text photo_alt_text FROM people_profiles p LEFT JOIN person_media pm ON pm.person_id=p.id AND pm.media_type='profile_photo' WHERE p.slug=? AND p.status='published' AND p.is_active=1 AND p.public_visibility=1`).bind(stableId).first();
  if(!row)return new Response("Profile not found.",{status:404});
  const person=serializePersonPublic(row);const expertise=await env.DB.prepare("SELECT title FROM person_expertise WHERE person_id=? ORDER BY display_order,id").bind(person.id).all();const specialties=expertise.results.map(item=>`<li>${escapeHtml(item.title)}</li>`).join("");
  const contact=[person.email?`<a href="mailto:${escapeHtml(person.email)}">Email ${escapeHtml(person.display_name)}</a>`:"",person.phone?`<a href="tel:${escapeHtml(person.phone.replace(/[^+\d]/g,""))}">${escapeHtml(person.phone)}</a>`:"",person.linkedin_url?`<a href="${escapeHtml(person.linkedin_url)}" target="_blank" rel="noopener">LinkedIn</a>`:""].filter(Boolean).join("");
  const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${escapeHtml(person.short_bio)}"><title>${escapeHtml(person.display_name)} | Architecting Intelligence</title><link rel="stylesheet" href="/assets/css/methodology-v10.css?v=20260925-1"><link rel="stylesheet" href="/assets/css/portal-hero-system.css?v=20260925-1"><link rel="stylesheet" href="/assets/css/platform-sections.css?v=20260925-1"><script src="/assets/js/methodology-v10.js?v=20260925-1" defer></script></head><body data-methodology-page="profile"><a class="skip-link" href="#main-content">Skip to content</a><header id="methodology-header"></header><main id="main-content"><section class="portal-hero portal-hero--page executive-profile-hero"><div class="portal-hero__inner"><div><span class="preview-kicker">Executive profile</span><h1>${escapeHtml(person.display_name)}</h1><p>${escapeHtml(person.designation)}</p></div><img src="${escapeHtml(person.profile_image_url||'/assets/images/profile-placeholder.svg')}" alt="${escapeHtml(person.display_name)}" width="240" height="240"></div></section><div class="methodology-wrap platform-section-shell executive-profile-body"><section><span class="content-kicker">Profile</span><h2>Leadership focused on practical enterprise outcomes.</h2><p>${escapeHtml(person.full_bio||person.short_bio)}</p>${specialties?`<h3>Areas of focus</h3><ul class="profile-specialties">${specialties}</ul>`:""}</section><aside class="governance-callout"><span class="content-kicker">Connect</span><h2>${escapeHtml(person.location||'Canada')}</h2><nav class="profile-contact-actions">${contact}</nav></aside></div></main><footer id="methodology-footer"></footer></body></html>`;
  return new Response(request.method==="HEAD"?null:html,{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"public, max-age=60"}});
}

async function serveLeadershipDirectory(request,env,url){
  if(request.method!=="GET"&&request.method!=="HEAD")return new Response("Method not allowed.",{status:405});
  const rows=await env.DB.prepare(`SELECT p.*,pm.id photo_media_id,pm.alt_text photo_alt_text FROM people_profiles p LEFT JOIN person_media pm ON pm.person_id=p.id AND pm.media_type='profile_photo' WHERE p.status='published' AND p.is_active=1 AND p.show_on_leadership=1 ORDER BY p.display_order,p.id`).all();
  const cards=rows.results.map(serializePersonPublic).map(person=>`<article class="profile-card"><img src="${escapeHtml(person.profile_image_url||'/assets/images/profile-placeholder.svg')}" alt="${escapeHtml(person.photo_alt_text)}"><div><span>${escapeHtml(person.leadership_category)}</span><h2>${escapeHtml(person.display_name)}</h2><strong>${escapeHtml(person.designation)}</strong><p>${escapeHtml(person.capability_line)}</p>${person.short_bio?`<p>${escapeHtml(person.short_bio)}</p>`:""}<nav>${person.linkedin_url?`<a href="${escapeHtml(person.linkedin_url)}" rel="noopener">LinkedIn</a>`:""}<a href="/about/leadership/${escapeHtml(person.slug)}">View Profile →</a></nav></div></article>`).join("");
  const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Leadership | Architecting Intelligence</title><link rel="stylesheet" href="/assets/css/methodology-v10.css?v=20260925-2"><link rel="stylesheet" href="/assets/css/portal-hero-system.css?v=20260925-2"><link rel="stylesheet" href="/assets/css/platform-sections.css?v=20260925-2"><script src="/assets/js/methodology-v10.js?v=20260925-2" defer></script></head><body data-methodology-page="about"><a class="skip-link" href="#main-content">Skip to content</a><header id="methodology-header"></header><main id="main-content"><section class="portal-hero portal-hero--page"><div class="portal-hero__inner"><div><span class="preview-kicker">Leadership</span><h1>Leadership for Enterprise AI Transformation</h1><p>Bringing together enterprise architecture, AI governance, intelligent automation, client strategy and transformation leadership to help organizations move from strategy to governed execution.</p></div></div></section><section class="methodology-wrap platform-section-shell"><div class="leadership-grid">${cards||'<p>No published leadership profiles are currently available.</p>'}</div></section></main><footer id="methodology-footer"></footer></body></html>`;
  return new Response(request.method==="HEAD"?null:html,{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"public, max-age=60"}});
}

async function serveLeadershipMedia(request,env,url){
  if(request.method!=="GET"&&request.method!=="HEAD")return new Response("Method not allowed.",{status:405});const personId=Number(url.pathname.split("/").pop());
  const media=await env.DB.prepare(`SELECT a.* FROM person_media pm JOIN people_profiles p ON p.id=pm.person_id JOIN library_assets a ON a.id=pm.asset_id WHERE pm.person_id=? AND pm.media_type='profile_photo' AND p.status='published' AND p.is_active=1 AND a.status='published'`).bind(personId).first();if(!media)return new Response("Not found.",{status:404});
  const object=await env.RESOURCE_FILES.get(media.object_key);if(!object)return new Response("Not found.",{status:404});const headers=new Headers();object.writeHttpMetadata(headers);headers.set("Cache-Control","public, max-age=3600");headers.set("X-Content-Type-Options","nosniff");return new Response(request.method==="HEAD"?null:object.body,{headers});
}

async function serveShowcaseMedia(request,env,url){
  const id=Number(url.pathname.split("/").pop());if(!Number.isInteger(id))return new Response("Not found.",{status:404});
  const media=await env.DB.prepare(`SELECT a.* FROM showcase_media sm JOIN showcase_items s ON s.id=sm.showcase_id JOIN library_assets a ON a.id=sm.asset_id
    WHERE sm.id=? AND s.status='published' AND s.visibility='public' AND a.status='published' AND a.visibility='public'`).bind(id).first();
  if(!media)return new Response("Not found.",{status:404});const object=await env.RESOURCE_FILES.get(media.object_key);if(!object)return new Response("File not found.",{status:404});
  const headers=new Headers();object.writeHttpMetadata(headers);headers.set("Content-Disposition",`inline; filename="${safeFileName(media.file_name)}"`);headers.set("Cache-Control","public, max-age=3600");headers.set("X-Content-Type-Options","nosniff");return new Response(object.body,{headers});
}

async function serveAdminLibraryDownload(request, env, url) {
  const admin = await requirePermission(request, env, "library.manage");
  if (admin instanceof Response) return admin;
  const id = Number(url.pathname.split("/").pop());
  if (!Number.isInteger(id)) return new Response("Not found.", { status: 404 });
  const asset = await env.DB.prepare("SELECT * FROM library_assets WHERE id=?").bind(id).first();
  if (!asset) return new Response("Not found.", { status: 404 });
  const object = await env.RESOURCE_FILES.get(asset.object_key);
  if (!object) return new Response("File not found.", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Content-Disposition", `inline; filename="${safeFileName(asset.file_name)}"`);
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(object.body, { headers });
}

async function serveManagedPage(request, env, url) {
  if (url.pathname !== "/" && url.pathname !== "/index.html" && !url.pathname.startsWith("/pages/")) return null;
  const accessPath = canonicalAccessPath(url.pathname);
  const lookupPath = accessPath === "/" ? "/index.html" : accessPath || url.pathname;
  const page = await env.DB.prepare("SELECT p.*,t.layout,t.font_body,t.font_heading,t.color_primary,t.color_accent,t.content_width FROM content_pages p LEFT JOIN page_templates t ON t.id=p.template_id WHERE (p.source_path=? OR '/pages/'||p.slug||'.html'=?) AND p.status='published'").bind(lookupPath,lookupPath).first();
  if (!page) return null;
  let leftNav = [], style = {};
  try { leftNav = JSON.parse(page.left_nav_json || "[]"); } catch {}
  try { style = JSON.parse(page.style_json || "{}"); } catch {}
  const content = renderManagedMain(page, leftNav, style);
  if (page.source_path) {
    const assetUrl = new URL(assetRoutePath(page.source_path), url);
    const base = await env.ASSETS.fetch(new Request(assetUrl, request));
    if (base.ok) {
      const headers = new Headers(base.headers);
      headers.delete("Content-Length");
      return new Response((await base.text()).replace(/<main\b[^>]*>[\s\S]*?<\/main>/i, content), { headers });
    }
  }
  return new Response(renderManagedDocument(page, content, style), { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function renderManagedMain(page, leftNav, style) {
  const primary = safeColor(style.primary) || safeColor(page.color_primary) || "#08264a";
  const accent = safeColor(style.accent) || safeColor(page.color_accent) || "#c3912f";
  const bodyFont = safeFont(style.font_body || page.font_body || "DM Sans");
  const headingFont = safeFont(style.font_heading || page.font_heading || "Fraunces");
  const width = Math.min(1600, Math.max(720, Number(page.content_width) || 1180));
  const nav = leftNav.length ? `<aside class="managed-left-nav"><strong>On this page</strong>${leftNav.map(item=>`<a href="#${escapeAttr(item.id)}">${escapeHtml(item.label)}</a>`).join("")}</aside>` : "";
  return `<main id="main-content" class="managed-page" style="--managed-primary:${primary};--managed-accent:${accent};--managed-width:${width}px;--managed-body:${bodyFont};--managed-heading:${headingFont}"><header class="managed-hero"><div><span>Architecting Intelligence</span><h1>${escapeHtml(page.title)}</h1>${page.summary?`<p>${escapeHtml(page.summary)}</p>`:""}</div></header><div class="managed-layout">${nav}<article class="managed-content">${sanitizeManagedHtml(page.body_html)}</article></div></main>`;
}

function renderManagedDocument(page, main, style) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(page.title)} | Architecting Intelligence</title><link rel="stylesheet" href="/assets/css/navigation.css?v=20260726-3"><link rel="stylesheet" href="/assets/css/shared-site-shell.css?v=20260728-5"><script src="/assets/js/navigation.js?v=20260726-3" defer></script><script src="/assets/js/shared-site-shell.js?v=20260728-5" defer></script></head><body><header class="site-header"><div class="utility-bar"><div class="utility-inner"><span>Enterprise AI Transformation Methodology</span><a href="/login">Sign in</a></div></div><div class="header-container"><a class="brand" href="/"><img class="company-logo" src="/assets/images/ratheesh-technology-logo-transparent.png" alt="Ratheesh Technology Ltd."></a><button class="mobile-menu-button" type="button" aria-expanded="false" aria-controls="primary-navigation" aria-label="Open navigation menu"><span></span><span></span><span></span></button><nav id="primary-navigation" class="primary-navigation" aria-label="Primary navigation"></nav></div></header>${main}<footer></footer></body></html>`;
}

async function serveAdmin(request, env, url) {
  const user = await currentUser(request, env);
  if (!user) return Response.redirect(new URL("/login?next=/admin", url), 302);
  if (user.role !== "admin") return new Response("Administrator access required.", { status: 403 });
  return env.ASSETS.fetch(request);
}

async function startGoogleAuth(request, env, url) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return Response.redirect(new URL("/login?google=unavailable", url), 302);
  const state = randomToken(32);
  const verifier = randomToken(48);
  const challenge = await sha256(verifier);
  const next = safeNext(url.searchParams.get("next"));
  const redirectUri = `${url.origin}/api/auth/google/callback`;
  const authorization = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorization.search = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  const headers = new Headers({ Location: authorization.toString(), "Cache-Control": "no-store" });
  appendCookie(headers, oauthCookie("google_oauth_state", state, 600));
  appendCookie(headers, oauthCookie("google_oauth_verifier", verifier, 600));
  appendCookie(headers, oauthCookie("google_oauth_next", next, 600));
  return new Response(null, { status: 302, headers });
}

async function finishGoogleAuth(request, env, url) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return Response.redirect(new URL("/login?google=unavailable", url), 302);
  const state = url.searchParams.get("state") || "";
  const expectedState = cookieValue(request, "google_oauth_state") || "";
  const verifier = cookieValue(request, "google_oauth_verifier") || "";
  const next = safeNext(cookieValue(request, "google_oauth_next"));
  if (!state || !expectedState || !verifier || !(await constantTimeEqual(state, expectedState))) {
    return Response.redirect(new URL("/login?google=invalid_state", url), 302);
  }
  if (url.searchParams.get("error")) return Response.redirect(new URL("/login?google=cancelled", url), 302);
  const code = url.searchParams.get("code");
  if (!code) return Response.redirect(new URL("/login?google=failed", url), 302);

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${url.origin}/api/auth/google/callback`,
      grant_type: "authorization_code",
      code_verifier: verifier,
    }),
  });
  if (!tokenResponse.ok) return Response.redirect(new URL("/login?google=failed", url), 302);
  const tokens = await tokenResponse.json();
  if (!tokens.access_token) return Response.redirect(new URL("/login?google=failed", url), 302);

  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}`, Accept: "application/json" },
  });
  if (!profileResponse.ok) return Response.redirect(new URL("/login?google=failed", url), 302);
  const profile = await profileResponse.json();
  const email = normalizeEmail(profile.email);
  const googleSub = String(profile.sub || "").slice(0, 255);
  const name = String(profile.name || email.split("@")[0]).trim().slice(0, 100);
  if (!googleSub || !validEmail(email) || profile.email_verified !== true) return Response.redirect(new URL("/login?google=unverified", url), 302);

  let user = await env.DB.prepare("SELECT * FROM users WHERE google_sub=? OR email=? ORDER BY google_sub IS NOT NULL DESC LIMIT 1").bind(googleSub, email).first();
  if (!user) {
    const config = await getConfig(env);
    if (!config.registration_enabled) return Response.redirect(new URL("/login?google=registration_closed", url), 302);
    const role = isAdminEmail(email, env) ? "admin" : "member";
    const unusablePassword = randomToken(48);
    const result = await env.DB.prepare(`INSERT INTO users(name,email,password_hash,password_salt,role,google_sub,auth_provider)
      VALUES(?,?,?,?,?,?,?)`).bind(name, email, unusablePassword, randomToken(16), role, googleSub, "google").run();
    user = { id: Number(result.meta.last_row_id), name, email, role, status: "active" };
  } else {
    if (user.status !== "active") return Response.redirect(new URL("/login?google=disabled", url), 302);
    await env.DB.prepare("UPDATE users SET google_sub=?,auth_provider=CASE WHEN auth_provider='password' THEN 'password+google' ELSE auth_provider END,last_login_at=CURRENT_TIMESTAMP WHERE id=?")
      .bind(googleSub, user.id).run();
  }

  const session = await createSession(env, user.id);
  const headers = new Headers({ Location: new URL(next, url).toString(), "Cache-Control": "no-store" });
  appendCookie(headers, sessionCookie(session.token, session.expires));
  appendCookie(headers, clearOauthCookie("google_oauth_state"));
  appendCookie(headers, clearOauthCookie("google_oauth_verifier"));
  appendCookie(headers, clearOauthCookie("google_oauth_next"));
  return new Response(null, { status: 302, headers });
}

async function getConfig(env) {
  const rows = await env.DB.prepare("SELECT key,value FROM portal_config").all();
  const config = { ...DEFAULT_CONFIG };
  for (const row of rows.results) {
    try { config[row.key] = JSON.parse(row.value); } catch { config[row.key] = row.value; }
  }
  return validateConfig(config);
}

function validateConfig(input) {
  const publicPaths = Array.isArray(input.public_paths) ? input.public_paths.filter((p) => typeof p === "string" && p.startsWith("/")).slice(0, 100) : DEFAULT_CONFIG.public_paths;
  for (const required of DEFAULT_CONFIG.public_paths) if (!publicPaths.includes(required)) publicPaths.push(required);
  return {
    registration_enabled: input.registration_enabled !== false,
    public_paths: publicPaths,
    preview_words: Math.min(300, Math.max(25, Number(input.preview_words) || 85)),
    copy_deterrence_enabled: input.copy_deterrence_enabled !== false,
  };
}

function validateMenu(input) {
  if (!Array.isArray(input) || !input.length) throw new Error("Navigation must contain at least one item.");
  if (input.length > 200) throw new Error("Navigation cannot contain more than 200 items.");
  const items = input.map((item, index) => ({
    key: String(item.key || index),
    parentKey: item.parentKey === null || item.parentKey === undefined || item.parentKey === "" ? null : String(item.parentKey),
    label: String(item.label || "").trim().slice(0, 80),
    url: String(item.url || "").trim().slice(0, 500),
    position: Number.isInteger(Number(item.position)) ? Number(item.position) : index,
    visibility: item.visibility === "hidden" ? "hidden" : "visible",
  }));
  if (items.some(item => !item.label || (!item.url && item.parentKey === null) || (item.url && !item.url.startsWith("/") && !/^https:\/\//i.test(item.url)))) {
    throw new Error("Every navigation item requires a label and a safe relative or HTTPS URL.");
  }
  const keys = new Set(items.map(item => item.key));
  if (keys.size !== items.length) throw new Error("Navigation item keys must be unique.");
  if (items.some(item => item.parentKey !== null && (!keys.has(item.parentKey) || item.parentKey === item.key))) throw new Error("Every child must reference a valid parent.");
  const childKeys = new Set(items.filter(item => item.parentKey !== null).map(item => item.key));
  if (items.some(item => item.parentKey !== null && childKeys.has(item.parentKey))) throw new Error("Navigation supports one submenu level only.");
  return items;
}

function menuItemsToNavigation(items) {
  return items.filter(item => item.parentKey === null).sort((a,b) => a.position-b.position).map(root => ({
    key: root.key, label: root.label, href: root.url, position: root.position, visibility: root.visibility,
    children: items.filter(item => item.parentKey === root.key).sort((a,b) => a.position-b.position).map(child => ({
      key: child.key, label: child.label, href: child.url, position: child.position, visibility: child.visibility,
    })),
  }));
}

function normalizeNavigation(payload) {
  const roots = Array.isArray(payload?.navigation) ? payload.navigation : [];
  return roots.slice(0,100).map((root,index) => ({
    key: String(root.key || `root-${index+1}`), label: String(root.label || "").trim().slice(0,80),
    href: String(root.href || "").trim().slice(0,500), position: Number(root.position) || index+1,
    visibility: root.visibility === "hidden" ? "hidden" : "visible",
    children: (Array.isArray(root.children) ? root.children : []).slice(0,100).map((child,childIndex) => ({
      key: String(child.key || `child-${index+1}-${childIndex+1}`), label: String(child.label || "").trim().slice(0,80),
      href: String(child.href || "").trim().slice(0,500), position: Number(child.position) || childIndex+1,
      visibility: child.visibility === "hidden" ? "hidden" : "visible",
    })),
  })).filter(root => root.label && root.href).sort((a,b) => a.position-b.position);
}

function flattenNavigation(navigation) {
  const items=[];
  for (const root of navigation) {
    items.push({ id:root.key, key:root.key, label:root.label, url:root.href, parent_id:null, parentKey:null, position:root.position, visibility:root.visibility });
    for (const child of root.children || []) items.push({ id:child.key, key:child.key, label:child.label, url:child.href, parent_id:root.key, parentKey:root.key, position:child.position, visibility:child.visibility });
  }
  return items;
}

async function getPublishedNavigation(env,{ user=null,includeShowcase=true }={}) {
  const row = await env.DB.prepare("SELECT version_number,schema_version,source,payload_json FROM navigation_versions WHERE status='published' ORDER BY version_number DESC LIMIT 1").first();
  if (!row) throw new Error("No published navigation version exists.");
  const payload = safeJsonValue(row.payload_json, {});
  let navigation = normalizeNavigation(payload);
  if (!navigation.length) throw new Error("Published navigation is invalid.");
  if (includeShowcase) navigation = await integrateShowcaseNavigation(env,navigation,user);
  if (includeShowcase) navigation = await integratePeopleNavigation(env,navigation);
  return { version:Number(row.version_number), schemaVersion:Number(row.schema_version || 1), source:row.source, navigation };
}

async function integratePeopleNavigation(env,navigation){
  const published=await env.DB.prepare(`SELECT COUNT(*) count FROM people_profiles WHERE status='published' AND is_active=1 AND show_on_leadership=1`).first();
  return navigation.map(root=>{
    if(root.href!=="/pages/about.html")return root;
    const seen=new Set((root.children||[]).map(child=>child.href));
    const additions=Number(published?.count)&&!seen.has("/about/leadership")?[{key:"about-leadership",label:"Leadership",href:"/about/leadership",position:20,visibility:"visible"}]:[];
    return {...root,children:[...(root.children||[]),...additions]};
  });
}

async function integrateShowcaseNavigation(env,navigation,user) {
  const rows=await env.DB.prepare(`SELECT stable_id,content_type,slug,title,target_url,legacy_url,display_order,visibility,status,include_in_navigation
    FROM showcase_items ORDER BY display_order,id`).all();
  const managedUrls=new Set(rows.results.map(item=>item.content_type==="demo"?item.target_url:(item.legacy_url||`/case-studies/#${item.slug}`)).filter(url=>url&&url!=="/case-studies/"));
  const allowed=item=>item.status==="published"&&Number(item.include_in_navigation)&&
    (item.visibility==="public"||(item.visibility==="authenticated"&&user)||(item.visibility==="restricted"&&user?.role==="admin"));
  return navigation.map(root=>{
    if (root.href!=="/case-studies/") return root;
    const retained=(root.children||[]).filter(child=>!managedUrls.has(child.href));
    const published=rows.results.filter(allowed);const caseStudies=published.filter(item=>item.content_type==="case_study");
    const additions=published.map(item=>({
      key:`showcase-${item.stable_id}`,
      label:item.content_type==="case_study"?`Case Study ${String(caseStudies.indexOf(item)+1).padStart(2,"0")} — ${item.title.replace(/^Case Study\s*\d+\s*[—–-]?\s*/i,"")}`:item.title,
      href:item.content_type==="demo"?item.target_url:(item.legacy_url||`/case-studies/#${item.slug}`),
      position:(item.content_type==="case_study"?1000:2000)+Number(item.display_order||0),visibility:"visible",group:item.content_type==="case_study"?"Case Studies":"Demos",
    }));
    const seen=new Set();
    return { ...root,children:[...retained,...additions].filter(child=>child.href&&!seen.has(child.href)&&seen.add(child.href)) };
  });
}

async function getPublicShowcase(env,user,{ type=null,previewId=null }={}) {
  let preview=false;
  let where="s.status='published'";
  const bindings=[];
  if (previewId) {
    const allowed=await hasPermission(user,env,"showcase.manage");
    if (allowed) { where="s.id=?";bindings.push(Number(previewId));preview=true; }
  }
  if (type) { where+=`${bindings.length?" AND":" AND"} s.content_type=?`;bindings.push(type); }
  const rows=await env.DB.prepare(`SELECT s.*,a.file_name,a.object_key,a.content_type file_content_type,a.size_bytes,
    a.version_label,a.download_enabled,a.watermark_enabled,a.created_at file_uploaded_at
    FROM showcase_items s LEFT JOIN library_assets a ON a.id=s.asset_id
    WHERE ${where} ORDER BY s.featured DESC,s.display_order,s.id`).bind(...bindings).all();
  const visible=rows.results.filter(item=>preview||item.visibility==="public"||(item.visibility==="authenticated"&&user)||(item.visibility==="restricted"&&user?.role==="admin"));
  const media=await getShowcaseMedia(env,visible.map(item=>item.id),false);
  return { preview,items:visible.map(item=>({...serializeShowcaseItem(item,user),media:media.get(item.id)||[]})) };
}

async function getShowcaseMedia(env,ids,admin=false){
  const result=new Map();if(!ids.length)return result;
  const placeholders=ids.map(()=>"?").join(",");
  const rows=await env.DB.prepare(`SELECT sm.*,a.file_name,a.object_key,a.content_type,a.size_bytes,a.created_at uploaded_at
    FROM showcase_media sm JOIN library_assets a ON a.id=sm.asset_id
    WHERE sm.showcase_id IN (${placeholders}) AND (?=1 OR a.status='published') ORDER BY sm.display_order,sm.id`).bind(...ids,admin?1:0).all();
  for(const item of rows.results){const list=result.get(item.showcase_id)||[];list.push({id:item.id,asset_type:item.asset_type,alt_text:item.alt_text,caption:item.caption,url:`/showcase-media/${item.id}`,file_name:item.file_name,content_type:item.content_type,size_bytes:Number(item.size_bytes),uploaded_at:item.uploaded_at,object_key:admin?item.object_key:undefined});result.set(item.showcase_id,list)}
  return result;
}

function serializePerson(item){return {id:item.id,stable_id:item.stable_id,slug:item.slug||item.stable_id,name:item.name,display_name:item.display_name,first_name:item.first_name||"",middle_name:item.middle_name||"",last_name:item.last_name||"",designation:item.designation,capability_line:item.capability_line||"",leadership_category:item.leadership_category||"Executive Leadership",person_type:item.person_type||"Executive",short_bio:item.short_bio,full_bio:item.full_bio,email:item.email,phone:item.phone,linkedin_url:item.linkedin_url,website_url:item.website_url||"",profile_image_url:item.photo_media_id?`/leadership-media/${item.id}`:item.profile_image_url,photo_alt_text:item.photo_alt_text||item.display_name,photo:{object_key:item.photo_object_key||null,file_name:item.photo_file_name||null,content_type:item.photo_content_type||null,size_bytes:Number(item.photo_size_bytes||0),uploaded_at:item.photo_uploaded_at||null},specialties:safeJsonValue(item.specialties_json,[]),location:item.location,cta_label:item.cta_label,cta_url:item.cta_url,display_order:Number(item.display_order),is_active:Boolean(item.is_active),public_visibility:Boolean(item.public_visibility),show_on_leadership:Boolean(item.show_on_leadership),featured_homepage:Boolean(item.featured_homepage),status:item.status||"published",email_public:Boolean(item.email_public),phone_public:Boolean(item.phone_public),linkedin_public:Boolean(item.linkedin_public),website_public:Boolean(item.website_public)}}
function serializePersonPublic(item){const person=serializePerson(item);if(!person.email_public)person.email="";if(!person.phone_public)person.phone="";if(!person.linkedin_public)person.linkedin_url="";if(!person.website_public)person.website_url="";delete person.photo.object_key;return person}

function serializeShowcaseItem(item,user,{ admin=false,r2=null }={}) {
  const assetDownload=item.asset_id?`/library-downloads/${item.asset_id}`:item.static_download_url;
  const canDownload=Boolean(assetDownload)&&(item.asset_id?Number(item.download_enabled)||user?.role==="admin":true);
  const result={
    id:item.id,stable_id:item.stable_id,content_type:item.content_type,slug:item.slug,title:item.title,
    description:item.description,category:item.category,cover_image_url:item.cover_image_url,
    target_url:item.target_url,legacy_url:item.legacy_url,tags:safeJsonValue(item.tags_json,[]),
    outcomes:safeJsonValue(item.outcomes_json,[]),related_links:safeJsonValue(item.related_links_json,[]),
    featured:Boolean(item.featured),display_order:Number(item.display_order),include_in_navigation:Boolean(item.include_in_navigation),
    visibility:item.visibility,status:item.status,published_at:item.published_at,updated_at:item.updated_at,
    download_url:canDownload?assetDownload:null,file_name:item.file_name||item.static_file_name||null,
    content_type_file:item.file_content_type||item.static_content_type||null,size_bytes:Number(item.size_bytes||item.static_size_bytes||0),
    version_label:item.version_label||null,
  };
  if (admin) result.file={
    storage_provider:item.asset_id?"R2":"Static asset",object_key:item.object_key||item.static_download_url||null,
    file_name:result.file_name,size_bytes:r2?.size??result.size_bytes,content_type:r2?.httpMetadata?.contentType||result.content_type_file,
    uploaded_at:r2?.uploaded?.toISOString?.()||item.file_uploaded_at||item.created_at,
    review_route:item.asset_id?`/admin-library-downloads/${item.asset_id}`:item.static_download_url||null,
    authorized_download_url:canDownload?assetDownload:null,download_enabled:item.asset_id?Boolean(item.download_enabled):Boolean(item.static_download_url),
    watermark_requested:Boolean(item.watermark_enabled),watermark_processing:"not_implemented",
  };
  return result;
}

async function hasPermission(user,env,permission) {
  if (!user) return false;
  if (user.role==="admin"&&isAdminEmail(user.email,env)) return true;
  const rows=await env.DB.prepare(`SELECT r.permissions_json FROM user_access_roles ur JOIN access_roles r ON r.id=ur.role_id WHERE ur.user_id=?`).bind(user.id).all();
  return rows.results.some(row=>safeJsonValue(row.permissions_json,[]).includes(permission));
}

async function publishNavigation(env, actor, navigation, changeNote) {
  const payload = { schemaVersion:1, navigation:normalizeNavigation({ navigation }) };
  if (!payload.navigation.length) throw new Error("A valid root navigation item is required.");
  const payloadJson = JSON.stringify(payload);
  const contentHash = await sha256(payloadJson);
  const next = await env.DB.prepare("SELECT COALESCE(MAX(version_number),0)+1 AS version_number FROM navigation_versions").first();
  const version = Number(next?.version_number || 1);
  const validation = { valid:true, rootCount:payload.navigation.length, itemCount:flattenNavigation(payload.navigation).length };
  const draft = await env.DB.prepare(`INSERT INTO navigation_versions
    (version_number,status,schema_version,source,payload_json,content_hash,change_note,validation_json,created_by)
    VALUES(?,'draft',1,'admin',?,?,?,?,?)`).bind(version,payloadJson,contentHash,String(changeNote||"").slice(0,500),JSON.stringify(validation),actor.id).run();
  const id = Number(draft.meta.last_row_id);
  try {
    await env.DB.batch([
      env.DB.prepare("UPDATE navigation_versions SET status='superseded' WHERE status='published'"),
      env.DB.prepare("UPDATE navigation_versions SET status='published',published_by=?,published_at=CURRENT_TIMESTAMP WHERE id=? AND status='draft'").bind(actor.id,id),
    ]);
  } catch (error) {
    await env.DB.prepare("UPDATE navigation_versions SET status='failed',validation_json=? WHERE id=? AND status='draft'")
      .bind(JSON.stringify({ ...validation, valid:false, error:"Publication transaction failed." }),id).run().catch(()=>{});
    throw error;
  }
  await auditAdmin(env,actor.id,"navigation.published","navigation",id,{ version,content_hash:contentHash });
  return { version, contentHash };
}

function buildPageCatalog(managedPages, accessRows) {
  const accessByPath = new Map(accessRows.map(row => [row.path, row]));
  const managedByPath = new Map();
  for (const page of managedPages) {
    const pagePath = page.source_path === "/index.html" ? "/" : page.source_path || `/pages/${page.slug}.html`;
    managedByPath.set(pagePath, page);
  }
  const catalog = STATIC_CONTENT_PAGES.map(staticPage => {
    const managed = managedByPath.get(staticPage.path);
    const access = accessByPath.get(staticPage.path);
    managedByPath.delete(staticPage.path);
    return {
      path: staticPage.path,
      source_path: staticPage.source_path || staticPage.path,
      title: managed?.title || access?.title || staticPage.title,
      managed_id: managed?.id || null,
      status: managed?.status || "static",
      visibility: access?.visibility || "visible",
      requires_sign_in: Number(access?.requires_sign_in ?? !DEFAULT_CONFIG.public_paths.includes(staticPage.path)),
      updated_at: managed?.updated_at || access?.updated_at || null,
    };
  });
  for (const [pagePath, managed] of managedByPath) {
    const access = accessByPath.get(pagePath);
    catalog.push({
      path: pagePath,
      source_path: managed.source_path || pagePath,
      title: managed.title,
      managed_id: managed.id,
      status: managed.status,
      visibility: access?.visibility || "visible",
      requires_sign_in: Number(access?.requires_sign_in ?? 1),
      updated_at: managed.updated_at,
    });
  }
  return catalog.sort((a, b) => a.title.localeCompare(b.title));
}

async function getPageAccess(env, path) {
  const pagePath = canonicalAccessPath(path);
  if (!pagePath) return null;
  return env.DB.prepare("SELECT path,title,visibility,requires_sign_in FROM page_access WHERE path=?").bind(pagePath).first();
}

async function ensurePageAccess(env, page) {
  const pagePath = page.source_path === "/index.html" ? "/" : page.source_path || `/pages/${page.slug}.html`;
  const requiresSignIn = DEFAULT_CONFIG.public_paths.includes(pagePath) ? 0 : 1;
  await env.DB.prepare(`INSERT OR IGNORE INTO page_access(path,title,visibility,requires_sign_in)
    VALUES(?,?,'visible',?)`).bind(pagePath, page.title, requiresSignIn).run();
}

function validatePage(input) {
  const title = String(input.title || "").trim().slice(0, 160);
  const slug = String(input.slug || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 120);
  if (!title || !slug) throw new Error("Page title and slug are required.");
  return {
    title, slug,
    source_path: safePagePath(input.source_path) || null,
    template_id: Number(input.template_id) || null,
    status: validWorkflowState(input.workflow_state || input.status) === "published" ? "published" : "draft",
    workflow_state: validWorkflowState(input.workflow_state || input.status),
    summary: String(input.summary || "").trim().slice(0, 500),
    body_html: sanitizeManagedHtml(String(input.body_html || "")).slice(0, 500000),
    left_nav: Array.isArray(input.left_nav) ? input.left_nav.slice(0, 50).map(item => ({ label: String(item.label || "").trim().slice(0, 80), id: String(item.id || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80) })).filter(item => item.label && item.id) : [],
    style: {
      font_body: safeFont(input.style?.font_body || "DM Sans"),
      font_heading: safeFont(input.style?.font_heading || "Fraunces"),
      primary: safeColor(input.style?.primary) || "#08264a",
      accent: safeColor(input.style?.accent) || "#c3912f",
    },
    seo_title: String(input.seo_title || "").trim().slice(0,70),
    seo_description: String(input.seo_description || "").trim().slice(0,180),
    canonical_url: safeCanonicalUrl(input.canonical_url),
    hero: {
      headline: String(input.hero?.headline || "").trim().slice(0,180),
      description: String(input.hero?.description || "").trim().slice(0,500),
      image: safeAssetPath(input.hero?.image),
    },
    related_pages: Array.isArray(input.related_pages) ? input.related_pages.map(safeAccessPath).filter(Boolean).slice(0,30) : [],
    scheduled_publish_at: safeDateTime(input.scheduled_publish_at),
    change_note: String(input.change_note || "").trim().slice(0,500),
  };
}

async function savePageAdministration(env, pageId, page, actorId, previousState) {
  const nextVersion = await env.DB.prepare("SELECT COALESCE(MAX(version_number),0)+1 next_version FROM content_versions WHERE page_id=?").bind(pageId).first();
  const metadata = {
    seo_title: page.seo_title, seo_description: page.seo_description, canonical_url: page.canonical_url,
    hero: page.hero, related_pages: page.related_pages,
  };
  await env.DB.prepare(`INSERT INTO content_versions(page_id,version_number,title,summary,body_html,metadata_json,change_note,created_by)
    VALUES(?,?,?,?,?,?,?,?)`).bind(pageId,Number(nextVersion?.next_version||1),page.title,page.summary,page.body_html,JSON.stringify(metadata),page.change_note,actorId).run();
  await env.DB.prepare(`INSERT INTO content_page_settings(page_id,workflow_state,seo_title,seo_description,canonical_url,hero_json,
    related_pages_json,scheduled_publish_at,published_at,archived_at,updated_by,updated_at)
    VALUES(?,?,?,?,?,?,?,?,CASE WHEN ?='published' THEN CURRENT_TIMESTAMP ELSE NULL END,
      CASE WHEN ?='archived' THEN CURRENT_TIMESTAMP ELSE NULL END,?,CURRENT_TIMESTAMP)
    ON CONFLICT(page_id) DO UPDATE SET workflow_state=excluded.workflow_state,seo_title=excluded.seo_title,
      seo_description=excluded.seo_description,canonical_url=excluded.canonical_url,hero_json=excluded.hero_json,
      related_pages_json=excluded.related_pages_json,scheduled_publish_at=excluded.scheduled_publish_at,
      published_at=CASE WHEN excluded.workflow_state='published' THEN CURRENT_TIMESTAMP ELSE published_at END,
      archived_at=CASE WHEN excluded.workflow_state='archived' THEN CURRENT_TIMESTAMP ELSE NULL END,
      updated_by=excluded.updated_by,updated_at=CURRENT_TIMESTAMP`).bind(pageId,page.workflow_state,page.seo_title,page.seo_description,
      page.canonical_url,JSON.stringify(page.hero),JSON.stringify(page.related_pages),page.scheduled_publish_at,
      page.workflow_state,page.workflow_state,actorId).run();
  if (previousState !== page.workflow_state) {
    await env.DB.prepare("INSERT INTO content_workflow_events(page_id,from_state,to_state,note,actor_id) VALUES(?,?,?,?,?)")
      .bind(pageId,previousState,page.workflow_state,page.change_note,actorId).run();
  }
  await auditAdmin(env, actorId, "content.version_saved", "page", pageId, { workflow_state: page.workflow_state, version: Number(nextVersion?.next_version||1) });
}

function validateTemplate(input) {
  return {
    name: String(input.name || "").trim().slice(0, 100),
    description: String(input.description || "").trim().slice(0, 500),
    layout: input.layout === "article" ? "article" : "left-nav",
    font_body: safeFont(input.font_body || "DM Sans"),
    font_heading: safeFont(input.font_heading || "Fraunces"),
    color_primary: safeColor(input.color_primary) || "#08264a",
    color_accent: safeColor(input.color_accent) || "#c3912f",
    content_width: Math.min(1600, Math.max(720, Number(input.content_width) || 1180)),
  };
}

function validateResource(input) {
  const get = key => typeof input?.get === "function" ? input.get(key) : input?.[key];
  const title = String(get("title") || "").trim().slice(0, 160);
  if (!title) throw new Error("Resource title is required.");
  return {
    title,
    description: String(get("description") || "").trim().slice(0, 2000),
    category: String(get("category") || "").trim().slice(0, 80),
    status: get("status") === "published" ? "published" : "draft",
    position: Math.min(10000, Math.max(0, Number(get("position")) || 0)),
  };
}

function validateLibraryAsset(form, file) {
  const kind = ["document","image","video","audio","archive","other"].includes(form.get("asset_kind")) ? form.get("asset_kind") : inferAssetKind(file.type);
  const visibility = ["public","authenticated","restricted"].includes(form.get("visibility")) ? form.get("visibility") : "authenticated";
  const title = String(form.get("title") || "").trim().slice(0,160);
  if (!title) throw new Error("Asset title is required.");
  return {
    title,
    description: String(form.get("description") || "").trim().slice(0,2000),
    asset_kind: kind,
    category: String(form.get("category") || "").trim().slice(0,80),
    tags: String(form.get("tags") || "").split(",").map(value=>value.trim()).filter(Boolean).slice(0,40),
    version_label: String(form.get("version_label") || "1.0").trim().slice(0,30),
    visibility,
    related_pages: String(form.get("related_pages") || "").split(/\r?\n/).map(safeAccessPath).filter(Boolean).slice(0,40),
    download_enabled: form.get("download_enabled") ? 1 : 0,
    watermark_enabled: form.get("watermark_enabled") ? 1 : 0,
  };
}

function slugify(value) {
  return String(value||"").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,120)||"item";
}

function safeShowcaseUrl(value,{ cover=false }={}) {
  const text=String(value||"").trim().slice(0,500);
  if(!text)return"";
  if(text.startsWith("/")&&!text.startsWith("//"))return text;
  if(/^https:\/\//i.test(text))return text;
  return cover?"":"";
}

function validateShowcaseInput(input,existing=null) {
  const source=input&&typeof input==="object"?input:{};
  const contentType=existing?.content_type||(["case_study","demo"].includes(source.content_type)?source.content_type:"case_study");
  const title=String(source.title??existing?.title??"").trim().slice(0,160);
  if(!title)throw new Error("Title is required.");
  const targetUrl=safeShowcaseUrl(source.target_url??existing?.target_url??"");
  if(contentType==="demo"&&!targetUrl)throw new Error("A safe internal or HTTPS demo URL is required.");
  const links=(Array.isArray(source.related_links)?source.related_links:safeJsonValue(existing?.related_links_json,[])).slice(0,20).map(link=>({
    label:String(link?.label||"").trim().slice(0,80),url:safeShowcaseUrl(link?.url),
  })).filter(link=>link.label&&link.url);
  return {
    content_type:contentType,slug:existing?.slug||slugify(source.slug||title),title,
    description:String(source.description??existing?.description??"").trim().slice(0,3000),
    category:String(source.category??existing?.category??"").trim().slice(0,100),
    cover_image_url:safeShowcaseUrl(source.cover_image_url??existing?.cover_image_url??"",{ cover:true }),
    target_url:targetUrl,legacy_url:safeShowcaseUrl(source.legacy_url??existing?.legacy_url??""),
    asset_id:Number.isInteger(Number(source.asset_id))&&Number(source.asset_id)>0?Number(source.asset_id):(existing?.asset_id||null),
    tags:(Array.isArray(source.tags)?source.tags:safeJsonValue(existing?.tags_json,[])).map(value=>String(value).trim().slice(0,80)).filter(Boolean).slice(0,40),
    outcomes:(Array.isArray(source.outcomes)?source.outcomes:safeJsonValue(existing?.outcomes_json,[])).map(value=>String(value).trim().slice(0,160)).filter(Boolean).slice(0,20),
    related_links:links,featured:source.featured?1:0,
    display_order:Math.min(100000,Math.max(0,Number(source.display_order??existing?.display_order)||0)),
    include_in_navigation:source.include_in_navigation?1:0,
    visibility:["public","authenticated","restricted"].includes(source.visibility)?source.visibility:(existing?.visibility||"public"),
  };
}

function validatePerson(input){
  const source=input&&typeof input==="object"?input:{};
  const name=String(source.name||"").trim().slice(0,120);if(name.length<2)throw new Error("Name is required.");
  const email=String(source.email||"").trim().toLowerCase().slice(0,180);if(email&&!validEmail(email))throw new Error("Enter a valid email address.");
  const linkedIn=String(source.linkedin_url||"").trim().slice(0,500);if(linkedIn&&!/^https:\/\/(www\.)?linkedin\.com\//i.test(linkedIn))throw new Error("LinkedIn URL must use linkedin.com.");
  const image=safeShowcaseUrl(source.profile_image_url||"",{cover:true});
  return [name,String(source.display_name||name).trim().slice(0,120),String(source.designation||"").trim().slice(0,180),String(source.short_bio||"").trim().slice(0,500),String(source.full_bio||"").trim().slice(0,5000),email,String(source.phone||"").trim().slice(0,60),linkedIn,image,JSON.stringify((Array.isArray(source.specialties)?source.specialties:[]).map(v=>String(v).trim().slice(0,80)).filter(Boolean).slice(0,20)),String(source.location||"").trim().slice(0,120),String(source.cta_label||"").trim().slice(0,80),safeShowcaseUrl(source.cta_url||""),Math.max(0,Number(source.display_order)||0),source.is_active===false?0:1,source.public_visibility===false?0:1];
}

async function uniqueShowcaseSlug(env,requested) {
  const base=slugify(requested);
  for(let suffix=0;suffix<1000;suffix++){
    const candidate=suffix?`${base}-${suffix+1}`:base;
    const existing=await env.DB.prepare("SELECT id FROM showcase_items WHERE slug=?").bind(candidate).first();
    if(!existing)return candidate;
  }
  throw new Error("Unable to allocate a unique showcase slug.");
}

function inferAssetKind(contentType) {
  if (String(contentType).startsWith("image/")) return "image";
  if (String(contentType).startsWith("video/")) return "video";
  if (String(contentType).startsWith("audio/")) return "audio";
  return "document";
}

function buildGovernedAuthoringBrief(topic, audience, objective) {
  return `<article>
  <p><strong>DRAFT — HUMAN REVIEW REQUIRED</strong></p>
  <h1>${escapeHtml(topic)}</h1>
  <p><strong>Audience:</strong> ${escapeHtml(audience)}</p>
  <p><strong>Editorial objective:</strong> ${escapeHtml(objective)}</p>
  <h2>Executive context</h2>
  <p>State the enterprise decision, business pressure and measurable outcome. Separate verified facts from assumptions.</p>
  <h2>Operating model and decision rights</h2>
  <p>Identify the accountable owner, contributors, reviewers, approver and escalation path.</p>
  <h2>Architecture and implementation</h2>
  <p>Explain required capabilities, dependencies, controls, integration boundaries and delivery sequence.</p>
  <h2>Risk, governance and evidence</h2>
  <p>List policy obligations, security controls, evidence sources, unresolved gaps and validation criteria.</p>
  <h2>Measures and next decision</h2>
  <p>Define outcome measures, leading indicators, review cadence and the decision required from the reader.</p>
  <aside><strong>Author checklist:</strong> verify every claim; attach authoritative sources; remove unsupported precision; confirm accessibility; route for approval before publishing.</aside>
</article>`;
}

function validWorkflowState(value) {
  return ["draft","in_review","approved","published","archived"].includes(value) ? value : "draft";
}
function safeCanonicalUrl(value) {
  const text = String(value || "").trim().slice(0,500);
  if (!text) return "";
  try { const url = new URL(text); return url.protocol === "https:" ? url.toString() : ""; } catch { return ""; }
}
function safeAssetPath(value) {
  const path = String(value || "").trim().slice(0,500);
  return /^\/assets\/[a-zA-Z0-9_./-]+$/.test(path) ? path : "";
}
function safeDateTime(value) {
  const text = String(value || "").trim();
  return text && !Number.isNaN(Date.parse(text)) ? new Date(text).toISOString() : null;
}
function parseJsonObject(value) {
  try { const parsed = JSON.parse(value || "{}"); return parsed && typeof parsed === "object" ? parsed : {}; } catch { return {}; }
}
async function auditAdmin(env, actorId, action, entityType, entityId, detail = {}) {
  await env.DB.prepare("INSERT INTO admin_audit_log(actor_id,action,entity_type,entity_id,detail_json) VALUES(?,?,?,?,?)")
    .bind(actorId,action,entityType,entityId === null ? null : String(entityId),JSON.stringify(detail)).run();
}

function canonicalAccessPath(value) {
  const path = String(value || "").trim();
  if (path === "/" || path === "/index.html") return "/";
  if (/^\/pages\/[a-zA-Z0-9_-]+$/.test(path)) return `${path}.html`;
  return /^\/pages\/[a-zA-Z0-9_-]+\.html$/.test(path) ? path : null;
}
function safeAccessPath(value) { return canonicalAccessPath(value); }
function safeEditableSourcePath(value) {
  const path = String(value || "").trim();
  if (path === "/" || path === "/index.html") return path;
  return /^\/pages\/[a-zA-Z0-9_-]+\.html$/.test(path) ? path : null;
}
function safePagePath(value) {
  const path = String(value || "").trim();
  if (path === "/index.html") return path;
  return /^\/pages\/[a-zA-Z0-9_-]+\.html$/.test(path) ? path : null;
}
function assetRoutePath(path) {
  if (path === "/index.html") return "/";
  return path.replace(/\.html$/i, "");
}
function safeColor(value) { return /^#[0-9a-f]{6}$/i.test(String(value || "")) ? String(value) : ""; }
function validateTheme(input) {
  const source = input && typeof input === "object" ? input : {};
  const globalInput = source.global && typeof source.global === "object" ? source.global : {};
  const baseline = APPROVED_THEME.global;
  const pick = (value, allowed, fallback) => allowed.includes(value) ? value : fallback;
  const global = {
    primary: safeColor(globalInput.primary) || baseline.primary, accent: safeColor(globalInput.accent) || baseline.accent,
    background: safeColor(globalInput.background) || baseline.background, surface: safeColor(globalInput.surface) || baseline.surface,
    text: safeColor(globalInput.text) || baseline.text, muted: safeColor(globalInput.muted) || baseline.muted,
    border: safeColor(globalInput.border) || baseline.border,
    navigation_background: safeColor(globalInput.navigation_background) || baseline.navigation_background,
    heading_font: pick(globalInput.heading_font,["Georgia","Arial","DM Sans","Inter","Fraunces"],baseline.heading_font),
    body_font: pick(globalInput.body_font,["Arial","DM Sans","Inter","Georgia"],baseline.body_font),
    base_font_size: pick(globalInput.base_font_size,["15px","16px","17px","18px"],baseline.base_font_size),
    heading_scale: pick(globalInput.heading_scale,["compact","standard","expanded"],baseline.heading_scale),
    spacing_density: pick(globalInput.spacing_density,["compact","standard","spacious"],baseline.spacing_density),
    border_radius: pick(globalInput.border_radius,["0px","4px","8px","14px","20px"],baseline.border_radius),
    shadow_intensity: pick(globalInput.shadow_intensity,["none","low","medium","high"],baseline.shadow_intensity),
  };
  const panelSource = source.panels && typeof source.panels === "object" ? source.panels : {};
  const panels = {};
  for (const key of Object.keys(APPROVED_THEME.panels)) {
    const value = panelSource[key] && typeof panelSource[key] === "object" ? panelSource[key] : {};
    const fallback = APPROVED_THEME.panels[key];
    panels[key] = {
      preset: pick(value.preset,["Light","Dark","Image","Accent","Neutral"],fallback.preset),
      background: safeColor(value.background) || fallback.background, text: safeColor(value.text) || fallback.text,
      heading: safeColor(value.heading) || fallback.heading, accent: safeColor(value.accent) || fallback.accent,
      background_image: safeAssetPath(value.background_image) || "", overlay: Math.max(0,Math.min(90,Number(value.overlay ?? fallback.overlay))),
      mode: pick(value.mode,["light","dark"],fallback.mode), density: pick(value.density,["compact","standard","spacious"],fallback.density),
      heading_size: pick(value.heading_size,["small","standard","emphasis"],fallback.heading_size), border: Boolean(value.border),
      card_treatment: pick(value.card_treatment,["flat","surface","outlined","elevated"],fallback.card_treatment),
      content_width: pick(value.content_width,["narrow","standard","wide"],fallback.content_width),
    };
  }
  return { global, panels };
}
function themeCssVariables(theme) {
  const g = theme.global;
  const heading = {compact:["clamp(2rem,2.8vw,3.15rem)","clamp(1.85rem,2.6vw,2.8rem)","clamp(1.45rem,2vw,2.1rem)"],standard:["clamp(2.15rem,3.2vw,3.5rem)","clamp(2rem,3vw,3.25rem)","clamp(1.6rem,2.2vw,2.4rem)"],expanded:["clamp(2.35rem,3.7vw,4rem)","clamp(2.2rem,3.3vw,3.5rem)","clamp(1.75rem,2.5vw,2.65rem)"]}[g.heading_scale];
  const shadows={none:"none",low:"0 8px 20px rgba(24,24,22,.08)",medium:"0 16px 40px rgba(24,24,22,.12)",high:"0 22px 54px rgba(24,24,22,.18)"};
  const spacing={compact:"64px",standard:"78px",spacious:"94px"};
  const variables={"--theme-primary":g.primary,"--theme-accent":g.accent,"--theme-background":g.background,"--theme-surface":g.surface,"--theme-text":g.text,"--theme-muted":g.muted,"--theme-border":g.border,"--theme-navigation-background":g.navigation_background,"--theme-font-heading":g.heading_font,"--theme-font-body":g.body_font,"--theme-radius":g.border_radius,"--theme-shadow":shadows[g.shadow_intensity],"--theme-space-section":spacing[g.spacing_density],"--font-size-hero":heading[0],"--font-size-page-title":heading[1],"--font-size-section-title":heading[2],"--font-size-card-title":"1.05rem","--font-size-body":g.base_font_size};
  for(const [key,panel] of Object.entries(theme.panels)){const name=key.replace(/_/g,"-");variables[`--theme-panel-${name}-background`]=panel.background;variables[`--theme-panel-${name}-text`]=panel.text;variables[`--theme-panel-${name}-heading`]=panel.heading;variables[`--theme-panel-${name}-accent`]=panel.accent;variables[`--theme-panel-${name}-overlay`]=String(panel.overlay/100)}
  return variables;
}
function themeContrast(theme) {
  const pairs=[["Primary text",theme.global.text,theme.global.background],["Secondary text",theme.global.muted,theme.global.background],["Card text",theme.global.text,theme.global.surface],...Object.entries(theme.panels).map(([key,panel])=>[`${key} text`,panel.text,panel.background])];
  return pairs.map(([label,foreground,background])=>{const ratio=contrastRatio(foreground,background);return{label,foreground,background,ratio:Number(ratio.toFixed(2)),pass:ratio>=4.5}});
}
function contrastRatio(a,b) {
  const luminance=color=>{const rgb=[1,3,5].map(index=>parseInt(color.slice(index,index+2),16)/255).map(value=>value<=.03928?value/12.92:((value+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]};
  const [light,dark]=[luminance(a),luminance(b)].sort((x,y)=>y-x);return(light+.05)/(dark+.05);
}
async function nextThemeVersion(env){const row=await env.DB.prepare("SELECT COALESCE(MAX(version_number),0)+1 next_version FROM theme_versions").first();return Number(row?.next_version||1)}
function safeFont(value) { return String(value || "").replace(/[^a-zA-Z0-9 ,'-]/g, "").slice(0, 80) || "Arial"; }
function safeFileName(value) { return String(value || "download").replace(/[^a-zA-Z0-9._ -]/g, "_").replace(/\s+/g, "-").slice(0, 180); }
function escapeAttr(value) { return escapeHtml(String(value || "")).replace(/`/g, ""); }
function sanitizeManagedHtml(value) {
  return sanitizeHtml(String(value || ""), {
    allowedTags: ["article","aside","blockquote","br","button","code","div","em","figure","figcaption","h1","h2","h3","h4","h5","h6","hr","img","li","main","nav","ol","p","pre","section","small","span","strong","sub","sup","table","tbody","td","th","thead","tr","ul","a"],
    allowedAttributes: {
      "*": ["id","class","role","aria-label","aria-labelledby","aria-describedby","aria-expanded","aria-controls","hidden","title"],
      a: ["href","target","rel"], img: ["src","alt","width","height","loading"],
      button: ["type"], td: ["colspan","rowspan"], th: ["colspan","rowspan","scope"],
    },
    allowedSchemes: ["http","https","mailto"],
    allowedSchemesByTag: { img:["http","https"] },
    allowProtocolRelative: false,
    enforceHtmlBoundary: true,
    transformTags: { a: sanitizeHtml.simpleTransform("a", { rel:"noopener noreferrer" }, true) },
  });
}

async function currentUser(request, env) {
  const token = cookieValue(request, SESSION_COOKIE);
  if (!token) return null;
  return env.DB.prepare(`SELECT u.id,u.name,u.email,u.role,u.status FROM sessions s
    JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>CURRENT_TIMESTAMP AND u.status='active'`)
    .bind(await sha256(token)).first();
}

async function requireAdmin(request, env) {
  return requirePermission(request, env, "dashboard.view");
}

function adminPermissionFor(path, method) {
  if (path === "/api/admin/dashboard" || path === "/api/admin/parity") return "dashboard.view";
  if (path.startsWith("/api/admin/theme")) return method === "GET" ? "theme.manage" : "theme.manage";
  if (path === "/api/admin/config") return "settings.manage";
  if (/^\/api\/admin\/users\/\d+\/roles$/.test(path)) return "roles.manage";
  if (path.startsWith("/api/admin/users/")) return "users.manage";
  if (path === "/api/admin/menu") return "navigation.manage";
  if (/^\/api\/admin\/pages\/\d+\/workflow$/.test(path)) return "dashboard.view";
  if (path === "/api/admin/page-access" || path === "/api/admin/page-source" || path.startsWith("/api/admin/pages") || path.startsWith("/api/admin/templates")) return method === "GET" ? "pages.manage" : "content.edit";
  if (path === "/api/admin/content") return "pages.manage";
  if (path.startsWith("/api/admin/resources") || path.startsWith("/api/admin/library")) return "library.manage";
  if (path.startsWith("/api/admin/showcase")) return "showcase.manage";
  if (path.startsWith("/api/admin/people")) return "people.manage";
  if (path.startsWith("/api/admin/search")) return "search.manage";
  if (path.startsWith("/api/admin/authoring")) return "content.edit";
  return "dashboard.view";
}

async function requirePermission(request, env, permission) {
  const user = await currentUser(request, env);
  if (!user) return json({ error:"Administrator sign-in required." },403);
  const breakGlass = user.role === "admin" && isAdminEmail(user.email,env);
  if (breakGlass) return { ...user, permissions:["*"], break_glass:true };
  const rows = await env.DB.prepare(`SELECT r.permissions_json FROM user_access_roles ur
    JOIN access_roles r ON r.id=ur.role_id WHERE ur.user_id=?`).bind(user.id).all();
  const permissions = new Set(rows.results.flatMap(row => safeJsonValue(row.permissions_json,[])).filter(value => typeof value === "string"));
  if (!permissions.has(permission)) return json({ error:`Permission required: ${permission}.` },403);
  return { ...user, permissions:[...permissions], break_glass:false };
}

async function createSessionResponse(env, userId, user) {
  const session = await createSession(env, userId);
  return json({ user: publicUser(user) }, 200, { "Set-Cookie": sessionCookie(session.token, session.expires) });
}

async function createSession(env, userId) {
  const token = randomToken(32);
  const expires = new Date(Date.now() + 7 * 86400000);
  await env.DB.prepare("INSERT INTO sessions(user_id,token_hash,expires_at) VALUES(?,?,?)")
    .bind(userId, await sha256(token), expires.toISOString()).run();
  return { token, expires };
}

async function logAccess(request, env, path, user) {
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const ipHash = ip && env.IP_HASH_SALT ? await sha256(`${env.IP_HASH_SALT}:${ip}`) : null;
  await env.DB.prepare(`INSERT INTO access_events(user_id,path,ip_hash,country,city,user_agent,referer)
    VALUES(?,?,?,?,?,?,?)`).bind(
      user?.id || null, path, ipHash,
      request.cf?.country || null, request.cf?.city || null,
      (request.headers.get("User-Agent") || "").slice(0, 300),
      (request.headers.get("Referer") || "").slice(0, 500)
    ).run();
}

async function gatedResponse(response, path, wordLimit) {
  const length = Number(response.headers.get("Content-Length") || 0);
  if (length > 2_000_000) return new Response("Content is available after registration.", { status: 403 });
  const html = await response.text();
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (!main) return addPortalHeaders(new Response(html, response));
  const titleMatch = main[1].match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || main[1].match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i);
  const title = plainText(titleMatch?.[1] || html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "Architecting Intelligence");
  const paragraphs = [...main[1].matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((match) => plainText(match[1])).filter(Boolean);
  const sourceText = paragraphs.length ? paragraphs.join(" ") : plainText(main[1]).replace(title, "").trim();
  const words = sourceText.split(/\s+/).filter(Boolean);
  const excerpt = escapeHtml(words.slice(0, wordLimit).join(" "));
  const gate = `<main id="main-content" class="member-excerpt">
    <section class="article-hero platform-page-hero excerpt-hero"><div class="hero-inner">
      <span class="hero-eyebrow">Architecting Intelligence</span><h1>${escapeHtml(title)}</h1>
      <p>${excerpt}${words.length > wordLimit ? "…" : ""}</p>
    </div></section>
    <section class="excerpt-lock"><div class="excerpt-lock-inner"><span class="preview-kicker">Continue with free membership</span>
    <h2>Register to continue reading</h2>
    <p>Create a free account to read the rest of this page and access the portal’s complete implementation frameworks.</p>
    <div><a class="button button-primary" href="/register?next=${encodeURIComponent(path)}">Click here to register</a>
    <a class="button button-secondary" href="/login?next=${encodeURIComponent(path)}">Sign in</a></div></div></section></main>`;
  return addPortalHeaders(new Response(html.replace(main[0], gate), response));
}

function isPublicPath(path, paths) { return paths.includes(path) || paths.includes(path.replace(/\/$/, "") || "/"); }
function redirectWithQuery(url, pathname) {
  const target = new URL(pathname, url);
  target.search = url.search;
  return Response.redirect(target, 308);
}
function isHtml(response) { return (response.headers.get("Content-Type") || "").includes("text/html"); }
function addPortalHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("Content-Security-Policy", "frame-ancestors 'self'");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
function publicUser(user) { return { id: user.id, name: user.name, email: user.email, role: user.role }; }
function normalizeEmail(value) { return String(value || "").trim().toLowerCase().slice(0, 254); }
function isAdminEmail(email, env) {
  const configured = String(env.ADMIN_EMAILS || env.ADMIN_EMAIL || "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);
  return configured.includes(normalizeEmail(email));
}
function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
function randomToken(bytes) { const a = new Uint8Array(bytes); crypto.getRandomValues(a); return bytesToBase64Url(a); }
async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: 100000 }, key, 256);
  return bytesToBase64Url(new Uint8Array(bits));
}
async function sha256(value) { return bytesToBase64Url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))); }
async function constantTimeEqual(a, b) {
  const aa = new TextEncoder().encode(a), bb = new TextEncoder().encode(b);
  if (aa.length !== bb.length) return false;
  let diff = 0; for (let i = 0; i < aa.length; i++) diff |= aa[i] ^ bb[i];
  return diff === 0;
}
function bytesToBase64Url(bytes) { return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
function cookieValue(request, name) {
  const match = (request.headers.get("Cookie") || "").match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}
function sessionCookie(token, expires) { return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; Expires=${expires.toUTCString()}; HttpOnly; Secure; SameSite=Strict`; }
function expiredSessionCookie() { return `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`; }
function oauthCookie(name, value, maxAge) { return `${name}=${encodeURIComponent(value)}; Path=/api/auth/google; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`; }
function clearOauthCookie(name) { return `${name}=; Path=/api/auth/google; Max-Age=0; HttpOnly; Secure; SameSite=Lax`; }
function appendCookie(headers, value) { headers.append("Set-Cookie", value); }
function safeNext(value) { return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/"; }
function assertSameOrigin(request) {
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) throw new Error("Invalid request origin.");
}
async function readJson(request) {
  if (!(request.headers.get("Content-Type") || "").includes("application/json")) throw new Error("Expected JSON.");
  return request.json();
}
function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extraHeaders } });
}
function decodeEntities(value) { return value.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'"); }

export { sanitizeManagedHtml };
function plainText(value) { return decodeEntities(String(value || "").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()); }
function escapeHtml(value) { return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }
