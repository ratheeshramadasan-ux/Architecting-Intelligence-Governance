-- Controlled appearance and theme management. Additive only; existing content is unchanged.

CREATE TABLE IF NOT EXISTS theme_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version_number INTEGER NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','published','superseded')),
  config_json TEXT NOT NULL,
  change_note TEXT NOT NULL DEFAULT '',
  baseline INTEGER NOT NULL DEFAULT 0,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  published_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_theme_single_draft
  ON theme_versions(status) WHERE status='draft';
CREATE UNIQUE INDEX IF NOT EXISTS idx_theme_single_published
  ON theme_versions(status) WHERE status='published';
CREATE INDEX IF NOT EXISTS idx_theme_history
  ON theme_versions(version_number DESC);

UPDATE access_roles
SET permissions_json='["dashboard.view","pages.manage","content.edit","content.approve","content.publish","library.manage","users.manage","roles.manage","settings.manage","analytics.view","search.manage","theme.manage","theme.publish"]',
    updated_at=CURRENT_TIMESTAMP
WHERE key='administrator';
