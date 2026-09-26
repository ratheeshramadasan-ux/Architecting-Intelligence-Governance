from __future__ import annotations

import html
import base64
import re
import ssl
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_URL = "https://architecting-ai.rrlabs.ca/"


def fetch(url: str) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    context = ssl._create_unverified_context()
    with urllib.request.urlopen(request, timeout=30, context=context) as response:
        return response.read().decode("utf-8")


def balanced_element(source: str, tag: str, marker: str) -> str:
    match = re.search(rf"<{tag}\b[^>]*{marker}[^>]*>", source, flags=re.I)
    if not match:
        raise RuntimeError(f"Could not find {tag} containing {marker}")
    depth = 1
    token_re = re.compile(rf"</?{tag}\b[^>]*>", re.I)
    for token in token_re.finditer(source, match.end()):
        if token.group(0).startswith("</"):
            depth -= 1
        else:
            depth += 1
        if depth == 0:
            return source[match.start():token.end()]
    raise RuntimeError(f"Unclosed {tag} containing {marker}")


def inner(element: str) -> str:
    return re.sub(r"^<[^>]+>|</[^>]+>$", "", element, count=2, flags=re.S).strip()


def clean(fragment: str) -> str:
    fragment = re.sub(r"<script\b[^>]*>.*?</script>", "", fragment, flags=re.I | re.S)
    fragment = re.sub(r"\sstyle=(['\"]).*?\1", "", fragment, flags=re.I | re.S)
    fragment = re.sub(r"\sonclick=(['\"]).*?\1", "", fragment, flags=re.I | re.S)
    fragment = re.sub(r"\sclass=(['\"])card\1", ' class="content-block"', fragment, flags=re.I)
    return fragment.strip()


MENU = [
    ("Home", "index.html"),
    ("AI Governance", "pages/ai-governance.html", [
        ("1. Governance Integration Model", "pages/governance-integration.html"),
        ("2. Greenfield Implementation", "pages/greenfield-implementation.html"),
        ("3. Governance Pillars", "pages/ai-governance.html", [
            ("Pillar 1 — Governance, Compliance & Oversight", "pages/ai-governance.html"),
            ("Pillar 2 — Operational & Behavioural Risk", "pages/operational-risk.html"),
            ("Pillar 3 — Data Security & Privacy", "pages/data-security.html"),
            ("Pillar 4 — Vendor, Infrastructure & Lifecycle", "pages/vendor-assurance.html"),
        ]),
        ("4. Agentic AI Governance Framework", "pages/agentic-ai.html"),
    ]),
    ("AI Adoption", "pages/ai-adoption.html", [
        ("Adoption & Migration", "pages/ai-adoption.html"),
        ("AI & RPA Portfolio Planning", "pages/ai-rpa-prioritization.html"),
        ("Document Processing", "pages/document-processing.html"),
        ("Automation Framework", "pages/automation.html"),
    ]),
    ("Architecture", "pages/architecture.html", [
        ("Enterprise Architecture", "pages/architecture.html"),
        ("AI Architecture Framework", "pages/ai-architecture.html"),
    ]),
    ("Solutions", "pages/solutions.html", [
        ("Document Processing", "pages/document-processing.html"),
        ("Intelligent Automation", "pages/automation.html"),
        ("Tool Migration", "pages/ai-adoption.html"),
    ]),
    ("Assurance", "pages/assurance.html", [
        ("Enterprise AI Assurance", "pages/assurance.html"),
        ("Security & Architecture Review", "pages/security-review.html"),
    ]),
    ("Resources", "pages/resources.html"),
    ("About", "pages/about.html"),
    ("Contact", "pages/contact.html"),
]


def href(target: str, depth: int) -> str:
    return ("../" if depth else "./") + target


