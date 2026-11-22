import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const playwrightPath = process.env.PLAYWRIGHT_MODULE || '/home/freeze_404/.local/share/mise/installs/playwright/1.65.1/node_modules/playwright';
const { chromium } = require(playwrightPath);
const baseURL = process.env.PORTFOLIO_URL || 'http://127.0.0.1:4173';
const artifacts = fileURLToPath(new URL('../qa/', import.meta.url));
await mkdir(artifacts, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.BROWSER_PATH || '/opt/brave-bin/brave',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const results = [];

async function check(name, body) {
  try {
    await body();
    results.push({ name, status: 'pass' });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({ name, status: 'fail', error: error.message });
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

async function visit(context) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const response = await page.goto(baseURL, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200, 'Website must be served successfully');
  await page.getByRole('heading', { level: 1 }).waitFor();
  return { page, errors };
}

async function clickStickyControl(page, control) {
  // Locator auto-scroll can move a sticky control despite it already being visible.
  const box = await control.boundingBox();
  assert.ok(box && box.y >= 0, 'Sticky control must already be in the viewport');
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await check(`layout and project navigation at ${viewport.width}x${viewport.height}`, async () => {
      const context = await browser.newContext({ viewport });
      try {
        const { page, errors } = await visit(context);
        assert.match(await page.locator('main').innerText(), /Satyam/i);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'No horizontal page overflow');
        await page.locator('img').evaluateAll(async images => {
          await Promise.all(images.map(image => {
            image.loading = 'eager';
            return image.decode();
          }));
        });
        const brokenImages = await page.locator('img').evaluateAll(images => images.filter(image => !image.complete || !image.naturalWidth).map(image => image.src));
        assert.deepEqual(brokenImages, [], 'Project imagery must load');
        const links = await page.locator('a[href^="#"]').evaluateAll(anchors => anchors.map(anchor => ({ href: anchor.getAttribute('href'), label: anchor.textContent.trim() })));
        assert.ok(links.length >= 3, 'Expected working section links');
        for (const { href } of links) {
          assert.ok(href.length > 1, 'No dead # links');
          assert.ok(await page.locator(`[id="${href.slice(1)}"]`).count(), `Anchor ${href} must resolve`);
        }
        const projectLink = page.locator('.project-card').first();
        assert.ok(await projectLink.count(), 'Project preview must link to a detailed project');
        const projectHref = await projectLink.getAttribute('href');
        await projectLink.click();
        await page.waitForFunction(hash => location.hash === hash, projectHref);
        assert.equal(new URL(page.url()).hash, projectHref);
        assert.deepEqual(errors, [], 'No uncaught application errors');
        await page.goto(baseURL, { waitUntil: 'networkidle' });
        await page.screenshot({ path: `${artifacts}${viewport.width}x${viewport.height}-viewport.png` });
        await page.screenshot({ path: `${artifacts}${viewport.width}x${viewport.height}.png`, fullPage: true });
        await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'About', exact: true }).click();
        await page.waitForFunction(() => document.querySelector('#about').getBoundingClientRect().top <= document.querySelector('.site-header').getBoundingClientRect().height + 28);
        assert.equal(await page.locator('#project-navigation').count(), 0, 'There must be no second project navigation bar');
        await page.screenshot({ path: `${artifacts}about-${viewport.width}.png` });
      } finally { await context.close(); }
    });
  }

  await check('theme and motion preferences persist after reload', async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
    try {
      const { page } = await visit(context);
      const theme = page.getByRole('button', { name: /theme|dark|light/i }).first();
      const before = await page.locator('html').getAttribute('data-theme');
      await theme.click();
      const after = await page.locator('html').getAttribute('data-theme');
      assert.notEqual(after, before, 'Theme control must change theme');
      await page.reload({ waitUntil: 'networkidle' });
      assert.equal(await page.locator('html').getAttribute('data-theme'), after, 'Theme persists');
      const motion = page.getByRole('button', { name: /motion|animation/i }).first();
      const motionBefore = await motion.getAttribute('aria-pressed');
      await motion.click();
      const motionAfter = await motion.getAttribute('aria-pressed');
      assert.notEqual(motionAfter, motionBefore, 'Motion control must change state');
      await page.reload({ waitUntil: 'networkidle' });
      assert.equal(await page.getByRole('button', { name: /motion|animation/i }).first().getAttribute('aria-pressed'), motionAfter, 'Motion preference persists');
      await page.screenshot({ path: `${artifacts}alternate-theme.png`, fullPage: true });
    } finally { await context.close(); }
  });

  await check('system reduced motion disables decorative animation', async () => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    try {
      const { page } = await visit(context);
      const running = await page.evaluate(() => document.getAnimations().filter(animation => {
        const timing = animation.effect.getComputedTiming();
        return animation.playState === 'running' && timing.duration > 10 && timing.iterations === Infinity;
      }).length);
      assert.equal(running, 0, 'Reduced-motion users must not receive continuous decorative animations');
    } finally { await context.close(); }
  });

  await check('keyboard access and storage failure remain usable', async () => {
    const context = await browser.newContext();
    try {
      await context.addInitScript(() => {
        Storage.prototype.getItem = () => { throw new Error('Storage unavailable'); };
        Storage.prototype.setItem = () => { throw new Error('Storage unavailable'); };
      });
      const { page, errors } = await visit(context);
      await page.keyboard.press('Tab');
      assert.equal(await page.locator(':focus').textContent(), 'Skip to content');
      const outline = await page.locator(':focus').evaluate(node => getComputedStyle(node).outlineStyle);
      assert.notEqual(outline, 'none', 'Keyboard focus must be visible');
      assert.ok(await page.locator(':focus').evaluate(node => {
        const box = node.getBoundingClientRect();
        return node.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
      }), 'Skip link must appear above the sticky header');
      await page.getByRole('button', { name: /theme/i }).click();
      assert.ok(await page.locator('html').getAttribute('data-theme'));
      await page.getByRole('button', { name: /motion/i }).click();
      assert.equal(await page.locator('#motion').getAttribute('aria-pressed'), 'true');
      assert.deepEqual(errors, [], 'Unavailable storage must not break controls');
    } finally { await context.close(); }
  });

  await check('card lighting responds to pointer and motion pause clears effects', async () => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    try {
      const { page } = await visit(context);
      const card = page.locator('.project-card').first();
      await card.hover({ position: { x: 80, y: 80 } });
      await page.waitForFunction(() => document.querySelector('.project-card').style.getPropertyValue('--spot-x') !== '', null, { timeout: 3000 });
      const spot = await card.evaluate(node => node.style.getPropertyValue('--spot-x'));
      assert.ok(spot.endsWith('px'));
      assert.equal(await page.locator('.cursor-halo').getAttribute('data-active'), 'true');
      assert.equal(await page.locator('.cursor-halo path').count(), 1, 'Custom cursor is an arrow silhouette');
      assert.notEqual(await page.locator('.cursor-halo path').evaluate(node => getComputedStyle(node).stroke), 'none');
      assert.equal(await page.locator('html').getAttribute('data-custom-cursor'), 'on');
      await page.locator('#motion').click();
      assert.equal(await card.evaluate(node => node.style.getPropertyValue('--spot-x')), '');
      assert.equal(await page.locator('.cursor-halo').evaluate(node => getComputedStyle(node).display), 'none');
      assert.equal(await page.locator('.cursor-halo').getAttribute('data-active'), 'false');
      assert.equal(await page.locator('html').getAttribute('data-custom-cursor'), null, 'Pause restores native cursor');
      assert.ok(await page.locator('.intro-copy, .project-figure, .card-copy, .project-preview').evaluateAll(nodes => nodes.every(node => !node.style.transform && !node.style.filter && !node.style.opacity)), 'GSAP reveal styles are cleared when motion is paused');
      assert.equal(await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length), 0);
      assert.equal(await page.locator('h1').isVisible(), true);
    } finally { await context.close(); }
  });

  await check('one React navigation handles projects, overview, keyboard and page sections', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    try {
      const { page, errors } = await visit(context);
      const nav = page.getByRole('navigation', { name: 'Main navigation', exact: true });
      assert.equal(await page.getByRole('navigation').count(), 1, 'One navigation landmark, no second bar');
      await page.locator('.project-card').last().click();
      const picker = nav.getByRole('button', { name: 'Browse projects' });
      await clickStickyControl(page, picker);
      await nav.getByRole('link', { name: 'Read Scalable image-processing infrastructure' }).click();
      await page.waitForFunction(() => location.hash === '#image-infrastructure');
      assert.equal(await picker.getAttribute('aria-expanded'), 'false');
      await clickStickyControl(page, picker);
      await nav.getByRole('link', { name: 'Read DRM-YOLO object detection' }).click();
      await page.waitForFunction(() => location.hash === '#drm-yolo');
      await page.waitForFunction(() => {
        const top = document.querySelector('#drm-yolo').getBoundingClientRect().top;
        const header = document.querySelector('.site-header').getBoundingClientRect().height;
        return top >= header && top <= header + 30;
      }, null, { timeout: 5000 });
      const readingPosition = await page.evaluate(() => scrollY);
      await clickStickyControl(page, picker);
      assert.equal(await page.evaluate(() => scrollY), readingPosition, 'Opening project picker preserves reading position');
      await page.screenshot({ path: `${artifacts}navigator-mobile.png` });
      await page.keyboard.press('Escape');
      assert.equal(await picker.getAttribute('aria-expanded'), 'false');
      assert.equal(await picker.evaluate(node => node === document.activeElement), true);
      await clickStickyControl(page, picker);
      await nav.getByRole('link', { name: /All projects/ }).click();
      await page.waitForFunction(() => location.hash === '#work');
      assert.equal(await page.locator('.project-card').count(), 4);
      await nav.getByRole('link', { name: 'About', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('a[href="#about"][aria-current]') !== null);
      assert.equal(await picker.getAttribute('aria-expanded'), 'false');
      assert.deepEqual(errors, []);
    } finally { await context.close(); }
  });

  await check('theme symbol follows theme, persisted preference, and system changes', async () => {
    const context = await browser.newContext({ colorScheme: 'light' });
    try {
      const { page } = await visit(context);
      const button = page.locator('#theme');
      const moon = await button.locator('path').getAttribute('d');
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.waitForFunction(() => document.querySelector('#theme').dataset.icon === 'sun');
      assert.notEqual(await button.locator('path').getAttribute('d'), moon);
      await button.click();
      assert.equal(await button.getAttribute('data-icon'), 'moon');
      await page.reload({ waitUntil: 'networkidle' });
      assert.equal(await button.getAttribute('data-icon'), 'moon');
    } finally { await context.close(); }
  });

  await check('unfinished social and CV destinations are not misleading links', async () => {
    const context = await browser.newContext();
    try {
      const { page } = await visit(context);
      const deadLinks = await page.locator('a').evaluateAll(anchors => anchors.filter(anchor => {
        const href = anchor.getAttribute('href') || '';
        return href === '#' || /example\.com|YOUR_|PLACEHOLDER|javascript:/i.test(href);
      }).map(anchor => ({ label: anchor.textContent.trim(), href: anchor.getAttribute('href') })));
      assert.deepEqual(deadLinks, [], 'Missing destinations should be visibly unavailable');
      assert.ok(await page.getByText(/LinkedIn/i).count(), 'LinkedIn is represented');
      assert.ok(await page.getByText(/GitHub/i).count(), 'GitHub is represented');
      assert.ok(await page.getByText(/CV/i).count(), 'CV is represented');
    } finally { await context.close(); }
  });
} finally {
  await browser.close();
  await writeFile(`${artifacts}test-results.json`, JSON.stringify({ baseURL, results }, null, 2) + '\n');
}
if (results.some(result => result.status === 'fail')) process.exitCode = 1;
