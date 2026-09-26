-- Phase 2: D1-backed case-study and demo collection.
-- Additive only: static files, library_assets, and legacy URLs remain untouched.

CREATE TABLE IF NOT EXISTS showcase_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stable_id TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL CHECK (content_type IN ('case_study','demo')),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT NOT NULL DEFAULT '',
  target_url TEXT NOT NULL DEFAULT '',
  legacy_url TEXT NOT NULL DEFAULT '',
  asset_id INTEGER REFERENCES library_assets(id) ON DELETE SET NULL,
  static_download_url TEXT NOT NULL DEFAULT '',
  static_file_name TEXT NOT NULL DEFAULT '',
  static_content_type TEXT NOT NULL DEFAULT '',
  static_size_bytes INTEGER NOT NULL DEFAULT 0,
  tags_json TEXT NOT NULL DEFAULT '[]',
  outcomes_json TEXT NOT NULL DEFAULT '[]',
  related_links_json TEXT NOT NULL DEFAULT '[]',
  featured INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  include_in_navigation INTEGER NOT NULL DEFAULT 0,
  visibility TEXT NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public','authenticated','restricted')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','published','archived')),
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_showcase_public
  ON showcase_items(content_type,status,display_order,featured);
CREATE INDEX IF NOT EXISTS idx_showcase_navigation
  ON showcase_items(status,include_in_navigation,display_order);
CREATE UNIQUE INDEX IF NOT EXISTS idx_showcase_asset
  ON showcase_items(asset_id) WHERE asset_id IS NOT NULL;

INSERT OR IGNORE INTO showcase_items
  (stable_id,content_type,slug,title,description,category,cover_image_url,target_url,legacy_url,
   static_download_url,static_file_name,static_content_type,static_size_bytes,tags_json,outcomes_json,
   related_links_json,featured,display_order,include_in_navigation,visibility,status,published_at)
VALUES
  ('static-case-study-01','case_study','dental-claims','Enterprise Dental Claims Hyperautomation',
   'A high-risk, multi-location claims operation re-architected around a SQL control plane, deterministic rules, parallel workers, exception recovery, credential governance and end-of-day capacity controls.',
   'Healthcare operations','/assets/images/case-studies/dental-claims-cover.webp','/case-studies/#dental-claims','/case-studies/#dental-claims',
   '/downloads/case-studies/enterprise-dental-claims-hyperautomation.pdf','enterprise-dental-claims-hyperautomation.pdf','application/pdf',2735660,
   '["Hyperautomation","RPA","Claims","Control plane"]','["5 operating locations","3,000+ daily transactions","40% routed for human judgement"]',
   '[{"label":"Automation framework","url":"/pages/automation.html"}]',1,10,1,'public','published',CURRENT_TIMESTAMP),
  ('static-case-study-02','case_study','user-onboarding','Enterprise User Onboarding and Access Provisioning',
   'A governed parent-child automation model spanning a heterogeneous application estate, with smart work allocation, application isolation, licence controls, CyberArk integration and partial-success handling.',
   'Identity and access','/assets/images/case-studies/user-onboarding-cover.webp','/case-studies/#user-onboarding','/case-studies/#user-onboarding',
   '/downloads/case-studies/enterprise-user-onboarding-access-provisioning.pdf','enterprise-user-onboarding-access-provisioning.pdf','application/pdf',1707992,
   '["Identity","Access provisioning","RPA","CyberArk"]','["35 applications assessed","22 highly suitable","Single-day onboarding target"]',
   '[{"label":"IAM assessment","url":"/assessments/identity-and-access-assessment/"}]',1,20,1,'public','published',CURRENT_TIMESTAMP),
  ('static-case-study-03','case_study','banking-agentic-ai','Banking Customer Support - Agentic AI and Hyperautomation',
   'A trust-before-data and trust-before-action architecture integrating authentication, PII protection, governed RAG, MCP tools, APIs, RPA, human escalation, evaluation and privacy-safe monitoring.',
   'Banking and Agentic AI','/assets/images/case-studies/banking-agentic-ai-cover.webp','/case-studies/#banking-agentic-ai','/case-studies/#banking-agentic-ai',
   '/downloads/case-studies/banking-agentic-ai-hyperautomation.pdf','banking-agentic-ai-hyperautomation.pdf','application/pdf',1963118,
   '["Agentic AI","Banking","MCP","PII governance"]','["Need-to-know agent context","Two-tier MCP security","Privacy-safe observability"]',
   '[{"label":"Launch customer demo","url":"/enterprise-architecture/banking-agent-demo/"},{"label":"Open operations portal","url":"/enterprise-architecture/ai-operations/"}]',1,30,1,'public','published',CURRENT_TIMESTAMP),
  ('static-demo-banking-agent','demo','customer-banking-demo','Customer Banking Demo',
   'A governed customer-banking workspace using synthetic data.','Banking','',
   '/enterprise-architecture/banking-agent-demo/','/enterprise-architecture/banking-agent-demo/','','','',0,'[]','[]','[]',1,40,1,'public','published',CURRENT_TIMESTAMP),
  ('static-demo-ai-operations','demo','ai-operations-demo','AI Operations Demo',
   'The AI operations control plane supporting governed monitoring and intervention.','AI operations','',
   '/enterprise-architecture/ai-operations/','/enterprise-architecture/ai-operations/','','','',0,'[]','[]','[]',1,50,1,'public','published',CURRENT_TIMESTAMP),
  ('static-demo-commission-operations','demo','commission-operations-demo','Commission Operations Demo',
   'A synthetic commission-operations scenario demonstrating controlled automation.','Commission operations','',
   '/enterprise-architecture/incentive-commission-demo/','/enterprise-architecture/incentive-commission-demo/','','','',0,'[]','[]','[]',1,60,1,'public','published',CURRENT_TIMESTAMP);