def header(depth: int, active: str) -> str:
    def render_submenu(children: list[tuple]) -> str:
        rendered = []
        for child in children:
            child_label, child_target, *grandchildren = child
            if grandchildren:
                nested = "".join(
                    f'<a href="{href(grandchild_target, depth)}">{html.escape(grandchild_label)}</a>'
                    for grandchild_label, grandchild_target in grandchildren[0]
                )
                rendered.append(
                    f'<div class="submenu-group"><button class="submenu-trigger" type="button" aria-expanded="false">'
                    f'<span>{html.escape(child_label)}</span><span class="submenu-icon" aria-hidden="true"></span></button>'
                    f'<div class="nested-menu">{nested}</div></div>'
                )
            else:
                rendered.append(f'<a href="{href(child_target, depth)}">{html.escape(child_label)}</a>')
        return "".join(rendered)

    items = []
    for item in MENU:
        label, target, *children = item
        active_class = " active" if label == active else ""
        if children:
            submenu = render_submenu(children[0])
            items.append(
                f'<li class="navigation-item dropdown"><button class="navigation-link dropdown-trigger{active_class}" '
                f'type="button" aria-expanded="false">{html.escape(label)}<span class="dropdown-icon" aria-hidden="true"></span></button>'
                f'<div class="dropdown-menu">{submenu}</div></li>'
            )
        elif label == "Contact":
            items.append(f'<li><a class="contact-button{active_class}" href="{href(target, depth)}">Contact</a></li>')
        else:
            items.append(f'<li><a class="navigation-link{active_class}" href="{href(target, depth)}">{html.escape(label)}</a></li>')
    return f'''<a class="skip-link" href="#main-content">Skip to content</a>
<header class="site-header">
  <div class="utility-bar"><div class="utility-inner"><span>AI implementation &amp; governance advisory</span><a href="{href('pages/contact.html', depth)}">Speak with an advisor <span aria-hidden="true">&#8594;</span></a></div></div>
  <div class="header-container">
    <a class="brand" href="{href('index.html', depth)}" aria-label="Ratheesh Technology Ltd. home"><img class="company-logo" src="{href('assets/images/ratheesh-technology-logo-transparent.png', depth)}?v=20260719-63" alt="Ratheesh Technology Ltd. — AI Implementation and Governance" width="1906" height="825"></a>
    <button class="mobile-menu-button" type="button" aria-expanded="false" aria-controls="primary-navigation" aria-label="Open navigation menu"><span></span><span></span><span></span></button>
    <nav id="primary-navigation" class="primary-navigation" aria-label="Primary navigation"><ul class="navigation-list">{''.join(items)}</ul></nav>
  </div>
</header>'''


def footer(depth: int) -> str:
    return f'''<footer><div><img src="{href('assets/images/ratheesh-technology-logo-transparent.png', depth)}?v=20260719-63" alt="Ratheesh Technology Ltd." width="1906" height="825"><p>Architecting Intelligence</p></div><p>&copy; 2026 Ratheesh Technology Ltd.</p></footer>'''


def document(title: str, active: str, content: str, depth: int = 1, home: bool = False) -> str:
    legacy_stylesheet = href("assets/css/legacy-visuals.css", depth)
    stylesheet = href("assets/css/navigation.css", depth)
    script = href("assets/js/navigation.js", depth)
    page_class = "home-content" if home else "inner-page"
    return f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="{html.escape(title)} — Architecting Intelligence"><title>{html.escape(title)} | Ratheesh Technology Ltd.</title>
