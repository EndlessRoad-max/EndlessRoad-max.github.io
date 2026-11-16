import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const base = process.env.CHECK_URL || 'http://127.0.0.1:4331/';
const output = 'test-results/notes';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });

class Notes {
  constructor(page) {
    this.page = page;
    this.navigation = page.getByRole('region', { name: '笔记筛选', exact: true });
    this.categories = page.getByRole('group', { name: '分类', exact: true });
    this.tags = page.getByRole('group', { name: '标签', exact: true });
    this.rows = page.locator('[data-note]:visible');
  }
  async open(query = '') {
    await this.page.goto(new URL('notes/' + query, base).href);
    await this.navigation.waitFor();
  }
  category(name, count) { return this.categories.getByRole('button', { name: `${name}，${count} 篇笔记`, exact: true }); }
  tag(name, count) { return this.tags.getByRole('button', { name: `#${name}，${count} 篇笔记`, exact: true }); }
  async count(total) {
    await this.page.getByRole('status').filter({ hasText: new RegExp(`共 ${total} 篇笔记$`) }).waitFor();
    assert.equal(await this.rows.count(), Math.min(total, 10));
  }
  async geometry() {
    assert(await this.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const issue = await this.navigation.evaluate(root => {
      const bounds = root.getBoundingClientRect();
      const buttons = [...root.querySelectorAll('button')].filter(b => !b.hidden).map(b => ({ name: b.textContent, r: b.getBoundingClientRect() }));
      for (const { name, r } of buttons) if (r.left < bounds.left || r.right > bounds.right + 1) return `clipped: ${name}`;
      for (let i = 0; i < buttons.length; i++) for (let j = i + 1; j < buttons.length; j++) {
        const a = buttons[i].r, b = buttons[j].r;
        if (Math.min(a.right, b.right) > Math.max(a.left, b.left) && Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top)) return `overlap: ${buttons[i].name} / ${buttons[j].name}`;
      }
      return '';
    });
    assert.equal(issue, '');
  }
}
try {
  await Promise.all([320, 390, 768, 1440].map(async width => {
    const context = await browser.newContext({ viewport: { width, height: 1050 }, reducedMotion: 'reduce', colorScheme: 'light' });
    await context.tracing.start({ screenshots: true, snapshots: true });
    const page = await context.newPage(), notes = new Notes(page), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await notes.open();
      const data = await page.locator('[data-note]').evaluateAll(rows => rows.map(row => ({ category: row.dataset.category, tags: JSON.parse(row.dataset.tags) })));
      const excel = data.filter(n => n.category === 'Excel 数据抽取');
      const openxml = excel.filter(n => n.tags.includes('OpenXML')).length;
      const globalOpenxml = data.filter(n => n.tags.includes('OpenXML')).length;
      const ai = data.filter(n => n.category === 'AI Agent');
      const ts = ai.filter(n => n.tags.includes('TypeScript')).length;
      const tagCount = new Set(data.flatMap(n => n.tags)).size;
      const limit = width <= 600 ? 6 : 10;
      await notes.count(data.length);
      assert.equal(await notes.tags.getByRole('button').count(), Math.min(tagCount, limit) + 1 + Number(tagCount > limit));
      await notes.geometry();
      assert((await notes.navigation.boundingBox()).height < (width <= 600 ? 420 : 280));
      await page.screenshot({ path: `${output}/${width}-light.png`, fullPage: true });
      await page.getByRole('button', { name: /切换到深色主题/ }).click();
      await page.screenshot({ path: `${output}/${width}-dark.png`, fullPage: true });
      await notes.tags.getByRole('button', { name: '展开全部标签', exact: true }).click();
      assert.equal(await notes.tags.getByRole('button').count(), tagCount + 2);
      await notes.geometry();
      await notes.tags.getByRole('button', { name: '收起', exact: true }).click();
      await notes.category('Excel 数据抽取', excel.length).click();
      await notes.count(excel.length);
      assert.equal(new URL(page.url()).searchParams.get('category'), 'Excel 数据抽取');
      if (!(await notes.tag('OpenXML', openxml).isVisible())) await notes.tags.getByRole('button', { name: '展开全部标签', exact: true }).click();
      await notes.tag('OpenXML', openxml).click(); await notes.count(openxml);
      await notes.tag('OpenXML', openxml).click(); await notes.count(excel.length);
      await page.goBack(); await notes.count(openxml);
      await page.goForward(); await notes.count(excel.length);
      await notes.tag('Excel', excel.filter(n => n.tags.includes('Excel')).length).click();
      await page.reload(); await notes.navigation.waitFor();
      assert.equal(await notes.tag('Excel', excel.filter(n => n.tags.includes('Excel')).length).getAttribute('aria-pressed'), 'true');
      await notes.category('AI Agent', ai.length).click();
      await notes.count(ai.length);
      assert.equal(new URL(page.url()).searchParams.has('tag'), false);
      await page.getByRole('button', { name: '清除筛选', exact: true }).click();
      await notes.count(data.length);
      await notes.open('?tag=OpenXML'); await notes.count(globalOpenxml);
      assert(await notes.tag('OpenXML', globalOpenxml).isVisible());
      await notes.open('?category=missing&tag=missing'); await notes.count(0);
      assert(await page.getByText('还没有符合条件的笔记，试试其他分类或标签。', { exact: true }).isVisible());
      await page.getByRole('button', { name: '清除筛选', exact: true }).click(); await notes.count(data.length);
      await notes.open('?category=AI+Agent&tag=TypeScript'); await notes.count(ts);
      await notes.geometry();
      await page.screenshot({ path: `${output}/${width}-topic.png`, fullPage: true });
      await notes.tags.getByRole('button', { name: '全部', exact: true }).focus();
      assert(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle !== 'none'));
      await page.keyboard.press('Enter'); await notes.count(ai.length);
      assert.equal(new URL(page.url()).searchParams.has('tag'), false);
      await notes.categories.getByRole('button', { name: '全部', exact: true }).focus();
      await page.keyboard.press('Space'); await notes.count(data.length);
      assert.deepEqual(errors, []);
    } finally {
      await context.tracing.stop({ path: `${output}/${width}-trace.zip` });
      await context.close();
    }
  }));
  const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const tp = await touch.newPage(), tn = new Notes(tp); await tn.open();
  await tn.category('科研方法', 1).tap(); await tn.count(1);
  await tn.tag('深度学习', 1).tap(); await tn.count(1);
  await touch.close();
  const plain = await browser.newContext({ javaScriptEnabled: false });
  const pp = await plain.newPage(); await pp.goto(new URL('notes/', base).href);
  assert.equal(await pp.locator('[data-note]:visible').count(), await pp.locator('[data-note]').count());
  assert.equal(await pp.getByRole('region', { name: '笔记筛选', exact: true }).count(), 0);
  assert(await pp.getByRole('link', { name: '搜索笔记正文', exact: true }).isVisible());
  await plain.close();
  console.log('Notes passed: 4 widths, both themes, filters/history, tag links, expansion, empty state, keyboard/touch, no-JS fallback.');
} finally { await browser.close(); }
