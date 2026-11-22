# Satyam Bishwakarma — portfolio

A dependency-free, static portfolio with a concise opening, project previews linked to detailed case studies, light/dark themes, and optional ambient motion. No external fonts, tracking, CDN scripts, or build step.

## Preview

From this directory run `python3 -m http.server 4173` and visit http://localhost:4173. Opening `index.html` directly also works. Test light and dark themes, narrow screens, keyboard navigation, reduced motion, and every link before publishing.

## Fill in the placeholders

- Edit `content.js` for social URLs, project copy, repository links, and image paths. `null` social URLs render as clearly unavailable placeholders rather than broken links. GitHub is linked; X, LinkedIn, and CV await your final URLs. Use an HTTPS URL for a CV, or add a PDF under `assets/` and use its relative path.
- Replace `assets/composition.svg`, `assets/infrastructure.svg`, and `assets/water.svg` with actual screenshots or research figures. Current original illustrations are explicitly labeled; they are not screenshots or experimental plots. Update each image's `alt`, and change the illustrative captions in `app.js` once real assets are in place.
- Edit the introduction, education, about section, and metadata in `index.html`. Copy was grounded in the local GitHub profile README; verify research status and any reported results before launch.
- Remove the `noindex, nofollow` robots meta tag in `index.html` when the portfolio is ready to appear in search results.
- Colors and responsive layout live in `styles.css`. Porcelain is the primary light surface, carbon supplies structure and typography, and ultramarine is reserved for emphasis. Dark mode reverses the surface and ink roles. These are compositional proportions, not strict pixel counts.

## GitHub Pages (maintenance mode)

The user-site repository is `satyam-bishwakarma/satyam-bishwakarma.github.io`, serving `https://satyam-bishwakarma.github.io/`. The public site is intended to show only `maintenance/index.html` until content is ready. The full portfolio is available locally and in source.

`.github/workflows/pages.yml` is manual only. Pages is configured for GitHub Actions; pushing changes does not automatically deploy. When placeholders are complete, run **Actions → Publish portfolio → Run workflow**, choose mode **portfolio**, and enter `PUBLISH`. To return to the preparation screen, run with **maintenance** mode (the default). Check the workflow result and visit the live URL. Only the selected site's files enter the deployment artifact; tests and source documentation are excluded.

GitHub automatically enabled legacy branch publishing when the user-site repository was created and briefly deployed the first push. That build was cancelled, publishing was switched to Actions, and a maintenance deployment replaced the unfinished portfolio. The API refused direct Pages deactivation, so maintenance mode keeps unfinished content out of the current public website while preserving the source.

## Design references

The project-card screenshot supplied by the user informed the preview grid; the local Lumora prompt informed spacing and section rhythm. Second-pass live browser review covered React Bits' [Spotlight Card](https://reactbits.dev/components/spotlight-card), [Aurora](https://reactbits.dev/backgrounds/aurora), and the [ReactDrops](https://reactdrops.dev) homepage. Original effects in `effects.css` and `motion.js` adapt those ideas: pointer-following card illumination, slight depth, an ambient ultramarine wash, contour movement, path tracing, and one-time entrance transitions. No library code or third-party assets were copied.

[Apple typography guidance](https://developer.apple.com/design/human-interface-guidelines/typography) informed hierarchy and the native system font. A likely match for the originally ambiguous better-typography reference is [Jakub Krehel's skill](https://github.com/jakubkrehel/skills/blob/main/skills/better-typography/SKILL.md), reviewed on the second pass. Its guidance informed balanced headings, paragraph wrapping, rem-based text roles, and readable line measures.

Motion respects the operating system's reduced-motion preference even when the manual motion setting is enabled. Theme and manual motion choices persist locally when browser storage is available. Project links and social content are created using DOM text nodes; external links accept only HTTP(S).

## Verification

With the preview server running on port 4173, run `node tests/smoke.mjs`. The script uses the locally installed Playwright and Brave; override `PLAYWRIGHT_MODULE` and `BROWSER_PATH` for another machine, and `PORTFOLIO_URL` for another preview URL. It checks desktop/mobile layout, project navigation, asset loading, theme/motion persistence, reduced motion, keyboard focus, storage failure, and placeholders. Screenshots are generated locally under `qa/` and excluded from Git; `qa/test-results.json` records the most recent run. No numerical coverage claim is made for this browser smoke suite.

## Profile and navigation update

The profile content was checked against the current GitHub profile README on 22 November 2026. All four projects are represented, including DRM-YOLO with its planned-submission status. All four projects share the same overview grid. Confirmed X and LinkedIn URLs now work; CV remains unavailable until supplied. The about section includes the complete toolkit, quantitative foundations and education. Headings foreground identity, project names and background rather than slogans.

The work navigator starts above the overview cards and stays available through the project details. Overview is active while reading the cards, then the active state follows each project. It hides and clears its selection at About; anchor offsets follow its responsive height. Its active state follows scrolling using `aria-current="location"`; anchors preserve deep links and browser history. Destination sections receive keyboard focus. The theme control shows the action: sun to switch to light, moon to switch to dark, including system and stored preference changes.

About uses full-width content bands: profile and education, foundations and interests, then a three-column toolkit on desktop. A small ultramarine pointer glow complements the native cursor on fine-pointer devices; it expands over links/buttons and is disabled by motion pause or OS reduced motion.

## Navigation hierarchy and spacing

The global header remains available for Work, About and Connect, with its current section indicated. The project index is subordinate: one flat row with an underline, directly beneath the header while browsing work. Compact mobile labels keep all project choices readable; full accessible names remain available. Anchor offsets account for both rows. About uses a shared two-column grid for profile, credentials and foundations, followed by a three-column toolkit. Group spacing follows 8/16/24/32/48/64px steps; these are project design choices, informed by [Apple layout guidance](https://developer.apple.com/design/human-interface-guidelines/layout), not Apple-mandated web measurements.
