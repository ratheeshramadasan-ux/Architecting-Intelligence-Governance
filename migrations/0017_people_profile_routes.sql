-- Public profile routes for centrally managed executive profiles.
-- Additive data correction only; no existing profile or content is removed.
UPDATE people_profiles SET cta_label='View Ranjith portfolio',cta_url='/people/ranjith-pilanku/',updated_at=CURRENT_TIMESTAMP WHERE stable_id='ranjith-pilanku';
UPDATE people_profiles SET cta_label='View Ratheesh portfolio',cta_url='/pages/executive-career-portfolio.html',updated_at=CURRENT_TIMESTAMP WHERE stable_id='ratheesh-ramadasan';
