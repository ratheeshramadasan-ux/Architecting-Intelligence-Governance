import fs from "node:fs";
import path from "node:path";

const root = path.resolve("greenfield-portal");
const output = path.resolve("docs/enterprise-ai-transformation/phase-0-information-architecture");
const dataDir = path.join(output, "data");
fs.mkdirSync(dataDir, { recursive: true });

const productionRootPages = ["index.html", "admin.html", "login.html", "register.html"];
const contentPages = fs.readdirSync(path.join(root, "pages"))
  .filter(name => name.endsWith(".html") && !name.endsWith(".bak") && !name.includes("_test"))
  .sort();
const pageFiles = [...productionRootPages, ...contentPages.map(name => `pages/${name}`)];
const htmlEntity = value => value
  .replace(/&amp;/g, "&").replace(/&mdash;/g, "—").replace(/&ndash;/g, "–")
  .replace(/&middot;/g, "·").replace(/&#8594;/g, "→").replace(/&#x27;/g, "'")
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const text = value => htmlEntity(String(value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
const csv = value => `"${String(value ?? "").replaceAll('"', '""')}"`;

const dispositions = {
  "index.html": ["retain", "Home", "Enterprise AI Transformation", "/"],
  "pages/about.html": ["move", "Knowledge Centre", "About the Methodology and Author", "/knowledge-centre/about"],
  "pages/agentic-ai.html": ["split", "Stage 4 — Establish Governance", "Agent Risk Management", "/transformation/stage-4-establish-governance/agent-risk-management"],
  "pages/ai-adoption.html": ["split", "Stage 3 — Define Strategy", "Enterprise AI Adoption Strategy", "/transformation/stage-3-define-strategy/ai-adoption-strategy"],
  "pages/ai-architecture.html": ["split", "Stage 7 — Design the Target Architecture", "Enterprise AI Control-Plane Architecture", "/transformation/stage-7-design-target-architecture/ai-control-plane"],
  "pages/ai-automation-spectrum.html": ["move", "Knowledge Centre", "AI and Automation Autonomy Spectrum", "/knowledge-centre/ai-automation-autonomy-spectrum"],
  "pages/ai-governance.html": ["merge", "Stage 4 — Establish Governance", "AI Governance Operating Model", "/transformation/stage-4-establish-governance/operating-model"],
  "pages/ai-infrastructure-architecture.html": ["split", "Stage 7 — Design the Target Architecture", "AI Infrastructure Architecture", "/transformation/stage-7-design-target-architecture/infrastructure-architecture"],
  "pages/ai-rpa-prioritization.html": ["move", "Stage 5 — Identify and Prioritise Opportunities", "Opportunity Prioritisation Model", "/transformation/stage-5-prioritise-opportunities/prioritisation-model"],
  "pages/ai-technology-glossary.html": ["retain", "Knowledge Centre", "AI and Technology Glossary", "/knowledge-centre/glossary"],
  "pages/architecture.html": ["merge", "Stage 7 — Design the Target Architecture", "Target Architecture Overview", "/transformation/stage-7-design-target-architecture"],
  "pages/assurance.html": ["merge", "Stage 12 — Operate and Govern Production", "AI Assurance and Control Testing", "/transformation/stage-12-operate-govern-production/assurance"],
  "pages/automation.html": ["move", "Knowledge Centre", "Intelligent Automation Framework", "/knowledge-centre/intelligent-automation"],
  "pages/contact.html": ["retain", "Utility", "Contact", "/contact"],
  "pages/data-security.html": ["split", "Stage 7 — Design the Target Architecture", "Data Security and Privacy Architecture", "/transformation/stage-7-design-target-architecture/data-security"],
  "pages/document-processing.html": ["move", "Knowledge Centre", "Intelligent Document Processing Pattern", "/knowledge-centre/document-processing"],
  "pages/executive-career-portfolio.html": ["archive", "About", "Executive Career Portfolio", "/about/executive-career-portfolio"],
  "pages/governance-integration.html": ["merge", "Stage 4 — Establish Governance", "Integrated AI Governance Model", "/transformation/stage-4-establish-governance/integrated-governance"],
  "pages/greenfield-implementation.html": ["split", "Stage 8 — Plan Implementation", "Greenfield AI Implementation Blueprint", "/transformation/stage-8-plan-implementation/greenfield-blueprint"],
  "pages/knowledge-discovery.html": ["retain", "Knowledge Centre", "Knowledge Discovery", "/knowledge-centre/search"],
  "pages/operational-risk.html": ["move", "Stage 12 — Operate and Govern Production", "Operational and Behavioural Risk", "/transformation/stage-12-operate-govern-production/operational-risk"],
  "pages/resources.html": ["move", "Deliverables", "Deliverable and Template Catalogue", "/deliverables"],
  "pages/security-review.html": ["merge", "Stage 7 — Design the Target Architecture", "Security Architecture Review", "/transformation/stage-7-design-target-architecture/security-review"],
  "pages/solutions.html": ["split", "Stage 5 — Identify and Prioritise Opportunities", "AI Opportunity Patterns", "/transformation/stage-5-prioritise-opportunities/opportunity-patterns"],
  "pages/vendor-assurance.html": ["move", "Stage 4 — Establish Governance", "Third-Party AI Assurance", "/transformation/stage-4-establish-governance/vendor-assurance"],
};

const inventory = pageFiles.map(relative => {
  const html = fs.readFileSync(path.join(root, relative), "utf8");
  const title = text(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]);
  const heading = text(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]);
  const description = text(html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)/i)?.[1]);
  const links = [...html.matchAll(/\bhref=["']([^"'#]+)(?:#[^"']*)?["']/gi)].map(match => match[1]);
  const localLinks = links.filter(link => !/^(?:https?:|mailto:|tel:|data:)/i.test(link));
  const externalLinks = links.length - localLinks.length;
  const downloads = links.filter(link => link.includes("/downloads/") || /\.(?:pdf|docx|xlsx|csv)$/i.test(link));
  const disposition = dispositions[relative] || ["retain", "Utility", heading || title, relative === "index.html" ? "/" : `/${relative}`];
  return {
    route: relative === "index.html" ? "/" : `/${relative}`,
    source_file: relative,
    title, h1: heading, description,
    page_type: productionRootPages.includes(relative) ? (relative === "index.html" ? "landing" : "application") : "guidance",
    status: "current",
    local_link_count: localLinks.length,
    external_link_count: externalLinks,
    download_link_count: downloads.length,
    migration_action: disposition[0],
    future_location: disposition[1],
    proposed_name: disposition[2],
    proposed_route: disposition[3],
  };
});

const inventoryHeaders = Object.keys(inventory[0]);
fs.writeFileSync(path.join(dataDir, "current-content-inventory.csv"),
  [inventoryHeaders.map(csv).join(","), ...inventory.map(row => inventoryHeaders.map(key => csv(row[key])).join(","))].join("\n"));

const migrationHeaders = ["current_route","current_name","action","future_location","proposed_name","proposed_route","redirect_required","notes"];
const migrationRows = inventory.map(item => ({
  current_route: item.route, current_name: item.h1 || item.title, action: item.migration_action,
  future_location: item.future_location, proposed_name: item.proposed_name, proposed_route: item.proposed_route,
  redirect_required: item.route === item.proposed_route ? "no" : "yes",
  notes: item.migration_action === "split" ? "Create child-page plan before moving; retain the current page until approval."
    : item.migration_action === "merge" ? "Merge into the canonical destination after content-level review."
    : item.migration_action === "archive" ? "Remove from normal methodology navigation; retain an accessible archive route."
    : "Preserve content and map it to the future hierarchy.",
}));
fs.writeFileSync(path.join(dataDir, "article-migration-matrix.csv"),
  [migrationHeaders.map(csv).join(","), ...migrationRows.map(row => migrationHeaders.map(key => csv(row[key])).join(","))].join("\n"));

const redirects = migrationRows.filter(row => row.redirect_required === "yes").map(row => ({
  source: row.current_route,
  destination: row.proposed_route,
  status: "planned-not-implemented",
  redirect_type: "permanent-after-approval",
  prerequisite: "Destination published and migration accepted",
  rollback: "Remove route-map entry; current source remains intact",
}));
const redirectHeaders = Object.keys(redirects[0]);
fs.writeFileSync(path.join(dataDir, "route-redirect-register.csv"),
  [redirectHeaders.map(csv).join(","), ...redirects.map(row => redirectHeaders.map(key => csv(row[key])).join(","))].join("\n"));

const downloads = fs.readdirSync(path.join(root, "downloads"))
  .filter(name => !name.startsWith("~$"))
  .map(name => {
    const stat = fs.statSync(path.join(root, "downloads", name));
    return { name, route: `/downloads/${name}`, bytes: stat.size, type: path.extname(name).slice(1).toLowerCase() };
  });
fs.writeFileSync(path.join(dataDir, "download-inventory.csv"),
  ["name,route,bytes,type", ...downloads.map(item => [item.name,item.route,item.bytes,item.type].map(csv).join(","))].join("\n"));

const images = [...["assets/images", "public/assets"].flatMap(folder =>
  fs.readdirSync(path.join(root, folder)).map(name => ({ folder, name, bytes: fs.statSync(path.join(root, folder, name)).size }))
)];
fs.writeFileSync(path.join(dataDir, "visual-asset-inventory.csv"),
  ["folder,name,bytes", ...images.map(item => [item.folder,item.name,item.bytes].map(csv).join(","))].join("\n"));

const summary = {
  generated_at: new Date().toISOString(),
  production_root: root,
  pages: inventory.length,
  content_pages: inventory.filter(item => item.page_type === "guidance").length,
  routes: inventory.length,
  downloads: downloads.length,
  visual_assets: images.length,
  actions: Object.fromEntries(["retain","move","rename","merge","split","archive","retire"].map(action => [action, inventory.filter(item => item.migration_action === action).length])),
};
fs.writeFileSync(path.join(dataDir, "inventory-summary.json"), JSON.stringify(summary, null, 2));

const markdownRows = inventory.map(item =>
  `| \`${item.route}\` | ${item.h1 || item.title} | ${item.page_type} | ${item.migration_action} | ${item.future_location} |`
);
fs.writeFileSync(path.join(output, "01-current-portal-inventory.md"), `# 0.1 Current portal inventory

Generated from the non-production repository by \`scripts/build-phase0-inventory.mjs\`.

## Scope and findings

- ${inventory.length} current application and content pages were inventoried.
- ${downloads.length} downloadable artifacts and ${images.length} visual assets were inventoried.
- Backup, work, deployment-package, temporary and test files are excluded from current-route totals and recorded as repository hygiene findings.
- Navigation is database-managed through \`menu_items\`; page access is managed through \`page_access\`; the Worker also maintains a static page catalogue.
- No calculator route was found. Spreadsheet-based scoring and prioritisation tools exist as downloads.

## Current route catalogue

| Current route | Current heading | Type | Proposed action | Future area |
|---|---|---|---|---|
${markdownRows.join("\n")}

## Supporting inventories

- [Current content inventory](data/current-content-inventory.csv)
- [Downloads](data/download-inventory.csv)
- [Visual assets](data/visual-asset-inventory.csv)
- [Machine-readable summary](data/inventory-summary.json)

## Repository findings

The deployable portal contains ${inventory.length} routes, but the repository also contains a full backup tree, generated deployment packages, temporary HTML fragments, office lock files and test pages. These must not be interpreted as published methodology content. They should be cleaned only through a separately approved repository-hygiene change.

## Current database-managed navigation

The current local migration state contains these top-level items: Knowledge Discovery; AI Strategy & Adoption; AI Governance; AI Architecture; AI Implementation; AI Solutions (hidden); Intelligent Automation; Security & Risk; and Resources. Home and Contact are fixed navigation items. Child items resolve to the guidance routes included in the route catalogue above.

This current navigation is evidence for the migration analysis only. Phase 0 does not replace it.
`);

fs.writeFileSync(path.join(output, "04-article-migration-matrix.md"), `# 0.3 Current-to-future article migration matrix

Every current route has a disposition in [article-migration-matrix.csv](data/article-migration-matrix.csv).

## Disposition totals

${Object.entries(summary.actions).map(([action,count]) => `- ${action}: ${count}`).join("\n")}

## Rules

- **Retain:** preserve the page and align it to the new hierarchy.
- **Move:** change lifecycle placement without duplicating content.
- **Merge:** consolidate after paragraph-level review into the named canonical page.
- **Split:** create the documented child-page plan before moving any content.
- **Archive:** remove from normal methodology navigation but retain access.
- No current route is deleted or redirected during Phase 0.
- Redirects become eligible only after the Platform Owner approves the migration matrix and the destination exists.
`);

console.log(JSON.stringify(summary, null, 2));
