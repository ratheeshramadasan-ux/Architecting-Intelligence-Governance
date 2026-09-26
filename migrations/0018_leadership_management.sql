-- Leadership and executive management. Additive only; existing people records are preserved.
ALTER TABLE people_profiles ADD COLUMN first_name TEXT NOT NULL DEFAULT '';
ALTER TABLE people_profiles ADD COLUMN middle_name TEXT NOT NULL DEFAULT '';
ALTER TABLE people_profiles ADD COLUMN last_name TEXT NOT NULL DEFAULT '';
ALTER TABLE people_profiles ADD COLUMN slug TEXT;
ALTER TABLE people_profiles ADD COLUMN capability_line TEXT NOT NULL DEFAULT '';
ALTER TABLE people_profiles ADD COLUMN leadership_category TEXT NOT NULL DEFAULT 'Executive Leadership';
ALTER TABLE people_profiles ADD COLUMN person_type TEXT NOT NULL DEFAULT 'Executive';
ALTER TABLE people_profiles ADD COLUMN show_on_leadership INTEGER NOT NULL DEFAULT 1;
ALTER TABLE people_profiles ADD COLUMN featured_homepage INTEGER NOT NULL DEFAULT 0;
ALTER TABLE people_profiles ADD COLUMN status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived'));
ALTER TABLE people_profiles ADD COLUMN published_at TEXT;
ALTER TABLE people_profiles ADD COLUMN website_url TEXT NOT NULL DEFAULT '';
ALTER TABLE people_profiles ADD COLUMN email_public INTEGER NOT NULL DEFAULT 0;
ALTER TABLE people_profiles ADD COLUMN phone_public INTEGER NOT NULL DEFAULT 0;
ALTER TABLE people_profiles ADD COLUMN linkedin_public INTEGER NOT NULL DEFAULT 1;
ALTER TABLE people_profiles ADD COLUMN website_public INTEGER NOT NULL DEFAULT 0;

UPDATE people_profiles SET slug=stable_id WHERE slug IS NULL OR slug='';
CREATE UNIQUE INDEX IF NOT EXISTS idx_people_slug ON people_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_people_leadership_public ON people_profiles(status,is_active,show_on_leadership,featured_homepage,display_order);

