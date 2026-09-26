-- Align navigation labels and placement with the actual editorial focus of each page.
UPDATE menu_items SET label='Enterprise Platform Migration Strategy', position=10 WHERE url='/pages/ai-adoption.html';
UPDATE menu_items SET label='AI & Automation Opportunity Prioritization', position=20 WHERE url='/pages/ai-rpa-prioritization.html';

UPDATE menu_items SET parent_id=2, label='Greenfield AI Governance Blueprint', position=5 WHERE url='/pages/greenfield-implementation.html';
UPDATE menu_items SET label='Integrated Governance Model', position=10 WHERE url='/pages/governance-integration.html';

UPDATE menu_items SET label='Enterprise Architecture & Implementation', position=10 WHERE url='/pages/architecture.html';
UPDATE menu_items SET label='AI Architecture & Runtime Implementation', position=10 WHERE url='/pages/ai-architecture.html';

-- Document Processing is an intelligent-automation operating and measurement pattern,
-- not a standalone solution catalogue.
UPDATE menu_items SET parent_id=6, label='Intelligent Document Processing', position=30 WHERE url='/pages/document-processing.html';
UPDATE menu_items SET label='Intelligent Automation Framework', position=10 WHERE url='/pages/automation.html';
UPDATE menu_items SET label='AI Automation & Autonomy Spectrum', position=20 WHERE url='/pages/ai-automation-spectrum.html';

UPDATE menu_items SET label='AI Security & Architecture Review', position=20 WHERE url='/pages/security-review.html';
UPDATE menu_items SET label='Vendor, Infrastructure & Lifecycle Risk', position=50 WHERE url='/pages/vendor-assurance.html';

-- Keep the planned domain in Admin, but do not show an empty public dropdown.
UPDATE menu_items SET visibility='hidden' WHERE id=5;
