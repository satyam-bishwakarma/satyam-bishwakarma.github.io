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

## GitHub Pages (prepared, deployment disabled)

The intended user-site repository is `satyam-bishwakarma/satyam-bishwakarma.github.io`, which serves `https://satyam-bishwakarma.github.io/` once deployed. Source can be public while the site remains unpublished.

`.github/workflows/pages.yml` is manual only. Pushing changes does not automatically deploy. When placeholders are complete, configure repository **Settings → Pages → Source → GitHub Actions**, then run the Pages workflow with the required `PUBLISH` confirmation. Check its result and visit the live URL. The workflow publishes the static site; there is no application server.

## Design references

The project-card screenshot supplied by the user informed the preview grid; the local Lumora prompt informed spacing and section rhythm. [React Bits](https://reactbits.dev) and [ReactDrops](https://reactdrops.dev) informed restrained background motion rather than copied components. [Apple typography guidance](https://developer.apple.com/design/human-interface-guidelines/typography) informed the native system font, hierarchy, clear grouping, and generous space. The requested better-typography reference could not be retrieved; readable line lengths and spacing were applied directly.

Motion respects the operating system's reduced-motion preference even when the manual motion setting is enabled. Theme and manual motion choices persist locally when browser storage is available. Project links and social content are created using DOM text nodes; external links accept only HTTP(S).

## Verification

With the preview server running on port 4173, run `node tests/smoke.mjs`. The script uses the locally installed Playwright and Brave; override `PLAYWRIGHT_MODULE` and `BROWSER_PATH` for another machine, and `PORTFOLIO_URL` for another preview URL. It checks desktop/mobile layout, project navigation, asset loading, theme/motion persistence, reduced motion, keyboard focus, storage failure, and placeholders. Screenshots are generated locally under `qa/` and excluded from Git; `qa/test-results.json` records the most recent run. No numerical coverage claim is made for this browser smoke suite.