<link rel="stylesheet" href="{legacy_stylesheet}?v=20260719-63"><link rel="stylesheet" href="{stylesheet}?v=20260719-63"><script src="{script}?v=20260719-63" defer></script></head>
<body>{header(depth, active)}<main id="main-content" class="{page_class}"><div class="legacy-content">{content}</div></main>{footer(depth)}</body></html>'''


def section(source: str, page_id: str) -> str:
    fragment = clean(inner(balanced_element(source, "div", rf'id=["\']{re.escape(page_id)}["\']')))
    fragment = re.sub(r'^\s*id=["\']pg-[^"\']+["\']>\s*', '', fragment, count=1, flags=re.I)
    fragment = fragment.replace("Agentic AI Framework", "Agentic AI Governance Framework")
    try:
        header_block = balanced_element(fragment, "div", r'class=["\'][^"\']*pg-header')
    except RuntimeError:
        return fragment
    header_content = inner(header_block)
    fragment = fragment.replace(header_block, "", 1)
    hero = f'<section class="article-hero platform-page-hero"><div class="hero-inner">{header_content}</div></section>'
    return hero + fragment


def architecture_content(source: str) -> str:
    hero = clean(inner(balanced_element(source, "header", r'class=["\'][^"\']*hero')))
    main = clean(inner(balanced_element(source, "main", r'class=["\'][^"\']*container')))
    main = re.sub(
        r'<div class="visual-title">(.*?)</div>',
        r'<h2 class="visual-title">\1</h2>',
        main,
        count=1,
        flags=re.I | re.S,
    )
    image_match = re.search(r'(<img\b[^>]*enterprise-ai-control-plane[^>]*?/?>)', main, flags=re.I | re.S)
    if image_match:
        viewer = f'''<div class="infographic-tools" role="toolbar" aria-label="Infographic controls">
  <span>Explore infographic</span>
  <button type="button" data-infographic-action="out" aria-label="Zoom out">−</button>
  <output aria-live="polite">100%</output>
  <button type="button" data-infographic-action="in" aria-label="Zoom in">+</button>
  <button type="button" data-infographic-action="reset">Reset</button>
</div>
<div class="infographic-viewport" tabindex="0" aria-label="Interactive architecture infographic. Zoom, then drag to pan.">
  <div class="infographic-canvas">{image_match.group(1)}</div>
