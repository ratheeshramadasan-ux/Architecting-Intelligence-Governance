-- Phase 1: immutable navigation publications and permission enforcement.
-- Additive only: legacy menu_items remains intact as a rollback source.

CREATE TABLE IF NOT EXISTS navigation_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version_number INTEGER NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('draft','published','superseded','failed')),
  schema_version INTEGER NOT NULL DEFAULT 1,
  source TEXT NOT NULL DEFAULT 'admin',
  payload_json TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  change_note TEXT NOT NULL DEFAULT '',
  validation_json TEXT NOT NULL DEFAULT '{}',
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  published_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_navigation_one_published
  ON navigation_versions(status) WHERE status='published';
CREATE INDEX IF NOT EXISTS idx_navigation_versions_number
  ON navigation_versions(version_number DESC);

-- Preserve a verbatim, queryable snapshot of all 35 legacy records before activation.
INSERT INTO navigation_versions(version_number,status,source,payload_json,content_hash,change_note,validation_json)
SELECT 1,'superseded','legacy-menu-items',
  json_object(
    'schemaVersion',1,
    'legacyItems',json_group_array(json_object(
      'id',id,'label',label,'href',url,'parentId',parent_id,
      'position',position,'visibility',visibility
    ))
  ),
  'legacy-menu-items-import',
  'Imported from all existing menu_items records before public reconciliation.',
  json_object('recordCount',COUNT(*),'valid',1)
FROM (SELECT * FROM menu_items ORDER BY COALESCE(parent_id,0),position,id)
WHERE NOT EXISTS (SELECT 1 FROM navigation_versions);

