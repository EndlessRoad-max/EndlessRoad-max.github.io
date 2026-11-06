import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
const base = process.env.CHECK_URL || 'http://127.0.0.1:4331/';
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 1000 }, reducedMotion: 'reduce' });
  await page.route('**/notes/**', async route => {
    if (route.request().resourceType() !== 'document') return route.continue();
    const response = await route.fetch();
    const fixture = Array.from({ length: 12 }, (_, i) => `<div data-note data-category="分页测试" data-tags='["共享标签","长标签名称用于验证换行可读性"]'><p>测试笔记 ${i + 1}</p></div>`).join('');
    await route.fulfill({ response, body: (await response.text()).replace('id="note-list">', `id="note-list">${fixture}`) });
  });
  await page.goto(new URL('notes/?category=' + encodeURIComponent('分页测试'), base).href);
  await page.getByRole('group', { name: '可探索的银河地图', exact: true }).waitFor();
  assert.equal(await page.locator('[data-note]:visible').count(), 10);
  await page.getByRole('button', { name: '下一页', exact: true }).click();
  assert.equal(await page.locator('[data-note]:visible').count(), 2);
  assert.equal(new URL(page.url()).searchParams.get('page'), '2');
  await page.reload();
  await page.getByText('2 / 2', { exact: true }).waitFor();
  await page.getByRole('button', { name: '共享标签，12 篇笔记', exact: true }).click();
  assert.equal(await page.locator('[data-note]:visible').count(), 10);
  assert.equal(new URL(page.url()).searchParams.has('page'), false);
  await page.getByRole('button', { name: '全部主题', exact: true }).click();
  await page.getByRole('button', { name: '下一组节点', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: '上一组节点', exact: true }).isEnabled(), true);
  await page.getByRole('button', { name: '列表选择', exact: true }).click();
  await page.getByRole('button', { name: 'Excel 数据抽取 (3)', exact: true }).click();
  assert.equal(await page.locator('[data-note]:visible').count(), 3);
  console.log('Galaxy pagination passed: 12-note fixture, page URL/reload, filter resets page, mobile node groups.');
} finally { await browser.close(); }
