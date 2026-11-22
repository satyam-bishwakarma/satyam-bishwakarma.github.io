# Satyam Bishwakarma — portfolio

A static portfolio with React navigation, GSAP section reveals, and a Vite production build. Dependencies are bundled locally; there are no CDN scripts, external fonts, or tracking. The introduction, profile and project source remain easy to edit.

## Preview and build

Run `npm ci`, then `npm run dev` and open http://127.0.0.1:4173/. For a production preview, run `npm run build` followed by `npm run preview`, or serve `dist/` with a static server. Opening the source HTML directly is unsupported.

`src/Navigation.jsx` owns the single navigation component. Work leads to the overview; its adjacent project-picker button gives access to every project. The picker supports native links, current-project state, outside-click dismissal and Escape focus return. About and Connect use the same navigation styling. There is no second project navigation bar.

`src/RevealEffects.jsx` uses GSAP for short, one-time, staggered entrances. Text travels 14px without blur; figures travel 20px with a 2px blur. Content remains readable before scripts load. Direct project destinations settle immediately, and manual pause or OS reduced motion cancels reveals and clears their styles.

`motion.js` owns card lighting and the custom arrow cursor. The arrow has a theme-aware ultramarine stroke and drop shadow aligned to its actual tip. There is no circular or offset cursor glow. It restores the native cursor for touch, editable fields, window blur, manual pause and OS reduced motion.

## Editing content

- `content.js`: all four projects, descriptions, evidence, image paths and social URLs. Unknown URLs stay `null`, producing unavailable placeholders. GitHub, X and LinkedIn are populated; CV is pending. A CV may use an HTTPS URL or a relative PDF under `assets/`.
- `index.html`: introduction, profile, education, toolkit and metadata. Facts were checked against the GitHub profile README; verify research status and reported results before launch.
- `assets/`: replace the original representative illustrations with actual project screenshots or research figures. Update image alt text and illustrative captions in `app.js` when replacing them.
- `styles.css` and `effects.css`: porcelain/carbon/ultramarine tokens, layout, card interactions and cursor styling. `src/navigation.css` owns the React navigation visuals.
- Remove `noindex, nofollow` from `index.html` when ready for search indexing.

About uses a shared grid and 8/16/24/32/48/64px spacing steps. These are project design choices informed by Apple's alignment and grouping guidance, not Apple-mandated web dimensions.

## GitHub Pages — preparation mode

Repository: [satyam-bishwakarma/satyam-bishwakarma.github.io](https://github.com/satyam-bishwakarma/satyam-bishwakarma.github.io). Public address: https://satyam-bishwakarma.github.io/.

The public site currently shows only `maintenance/index.html`. Pushing source does not deploy. To launch the portfolio, use **Actions → Publish portfolio → Run workflow**, choose **portfolio**, and enter `PUBLISH`. To restore the preparation screen, choose **maintenance**, the default mode. The workflow installs locked dependencies, builds Vite output, and stages either `dist/` or the maintenance HTML. Tests and source documents are excluded from deployment.

During initial setup GitHub auto-enabled legacy user-site publishing and briefly deployed the first push. It was switched to manual Actions publishing and replaced with the preparation screen; the API refused direct Pages deactivation.

## Verification

With a preview running on port 4173, run `node tests/smoke.mjs`. Set `PLAYWRIGHT_MODULE` and `BROWSER_PATH` for the local Playwright installation and browser executable, or `PORTFOLIO_URL` for another server. The current setup uses installed Playwright and Brave.

The suite checks desktop/mobile layout, asset loading, native project links, the single React navigation and project picker, keyboard dismissal/focus, reading-position stability, theme symbols and persistence, reduced motion, GSAP pause cleanup, cursor appearance/restoration, storage failure, and placeholders. Screenshots are generated under `qa/` and excluded from Git. `qa/test-results.json` records the latest run; no numerical coverage claim is made.

## Design references

The supplied project-grid screenshot and local Lumora prompt informed the composition. The supplied React Bits PillNav and AnimatedContent sources informed the interaction patterns; the implementation uses React navigation and GSAP reveals tailored to this portfolio rather than copying every option.

References reviewed: [React Bits](https://reactbits.dev), [ReactDrops](https://reactdrops.dev), [Apple layout guidance](https://developer.apple.com/design/human-interface-guidelines/layout), [Apple typography guidance](https://developer.apple.com/design/human-interface-guidelines/typography), and [Jakub Krehel's better-typography skill](https://github.com/jakubkrehel/skills/blob/main/skills/better-typography/SKILL.md), a likely match for the originally ambiguous typography reference.
