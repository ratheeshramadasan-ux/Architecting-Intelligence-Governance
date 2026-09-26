-- FP-1: additive administration capabilities. Existing portal records remain untouched.

CREATE TABLE IF NOT EXISTS content_page_settings (
  page_id INTEGER PRIMARY KEY REFERENCES content_pages(id) ON DELETE CASCADE,
  workflow_state TEXT NOT NULL DEFAULT 'draft'
    CHECK (workflow_state IN ('draft','in_review','approved','published','archived')),
  seo_title TEXT NOT NULL DEFAULT '',
  seo_description TEXT NOT NULL DEFAULT '',
  canonical_url TEXT NOT NULL DEFAULT '',
  hero_json TEXT NOT NULL DEFAULT '{}',
  related_pages_json TEXT NOT NULL DEFAULT '[]',
  scheduled_publish_at TEXT,
  published_at TEXT,
  archived_at TEXT,
  updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id INTEGER NOT NULL REFERENCES content_pages(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  body_html TEXT NOT NULL DEFAULT '',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  change_note TEXT NOT NULL DEFAULT '',
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(page_id, version_number)
);

CREATE TABLE IF NOT EXISTS content_workflow_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id INTEGER NOT NULL REFERENCES content_pages(id) ON DELETE CASCADE,
  from_state TEXT,
  to_state TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS access_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  permissions_json TEXT NOT NULL DEFAULT '[]',
  system_role INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_access_roles (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES access_roles(id) ON DELETE CASCADE,
  assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(user_id, role_id)
);

CREATE TABLE IF NOT EXISTS library_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  asset_kind TEXT NOT NULL DEFAULT 'document'
    CHECK (asset_kind IN ('document','image','video','audio','archive','other')),
  category TEXT NOT NULL DEFAULT '',
  tags_json TEXT NOT NULL DEFAULT '[]',
  file_name TEXT NOT NULL,
  object_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  size_bytes INTEGER NOT NULL DEFAULT 0,
  version_label TEXT NOT NULL DEFAULT '1.0',
  visibility TEXT NOT NULL DEFAULT 'authenticated'
    CHECK (visibility IN ('public','authenticated','restricted')),
  related_pages_json TEXT NOT NULL DEFAULT '[]',
  download_enabled INTEGER NOT NULL DEFAULT 1,
  watermark_enabled INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','published','archived')),
  uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS search_index_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scope TEXT NOT NULL DEFAULT 'all',
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued','running','completed','failed')),
  records_indexed INTEGER NOT NULL DEFAULT 0,
  requested_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  requested_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  message TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  detail_json TEXT NOT NULL DEFAULT '{}',
  occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO access_roles(key,name,description,permissions_json,system_role) VALUES
  ('administrator','Administrator','Complete portal administration access.','["dashboard.view","pages.manage","content.edit","content.approve","content.publish","library.manage","users.manage","roles.manage","settings.manage","analytics.view","search.manage"]',1),
  ('editor','Content Editor','Create and edit content and library assets.','["dashboard.view","pages.manage","content.edit","library.manage"]',1),
  ('reviewer','Content Reviewer','Review and approve content before publication.','["dashboard.view","content.review","content.approve","analytics.view"]',1),
  ('member','Member','Authenticated access to protected public content.','[]',1);

CREATE INDEX IF NOT EXISTS idx_content_versions_page ON content_versions(page_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_page ON content_workflow_events(page_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_library_assets_status ON library_assets(status, asset_kind, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_time ON admin_audit_log(occurred_at DESC);
