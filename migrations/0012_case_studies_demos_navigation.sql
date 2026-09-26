UPDATE menu_items
SET label='Case Studies & Demos', position=45, visibility='visible'
WHERE url='/case-studies/';

INSERT INTO menu_items(label,url,parent_id,position,visibility)
SELECT 'Healthcare: Dental Claims','/case-studies/#dental-claims',id,10,'visible'
FROM menu_items WHERE url='/case-studies/' AND parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM menu_items WHERE url='/case-studies/#dental-claims');

INSERT INTO menu_items(label,url,parent_id,position,visibility)
SELECT 'Identity: User Onboarding','/case-studies/#user-onboarding',id,20,'visible'
FROM menu_items WHERE url='/case-studies/' AND parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM menu_items WHERE url='/case-studies/#user-onboarding');

INSERT INTO menu_items(label,url,parent_id,position,visibility)
SELECT 'Banking: Agentic AI','/case-studies/#banking-agentic-ai',id,30,'visible'
FROM menu_items WHERE url='/case-studies/' AND parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM menu_items WHERE url='/case-studies/#banking-agentic-ai');

INSERT INTO menu_items(label,url,parent_id,position,visibility)
SELECT 'Customer Banking Demo','/enterprise-architecture/banking-agent-demo/',id,40,'visible'
FROM menu_items WHERE url='/case-studies/' AND parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM menu_items WHERE url='/enterprise-architecture/banking-agent-demo/');

INSERT INTO menu_items(label,url,parent_id,position,visibility)
SELECT 'AI Operations Demo','/enterprise-architecture/ai-operations/',id,50,'visible'
FROM menu_items WHERE url='/case-studies/' AND parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM menu_items WHERE url='/enterprise-architecture/ai-operations/');

INSERT INTO menu_items(label,url,parent_id,position,visibility)
SELECT 'Commission Operations Demo','/enterprise-architecture/incentive-commission-demo/',id,60,'visible'
FROM menu_items WHERE url='/case-studies/' AND parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM menu_items WHERE url='/enterprise-architecture/incentive-commission-demo/');
