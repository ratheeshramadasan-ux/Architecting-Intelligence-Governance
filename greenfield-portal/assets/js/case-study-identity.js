(() => {
  const identities = Object.freeze({
    "dental-claims": { number:"01", taxonomy:"Healthcare · Intelligent Processing", patternTitle:"Intelligent Transaction Processing", businessContext:"Enterprise Dental Claims" },
    "user-onboarding": { number:"02", taxonomy:"Identity · Access Orchestration", patternTitle:"Enterprise Identity & Access Orchestration", businessContext:"Enterprise User Onboarding" },
    "banking-agentic-ai": { number:"03", taxonomy:"Banking · Agentic Operations", patternTitle:"Agentic Service Operations", businessContext:"Banking Customer Support" },
    "agentic-commission-operations": { number:"04", taxonomy:"Insurance · Decisioning & Settlement", patternTitle:"Dynamic Rules, Calculation & Settlement", businessContext:"Insurance Commission & Brokerage" }
  });
  const normalize = item => {
    const identity = identities[item?.slug];
    if (!identity) return { ...item, taxonomy:item?.category||"Case study", displayTitle:item?.title||"Case study", businessContext:item?.description||"" };
    return { ...item, ...identity, displayTitle:`Case Study ${identity.number} — ${identity.patternTitle}` };
  };
  window.caseStudyIdentity = { identities, normalize };
})();
