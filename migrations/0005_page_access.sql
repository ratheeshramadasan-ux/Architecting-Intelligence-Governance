CREATE TABLE IF NOT EXISTS page_access (
  path TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'visible' CHECK (visibility IN ('visible', 'hidden')),
  requires_sign_in INTEGER NOT NULL DEFAULT 0 CHECK (requires_sign_in IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_page_access_visibility
  ON page_access(visibility, requires_sign_in, path);

INSERT OR IGNORE INTO page_access(path,title,visibility,requires_sign_in) VALUES
  ('/','Home','visible',0),
  ('/pages/about.html','About','visible',0),
  ('/pages/agentic-ai.html','Agentic AI Governance Framework','visible',1),
  ('/pages/ai-adoption.html','AI Adoption and Enterprise Tool Migration','visible',1),
  ('/pages/ai-architecture.html','AI Architecture and Runtime Implementation','visible',1),
  ('/pages/ai-automation-spectrum.html','Enterprise AI Automation Spectrum','visible',1),
  ('/pages/ai-governance.html','Governance, Compliance and Oversight','visible',1),
  ('/pages/ai-infrastructure-architecture.html','AI Infrastructure Architecture','visible',1),
  ('/pages/ai-rpa-prioritization.html','AI and RPA Opportunity Prioritization','visible',1),
  ('/pages/architecture.html','Enterprise Architecture','visible',1),
  ('/pages/assurance.html','Enterprise AI Assurance','visible',1),
  ('/pages/automation.html','Automation Framework','visible',1),
  ('/pages/contact.html','Contact','visible',0),
  ('/pages/data-security.html','Data Security and Privacy','visible',1),
  ('/pages/document-processing.html','Intelligent Document Processing','visible',1),
  ('/pages/executive-career-portfolio.html','Executive Career Portfolio','visible',0),
  ('/pages/governance-integration.html','Governance Integration Model','visible',1),
  ('/pages/greenfield-implementation.html','Greenfield AI Governance Blueprint','visible',1),
  ('/pages/operational-risk.html','Operational and Behavioural Risk','visible',1),
  ('/pages/resources.html','Resources and Downloads','visible',1),
  ('/pages/security-review.html','Security and Architecture Review','visible',1),
  ('/pages/solutions.html','Solutions','visible',1),
  ('/pages/vendor-assurance.html','Vendor, Infrastructure and Lifecycle','visible',1);
