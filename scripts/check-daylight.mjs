import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {writeFile,mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url), sharp=require('sharp');
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {})});
const base=process.env.TEST_URL || 'http://127.0.0.1:4330/';
await mkdir('test-results/daylight',{recursive:true});
const report=[];
class Home {
 constructor(page){this.page=page;this.toggle=page.getByRole('button',{name:/切换到.*主题/});}
 async open(){await this.page.goto(base);await this.page.waitForFunction(()=>document.querySelector('.lunar-surface img')?.classList.contains('is-ready'));}
 async positions(){return this.page.evaluate(()=>['.header-inner','.handwritten-motto','.hero h1','.hero .actions','.intro-section'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return [r.x,r.y,r.width,r.height];}));}
}
const lum=rgb=>rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
try {
 await Promise.all([360,390,768,1440,1920].map(async width=>{
  const context=await browser.newContext({viewport:{width,height:1000},colorScheme:'light',reducedMotion:'reduce'});
  const page=await context.newPage(),home=new Home(page);const images=[];page.on('request',r=>{if(r.url().includes('lunar-horizon'))images.push(r.url());});
  await home.open();const before=await home.positions();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.equal(await page.locator('.star-field').isVisible(),false);
  assert.equal(await page.locator('.star-particle').first().evaluate(e=>getComputedStyle(e).animationName),'none');
  await page.screenshot({path:`test-results/daylight/light-${width}.png`});
  const boxes=await page.evaluate(()=>['.hello','.hero h1','.hero-subtitle','.intro-section p','.header-inner nav a','.motto-translation','.hero .button'].flatMap(s=>[...document.querySelectorAll(s)].map(e=>{let r=e.getBoundingClientRect();if(e.matches('a')){const range=document.createRange();range.selectNodeContents(e);r=range.getBoundingClientRect();}return {selector:s,x:r.x,y:r.y,w:r.width,h:r.height,color:getComputedStyle(e).color.match(/[\d.]+/g).slice(0,3).map(Number)};})));
  const hide=await page.addStyleTag({content:'.hello,.hero h1,.hero-subtitle,.intro-section p,.header-inner nav a,.motto-translation,.hero .button {color:transparent!important;text-shadow:none!important}.motto-translation svg {visibility:hidden!important}'});
  const {data,info}=await sharp(await page.screenshot()).removeAlpha().raw().toBuffer({resolveWithObject:true});
  const contrasts=boxes.map(b=>{let min=99;const fg=lum(b.color);for(let y=Math.max(0,Math.ceil(b.y));y<Math.min(info.height,b.y+b.h);y++){for(let x=Math.ceil(b.x);x<Math.min(info.width,b.x+b.w);x++){const i=(y*info.width+x)*3,bg=lum([...data.subarray(i,i+3)]);min=Math.min(min,(Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05));}}return {selector:b.selector,minimum:min};});
  await hide.evaluate(el=>el.remove());
  for(const c of contrasts)assert(c.minimum>=4.5,`${width} ${c.selector} contrast ${c.minimum}`);
  await home.toggle.click();assert.deepEqual(await home.positions(),before);await page.screenshot({path:`test-results/daylight/dark-${width}.png`});
  await home.toggle.click();assert.deepEqual(await home.positions(),before);
  for(let i=0;i<6;i++)await home.toggle.click();
  assert.equal(images.length,1,'theme toggles do not request another image');await page.reload();assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('dark')),false);
  assert.equal(new Set(images).size,1,'one responsive lunar asset only');
  report.push({width,contrasts,layoutShift:0,imageRequests:images.length});await context.close();
 }));
 const context=await browser.newContext({viewport:{width:390,height:1000},colorScheme:'light'});const page=await context.newPage(),home=new Home(page);
 let release;const gate=new Promise(r=>release=r);await page.route('**/lunar-horizon*.webp',async route=>{await gate;await route.continue();});
 await page.goto(base,{waitUntil:'domcontentloaded'});const pending=await home.positions();
 assert.equal(await page.locator('.lunar-surface img').evaluate(e=>getComputedStyle(e).opacity),'0');
 assert.equal(await page.locator('.lunar-surface').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(238, 238, 239)');
 release();await page.waitForFunction(()=>document.querySelector('.lunar-surface img').classList.contains('is-ready'));assert.deepEqual(await home.positions(),pending);
 await page.emulateMedia({colorScheme:'dark'});await page.waitForFunction(()=>document.documentElement.classList.contains('dark'));
 await page.emulateMedia({colorScheme:'light'});await page.waitForFunction(()=>!document.documentElement.classList.contains('dark'));
 await page.unroute('**/lunar-horizon*.webp');await page.route('**/lunar-horizon*.webp',r=>r.abort());await page.reload();assert.equal(await page.locator('.lunar-surface img').evaluate(e=>getComputedStyle(e).opacity),'0');
 await context.close();
 const normal=await browser.newContext({viewport:{width:1440,height:1000},colorScheme:'dark'});
 const np=await normal.newPage(),nh=new Home(np);await nh.open();
 assert.equal(await np.locator('.star-particle').first().evaluate(e=>getComputedStyle(e).animationName),'star-rise');
 await nh.toggle.click();await np.waitForFunction(()=>getComputedStyle(document.querySelector('.lunar-surface img')).opacity==='0.55');
 assert.equal(await np.locator('.star-particle').first().evaluate(e=>getComputedStyle(e).animationName),'none');
 assert.equal(await np.locator('.lunar-shade').evaluate(e=>getComputedStyle(e,'::after').transitionDuration),'0.2s');
 await np.emulateMedia({colorScheme:'dark'});assert.equal(await np.evaluate(()=>document.documentElement.classList.contains('dark')),false,'manual light wins over OS');
 await np.emulateMedia({reducedMotion:'reduce'});assert.equal(await np.locator('.lunar-shade').evaluate(e=>getComputedStyle(e,'::after').transitionDuration),'0s');
 await nh.toggle.click();await np.reload();assert.equal(await np.evaluate(()=>document.documentElement.classList.contains('dark')),true,'dark preference restored');
 await np.getByRole('link',{name:'进入笔记',exact:true}).click();await np.waitForURL('**/notes/');
 await nh.open();await np.getByRole('link',{name:'查看项目',exact:true}).click();await np.waitForURL('**/projects/');
 await normal.close();
 await writeFile('test-results/daylight/report.json',JSON.stringify(report,null,2));console.log('Minimum sampled contrast:',Math.min(...report.flatMap(r=>r.contrasts.map(c=>c.minimum))).toFixed(2));console.log('PASS: responsive contrast/layout, single image, persistence, auto theme, slow/failed image, reduced motion');
}finally{await browser.close();}
