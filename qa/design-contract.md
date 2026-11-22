# Portfolio design contract

Audience: research collaborators, internship reviewers, and engineering hiring teams.
Primary job: understand Satyam's focus and inspect evidence within a short visit.

- At 1440×900, show identity, academic context, research/engineering focus, social/CV access and selected project previews.
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
