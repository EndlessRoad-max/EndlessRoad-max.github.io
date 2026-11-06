import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({headless:true, executablePath:process.env.CHROMIUM_PATH});
const base=process.env.TEST_URL || 'http://127.0.0.1:4331/';
await mkdir('test-results/cover',{recursive:true});
try {
 await Promise.all([[390,844],[768,1024],[1440,900],[1920,1080],[375,667],[844,390],[720,450]].map(async ([width,height])=>{
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce',colorScheme:'light'});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.waitForFunction(()=>document.querySelector('.lunar-surface img').classList.contains('is-ready'));
  const geometry=()=>page.evaluate(()=>{
   const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height};};
   return {intro:rect('#home-introduction'),cover:rect('.home-cover'),cue:rect('.scroll-cue'),header:rect('.site-header'),scene:rect('.sphere-sky'),name:rect('.hero h1'),overflow:document.documentElement.scrollWidth>innerWidth};
  });
  const before=await geometry();assert(!before.overflow);assert(before.intro.top>=height-1);assert(Math.abs(before.scene.bottom-before.cover.bottom)<1);
  if(height>=667)assert(before.cue.bottom<=height-12,'cue within first viewport');
  await page.screenshot({path:`test-results/cover/${width}x${height}-day.png`});
  if(height>=667)await page.getByRole('link',{name:'向下探索'}).screenshot({path:`test-results/cover/${width}x${height}-cue-day.png`});
  await page.getByRole('button',{name:'切换到深色主题'}).click();assert.deepEqual(await geometry(),before);
  await page.screenshot({path:`test-results/cover/${width}x${height}-night.png`});
  if(height>=667)await page.getByRole('link',{name:'向下探索'}).screenshot({path:`test-results/cover/${width}x${height}-cue-night.png`});
  await page.getByRole('link',{name:'向下探索'}).press('Enter');await page.waitForFunction(()=>location.hash==='#home-introduction');
  const after=await geometry();assert(after.intro.top>=after.header.bottom,'anchor clears sticky navigation');assert(after.intro.top<height,'anchor enters view');assert(after.cue.bottom<=after.header.bottom,'scroll cue is above the content viewport');assert(Math.abs(after.intro.top-after.header.bottom-24)<2,'single 24px header offset');
  if(width===1440||width===390)await page.screenshot({path:`test-results/cover/${width}-after-explore.png`});
  await page.reload();await page.waitForFunction(()=>window.scrollY>0);assert((await geometry()).intro.top<height,'hash reload preserved');
  await page.goBack();await page.waitForFunction(()=>!location.hash);
  assert.deepEqual(errors,[]);await context.close();
 }));
 const zoomContext=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 const zoomPage=await zoomContext.newPage();await zoomPage.goto(base);
 await zoomPage.evaluate(()=>{document.documentElement.style.zoom='2';});
 await zoomPage.waitForFunction(()=>Math.abs(document.querySelector('.sphere-sky').getBoundingClientRect().bottom-document.querySelector('.home-cover').getBoundingClientRect().bottom)<2);
 assert(await zoomPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), '200% CSS zoom does not overflow horizontally');
 await zoomPage.getByRole('link',{name:'向下探索'}).click();
 assert(await zoomPage.getByRole('heading',{name:'关于这个空间'}).isVisible());
 await zoomContext.close();
 console.log('PASS cover: seven viewport sizes incl. landscape/half-size zoom equivalent, first-fold content, anchor/reload, stable day/night geometry');
} finally {await browser.close();}
