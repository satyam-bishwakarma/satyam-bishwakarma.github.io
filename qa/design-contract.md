# Portfolio design contract

Audience: research collaborators, internship reviewers, and engineering hiring teams.
Primary job: understand Satyam's focus and inspect evidence within a short visit.

- At 1440×900, show identity, academic context, research/engineering focus, social/CV access and all four selected project previews.
- At 390×844, prioritize identity and access, then stack project previews without horizontal scrolling.
- Each project preview links to its own detailed section, with a description and representative visual side by side on desktop and stacked on mobile.
- Porcelain/carbon foundations with ultramarine accents: approximate 60/30/10 visual balance, inverted for dark mode.
- Restrained gradient motion, manual pause, OS reduced-motion support, persistent theme choice.
- Visible keyboard focus, readable body copy, labelled icon controls, no fabricated achievements, no fake contact success flow.
- Missing social destinations and CV must be clearly unavailable rather than broken links; representative diagrams must not pose as actual screenshots.
- Publish only through a manual GitHub Pages workflow. Saving source must not publish the unfinished site.

References inspected: user's local project-grid screenshot and Lumora template prompt; Apple Human Interface Guidelines; GitHub Pages documentation. Second-pass live browser review covered React Bits Spotlight Card and Aurora plus ReactDrops homepage (local reference captures in qa/). Reviewed Jakub Krehel's better-typography skill as a likely match for the original ambiguous reference.

Motion refinement preserves the existing layout. Pointer spotlights and slight card depth apply only with a fine pointer and hover support. Entrance transitions run once, start from visible content and cannot gate reading. Gradients, contour movement, path tracing and UI transitions stop under manual pause or OS reduced motion. No shader runtime, external library or scroll hijacking is added.

This is a static site: no server data, authentication, forms, or loading dependency is required. Browser storage failure must leave controls usable for the current visit.

Organization revision: all four projects share an equal card hierarchy; the hero names Satyam and describes his work directly. Project navigation only appears inside detail browsing; Overview and About clear current-project selection.

Latest structure: navigator precedes Overview cards and spans the whole work region; Overview has its own active state. About uses full-width grouped rows. Pointer halo preserves the native cursor and is disabled for touch, pause and reduced motion.

Hierarchy refinement: sticky global header; subordinate flat project index with underline selection. Compact mobile labels avoid clipped choices at target viewport. About uses equal grid tracks and shared spacing for headings/body. Keyboard skip-link must render above the header; global Work/About active states follow their anchors.

Supplied-effects adaptation: PillNav-inspired behavior applies to the global navigation only. AnimatedContent-inspired short staggered entrances use visible fallbacks, never disappearance or scrub; figures alone use blur. Pointer light is offset and unoutlined.

Current migration supersedes earlier two-row navigation: React provides one global pill navigation and an accessible project picker. GSAP owns reveal effects, Vite bundles dependencies. Cursor is an arrow with ultramarine edge and shadow; native pointer is restored on pause/reduced motion/touch/editable fields.

Latest preference: default system cursor only, no custom overlay or cursor effects. Single Projects disclosure contains Overview and all project links, alongside About and Connect.

Latest scroll revision supersedes resistance: native passive wheel scroll; short idle settle uses actual content end and next start. Long projects remain freely scrollable. Navigator labels have no hover roll/fill.

Current scrolling preference supersedes earlier transition experiments: default native scrolling only; no magnetic controller, resistance, snapping or smooth anchor animation.

Explicit next-section link: fixed, labelled destination, native instant anchors and focus movement; no bounce or scroll interception; hides at Contact/page bottom.

Current continuation design: integrated header row, not fixed corner overlay. Actual header height measured for anchors; no reading-area control; restrained hover/press feedback.

Latest header: one row only. Identity/navigation left, Continue center, theme/motion right. Compact menu below1101px retains access to all destinations, with nested dismissal/focus behavior. No second row and no floating overlay.
