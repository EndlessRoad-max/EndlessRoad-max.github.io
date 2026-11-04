import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base=process.env.CHECK_URL || 'http://127.0.0.1:4323/';
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({headless:true});
class Notes {
  constructor(page){this.page=page;this.category=page.getByRole('combobox',{name:/按分类阅读/});this.tag=page.getByRole('combobox',{name:/按标签发现/});}
  async open(query=''){await this.page.goto(new URL('notes/'+query,base).href);await this.category.waitFor();}
}
try {
 await Promise.all([375,768,1440].map(async width=>{
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  const page=await context.newPage();const notes=new Notes(page);await notes.open();
  await notes.tag.click();assert.equal(await notes.tag.evaluate(el=>getComputedStyle(el).outlineStyle),'none');
  assert.equal(await notes.tag.getAttribute('aria-expanded'),'true');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.screenshot({path:`test-results/filters-${width}-light.png`});
  await page.evaluate(()=>document.documentElement.classList.add('dark'));
  await page.screenshot({path:`test-results/filters-${width}-dark.png`});
  await notes.category.click();assert.equal(await notes.tag.getAttribute('aria-expanded'),'false');
  await page.getByRole('option',{name:'日常记录',exact:true}).click();
  assert.equal(new URL(page.url()).searchParams.get('category'),'日常记录');
  assert.equal(await page.getByText('共 1 篇笔记',{exact:true}).count(),1);
  await notes.tag.click();await page.getByRole('option',{name:'随笔',exact:true}).click();
  assert.equal(new URL(page.url()).searchParams.get('tag'),'随笔');
  await page.goBack();assert.equal(await notes.tag.innerText(),'全部标签');
  await notes.tag.click();await page.getByRole('heading',{name:'笔记本',exact:false}).click();
  assert.equal(await notes.tag.getAttribute('aria-expanded'),'false');
  await context.close();
 }));
 const context=await browser.newContext();const page=await context.newPage();const notes=new Notes(page);await notes.open();
 await notes.category.focus();await page.keyboard.press('ArrowDown');
 assert.equal(await notes.category.getAttribute('aria-expanded'),'true');
 assert.equal(await notes.category.evaluate(el=>getComputedStyle(el).outlineStyle),'solid');
 await page.keyboard.press('End');await page.keyboard.press('Enter');
 assert(new URL(page.url()).searchParams.has('category'));
 await notes.tag.focus();await page.keyboard.press('Space');await page.keyboard.press('m');await page.keyboard.press('Enter');
 assert.equal(new URL(page.url()).searchParams.get('tag'),'Markdown');
 await notes.tag.click();await page.keyboard.press('Escape');assert.equal(await notes.tag.getAttribute('aria-expanded'),'false');
 await notes.tag.click();await page.keyboard.press('Tab');assert.equal(await notes.tag.getAttribute('aria-expanded'),'false');
 await notes.open('?category='+encodeURIComponent('不存在的分类'));
 assert((await notes.category.innerText()).includes('不存在的分类'));
 assert.equal(await page.getByText('还没有符合条件的笔记，试试其他分类或标签。',{exact:true}).isVisible(),true);
 await context.close();
 const plain=await browser.newContext({javaScriptEnabled:false});const plainPage=await plain.newPage();await plainPage.goto(new URL('notes/',base).href);
 assert.equal(await plainPage.getByRole('combobox',{name:'按分类阅读',exact:true}).isVisible(),true);
 assert.equal(await plainPage.getByRole('combobox',{name:'按标签发现',exact:true}).isVisible(),true);
 await plain.close();
 console.log('Filters passed: pointer focus, keyboard, selection, URL/back, unknown value, 3 widths, both themes, native fallback.');
} finally {await browser.close();}
