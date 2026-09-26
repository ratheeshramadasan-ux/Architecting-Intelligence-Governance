# 0.4 and 0.17 Navigation behaviour

## Desktop

Primary navigation exposes Home, Transformation, Lifecycle, Knowledge Centre, Deliverables, Tools and About. Lifecycle opens a two-level panel: stage sequence on the left and the selected stage’s workstreams on the right. It shows current stage, previous/next stage and gate status.

## Tablet and mobile

Use an accessible accordion. Only one stage need be expanded. Preserve the selected stage after navigation. Do not place all articles in one unbounded menu.

## Stage-local navigation

Breadcrumb; lifecycle progress; workstream navigation; on-page headings; related deliverables; previous/next page; previous/next stage.

## Accessibility

Semantic `nav` landmarks and lists; keyboard open/close and Escape; visible focus; `aria-expanded`; focus returned to trigger; screen-reader stage position; 44px touch targets; no hover-only behavior; reduced-motion support.

## Search and canonical identity

Search results show canonical title, stage, workstream, page type, status, audience, source and confidence. Alias matches resolve to the canonical page. Recently viewed content may be added only with privacy review; it is not currently supported.