</div>
<p class="infographic-help">Use +/− or the mouse wheel to zoom. Drag the infographic to inspect details.</p>'''
        main = main[:image_match.start()] + viewer + main[image_match.end():]
    return f'<section class="article-hero platform-page-hero">{hero}</section><div class="article-body">{main}</div>'


def write(relative: str, value: str) -> None:
    path = ROOT / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(value, encoding="utf-8")
    print(relative)


def externalize_about_photo(fragment: str) -> str:
    match = re.search(r'src="data:image/jpeg;base64,([^"]+)"', fragment, flags=re.I)
    if not match:
        return fragment
    photo_path = ROOT / "assets" / "images" / "ratheesh-ramadasan.jpg"
    photo_path.write_bytes(base64.b64decode(match.group(1)))
    return fragment[:match.start()] + 'src="../assets/images/ratheesh-ramadasan.jpg?v=20260719-63"' + fragment[match.end():]


def externalize_downloads(fragment: str) -> str:
    pattern = re.compile(
        r'href="data:application/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet;base64,([^"]+)"([^>]*?)download="([^"]+)"',
        flags=re.I,
    )
    def replace(match: re.Match[str]) -> str:
        filename = Path(match.group(3)).name
        payload = base64.b64decode(match.group(1))
        download_path = ROOT / "downloads" / filename
        download_path.parent.mkdir(parents=True, exist_ok=True)
        download_path.write_bytes(payload)
        if filename == "AI_Governance_Qualification_Framework_v2.xlsx":
            (ROOT / "AI_Governance_Qualification_Framework.xlsx").write_bytes(payload)
        return f'href="../downloads/{filename}"{match.group(2)}download="{filename}"'
    return pattern.sub(replace, fragment)


def add_greenfield_resources(fragment: str) -> str:
    """Add implementation artifacts to the central resource library."""
    grid = balanced_element(fragment, "div", r'class=["\'][^"\']*res-grid')
    additions = '''
    <div class="res-card">
      <div class="res-icon" data-format="XLSX" aria-hidden="true"></div>
      <div class="res-body">
        <div class="res-name">AI &amp; RPA Opportunity Priority Matrix</div>
        <div class="res-desc">Formula-driven portfolio scorecard for comparing AI, RPA, workflow and hybrid opportunities across value, feasibility, strategic alignment, risk exposure, technology readiness and dependencies. Includes sample initiatives, a risk register, technology dependency register, editable scoring model and executive dashboard.</div>
        <div class="res-meta">
          <span class="res-badge">XLSX</span><span class="res-badge">6 Sheets</span><span class="res-badge">Priority Scorecard</span>
          <a class="dl-btn" href="../downloads/AI_RPA_Opportunity_Priority_Matrix.xlsx" download="AI_RPA_Opportunity_Priority_Matrix.xlsx">Download file →</a>
        </div>
      </div>
    </div>
    <div class="res-card">
      <div class="res-icon" data-format="XLSX" aria-hidden="true"></div>
      <div class="res-body">
        <div class="res-name">AI &amp; RPA Platform-Aligned Tool Selection</div>
        <div class="res-desc">Vendor-neutral tool-selection workbook that links client platform adoption to capability, governance, resource availability, delivery capacity, cost and portability criteria. Assesses internal skills, recruitment, partners, training, support, ownership and continuity; compares nine leading platforms; calculates a shortlist; records the decision; and includes 17 current official product sources.</div>
        <div class="res-meta">
          <span class="res-badge">XLSX</span><span class="res-badge">8 Sheets</span><span class="res-badge">Tool Selector</span>
          <a class="dl-btn" href="../downloads/AI_RPA_Platform_Aligned_Tool_Selection.xlsx" download="AI_RPA_Platform_Aligned_Tool_Selection.xlsx">Download file →</a>
        </div>
      </div>
    </div>
    <div class="res-card">
      <div class="res-icon" data-format="DOCX" aria-hidden="true"></div>
      <div class="res-body">
        <div class="res-name">Enterprise AI Governance Greenfield Implementation Blueprint</div>
        <div class="res-desc">Detailed enterprise-neutral implementation guide covering the executive mandate, maturity baseline, four-tier operating model, RACI and decision rights, policy and controls, eight lifecycle gates, risk, architecture, adoption, assurance, implementation waves, exit criteria, and framework alignment.</div>
        <div class="res-meta">
          <span class="res-badge">DOCX</span><span class="res-badge">10 Stages</span><span class="res-badge">Implementation Guide</span>
          <a class="dl-btn" href="../downloads/Enterprise_AI_Governance_Greenfield_Implementation_Blueprint.docx" download="Enterprise_AI_Governance_Greenfield_Implementation_Blueprint.docx">Download file →</a>
        </div>
      </div>
    </div>
    <div class="res-card">
      <div class="res-icon" data-format="XLSX" aria-hidden="true"></div>
      <div class="res-body">
        <div class="res-name">Enterprise AI Governance Greenfield Implementation Toolkit</div>
        <div class="res-desc">Editable delivery workbook with an implementation plan, AI inventory, governance RACI, risk register, control catalogue, lifecycle gates, evidence register, executive metrics, and integrated NIST AI RMF, ISO/IEC 42001, COBIT, Three Lines, DAMA, MRM, EA, and ITSM mapping.</div>
        <div class="res-meta">
          <span class="res-badge">XLSX</span><span class="res-badge">9 Sheets</span><span class="res-badge">Editable Toolkit</span>
          <a class="dl-btn" href="../downloads/Enterprise_AI_Governance_Greenfield_Implementation_Toolkit.xlsx" download="Enterprise_AI_Governance_Greenfield_Implementation_Toolkit.xlsx">Download file →</a>
        </div>
      </div>
    </div>
    <div class="res-card">
      <div class="res-icon" data-format="XLSX" aria-hidden="true"></div>
      <div class="res-body">
        <div class="res-name">Enterprise AI Governance RACI Metrics Template</div>
        <div class="res-desc">Detailed responsibility and governance-performance workbook with a role directory, 12 enterprise decision RACI examples, eight lifecycle-gate activity mappings, a decision and escalation log, 12 defined governance KPIs and KRIs, automated accountability-health checks, data validation, evidence tracking, and a formula-driven executive dashboard.</div>
        <div class="res-meta">
          <span class="res-badge">XLSX</span><span class="res-badge">7 Sheets</span><span class="res-badge">RACI + Metrics</span>
          <a class="dl-btn" href="../downloads/Enterprise_AI_Governance_RACI_Metrics_Template.xlsx" download="Enterprise_AI_Governance_RACI_Metrics_Template.xlsx">Download file →</a>
        </div>
      </div>
    </div>
    <div class="res-card">
      <div class="res-icon" data-format="PNG" aria-hidden="true"></div>
      <div class="res-body">
        <div class="res-name">Greenfield AI Governance Implementation Journey</div>
        <div class="res-desc">High-resolution visual of the complete enterprise implementation model: ten stages, four governance tiers, eight lifecycle gates, decision evidence and exception flow, Three Lines assurance, governance metrics, and integrated framework alignment.</div>
        <div class="res-meta">
          <span class="res-badge">PNG</span><span class="res-badge">High Resolution</span><span class="res-badge">Infographic</span>
          <a class="dl-btn" href="../assets/images/greenfield-ai-governance-implementation-journey.png" download="Greenfield_AI_Governance_Implementation_Journey.png">Download file →</a>
        </div>
      </div>
    </div>'''
    expanded_grid = grid[:-6] + additions + grid[-6:]
    return fragment.replace(grid, expanded_grid, 1)


def normalize_agentic_visuals(fragment: str) -> str:
    risk_curve = '''<section class="automation-risk-curve" aria-labelledby="automation-risk-title">
  <div class="arc-kicker">Automation decision continuum</div>
  <h3 id="automation-risk-title" class="arc-title">The Enterprise Automation Risk Curve — Where AI Belongs</h3>
  <div class="arc-stages">
    <div class="arc-stage"><span class="arc-index">01</span><strong>Formula / Rule</strong><p>Deterministic<br>100% auditable</p></div>
    <div class="arc-stage"><span class="arc-index">02</span><strong>Rules Engine</strong><p>Low governance<br>overhead</p></div>
    <div class="arc-stage"><span class="arc-index">03</span><strong>Workflow / RPA</strong><p>Structured process<br>repeatable steps</p></div>
    <div class="arc-stage"><span class="arc-index">04</span><strong>AI Assisted</strong><p>Human approves<br>statistical outputs</p></div>
    <div class="arc-stage"><span class="arc-index">05</span><strong>Agentic AI</strong><p>Multi-step autonomy<br>full control stack</p></div>
  </div>
  <div class="arc-scale"><span><strong>Low</strong> risk exposure</span><span>Deterministic testing</span><span>Statistical drift detection</span><span><strong>Very high</strong> risk exposure</span></div>
