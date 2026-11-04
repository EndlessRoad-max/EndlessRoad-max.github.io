import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.CHECK_URL || 'http://127.0.0.1:4323/';
await mkdir('test-results', {recursive:true});
const browser = await chromium.launch({headless:true});
const label='一直在路上，想看看前面还有什么。 Still curious. Still moving forward.';
class Home {
  constructor(page) {this.page=page; this.motto=page.getByRole('region',{name:label,exact:true});}
  async open() {await this.page.goto(base); await this.motto.waitFor();}
  async complete() {await this.page.waitForFunction(()=>document.querySelector('[data-state]')?.getAttribute('data-state')==='complete');}
  async layout() {
    const {page,motto}=this;
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'horizontal overflow');
    const a=await motto.boundingBox(), b=await page.getByRole('heading',{name:'陈书研',exact:true}).boundingBox();
    assert(a.y+a.height<=b.y,'motto overlaps identity');
    const header=await page.getByRole('banner').boundingBox();
    assert(header.y+header.height<=a.y,'header overlaps motto');
  }
}
try {
 await Promise.all([375,768,1440].map(async width=>{
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();const home=new Home(page);await home.open();await home.complete();await home.layout();
  await page.screenshot({path:`test-results/motto-${width}.png`});
  await page.evaluate(()=>document.documentElement.classList.add('dark'));
  await page.screenshot({path:`test-results/motto-${width}-dark.png`});
  await context.close();
 }));
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const home=new Home(page);await home.open();
 assert.equal(await home.motto.getAttribute('data-state'),'writing');
 const timing=await home.motto.evaluate(el=>Math.max(...el.getAnimations({subtree:true}).map(a=>Number(a.effect.getComputedTiming().endTime))));
 assert(Math.abs(timing-8000)<2,`duration ${timing}`);
 await page.waitForFunction(()=>{const el=document.querySelector('[data-state]');return el?.getAnimations({subtree:true}).some(a=>Number(a.currentTime)>2200);});
 await page.screenshot({path:'test-results/motto-writing.png'});
 await home.complete();await home.layout();
 await page.evaluate(()=>document.documentElement.classList.add('dark'));
 await page.setViewportSize({width:768,height:1000});
 assert.equal(await home.motto.getAttribute('data-state'),'complete');
 // Simulate persisted pageshow branches deterministically as browsers may decline BFCache.
 await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
 assert.equal(await home.motto.getAttribute('data-state'),'writing');
 await page.emulateMedia({reducedMotion:'reduce'});await home.complete();
 assert.equal(await home.motto.evaluate(el=>el.getAnimations({subtree:true}).length),0);
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.evaluate(()=>{window.scrollTo({top:650,behavior:'instant'});window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));});
 assert.equal(await home.motto.getAttribute('data-state'),'complete');
 await page.goto(new URL('about/',base).href);await page.goto(base);
 assert.equal(await home.motto.getAttribute('data-state'),'writing');
 await page.reload();assert.equal(await home.motto.getAttribute('data-state'),'writing');
 await page.keyboard.press('Tab');
 assert(await page.evaluate(()=>document.activeElement?.tagName==='A'));
 assert.deepEqual(errors,[]);
 await context.close();
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:900}});
 const staticPage=await nojs.newPage();const staticHome=new Home(staticPage);await staticHome.open();await staticHome.layout();
 assert.equal(await staticHome.motto.getAttribute('data-state'),null);
 await staticPage.screenshot({path:'test-results/motto-nojs.png'});await nojs.close();
 console.log('Handwriting passed: 3 widths, themes, 8s timeline, single playback, reload, return, persisted restore, reduced motion, no JS, keyboard.');
} finally {await browser.close();}
