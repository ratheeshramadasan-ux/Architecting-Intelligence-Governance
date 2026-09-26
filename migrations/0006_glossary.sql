INSERT OR IGNORE INTO page_access(path,title,visibility,requires_sign_in)
VALUES ('/pages/ai-technology-glossary.html','AI and Technology Glossary','visible',0);

UPDATE menu_items SET url='', label='Resources' WHERE id=8;
INSERT OR IGNORE INTO menu_items(id,label,url,parent_id,position) VALUES
  (801,'Resources & Downloads','/pages/resources.html',8,10),
  (802,'AI & Technology Glossary','/pages/ai-technology-glossary.html',8,20);