</section>
'''
    fragment = re.sub(
        r'<!--\s*═+\s*ENTERPRISE AUTOMATION RISK CURVE\s*═+\s*-->.*?(?=<p>This framework dissects)',
        risk_curve,
        fragment,
        flags=re.I | re.S,
    )
    severity = '''<h3>Operational Severity Classification</h3>
<div class="severity-matrix">
  <div class="severity-row severity-1"><strong>SEV 1 — Regulatory / Material Financial</strong><p>Illegal data exposure, non-compliant regulated decisions, or unauthorised financial transactions above risk tolerance ceiling. Kill switch within 5 minutes. CRO + Legal notified immediately.</p></div>
  <div class="severity-row severity-2"><strong>SEV 2 — Business Channel Disruption</strong><p>Widespread invalid outcomes across an entire domain (e.g., dropping or mispricing all claims within an insurance type). Route to deterministic backup. Risk Owner notified within 30 minutes.</p></div>
  <div class="severity-row severity-3"><strong>SEV 3 — Degraded Operational Efficiency</strong><p>Model confidence drops sharply, causing unexpected exception spike overwhelming the HITL review queue. Automatic suspension threshold fires. CoE notified within 4 hours. RCA within 3 business days.</p></div>
  <div class="severity-row severity-4"><strong>SEV 4 — Minor Anomalies</strong><p>Intermittent variations not affecting financial totals, legal fields, or core functionality. Canary monitoring flags. Test case added to Tier C library within 5 business days. No production disruption.</p></div>
