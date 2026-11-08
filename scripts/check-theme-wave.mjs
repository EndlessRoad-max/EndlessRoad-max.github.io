import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import sharp from 'sharp';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.TEST_URL||'http://127.0.0.1:4331/';
const out=process.env.TEST_OUTPUT||'test-results/theme-circle-retract';
const routes=process.env.TEST_ROUTES?process.env.TEST_ROUTES.split(','):[''];
await mkdir(out+'/screenshots',{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
const comparisons=[];
class ThemePage {
 constructor(page){this.page=page;this.toggle=page.getByRole('button',{name:/切换到.*主题/});}
 async open(route=''){await this.page.goto(new URL(route,base).href);if(!route)await this.page.waitForFunction(()=>document.querySelector('.handwritten-motto')?.dataset.state==='complete'&&document.querySelector('.lunar-surface img')?.classList.contains('is-ready'));await this.page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(i=>i.loading!=='lazy').map(i=>i.decode()));});if(route==='notes/'){await this.page.waitForFunction(()=>document.querySelector('#knowledge-galaxy')?.dataset.ready==='true');await this.page.locator('#galaxy-motion').click();await this.page.waitForFunction(()=>document.querySelector('#galaxy-map')?.dataset.moving==='false');}}
 async click(){const box=await this.toggle.boundingBox();await this.page.mouse.click(box.x+box.width/2,box.y+box.height/2);}
 async settled(){await this.page.waitForFunction(()=>!document.documentElement.hasAttribute('data-theme-changing'));}
 async pauseReveal(){await this.page.waitForFunction(()=>document.getAnimations().some(a=>a.effect?.pseudoElement==='::view-transition-new(root)'));await this.page.evaluate(()=>{window.testReveal=document.getAnimations().find(a=>a.effect?.pseudoElement==='::view-transition-new(root)');window.testReveal.pause();});}
 async image(name){return sharp(await this.page.screenshot({path:`${out}/screenshots/${name}.png`})).removeAlpha().raw().toBuffer({resolveWithObject:true});}
}
try{
 for(const route of routes)for(const config of [{width:1440,height:1000,scroll:0},{width:390,height:844,scroll:0},{width:1440,height:1000,scroll:180}]){
  const context=await browser.newContext({viewport:{width:config.width,height:config.height},colorScheme:'light'});await context.tracing.start({snapshots:true,screenshots:true});
  const page=await context.newPage(),site=new ThemePage(page),errors=[];page.on('pageerror',e=>errors.push(e.message));await site.open(route);
  await page.addStyleTag({content:'*,*::before,*::after{animation-play-state:paused!important}'});
  await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),config.scroll);
  const toggleBox=await site.toggle.boundingBox();await page.mouse.move(toggleBox.x+toggleBox.width/2,toggleBox.y+toggleBox.height/2);
  const scrolled=await page.evaluate(()=>scrollY>8);
  await page.waitForFunction(scrolled=>document.querySelector('.site-header').classList.contains('is-scrolled')===scrolled,scrolled);
  await page.waitForFunction(()=>!document.getAnimations().some(a=>a instanceof CSSTransition&&a.playState==='running'));
  const prefix=`${route.replaceAll('/','')||'home'}-${config.width}-${config.scroll}`,day=await site.image(prefix+'-day');
  await site.click();await site.settled();const night=await site.image(prefix+'-night');
  for(const dark of [false,true]){
   const originBox=await site.toggle.boundingBox(),origin={x:originBox.x+originBox.width/2,y:originBox.y+originBox.height/2};
   const maxRadius=Math.hypot(Math.max(origin.x,config.width-origin.x),Math.max(origin.y,config.height-origin.y))+16;
   await site.click();await site.pauseReveal();
   for(const fraction of [.25,.5,.75]){
    await page.evaluate(f=>{window.testReveal.currentTime=900*f;},fraction);
    const frame=await site.image(`${prefix}-${dark?'dark':'light'}-${fraction}`),radius=maxRadius*(dark?fraction:1-fraction);
    let pixels=0,bad=0,total=0,max=0;
    for(let y=0;y<frame.info.height;y++)for(let x=0;x<frame.info.width;x++){
     const distance=Math.hypot(x-origin.x,y-origin.y);
     if(Math.abs(distance-radius)<24)continue;
     const expected=(distance<radius?night:day).data,index=(y*config.width+x)*3;let difference=0;
     for(let c=0;c<3;c++){const d=Math.abs(frame.data[index+c]-expected[index+c]);total+=d;difference=Math.max(difference,d);max=Math.max(max,d);}
     pixels++;if(difference>8)bad++;
    }
    const result={prefix,dark,fraction,pixels,badPercent:bad*100/pixels,meanChannelDifference:total/(pixels*3),max};comparisons.push(result);
    assert(result.badPercent<.2&&result.meanChannelDifference<.6,`theme colors escaped the common boundary: ${JSON.stringify(result)}`);
   }
   await page.evaluate(()=>window.testReveal.play());await site.settled();
  }
  // Reverse the same animation in place; do not capture another pair or restart.
  await site.click();await site.pauseReveal();await page.evaluate(()=>{window.testReveal.currentTime=450;});
  // A real pointer stays over the button. Locator.click's scroll-into-view can
  // scroll the document during a native snapshot and intentionally settle it.
  const buttonBox=await site.toggle.boundingBox();await page.mouse.click(buttonBox.x+buttonBox.width/2,buttonBox.y+buttonBox.height/2);
  await page.evaluate(()=>window.testReveal.ready.then(()=>{}));
  const reversed=await page.evaluate(()=>({same:document.getAnimations().includes(window.testReveal),rate:window.testReveal.playbackRate,time:window.testReveal.currentTime}));
  assert(reversed.same&&reversed.rate<0&&Math.abs(reversed.time-450)<100,'reversal must preserve the current edge');await site.settled();assert(await page.evaluate(()=>document.documentElement.classList.contains('dark')));
  await page.evaluate(()=>new Promise(resolve=>{const button=document.getElementById('theme-toggle');button.click();requestAnimationFrame(()=>{button.click();requestAnimationFrame(()=>{button.click();resolve();});});}));await site.settled();assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('dark')),false);
  await site.click();await page.emulateMedia({reducedMotion:'reduce'});await site.settled();assert(await page.evaluate(()=>document.documentElement.classList.contains('dark')));
  assert.deepEqual(errors,[]);await context.tracing.stop({path:`${out}/${prefix}-trace.zip`});await context.close();console.log('PASS: spatial reveal, in-place reversal, rapid toggles, reduced motion',prefix);
 }
 const context=await browser.newContext({colorScheme:'light'});await context.addInitScript(()=>{document.startViewTransition=undefined;});const site=new ThemePage(await context.newPage());await site.open();await site.click();await site.settled();assert(await site.page.evaluate(()=>document.documentElement.classList.contains('dark')&&!document.documentElement.classList.contains('theme-wave')));await context.close();
 await writeFile(out+'/spatial-comparison.json',JSON.stringify({comparisons,note:'Compare every pixel outside a 24px circular boundary band with the corresponding complete theme. Night is always inside the circle: expand for dusk, contract for dawn. CSS decoration timelines paused only for deterministic references.'},null,2));
 console.log('PASS: native API unavailable fallback');
}finally{await browser.close();}
