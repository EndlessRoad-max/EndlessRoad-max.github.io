import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const base = process.env.CHECK_URL || 'http://127.0.0.1:4331/';
const output = 'test-results/galaxy';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
class Notes {
  constructor(page) {
    this.page = page;
    this.map = page.getByRole('group', { name: '可探索的银河地图', exact: true });
    this.list = page.getByRole('group', { name: '列表选择主题或标签', exact: true });
    this.rows = page.locator('[data-note]:visible');
  }
  async open(query = '') { await this.page.goto(new URL('notes/' + query, base).href); await this.map.waitFor(); }
  async listOpen() { await this.page.getByRole('button', { name: '列表选择', exact: true }).click(); }
  async choose(name) { await this.list.getByRole('button', { name, exact: true }).click(); }
  async geometry() {
    const issue = await this.map.evaluate(map => {
      const frame = map.getBoundingClientRect();
      const buttons = [...map.querySelectorAll('button')].map(b => ({ name: b.textContent, r: b.getBoundingClientRect() }));
      for (const { name, r } of buttons) if (r.left < frame.left || r.right > frame.right || r.top < frame.top || r.bottom > frame.bottom) return `clipped: ${name}`;
      for (let i = 0; i < buttons.length; i++) for (let j = i + 1; j < buttons.length; j++) {
        const a = buttons[i].r, b = buttons[j].r;
        if (Math.min(a.right, b.right) > Math.max(a.left, b.left) && Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top)) return `overlap: ${buttons[i].name} / ${buttons[j].name}`;
      }
      return '';
    });
    assert.equal(issue, '');
    assert(await this.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  }
}
try {
  await Promise.all([320, 390, 768, 1440].map(async width => {
    const context = await browser.newContext({ viewport: { width, height: 1050 }, reducedMotion: 'reduce' });
    await context.tracing.start({ screenshots: true, snapshots: true });
    const page = await context.newPage(), notes = new Notes(page), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await notes.open();
      const total = await notes.rows.count();
      assert.equal(await notes.map.getAttribute('data-moving'), 'false');
      await notes.geometry();
      await page.screenshot({ path: `${output}/${width}-light.png`, fullPage: true });
      await page.getByRole('button', { name: /切换到深色主题/ }).click();
      await page.screenshot({ path: `${output}/${width}-dark.png`, fullPage: true });
      await notes.listOpen(); await notes.choose('Excel 数据抽取 (3)');
      assert.equal(await notes.rows.count(), 3);
      assert.equal(new URL(page.url()).searchParams.get('category'), 'Excel 数据抽取');
      await notes.choose('OpenXML (2)'); assert.equal(await notes.rows.count(), 2);
      await notes.geometry();
      await notes.choose('OpenXML (2)'); assert.equal(await notes.rows.count(), 3);
      await page.goBack(); assert.equal(await notes.rows.count(), 2);
      await page.goForward(); assert.equal(await notes.rows.count(), 3);
      await notes.choose('Excel (3)');
      await page.reload(); await notes.map.waitFor();
      assert.equal(await notes.map.getByRole('button', { name: 'Excel，3 篇笔记', exact: true }).getAttribute('aria-pressed'), 'true');
      await page.getByRole('button', { name: '清除筛选', exact: true }).click();
      assert.equal(await notes.rows.count(), total);
      await notes.open('?tag=OpenXML'); assert.equal(await notes.rows.count(), 2);
      await notes.open('?category=missing&tag=missing');
      assert.equal(await notes.rows.count(), 0);
      assert(await page.getByText('还没有符合条件的笔记，试试其他分类或标签。', { exact: true }).isVisible());
      assert.equal(await notes.map.getByRole('button', { name: /missing/ }).count(), 0);
      await notes.open('?category=AI+Agent&tag=TypeScript');
      assert.equal(await notes.rows.count(), 2); await notes.geometry();
      await page.screenshot({ path: `${output}/${width}-topic.png`, fullPage: true });
      await notes.map.getByRole('button', { name: 'AI Agent，清除标签筛选', exact: true }).focus();
      await page.keyboard.press('Enter'); assert.equal(new URL(page.url()).searchParams.has('tag'), false);
      assert.deepEqual(errors, []);
    } finally {
      await context.tracing.stop({ path: `${output}/${width}-trace.zip` });
      await context.close();
    }
  }));
  // A real animation clock drives the complete 240-second orbit, sampled every 4s.
  for (const width of [320, 768]) {
    const context = await browser.newContext({ viewport: { width, height: 1050 } });
    const page = await context.newPage(), notes = new Notes(page);
    await page.clock.install(); await notes.open(); await page.mouse.move(0, 0);
    await page.waitForFunction(() => document.getElementById('galaxy-map').dataset.moving === 'true');
    for (let step = 0; step < 60; step++) { await page.clock.runFor(4000); await notes.geometry(); }
    await notes.map.hover(); assert.equal(await notes.map.getAttribute('data-moving'), 'false');
    await page.mouse.move(0, 0); assert.equal(await notes.map.getAttribute('data-moving'), 'true');
    await page.getByRole('button', { name: '暂停公转', exact: true }).click();
    assert.equal(await notes.map.getAttribute('data-moving'), 'false');
    await page.getByRole('button', { name: '继续公转', exact: true }).click();
    assert.equal(await notes.map.getAttribute('data-moving'), 'true');
    await notes.map.getByRole('button', { name: '笔记本，显示全部笔记', exact: true }).focus();
    assert.equal(await notes.map.getAttribute('data-moving'), 'false');
    await page.getByRole('button', { name: '列表选择', exact: true }).focus();
    await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    await page.waitForFunction(() => document.getElementById('galaxy-map').dataset.moving === 'false');
    await context.close();
  }
  const touch = await browser.newContext({ viewport: { width: 390, height: 1000 }, hasTouch: true, isMobile: true });
  const tp = await touch.newPage(), tn = new Notes(tp); await tn.open();
  await tn.map.getByRole('button', { name: '笔记本，显示全部笔记', exact: true }).tap();
  assert.equal(await tn.map.getAttribute('data-moving'), 'false');
  await tp.getByRole('button', { name: '继续公转', exact: true }).tap();
  assert.equal(await tn.map.getAttribute('data-moving'), 'true'); await touch.close();
  const fallback = await browser.newContext();
  await fallback.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
  const fp = await fallback.newPage(), fn = new Notes(fp); await fn.open(); await fn.listOpen();
  await fn.choose('AI Agent (2)'); assert.equal(await fn.rows.count(), 2); await fallback.close();
  const plain = await browser.newContext({ javaScriptEnabled: false });
  const pp = await plain.newPage(); await pp.goto(new URL('notes/', base).href);
  assert((await pp.locator('[data-note]:visible').count()) > 0);
  assert.equal(await pp.getByRole('region', { name: '知识星系', exact: true }).count(), 0);
  await plain.close();
  console.log('Galaxy passed: 4 widths, both themes, filters/history, tag links, empty state, keyboard/touch, full orbit geometry, pause/offscreen, reduced motion, Canvas/JS fallback.');
} finally { await browser.close(); }
