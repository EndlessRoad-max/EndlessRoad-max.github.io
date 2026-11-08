import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
const base = process.env.TEST_URL || 'http://127.0.0.1:4331/';
await mkdir('test-results/theme-motion', { recursive: true });
class ThemePage {
  constructor(page) { this.page = page; this.toggle = page.getByRole('button', { name: /切换到.*主题/ }); }
  async open(route = '') {
    await this.page.goto(new URL(route, base).href);
    if (!route) await this.page.waitForFunction(() => document.querySelector('.lunar-surface img').classList.contains('is-ready') && document.querySelector('.handwritten-motto').dataset.state === 'complete');
  }
  async settled() { await this.page.waitForFunction(() => !document.documentElement.hasAttribute('data-theme-changing')); }
  async assertSceneClock() {
    const state = await this.page.evaluate(() => {
      const progress = Number(document.documentElement.style.getPropertyValue('--night-progress'));
      const backing = getComputedStyle(document.body, '::before');
      return {
        progress,
        backing: Number(backing.opacity),
        daylight: Number(getComputedStyle(document.querySelector('.daybreak-sky')).opacity),
        backingTransition: backing.transitionDuration,
        layers: [document.body, ...document.querySelectorAll('.daybreak-sky, .sphere-sky, .star-field')]
          .map(layer => Number(getComputedStyle(layer).getPropertyValue('--night-progress'))),
      };
    });
    assert.equal(state.backingTransition, '0s', 'background must not interpolate the scene clock a second time');
    assert(Math.abs(state.backing - state.progress) < 0.00001, 'background follows the shared scene clock without a tail');
    assert(Math.abs(state.daylight - (1 - state.progress)) < 0.00001, 'daylight follows the shared scene clock');
    assert(state.layers.every(progress => Math.abs(progress - state.progress) < 0.00001), 'all scene layers receive the same non-inherited progress');
  }
  async geometry() { return this.page.locator('main').boundingBox(); }
  async clouds() {
    return this.page.evaluate(() => {
      const scene = document.querySelector(innerWidth < 640 ? '.sun-scene-mobile' : '.sun-scene-desktop');
      return [...scene.querySelectorAll('.sun-cloud')].map(cloud => ({
        transform: getComputedStyle(cloud).transform,
        opacity: getComputedStyle(cloud).opacity,
        playState: getComputedStyle(cloud).animationPlayState,
        times: cloud.getAnimations().map(animation => animation.currentTime),
      }));
    });
  }
  async frame(name, progress) {
    if (progress !== null) await this.page.waitForFunction(p => {
      const root = document.documentElement;
      const value = Number(root.style.getPropertyValue('--night-progress'));
      return root.classList.contains('dark') ? value >= p : value <= 1 - p;
    }, progress);
    await this.assertSceneClock();
    // Bring both sides of the scene boundary into the viewport: full-page
    // screenshots do not extend the fixed theme backing below the viewport.
    await this.page.evaluate(() => scrollTo({top: 180, behavior: 'instant'}));
    const screenshot = await this.page.screenshot({ path: `test-results/theme-motion/${name}.png` });
    const { data, info } = await sharp(screenshot).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    // Below the moon's own fade, scene and page must meet without a dark/light band.
    const boundary = await this.page.locator('.sphere-sky').evaluate(e => Math.round(e.getBoundingClientRect().bottom));
    for (const y of [boundary - 12, boundary - 5, boundary, boundary + 5]) {
      for (let channel = 0; channel < 3; channel++) {
        const edge = data[(y * info.width + 5) * 3 + channel];
        const page = data[((boundary + 16) * info.width + 5) * 3 + channel];
        assert(Math.abs(edge - page) <= 3, `${name}: visible scene seam at y=${y}: ${edge} vs ${page}`);
      }
    }
    await this.page.evaluate(() => scrollTo({top: 0, behavior: 'instant'}));
  }
}
try {
  await Promise.all([390, 1440].map(async width => {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme: 'light' });
    await context.tracing.start({ screenshots: true, snapshots: true });
    const page = await context.newPage(), site = new ThemePage(page);
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await site.open(); const before = await site.geometry();
    await page.screenshot({ path: `test-results/theme-motion/${width}-day.png` });
    const cloudStart = await site.clouds();
    assert.equal(cloudStart.length, 2);
    assert(cloudStart.every(cloud => cloud.playState === 'paused'), 'cloud masks remain static while light filters are retained');
    await site.toggle.focus(); await page.keyboard.press('Enter');
    await site.frame(`${width}-dusk-middle`, .5); await site.settled();
    await page.screenshot({ path: `test-results/theme-motion/${width}-night.png` });
    assert.equal(await site.toggle.getAttribute('title'), '切换到浅色主题');
    assert.deepEqual(await site.geometry(), before);
    await site.toggle.click(); await site.frame(`${width}-dawn-middle`, .5); await site.settled();
    await site.assertSceneClock();
    assert.deepEqual(await site.clouds(), cloudStart, 'theme changes do not advance the cloud masks');
    // Also inspect real shared-clock frames: normalizing each transition's time
    // can hide a synchronization bug between the scene and the page background.
    for (const direction of ['dusk', 'dawn']) {
      await site.toggle.click();
      for (const elapsed of [80, 240, 480]) {
        await page.waitForFunction(({ elapsed, direction }) => {
          const value = Number(document.documentElement.style.getPropertyValue('--night-progress'));
          const threshold = elapsed / 1100;
          return direction === 'dusk' ? value >= threshold : value <= 1 - threshold;
        }, { elapsed, direction });
        await site.frame(`${width}-${direction}-live-${elapsed}`, null);
      }
      await site.settled();
    }
    await page.evaluate(() => { const button = document.getElementById('theme-toggle'); button.click(); requestAnimationFrame(() => { button.click(); requestAnimationFrame(() => button.click()); }); });
    await site.settled();
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('dark')), true);
    assert.equal(await page.evaluate(() => localStorage.getItem('theme')), 'dark');
    assert.deepEqual(await site.geometry(), before);
    await page.evaluate(() => scrollTo({ top: document.querySelector('.sphere-sky').getBoundingClientRect().height + 50, behavior: 'instant' }));
    await page.waitForFunction(() => document.querySelector('.sphere-sky').getBoundingClientRect().bottom <= 0);
    assert.equal(await page.locator('.daybreak-sky').evaluate(e => e.classList.contains('sky-paused')), true, 'sunlight pauses offscreen');
    await site.toggle.dispatchEvent('click');
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('lunar-transition')), false);
    await site.settled();
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForFunction(() => !document.querySelector('.daybreak-sky').classList.contains('sky-paused'));
    assert.deepEqual(await site.clouds(), cloudStart, 'returning onscreen does not restart cloud animation');
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    assert.equal(await page.locator('.daybreak-sky').evaluate(e => e.classList.contains('sky-paused')), true, 'background document pauses sunlight');
    await page.evaluate(() => {
      delete document.hidden;
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForFunction(() => !document.querySelector('.daybreak-sky').classList.contains('sky-paused'));
    assert.deepEqual(await site.clouds(), cloudStart, 'returning to the foreground keeps cloud masks static');
    await site.open('notes/'); await site.toggle.click();
    assert.equal(await page.locator('body').evaluate(e => getComputedStyle(e).transitionDuration.split(',')[0]), '0.3s');
    await site.settled();
    await page.emulateMedia({ reducedMotion: 'reduce' }); await site.toggle.click();
    assert.equal(await page.locator('body').evaluate(e => getComputedStyle(e).transitionDuration), '0s');
    await site.open(); await site.toggle.click(); await site.settled();
    assert(await page.evaluate(() => [...document.querySelectorAll('.sun-cloud')].every(cloud => getComputedStyle(cloud).animationName === 'none')), 'reduced motion also disables cloud timelines');
    assert.deepEqual(errors, []);
    await context.tracing.stop({ path: `test-results/theme-motion/${width}-trace.zip` }); await context.close();
  }));
  const context = await browser.newContext({ colorScheme: 'light' });
  await context.addInitScript(() => { Storage.prototype.setItem = Storage.prototype.getItem = () => { throw new Error('Storage unavailable'); }; });
  const page = await context.newPage(), site = new ThemePage(page); await site.open();
  await site.toggle.click(); await site.settled();
  await page.emulateMedia({ colorScheme: 'dark' }); await page.emulateMedia({ colorScheme: 'light' });
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains('dark')), true);
  await context.close();
  console.log('PASS: desktop/mobile static clouds, theme transition frames, keyboard, interruption, layout, offscreen, inner pages, reduced motion, unavailable storage');
} finally { await browser.close(); }
