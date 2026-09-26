-- Portal completion: centrally managed people and reusable showcase media.
-- Additive only. Existing showcase, library, navigation and authentication data are preserved.

CREATE TABLE IF NOT EXISTS showcase_media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  showcase_id INTEGER NOT NULL REFERENCES showcase_items(id) ON DELETE CASCADE,
  asset_id INTEGER NOT NULL REFERENCES library_assets(id) ON DELETE RESTRICT,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('exploded_view','diagram','gallery')),
  alt_text TEXT NOT NULL DEFAULT '',
  caption TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(showcase_id,asset_type)
);

CREATE INDEX IF NOT EXISTS idx_showcase_media_item ON showcase_media(showcase_id,asset_type,display_order);

-- The supplied exploded-view originals are uploaded to these deterministic staging R2 keys.
-- Keeping the metadata deterministic makes this migration safe to re-run and prevents duplicates.
INSERT OR IGNORE INTO library_assets
  (title,description,asset_kind,category,tags_json,file_name,object_key,content_type,size_bytes,version_label,visibility,related_pages_json,download_enabled,watermark_enabled,status)
VALUES
  ('Enterprise Dental Claims HyperAutomation — exploded view','Case Study 01 architecture exploded view.','image','Case Study media','["Case Study 01","exploded view"]','Enterprise Dental Claims HyperAutomation.png','showcase/case-study-01/enterprise-dental-claims-hyperautomation.png','image/png',1936945,'1.0','public','["/case-studies/#dental-claims"]',0,0,'published'),
  ('Enterprise User Onboarding — exploded view','Case Study 02 architecture exploded view.','image','Case Study media','["Case Study 02","exploded view"]','Enterprise User Onboarding.png','showcase/case-study-02/enterprise-user-onboarding.png','image/png',1927258,'1.0','public','["/case-studies/#user-onboarding"]',0,0,'published'),
  ('Banking Customer Support — exploded view','Case Study 03 architecture exploded view.','image','Case Study media','["Case Study 03","exploded view"]','Banking Customer Support.png','showcase/case-study-03/banking-customer-support.png','image/png',1909355,'1.0','public','["/case-studies/#banking-agentic-ai"]',0,0,'published'),
  ('Agentic Insurance Commission Operations — exploded view','Case Study 04 architecture exploded view.','image','Case Study media','["Case Study 04","exploded view"]','Agentic Insurance Commission Operations.png','showcase/case-study-04/agentic-insurance-commission-operations.png','image/png',1996139,'1.0','public','["/case-studies/#agentic-commission-operations"]',0,0,'published');

INSERT OR IGNORE INTO showcase_media(showcase_id,asset_id,asset_type,alt_text,caption,display_order)
SELECT s.id,a.id,'exploded_view',
  CASE s.slug
    WHEN 'dental-claims' THEN 'Exploded architecture view for Enterprise Dental Claims HyperAutomation'
    WHEN 'user-onboarding' THEN 'Exploded architecture view for Enterprise User Onboarding and Access Provisioning'
    WHEN 'banking-agentic-ai' THEN 'Exploded architecture view for Banking Customer Support using Agentic AI and Hyperautomation'
    ELSE 'Exploded architecture view for Agentic Insurance Commission Operations'
  END,
  'Architecture, governance, integration and execution layers.',0
FROM showcase_items s
JOIN library_assets a ON a.object_key=CASE s.slug
  WHEN 'dental-claims' THEN 'showcase/case-study-01/enterprise-dental-claims-hyperautomation.png'
  WHEN 'user-onboarding' THEN 'showcase/case-study-02/enterprise-user-onboarding.png'
  WHEN 'banking-agentic-ai' THEN 'showcase/case-study-03/banking-customer-support.png'
  WHEN 'agentic-commission-operations' THEN 'showcase/case-study-04/agentic-insurance-commission-operations.png'
END
WHERE s.slug IN ('dental-claims','user-onboarding','banking-agentic-ai','agentic-commission-operations');

-- Reconcile the established public numbering into the existing ordering field.
UPDATE showcase_items SET display_order=10 WHERE slug='dental-claims';
UPDATE showcase_items SET display_order=20 WHERE slug='user-onboarding';
UPDATE showcase_items SET display_order=30 WHERE slug='banking-agentic-ai';
UPDATE showcase_items SET display_order=40 WHERE slug='agentic-commission-operations';

CREATE TABLE IF NOT EXISTS people_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stable_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  designation TEXT NOT NULL DEFAULT '',
  short_bio TEXT NOT NULL DEFAULT '',
  full_bio TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  linkedin_url TEXT NOT NULL DEFAULT '',
  profile_image_url TEXT NOT NULL DEFAULT '',
  specialties_json TEXT NOT NULL DEFAULT '[]',
  location TEXT NOT NULL DEFAULT '',
  cta_label TEXT NOT NULL DEFAULT '',
  cta_url TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  public_visibility INTEGER NOT NULL DEFAULT 1,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_people_public ON people_profiles(is_active,public_visibility,display_order);

INSERT OR IGNORE INTO people_profiles
  (stable_id,name,display_name,designation,short_bio,full_bio,email,phone,linkedin_url,profile_image_url,specialties_json,location,cta_label,cta_url,display_order,is_active,public_visibility)
VALUES
  ('ratheesh-ramadasan','Ratheesh Ramadasan','Ratheesh Ramadasan','Principal Consultant — Enterprise Automation, AI Governance & Architecture',
   'Connecting enterprise architecture and governance with practical automation and AI implementation.',
   'A career built from financial operations through transformation leadership, intelligent automation, platform strategy, enterprise architecture and governed AI.',
   'ratheesh.ramadasan@gmail.com','','https://www.linkedin.com/in/ratheesh-ramadasan','/assets/images/ratheesh-ramadasan.jpg',
   '["Enterprise architecture","AI governance","Intelligent automation"]','Canada','About Ratheesh','/pages/executive-career-portfolio.html',10,1,1),
  ('ranjith-pilanku','Ranjith Pilanku','Ranjith Pilanku','Director — Technology Strategy & Delivery',
   'Technology strategy and delivery leadership focused on turning enterprise priorities into dependable execution.',
   'Ranjith supports technology strategy, delivery leadership and practical execution across the Architecting Intelligence platform.',
   'reachranjithpilanku@gmail.com','+1 (780) 222-1514','','/assets/images/profile-placeholder.svg',
   '["Technology strategy","Delivery leadership"]','Canada','Contact Ranjith','mailto:reachranjithpilanku@gmail.com',20,1,1);

UPDATE access_roles
SET permissions_json='["dashboard.view","pages.manage","content.edit","content.review","content.approve","content.publish","navigation.manage","library.manage","showcase.manage","showcase.publish","people.manage","users.manage","roles.manage","settings.manage","theme.manage","analytics.view","search.manage"]',
    updated_at=CURRENT_TIMESTAMP
WHERE key='administrator';
