INSERT OR IGNORE INTO page_access(path,title,visibility,requires_sign_in) VALUES
  ('/case-studies/','Enterprise AI Case Studies','visible',0),
  ('/case-studies/index.html','Enterprise AI Case Studies','visible',0);

INSERT INTO menu_items(label,url,parent_id,position,visibility)
SELECT 'Enterprise Case Studies','/case-studies/',NULL,75,'visible'
WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE url='/case-studies/');