-- Reconcile every existing uploaded Case Study exactly once. The production Case Study 04
-- is linked to its original library/R2 record rather than copied or re-uploaded.
INSERT OR IGNORE INTO showcase_items
  (stable_id,content_type,slug,title,description,category,target_url,legacy_url,asset_id,tags_json,
   featured,display_order,include_in_navigation,visibility,status,published_at,created_at,updated_at)
SELECT
  'library-case-study-' || a.id,
  'case_study',
  CASE WHEN lower(a.title) LIKE '%commission%' THEN 'agentic-commission-operations' ELSE 'uploaded-case-study-' || a.id END,
  a.title,a.description,'Case Study',
  CASE WHEN lower(a.title) LIKE '%commission%' THEN '/case-studies/#agentic-commission-operations' ELSE '/case-studies/#uploaded-case-study-' || a.id END,
  CASE WHEN lower(a.title) LIKE '%commission%' THEN '/case-studies/#agentic-commission-operations' ELSE '/case-studies/#uploaded-case-study-' || a.id END,
  a.id,a.tags_json,0,100 + a.id,CASE WHEN lower(a.title) LIKE '%commission%' THEN 1 ELSE 0 END,a.visibility,a.status,
  CASE WHEN a.status='published' THEN COALESCE(a.updated_at,CURRENT_TIMESTAMP) ELSE NULL END,
  a.created_at,a.updated_at
FROM library_assets a
WHERE a.category='Case Study'
  AND NOT EXISTS (
    SELECT 1 FROM showcase_items s
    WHERE s.asset_id=a.id OR lower(s.title)=lower(a.title)
      OR (a.file_name<>'' AND lower(s.static_file_name)=lower(a.file_name))
  );

UPDATE access_roles
SET permissions_json='["dashboard.view","pages.manage","content.edit","content.review","content.approve","content.publish","navigation.manage","library.manage","showcase.manage","showcase.publish","users.manage","roles.manage","settings.manage","theme.manage","analytics.view","search.manage"]',
    updated_at=CURRENT_TIMESTAMP
WHERE key='administrator';

UPDATE access_roles
SET permissions_json='["dashboard.view","pages.manage","content.edit","library.manage","showcase.manage"]',
    updated_at=CURRENT_TIMESTAMP
WHERE key='editor';
