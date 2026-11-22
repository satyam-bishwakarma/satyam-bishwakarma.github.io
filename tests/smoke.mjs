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
        assert.equal(await page.locator('#project-navigation').isVisible(), false, 'Detail navigation must be absent at About');
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
      assert.equal(await page.locator('.cursor-halo').evaluate(node => getComputedStyle(node, '::before').borderTopWidth), '0px', 'Cursor light must have no outlined ring');
      await page.locator('#motion').click();
      assert.equal(await card.evaluate(node => node.style.getPropertyValue('--spot-x')), '');
      assert.equal(await page.locator('.cursor-halo').evaluate(node => getComputedStyle(node).display), 'none');
      assert.equal(await page.locator('.cursor-halo').getAttribute('data-active'), 'false');
      assert.equal(await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length), 0);
      assert.equal(await page.locator('h1').isVisible(), true);
    } finally { await context.close(); }
  });

  await check('project navigator jumps between distant details and tracks active section', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    try {
      const { page } = await visit(context);
      await page.locator('.project-card').last().click();
      await page.waitForFunction(() => location.hash === '#water-quality');
      const navigator = page.getByRole('navigation', { name: 'Project navigator' });
      await navigator.getByRole('link', { name: 'Read Scalable image-processing infrastructure' }).click();
      await page.waitForFunction(() => location.hash === '#image-infrastructure');
      await page.waitForFunction(() => document.querySelector('#project-navigation a[aria-current]')?.getAttribute('href') === '#image-infrastructure');
      const bounds = await navigator.boundingBox();
      const dot = page.locator('.pill-active-dot');
      assert.equal(await dot.evaluate(node => getComputedStyle(node).opacity), '1', 'Active global section has a visible indicator');
      const headerBox = await page.locator('.site-header').boundingBox();
      assert.ok(Math.abs(bounds.y - headerBox.height) < 2, 'Project index sits directly below the global header');
      await navigator.getByRole('link', { name: 'Read DRM-YOLO object detection' }).click();
      assert.equal(await page.locator('#drm-yolo').isVisible(), true);
      await page.screenshot({ path: `${artifacts}navigator-mobile.png` });
      await navigator.getByRole('link', { name: 'Overview', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('#project-navigation a[href="#work"]').getAttribute('aria-current') === 'location');
      assert.equal(await navigator.isVisible(), true, 'Navigator begins above the overview grid');
      assert.equal(await page.getByRole('navigation', {name:'Main navigation',exact:true}).getByRole('link',{name:'Work',exact:true}).getAttribute('aria-current'), 'location');
      const navBox = await navigator.boundingBox();
      const gridBox = await page.locator('#project-grid').boundingBox();
      assert.ok(gridBox.y > navBox.y + navBox.height, 'Overview grid belongs below the navigator');
      assert.equal(await page.locator('.project-card').count(), 4, 'All projects share the overview grid');
      await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'About', exact: true }).click();
      await page.waitForFunction(() => location.hash === '#about');
      assert.equal(await navigator.isVisible(), false, 'Project navigation must not appear in About');
      assert.equal(await page.getByRole('navigation', {name:'Main navigation',exact:true}).getByRole('link',{name:'About',exact:true}).getAttribute('aria-current'), 'location');
      assert.equal(await navigator.locator('[aria-current]').count(), 0, 'About must not carry a stale project selection');
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
