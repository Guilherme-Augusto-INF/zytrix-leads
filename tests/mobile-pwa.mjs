// Execute the actual service worker with isolated Cache/Fetch doubles. No production requests.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
let passed=0;
function check(name,fn){fn();passed++;console.log('PASS',name);}
const manifest=JSON.parse(fs.readFileSync('public/manifest.webmanifest','utf8'));
check('standalone manifest retains same-origin application scope',()=>{assert.equal(manifest.display,'standalone');assert.equal(manifest.start_url,'/');assert.equal(manifest.scope,'/');assert.ok(!manifest.shortcuts);});
check('PNG icons have matching dimensions and distinct maskable purpose',()=>{
  for(const icon of manifest.icons){const p=fs.readFileSync('public'+icon.src),[w,h]=icon.sizes.split('x').map(Number);assert.equal(p.toString('hex',0,8),'89504e470d0a1a0a');assert.equal(p.readUInt32BE(16),w);assert.equal(p.readUInt32BE(20),h);}
  assert.ok(manifest.icons.some(i=>i.purpose==='maskable'));const apple=fs.readFileSync('public/icons/apple-touch-icon.png');assert.equal(apple.readUInt32BE(16),180);
});
const handlers={},entries=new Map(),deleted=[],offline=fs.readFileSync('public/offline.html','utf8');
let fetchMode='ok',calls=0,claims=0;
const cache={put:async(k,r)=>entries.set(k,r),match:async(k)=>entries.get(k)};
const fetch=async input=>{
  calls++;const path=typeof input==='string'?input:new URL(input.url).pathname;
  if(fetchMode==='offline')throw new TypeError('No network');
  let r=new Response(path==='/offline.html'?offline:path.endsWith('.png')?'PNG':'PRIVATE LEAD PAYLOAD',{headers:{'Content-Type':path==='/offline.html'?'text/html':path.endsWith('.png')?'image/png':'text/html'}});
  if(fetchMode==='login')r=new Response('<html>Sign in</html>',{headers:{'Content-Type':'text/html'}});
  if(fetchMode==='forbidden')r=new Response('Denied',{status:403});
  Object.defineProperty(r,'url',{value:'https://test.local'+path});return r;
};
const context={URL,Response,fetch,caches:{open:async()=>cache,keys:async()=>['zytrix-public-v0','other-app-cache'],delete:async k=>deleted.push(k)},self:{location:{origin:'https://test.local'},addEventListener:(event,fn)=>handlers[event]=fn,skipWaiting:async()=>{},clients:{claim:async()=>claims++}}};
vm.runInNewContext(fs.readFileSync('public/sw.js','utf8'),context);
async function lifecycle(name){let task;handlers[name]({waitUntil:p=>task=p});await task;}
function intercept(url,{method='GET',mode='navigate'}={}){let task;handlers.fetch({request:{url:'https://test.local'+url,method,mode},respondWith:p=>task=p});return task;}
await lifecycle('install');
check('cache only contains public offline notice and icons',()=>{assert.equal(entries.size,5);assert.ok(entries.has('/offline.html'));assert.ok([...entries.keys()].every(k=>k==='/offline.html'||k.startsWith('/icons/')));});
await lifecycle('activate');check('activation cleans only app-owned old caches',()=>{assert.deepEqual(deleted,['zytrix-public-v0']);assert.equal(claims,1);});
for(const [name,url,options] of [
  ['API reads never intercepted','/api/workspace',{}],
  ['API writes never intercepted','/api/workspace',{method:'POST'}],
  ['auth never intercepted','/signin-with-chatgpt',{}],
  ['RSC fetch never intercepted','/',{mode:'cors'}],
  ['tile requests never intercepted','/tile.png',{mode:'no-cors'}],
])check(name,()=>assert.equal(intercept(url,options),undefined));
check('external navigation never intercepted',()=>{let touched=false;handlers.fetch({request:{url:'https://tile.openstreetmap.org/',method:'GET',mode:'navigate'},respondWith:()=>touched=true});assert.equal(touched,false);});
const before=entries.size;let response=await intercept('/');
check('online private HTML reaches caller without persistent cache',()=>{assert.equal(response.status,200);assert.equal(entries.size,before);assert.ok(!entries.has('/'));});
fetchMode='forbidden';response=await intercept('/');check('auth denial is never replaced by offline fallback',()=>assert.equal(response.status,403));
fetchMode='offline';response=await intercept('/');check('offline navigation returns public notice with no lead payload',()=>{assert.equal(response.status,200);});assert.ok((await response.text()).includes('data-zytrix-offline'));
entries.clear();fetchMode='login';await lifecycle('install');check('gateway login HTML never poisons offline or icon cache',()=>assert.equal(entries.size,0));
fetchMode='offline';response=await intercept('/');check('first visit offline fails safely without cached app data',()=>{assert.equal(response.status,503);assert.equal(response.headers.get('cache-control'),'no-store');});
console.log(`Mobile PWA: ${passed} checks passed. Browser installation and device interaction not exercised.`);