CREATE TABLE IF NOT EXISTS person_expertise (
  id INTEGER PRIMARY KEY AUTOINCREMENT, person_id INTEGER NOT NULL REFERENCES people_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL, display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS person_experience (
  id INTEGER PRIMARY KEY AUTOINCREMENT, person_id INTEGER NOT NULL REFERENCES people_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL, organization_context TEXT NOT NULL DEFAULT '', description TEXT NOT NULL,
  start_date TEXT, end_date TEXT, outcome_metric TEXT NOT NULL DEFAULT '', display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS person_credentials (
  id INTEGER PRIMARY KEY AUTOINCREMENT, person_id INTEGER NOT NULL REFERENCES people_profiles(id) ON DELETE CASCADE,
  credential_type TEXT NOT NULL CHECK(credential_type IN ('education','certification','award','professional')),
  title TEXT NOT NULL, issuer TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS person_content_relationships (
  id INTEGER PRIMARY KEY AUTOINCREMENT, person_id INTEGER NOT NULL REFERENCES people_profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK(content_type IN ('case_study','framework','resource','insight')),
  content_id INTEGER, title TEXT NOT NULL DEFAULT '', url TEXT NOT NULL DEFAULT '', display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(person_id,content_type,content_id,url)
);
CREATE TABLE IF NOT EXISTS person_media (
  id INTEGER PRIMARY KEY AUTOINCREMENT, person_id INTEGER NOT NULL REFERENCES people_profiles(id) ON DELETE CASCADE,
  asset_id INTEGER NOT NULL REFERENCES library_assets(id) ON DELETE RESTRICT,
  media_type TEXT NOT NULL DEFAULT 'profile_photo' CHECK(media_type='profile_photo'), alt_text TEXT NOT NULL,
  width INTEGER, height INTEGER, created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(person_id,media_type)
);

UPDATE people_profiles SET
 first_name='Ratheesh',last_name='Ramadasan',slug='ratheesh-ramadasan',
 designation='Founder & Principal Consultant',
 capability_line='Enterprise Architecture · AI Governance · Intelligent Automation',
 leadership_category='Founder / Executive Leadership',person_type='Founder',display_order=1,
 show_on_leadership=1,featured_homepage=1,status='published',published_at=COALESCE(published_at,CURRENT_TIMESTAMP),
 cta_label='View Profile',cta_url='/about/leadership/ratheesh-ramadasan'
WHERE stable_id='ratheesh-ramadasan';

UPDATE people_profiles SET
 first_name='Ranjith',last_name='Pilanku',slug='ranjith-pilanku',
 designation='Director — Client Strategy & Enterprise Transformation',
 capability_line='Enterprise Services · Customer Success · Transformation · Strategic Client Leadership',
 leadership_category='Executive Leadership',person_type='Director',display_order=2,
 show_on_leadership=1,featured_homepage=1,status='published',published_at=COALESCE(published_at,CURRENT_TIMESTAMP),
 short_bio='',full_bio='',email='',phone='',linkedin_url='',email_public=0,phone_public=0,linkedin_public=0,
 cta_label='View Profile',cta_url='/about/leadership/ranjith-pilanku'
WHERE stable_id='ranjith-pilanku';

INSERT OR IGNORE INTO library_assets
  (title,description,asset_kind,category,tags_json,file_name,object_key,content_type,size_bytes,visibility,download_enabled,watermark_enabled,status)
VALUES
  ('Ranjith Pilanku profile photograph','Approved Leadership directory photograph.','image','Leadership media','["leadership","profile photograph"]','Ranjith Pilanku.jpg','leadership/ranjith-pilanku/profile/ranjith-pilanku.jpg','image/jpeg',30502,'public',0,0,'published');
INSERT OR IGNORE INTO person_media(person_id,asset_id,media_type,alt_text,width,height)
SELECT p.id,a.id,'profile_photo','Ranjith Pilanku, Director — Client Strategy & Enterprise Transformation',400,400
FROM people_profiles p JOIN library_assets a ON a.object_key='leadership/ranjith-pilanku/profile/ranjith-pilanku.jpg'
WHERE p.stable_id='ranjith-pilanku';

INSERT OR IGNORE INTO person_expertise(person_id,title,display_order)
SELECT id,'Enterprise Architecture',1 FROM people_profiles WHERE stable_id='ratheesh-ramadasan';
INSERT OR IGNORE INTO person_expertise(person_id,title,display_order)
SELECT id,'AI Governance',2 FROM people_profiles WHERE stable_id='ratheesh-ramadasan';
INSERT OR IGNORE INTO person_expertise(person_id,title,display_order)
SELECT id,'Intelligent Automation',3 FROM people_profiles WHERE stable_id='ratheesh-ramadasan';
INSERT OR IGNORE INTO person_expertise(person_id,title,display_order)
SELECT id,'Enterprise Services',1 FROM people_profiles WHERE stable_id='ranjith-pilanku';
INSERT OR IGNORE INTO person_expertise(person_id,title,display_order)
SELECT id,'Customer Success',2 FROM people_profiles WHERE stable_id='ranjith-pilanku';
INSERT OR IGNORE INTO person_expertise(person_id,title,display_order)
SELECT id,'Enterprise Transformation',3 FROM people_profiles WHERE stable_id='ranjith-pilanku';
INSERT OR IGNORE INTO person_expertise(person_id,title,display_order)
SELECT id,'Strategic Client Leadership',4 FROM people_profiles WHERE stable_id='ranjith-pilanku';
