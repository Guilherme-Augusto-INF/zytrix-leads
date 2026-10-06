// Built Worker integration tests: real D1, isolated fixture outbound HTTP. No production data.
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const wranglerRequire=createRequire(import.meta.resolve('wrangler/package.json'));
const {Miniflare,Response:MFResponse}=wranglerRequire('miniflare');
let outboundMode='ok',calls=0;
const fixture={elements:[{type:'node',id:1,lat:-23.53,lon:-46.79,tags:{name:'FIXTURE Barbearia','shop':'hairdresser','addr:city':'Osasco','addr:street':'Rua Teste','addr:housenumber':'1',phone:'+5511999991234',website:'https://example.com'}},{type:'node',id:1,lat:-23.53,lon:-46.79,tags:{name:'FIXTURE Barbearia','shop':'hairdresser'}}]};
const moduleFiles=fs.readdirSync('dist/server',{recursive:true}).filter(p=>p.endsWith('.js')||p.endsWith('.mjs')).sort((a,b)=>a==='index.js'?-1:b==='index.js'?1:a.localeCompare(b));
const mf=new Miniflare({modules:moduleFiles.map(p=>({type:'ESModule',path:path.resolve('dist/server',p)})),modulesRoot:path.resolve('dist/server'),compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:{DB:'zytrix-e2e-isolated'},outboundService:async req=>{calls++;if(outboundMode==='error')return new MFResponse('Unavailable',{status:429});if(outboundMode==='oversize')return new MFResponse('x'.repeat(1600000));if(outboundMode==='timeout'){await new Promise(r=>setTimeout(r,21000));}if(outboundMode==='redirect')return new MFResponse(null,{status:302,headers:{location:'http://127.0.0.1'}});const u=new URL(req.url);if(u.hostname==='nominatim.openstreetmap.org')return MFResponse.json([{lat:'-23.5325',lon:'-46.7917',display_name:'Osasco, São Paulo, Brasil',address:{country_code:'br',state:'São Paulo',city:'Osasco'},boundingbox:['-23.60','-23.46','-46.82','-46.74']}]);if(u.hostname==='overpass-api.de')return MFResponse.json(outboundMode==='empty'?{elements:[]}:outboundMode==='partial'?{...fixture,remark:'timeout'}:fixture);throw new Error('Unexpected outbound host '+u.hostname);}});
let passed=0;
function check(name,fn){fn();passed++;console.log('PASS',name);}
const userHeaders={'oai-authenticated-user-id':'fixture-owner','oai-authenticated-user-email':'fixture@example.test'};
async function call(route,data,headers=userHeaders){if(data&&route==='/api/workspace')await (await mf.getD1Database('DB')).prepare("UPDATE usage SET last_at=0 WHERE provider LIKE 'mutation:%'").run();const r=await mf.dispatchFetch('https://test.local'+route,{method:data?'POST':'GET',headers:{...headers,...(data?{'Content-Type':'application/json','Origin':'https://test.local'}:{})},body:data?JSON.stringify(data):undefined});let v;try{v=await r.json();}catch{v={};}return{status:r.status,headers:r.headers,v};}
try{
const d=await mf.getD1Database('DB');const file=fs.readdirSync('drizzle').find(f=>f.endsWith('.sql'));for(const stmt of fs.readFileSync('drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(stmt.trim())await d.exec(stmt.replaceAll('\n',' '));
let r=await call('/api/workspace',null,{});check('unauthenticated API denied',()=>assert.equal(r.status,401));
r=await call('/api/workspace');check('empty workspace has no fake leads',()=>{assert.equal(r.status,200);assert.equal(r.v.leads.length,0);assert.equal(r.headers.get('cache-control'),'private, no-store');});
let p={country:'BR',region:'São Paulo',city:'Osasco',scope:'city',category:'barbers',custom:'',radius:3,limit:30,provider:'osm',refresh:false};
r=await call('/api/search',{...p,radius:999});check('invalid input rejected before API',()=>assert.equal(r.status,422));
r=await call('/api/search',p);check('location must be confirmed',()=>assert.equal(r.status,422));
r=await call('/api/locations',p);check('manual geocoding returns explicit choice',()=>{assert.equal(r.status,200);assert.equal(r.v.choices.length,1);});p.locationId=r.v.choices[0].id;
r=await call('/api/search',p);check('provider normalization and dedup persist one real fixture',()=>{assert.equal(r.status,200);assert.equal(r.v.leads.length,1);assert.equal(r.v.leads[0].status,'POSSIBLE_WEBSITE');});const lead=r.v.leads[0];const before=calls;
r=await call('/api/search',p);check('persistent cache prevents another provider call',()=>{assert.equal(r.status,200);assert.equal(r.v.cached,true);assert.equal(calls,before);});
r=await call('/api/search',{...p,city:'Outra cidade'});check('homonymous/stale choice cannot change region',()=>assert.equal(r.status,422));
r=await call('/api/workspace',{action:'save',id:lead.id});check('save lead',()=>{assert.equal(r.status,200);assert.equal(r.v.lead.saved,true);});
r=await call('/api/workspace',{action:'stage',id:lead.id,stage:'INTERESSADO'});check('pipeline stage and event persisted',()=>assert.equal(r.v.lead.stage,'INTERESSADO'));
r=await call('/api/workspace',null,{'oai-authenticated-user-id':'other-owner','oai-authenticated-user-email':'other@example.test'});check('owner isolation',()=>assert.equal(r.v.leads.length,0));
r=await call('/api/workspace',{action:'save',id:lead.id},{'oai-authenticated-user-id':'other-owner','oai-authenticated-user-email':'other@example.test'});check('cross-owner mutation rejected',()=>assert.equal(r.status,404));
r=await call('/api/workspace',{action:'schedule',id:lead.id,dueAt:new Date(Date.now()+3600000).toISOString(),channel:'WhatsApp',message:'Mensagem fixture'});check('schedule and pipeline saved together',()=>assert.equal(r.v.lead.stage,'CONTATO_PROGRAMADO'));
r=await call('/api/workspace');check('activity history and schedule read back',()=>{assert.equal(r.v.schedules.length,1);assert.ok(r.v.activities.length>=3);});
r=await call('/api/workspace',{action:'suppress',id:lead.id,value:true});check('suppression blocks contact and cancels reminders',()=>assert.equal(r.v.lead.doNotContact,true));
r=await call('/api/workspace',{action:'schedule',id:lead.id,dueAt:new Date(Date.now()+3600000).toISOString(),channel:'WhatsApp',message:'Oi'});check('suppressed lead cannot schedule',()=>assert.equal(r.status,409));
r=await call('/api/verify',{id:lead.id});check('missing Tavily key handled without invented verification',()=>assert.equal(r.status,422));
const csrf=await mf.dispatchFetch('https://test.local/api/workspace',{method:'POST',headers:{...userHeaders,'Content-Type':'application/json','Origin':'https://attacker.test'},body:JSON.stringify({action:'save',id:lead.id})});check('CSRF origin rejected',()=>assert.equal(csrf.status,403));
await d.prepare('UPDATE usage SET last_at=0').run();const payload=await mf.dispatchFetch('https://test.local/api/workspace',{method:'POST',headers:{...userHeaders,'Content-Type':'application/json','Origin':'https://test.local'},body:'x'.repeat(20000)});check('payload length bounded',()=>assert.equal(payload.status,413));
await d.prepare("UPDATE usage SET last_at=0").run();outboundMode='error';r=await call('/api/search',{...p,refresh:true});check('API 429 surfaces failure, not fabricated leads',()=>assert.equal(r.status,429));
await d.prepare("UPDATE usage SET last_at=0").run();outboundMode='partial';r=await call('/api/search',{...p,refresh:true});check('partial Overpass results rejected',()=>assert.equal(r.status,502));
await d.prepare("UPDATE usage SET last_at=0").run();outboundMode='empty';r=await call('/api/search',{...p,refresh:true});check('city with zero results succeeds honestly',()=>{assert.equal(r.status,200);assert.equal(r.v.leads.length,0);});
await d.prepare("UPDATE usage SET last_at=0").run();outboundMode='oversize';r=await call('/api/search',{...p,refresh:true});check('oversized provider response rejected',()=>assert.equal(r.status,502));
await d.prepare("UPDATE usage SET last_at=0").run();outboundMode='redirect';r=await call('/api/search',{...p,refresh:true});check('provider redirect to private address blocked',()=>assert.equal(r.status,502));
await d.prepare("UPDATE usage SET last_at=0").run();outboundMode='timeout';r=await call('/api/search',{...p,refresh:true});check('provider timeout fails within bounded request',()=>assert.equal(r.status,502));
await d.prepare("UPDATE usage SET used=30,last_at=0 WHERE provider='overpass'").run();r=await call('/api/search',{...p,refresh:true});check('atomic free quota blocks excess calls',()=>assert.equal(r.status,429));
r=await call('/api/workspace',{action:'delete',id:lead.id});check('delete lead',()=>assert.equal(r.status,200));
r=await call('/api/workspace');check('delete purges lead schedules and activity',()=>{assert.equal(r.v.leads.length,0);assert.equal(r.v.schedules.length,0);assert.equal(r.v.activities.length,0);});
await d.exec("WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<1500) INSERT INTO leads(id,owner,provider,external_id,name,city,country,payload,updated_at) SELECT 'capacity-'||x,'fixture-owner','osm','capacity-'||x,'capacity','Osasco','BR','{}','2026-10-06' FROM n");r=await call('/api/search',{...p,refresh:true});check('workspace capacity prevents unbounded Worker memory use',()=>assert.equal(r.status,409));
const html=await mf.dispatchFetch('https://test.local/');const text=await html.text();check('built page smoke test and no lead data exposed in HTML',()=>{assert.equal(html.status,200);assert.ok(text.includes('Descobrir leads'));assert.ok(!text.includes('FIXTURE Barbearia'));assert.equal(html.headers.get('x-robots-tag'),'noindex, nofollow, noarchive');});
check('mobile PWA manifest, Apple icon and zoom-friendly viewport rendered',()=>{assert.ok(text.includes('/manifest.webmanifest'));assert.ok(text.includes('/icons/apple-touch-icon.png'));assert.ok(text.includes('viewport-fit=cover'));assert.ok(!text.includes('user-scalable=no'));assert.ok(text.includes('Navegação principal mobile'));assert.ok(text.includes('Como instalar'));});
const downloadPage=await mf.dispatchFetch('https://test.local/download');const downloadHtml=await downloadPage.text();check('Android download page exposes signed APK link and honest limitations',()=>{assert.equal(downloadPage.status,200);assert.ok(downloadHtml.includes('/downloads/zytrix-leads-1.0.0.apk'));assert.ok(downloadHtml.includes('não foram verificados'));assert.equal(downloadPage.headers.get('x-robots-tag'),'noindex, nofollow, noarchive');});
console.log(`API E2E: ${passed} checks passed. Fixtures isolated; browser interactions not exercised.`);
}finally{await mf.dispose();}