</div>
'''
    return re.sub(
        r'<h3>Operational Severity Classification</h3>.*?(?=<h3>The 5-Step Containment Blueprint</h3>)',
        severity,
        fragment,
        flags=re.I | re.S,
    )


source = fetch(SOURCE_URL)
ea_source = fetch(SOURCE_URL + "enterprise-architecture/ea-Implementation.html")
ai_arch_source = fetch(SOURCE_URL + "enterprise-architecture/ai-architecture.html")
legacy_style_blocks = []
for style_source in (source, ea_source, ai_arch_source):
    legacy_style_blocks.extend(re.findall(r"<style\b[^>]*>(.*?)</style>", style_source, flags=re.I | re.S))
write("assets/css/legacy-visuals.css", "\n\n".join(legacy_style_blocks))

hero_content = clean(inner(balanced_element(source, "div", r'id=["\']hero-section["\']')))
home_content = hero_content + section(source, "pg-home")

gov = section(source, "pg-gov")
gov = gov.replace(
    '<tr><td>Canadian PIPEDA / Bill C-27</td><td>Automated decision systems with significant individual impacts require transparency, explanation rights, and human review. Data must remain within approved jurisdictions.</td><td>Fines, mandatory breach notification, director liability</td></tr>',
    '''<tr><td>Canada — PIPEDA (current private-sector privacy law)<br><a href="https://laws-lois.justice.gc.ca/eng/acts/P-8.6/" target="_blank" rel="noopener">Official source ↗</a></td><td>Where PIPEDA applies, organizations remain accountable for personal information used by AI and must address lawful purposes, consent where required, safeguards, openness, individual access, accuracy, third-party processing, and qualifying breach reporting. PIPEDA does not impose a blanket Canadian data-residency rule or a general statutory right to human review of every automated decision.</td><td>Privacy-regulator investigation and recommendations, Federal Court remedies, breach-reporting duties, and statutory offences in defined circumstances</td></tr>
        <tr><td>Canada — Directive on Automated Decision-Making<br><a href="https://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=32592" target="_blank" rel="noopener">Official source ↗</a></td><td>Applies to Government of Canada institutions subject to the Policy on Service and Digital when automated systems make or support administrative decisions about clients. Requirements include an Algorithmic Impact Assessment and impact-level controls. It is not a general private-sector AI law.</td><td>Federal public-sector policy compliance, oversight, remediation, and reporting consequences</td></tr>
        <tr><td>Canada — Bill C-27 / proposed AIDA<br><a href="https://www.parl.ca/legisinfo/en/bill/44-1/c-27" target="_blank" rel="noopener">Official legislative history ↗</a></td><td>Historical proposal only. Bill C-27 did not reach report stage, third reading, or the Senate before the 44th Parliament’s first session ended; the proposed Artificial Intelligence and Data Act did not become law. It must not be used as a current legal obligation.</td><td>No AIDA enforcement or penalties under Bill C-27 because it was not enacted</td></tr>
        <tr><td>Canada — OSFI Guideline E-23<br><a href="https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/guideline-e-23-model-risk-management-2027" target="_blank" rel="noopener">Official source ↗</a></td><td>Final model-risk guideline for federally regulated financial institutions, including AI/ML models. It establishes proportional enterprise model governance and lifecycle expectations and takes effect on 1 May 2027.</td><td>Sector-specific supervisory expectations for in-scope federally regulated financial institutions</td></tr>'''
)
agentic = normalize_agentic_visuals(section(source, "pg-agentic"))
agentic = agentic.replace('OSFI B-13 / E-23</div><div class="reg-title">Technology &amp; Cyber Risk (Canada)', 'OSFI B-13 / E-23</div><div class="reg-title">Technology Risk / Model Risk (Canadian FRFIs)')
agentic = agentic.replace('E-23 — Model Risk</span>', 'E-23 — Model Risk (effective 2027)</span>')
agentic = '''<section class="article-hero platform-page-hero"><div class="hero-inner"><div class="pg-tag">AI Governance Framework</div><h1 class="pg-title">Agentic AI Governance Framework</h1><p class="pg-intro">A practical governance framework for controlling autonomous AI systems across qualification, architecture, oversight, runtime assurance, incident response, and enterprise accountability.</p></div></section>''' + agentic
ops = section(source, "pg-ops")
data = section(source, "pg-data")
vendor = section(source, "pg-vendor")
vendor = vendor.replace(
    'This invisible movement is a live compliance risk under GDPR, Canadian data sovereignty requirements, or sector-specific residency obligations. The data does not need to be stored permanently in an unauthorised jurisdiction to constitute a breach — processing it there may be sufficient.',
    'This invisible movement can create compliance risk under GDPR, contractual location commitments, Canadian public-sector or sector-specific residency rules, and privacy requirements governing cross-border processing. Canada does not have one blanket private-sector data-residency rule; the applicable law, regulator, contract, data category, and jurisdiction must be assessed. Processing in another jurisdiction can still affect access, safeguards, transparency, and transfer-risk obligations even when data is not stored there permanently.'
)
for pillar_name in ("gov", "ops", "data", "vendor"):
    pillar_content = locals()[pillar_name]
    pillar_content = re.sub(
        r"Pillar\s+[1-4]\s+of\s+4\s*(?:&nbsp;|\u00a0|\s)*[Â··]*(?:&nbsp;|\u00a0|\s)*AI Governance",
        "AI Governance",
        pillar_content,
        count=1,
        flags=re.I,
    )
    locals()[pillar_name] = pillar_content
review = section(source, "pg-review")
review = review.replace("Security Review Framework &nbsp;·&nbsp; AI Governance", "Assurance &nbsp;·&nbsp; Security &amp; Architecture Review")
automation = section(source, "pg-automation")
automation = automation.replace('<h1 class="uc-title">Automation Framework</h1>', '', 1)
automation = re.sub(r'<p class="uc-sub">.*?</p>', '', automation, count=1, flags=re.I | re.S)
automation = '''<section class="article-hero platform-page-hero"><div class="hero-inner"><div class="pg-tag">AI Adoption · Intelligent Automation</div><h1 class="pg-title">Automation Framework</h1><p class="pg-intro">Enterprise governance, operating-model, and implementation guidance for intelligent automation, RPA, hyperautomation, and Automation Centres of Excellence.</p></div></section>''' + automation
docproc = section(source, "pg-docproc")
migration = section(source, "pg-migration")
resources = add_greenfield_resources(externalize_downloads(section(source, "pg-resources")))
resources = resources.replace("⬇ Download", "Download file →")
resources = resources.replace("Governance toolkit, security questionnaire, and framework documents", "Governance toolkits, implementation blueprints, security questionnaires, and framework documents")
about = externalize_about_photo(section(source, "pg-about"))
greenfield = (ROOT / "work" / "greenfield_content.html").read_text(encoding="utf-8")
governance_integration = (ROOT / "work" / "governance_integration_content.html").read_text(encoding="utf-8")
ai_rpa_planning = (ROOT / "work" / "ai_rpa_planning_content.html").read_text(encoding="utf-8")
contact = section(source, "pg-contact")
about = about.replace('<h2>About Me</h2>', '', 1)
about = re.sub(r'<div class="subtitle">(.*?)</div>', '', about, count=1, flags=re.I | re.S)
about = '''<section class="article-hero platform-page-hero"><div class="hero-inner"><div class="pg-tag">About</div><h1 class="pg-title">About Me</h1><p class="pg-intro">Enterprise Architect · AI Governance Advisor · Intelligent Automation Leader</p></div></section>''' + about
contact = contact.replace('<h2>Get in Touch</h2>', '', 1)
contact = re.sub(r'<p class="sub">.*?</p>', '', contact, count=1, flags=re.I | re.S)
contact = '''<section class="article-hero platform-page-hero"><div class="hero-inner"><div class="pg-tag">Contact</div><h1 class="pg-title">Get in Touch</h1><p class="pg-intro">Consulting, advisory, architecture reviews, AI governance assessments, and automation strategy discussions.</p></div></section>''' + contact

docproc_body = docproc
try:
    docproc_body = docproc.replace(balanced_element(docproc, "section", r'class=["\'][^"\']*platform-page-hero'), "", 1)
except RuntimeError:
    pass
automation_body = automation
try:
    automation_body = automation.replace(balanced_element(automation, "section", r'class=["\'][^"\']*platform-page-hero'), "", 1)
except RuntimeError:
    pass
solutions = '''<section class="article-hero platform-page-hero"><div class="hero-inner"><div class="pg-tag">Solutions</div><h1 class="pg-title">Enterprise AI &amp; Automation Solutions</h1><p class="pg-intro">Practical implementation patterns for document processing, intelligent automation, platform migration, and governed enterprise AI delivery.</p></div></section>''' + docproc_body + automation_body

write("index.html", document("Architecting Intelligence", "Home", home_content, depth=0, home=True))
write("pages/ai-governance.html", document("Governance, Compliance & Oversight", "AI Governance", gov))
write("pages/agentic-ai.html", document("Agentic AI Governance Framework", "AI Governance", agentic))
write("pages/greenfield-implementation.html", document("Greenfield AI Governance Implementation Blueprint", "AI Governance", greenfield))
write("pages/governance-integration.html", document("Governance Integration Model", "AI Governance", governance_integration))
write("pages/ai-adoption.html", document("AI Adoption & Enterprise Tool Migration", "AI Adoption", migration))
write("pages/ai-rpa-prioritization.html", document("AI & RPA Opportunity Prioritization", "AI Adoption", ai_rpa_planning))
write("pages/document-processing.html", document("The Document Processing Misconception", "AI Adoption", docproc))
write("pages/automation.html", document("Automation Framework", "AI Adoption", automation))
write("pages/architecture.html", document("Enterprise Architecture & Implementation", "Architecture", architecture_content(ea_source)))
write("pages/ai-architecture.html", document("AI Architecture & Implementation Framework", "Architecture", architecture_content(ai_arch_source)))
write("pages/solutions.html", document("Solutions", "Solutions", solutions))
write("pages/assurance.html", document("Enterprise AI Assurance & Security Review", "Assurance", review))
write("pages/operational-risk.html", document("Operational & Behavioural Risk", "AI Governance", ops))
write("pages/data-security.html", document("Data Security & Privacy", "AI Governance", data))
write("pages/vendor-assurance.html", document("Vendor, Infrastructure & Lifecycle Dependencies", "AI Governance", vendor))
write("pages/security-review.html", document("Enterprise AI Security & Architecture Review", "Assurance", review))
write("pages/resources.html", document("Resources & Downloads", "Resources", resources))
write("pages/about.html", document("About Me", "About", about))
write("pages/contact.html", document("Get in Touch", "Contact", contact))