-- Activate the already-published public hierarchy, reconciled against the legacy snapshot.
INSERT INTO navigation_versions(version_number,status,source,payload_json,content_hash,change_note,validation_json,published_at)
SELECT 2,'published','methodology-reconciliation','{"schemaVersion":1,"navigation":[{"key":"public-1","label":"Home","href":"/","position":1,"visibility":"visible","children":[]},{"key":"public-2","label":"Get Started","href":"/transformation/","position":2,"visibility":"visible","children":[{"key":"public-2-1","label":"Get Started Overview","href":"/transformation/","position":1,"visibility":"visible"},{"key":"public-2-2","label":"Where Should We Begin?","href":"/transformation/#where-to-begin","position":2,"visibility":"visible"},{"key":"public-2-3","label":"Transformation Steps","href":"/transformation/#phases","position":3,"visibility":"visible"},{"key":"public-2-4","label":"14-Step Journey","href":"/journey/","position":4,"visibility":"visible"},{"key":"public-2-5","label":"Approval Checkpoints","href":"/transformation/#gates","position":5,"visibility":"visible"},{"key":"public-2-6","label":"Roadmap","href":"/transformation/#roadmap","position":6,"visibility":"visible"},{"key":"public-2-7","label":"Progress Scorecard","href":"/transformation/#scorecard","position":7,"visibility":"visible"},{"key":"public-2-8","label":"Choose the Best Opportunities","href":"/pages/ai-rpa-prioritization.html","position":8,"visibility":"visible"}]},{"key":"public-3","label":"Build AI Solutions","href":"/lifecycle/","position":3,"visibility":"visible","children":[{"key":"public-3-1","label":"Build Process Overview","href":"/lifecycle/","position":1,"visibility":"visible"},{"key":"public-3-2","label":"Submit Idea & Check Risk","href":"/lifecycle/#intake","position":2,"visibility":"visible"},{"key":"public-3-3","label":"Check Value & Feasibility","href":"/lifecycle/#feasibility","position":3,"visibility":"visible"},{"key":"public-3-4","label":"Prepare Data & Design","href":"/lifecycle/#data-readiness","position":4,"visibility":"visible"},{"key":"public-3-5","label":"Build the Solution","href":"/lifecycle/#build-config","position":5,"visibility":"visible"},{"key":"public-3-6","label":"Test & Approve","href":"/lifecycle/#testing-evaluation","position":6,"visibility":"visible"},{"key":"public-3-7","label":"Launch & Monitor","href":"/lifecycle/#deployment","position":7,"visibility":"visible"},{"key":"public-3-8","label":"Manage Changes & Issues","href":"/lifecycle/#change-management","position":8,"visibility":"visible"}]},{"key":"public-4","label":"Rules & Standards","href":"/standards/","position":4,"visibility":"visible","children":[{"key":"public-4-1","label":"Rules & Standards Overview","href":"/standards/","position":1,"visibility":"visible"},{"key":"public-4-2","label":"International Standards","href":"/standards/#international","position":2,"visibility":"visible"},{"key":"public-4-3","label":"Risk & Governance Guides","href":"/standards/#frameworks","position":3,"visibility":"visible"},{"key":"public-4-4","label":"Laws & Regulations","href":"/standards/#legislation","position":4,"visibility":"visible"},{"key":"public-4-5","label":"Match Rules to Controls","href":"/standards/#crosswalks","position":5,"visibility":"visible"},{"key":"public-4-6","label":"Proof of Compliance","href":"/standards/#evidence","position":6,"visibility":"visible"},{"key":"public-4-7","label":"Rule Changes","href":"/standards/#change-management","position":7,"visibility":"visible"}]},{"key":"public-5","label":"Learn","href":"/pages/knowledge-discovery.html","position":5,"visibility":"visible","children":[{"key":"public-5-1","label":"Browse & Search","href":"/pages/knowledge-discovery.html","position":1,"visibility":"visible"},{"key":"public-5-2","label":"Strategy and Business Value","href":"/pages/knowledge-discovery.html?cat=strategy-business-value","position":2,"visibility":"visible"},{"key":"public-5-3","label":"Governance & Ownership","href":"/pages/ai-governance.html","position":3,"visibility":"visible"},{"key":"public-5-4","label":"How Solutions Are Designed","href":"/pages/architecture.html","position":4,"visibility":"visible"},{"key":"public-5-5","label":"Data & Knowledge","href":"/pages/data-security.html","position":5,"visibility":"visible"},{"key":"public-5-6","label":"AI Agents & Automation","href":"/pages/agentic-ai.html","position":6,"visibility":"visible"},{"key":"public-5-7","label":"Security, Risk & Privacy","href":"/pages/security-review.html","position":7,"visibility":"visible"},{"key":"public-5-8","label":"Testing & Quality","href":"/pages/assurance.html","position":8,"visibility":"visible"},{"key":"public-5-9","label":"Operations & Adoption","href":"/pages/ai-adoption.html","position":9,"visibility":"visible"},{"key":"public-5-10","label":"Good & Bad Practices","href":"/pages/greenfield-implementation.html","position":10,"visibility":"visible"},{"key":"public-5-11","label":"Glossary","href":"/pages/ai-technology-glossary.html","position":11,"visibility":"visible"}]},{"key":"public-6","label":"Case Studies & Demos","href":"/case-studies/","position":6,"visibility":"visible","children":[{"key":"public-6-1","label":"View All Case Studies & Demos","href":"/case-studies/","position":1,"visibility":"visible"},{"key":"public-6-2","label":"Dental Claims Case Study","href":"/case-studies/#dental-claims","position":2,"visibility":"visible"},{"key":"public-6-3","label":"Employee Access Case Study","href":"/case-studies/#user-onboarding","position":3,"visibility":"visible"},{"key":"public-6-4","label":"Banking AI Case Study","href":"/case-studies/#banking-agentic-ai","position":4,"visibility":"visible"},{"key":"public-6-5","label":"Customer Banking Demo","href":"/enterprise-architecture/banking-agent-demo/","position":5,"visibility":"visible"},{"key":"public-6-6","label":"AI Operations Demo","href":"/enterprise-architecture/ai-operations/","position":6,"visibility":"visible"},{"key":"public-6-7","label":"Sales Commission Demo","href":"/enterprise-architecture/incentive-commission-demo/","position":7,"visibility":"visible"}]},{"key":"public-7","label":"Templates & Reports","href":"/deliverables/","position":7,"visibility":"visible","children":[{"key":"public-7-1","label":"View All Templates & Reports","href":"/deliverables/","position":1,"visibility":"visible"},{"key":"public-7-2","label":"Decision Records","href":"/deliverables/#executive-records","position":2,"visibility":"visible"},{"key":"public-7-3","label":"Policies & Governance","href":"/deliverables/#governance-artefacts","position":3,"visibility":"visible"},{"key":"public-7-4","label":"Architecture Blueprints","href":"/deliverables/#architecture-artefacts","position":4,"visibility":"visible"},{"key":"public-7-5","label":"Delivery Plans","href":"/deliverables/#delivery-plans","position":5,"visibility":"visible"},{"key":"public-7-6","label":"Operations & Quality Reports","href":"/deliverables/#operational-reports","position":6,"visibility":"visible"},{"key":"public-7-7","label":"Audit Evidence","href":"/deliverables/#evidence-packs","position":7,"visibility":"visible"},{"key":"public-7-8","label":"Downloads","href":"/pages/resources.html","position":8,"visibility":"visible"}]},{"key":"public-8","label":"Tools","href":"/tools/","position":8,"visibility":"visible","children":[{"key":"public-8-1","label":"View All Tools","href":"/tools/","position":1,"visibility":"visible"},{"key":"public-8-2","label":"Assessments","href":"/assessments/library/","position":2,"visibility":"visible"},{"key":"public-8-3","label":"Screening Tools","href":"/tools/#classification","position":3,"visibility":"visible"},{"key":"public-8-4","label":"Priority Calculators","href":"/tools/#prioritisation","position":4,"visibility":"visible"},{"key":"public-8-5","label":"Design Decision Tools","href":"/tools/#architecture","position":5,"visibility":"visible"},{"key":"public-8-6","label":"Governance Checklists","href":"/tools/#checklists","position":6,"visibility":"visible"},{"key":"public-8-7","label":"Testing Tools","href":"/tools/#evaluation","position":7,"visibility":"visible"},{"key":"public-8-8","label":"My Assessment Results","href":"/assessments/dashboard/","position":8,"visibility":"visible"}]},{"key":"public-9","label":"About","href":"/pages/about.html","position":9,"visibility":"visible","children":[{"key":"public-9-1","label":"About the Platform","href":"/pages/about.html","position":1,"visibility":"visible"},{"key":"public-9-2","label":"Executive Career Portfolio","href":"/pages/executive-career-portfolio.html","position":2,"visibility":"visible"},{"key":"public-9-3","label":"Contact","href":"/pages/contact.html","position":3,"visibility":"visible"}]}]}',
  'methodology-json-baseline-2026-09-23',
  'Reconciled the 35-record D1 legacy snapshot with the current public navigation before activation.',
  json_object('rootCount',9,'itemCount',69,'legacyRecordCount',(SELECT COUNT(*) FROM menu_items),'valid',1),
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM navigation_versions WHERE status='published');

-- Existing active administrators retain access through the system Administrator role.
INSERT OR IGNORE INTO user_access_roles(user_id,role_id,assigned_by)
SELECT u.id,r.id,u.id FROM users u CROSS JOIN access_roles r
WHERE u.role='admin' AND u.status='active' AND r.key='administrator';

UPDATE access_roles
SET permissions_json='["dashboard.view","pages.manage","content.edit","content.review","content.approve","content.publish","navigation.manage","library.manage","users.manage","roles.manage","settings.manage","theme.manage","analytics.view","search.manage"]',
    updated_at=CURRENT_TIMESTAMP
WHERE key='administrator';
