# Theme Preservation Report

## Retained

- Deep navy/teal identity, restrained gold accents, and professional enterprise tone.
- Existing typography character, logo, header, navigation, footer, and route familiarity.
- White editorial surfaces, narrow theory reading measure, and established content hierarchy.

## Updated

- Heroes now communicate one business outcome and a visual system.
- Cards are replaced where possible by journeys, flows, operating models, metrics strips, and responsibility views.
- White space and heading scale create executive scanability.
- Interactions disclose meaning rather than decorating the page.

## Deprecated for new work

- Page openings dominated by long paragraphs.
- Repeated equal-weight tile catalogues.
- Unstructured badge/pill proliferation.
- Decorative gradients, excessive shadows, and motion without explanatory value.

The result is an evolution of the recognised production theme, not a brand replacement.

## Shared footer continuity correction

The shared footer now uses the earlier production palette through explicit tokens:

| Token | Retained / adjusted value | Use |
|---|---:|---|
| `--footer-background` | `#f7f5ef` | Earlier cream footer background |
| `--footer-surface` | `#ffffff` | Optional neutral surface |
| `--footer-text` | `#102b48` | Established portal text navy |
| `--footer-muted-text` | `#5c6c7b` | Earlier muted blue-grey |
| `--footer-link` | `#08264a` | Established primary navy |
| `--footer-link-hover` | `#765515` | Accessibility-adjusted dark gold |
| `--footer-border` | `#e8e2d5` | Earlier warm footer divider |
| `--footer-accent` | `#bd8b2e` | Established production gold accent |
| `--footer-deep` | `#061d38` | Existing deep navy focus outline |

The only colour adjustment is the hover text: the production gold remains the accent, while a darker gold is used for hover text to preserve a 6.25:1 contrast ratio on cream. Footer text, muted text, links, and hover links measure 13.18:1, 4.96:1, 13.89:1, and 6.25:1 respectively.

The footer is rendered once by `shared-site-shell.js`. Both established shared entry scripts load that shell; no pilot contains a page-specific footer implementation. Existing footer elements are reused as semantic `<footer>` containers and their old page-specific contents are replaced.

The treatment deliberately avoids a new dark palette, gradients, card panels, decorative imagery, and fixed positioning. Its grouped links, warm divider, cream field, navy type, gold accents, and logo align it with the existing header and navigation.
