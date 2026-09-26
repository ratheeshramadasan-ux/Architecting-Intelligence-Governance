# Homepage Component Inventory

| Component | Data source | Reusable behavior |
|---|---|---|
| Platform hero | Approved Phase 2.5 copy | Four canonical actions |
| Global search | `platform-search-index.json` | Searches topics, stages, roles, deliverables, assessments and workshops |
| Primary entry points | Platform index and assessment framework | Resource counts and section links |
| Browse by role | Curated role definitions | Sends role intent into global search |
| Browse by topic | Curated domain taxonomy | Sends topic intent into global search |
| Transformation journey | `methodology.json` | Renders all 14 stages without duplicating lifecycle data |
| Featured content | Current lifecycle state and canonical routes | Structured update, template and upcoming groups |
| Platform statistics | Methodology, Mobilise, Discover, assessment and search data | Recalculates counts when source records grow |
| Shared header/footer | `methodology.js` and `methodology.json` | Preserves approved navigation and identity |
