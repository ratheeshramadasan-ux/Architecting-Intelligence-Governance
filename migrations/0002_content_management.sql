CREATE TABLE IF NOT EXISTS page_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  layout TEXT NOT NULL DEFAULT 'left-nav' CHECK (layout IN ('left-nav', 'article')),
  font_body TEXT NOT NULL DEFAULT 'DM Sans',
  font_heading TEXT NOT NULL DEFAULT 'Fraunces',
  color_primary TEXT NOT NULL DEFAULT '#08264a',
  color_accent TEXT NOT NULL DEFAULT '#c3912f',
  content_width INTEGER NOT NULL DEFAULT 1180,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  source_path TEXT UNIQUE,
  template_id INTEGER REFERENCES page_templates(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  summary TEXT NOT NULL DEFAULT '',
  body_html TEXT NOT NULL DEFAULT '',
  left_nav_json TEXT NOT NULL DEFAULT '[]',
  style_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '',
  parent_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  visibility TEXT NOT NULL DEFAULT 'visible' CHECK (visibility IN ('visible', 'hidden')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_content_pages_status ON content_pages(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_menu_items_parent_position ON menu_items(parent_id, position);

INSERT OR IGNORE INTO page_templates(name, description, layout)
VALUES ('Standard page with left submenu', 'Editorial content page with a sticky section menu on the left.', 'left-nav');

INSERT OR IGNORE INTO menu_items(id,label,url,parent_id,position) VALUES
  (1,'AI Strategy & Adoption','',NULL,10),
  (2,'AI Governance','',NULL,20),
  (3,'AI Architecture','',NULL,30),
  (4,'AI Implementation','',NULL,40),
  (5,'AI Solutions','',NULL,50),
  (6,'Intelligent Automation','',NULL,60),
  (7,'Security & Risk','',NULL,70),
  (8,'Resources','/pages/resources.html',NULL,80),
  (101,'Adoption & Migration','/pages/ai-adoption.html',1,10),
  (102,'AI & RPA Portfolio Planning','/pages/ai-rpa-prioritization.html',1,20),
  (103,'Greenfield Implementation','/pages/greenfield-implementation.html',1,30),
  (201,'Governance Integration Model','/pages/governance-integration.html',2,10),
  (202,'Governance, Compliance & Oversight','/pages/ai-governance.html',2,20),
  (203,'Agentic AI Governance Framework','/pages/agentic-ai.html',2,30),
  (301,'Enterprise Architecture','/pages/architecture.html',3,10),
  (302,'AI Infrastructure Architecture','/pages/ai-infrastructure-architecture.html',3,20),
  (401,'Implementation Overview','/pages/ai-architecture.html',4,10),
  (501,'Document Processing','/pages/document-processing.html',5,10),
  (601,'Automation Framework','/pages/automation.html',6,10),
  (602,'Enterprise AI Automation Spectrum','/pages/ai-automation-spectrum.html',6,20),
  (701,'Enterprise AI Assurance','/pages/assurance.html',7,10),
  (702,'Security & Architecture Review','/pages/security-review.html',7,20),
  (703,'Operational & Behavioural Risk','/pages/operational-risk.html',7,30),
  (704,'Data Security & Privacy','/pages/data-security.html',7,40),
  (705,'Vendor, Infrastructure & Lifecycle','/pages/vendor-assurance.html',7,50);
