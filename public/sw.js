/* Cache contains only an immutable offline notice and public icons. Never cache private data. */
const CACHE='zytrix-public-v1';
const PUBLIC_FILES=['/offline.html','/icons/icon-192.png','/icons/icon-512.png','/icons/maskable-512.png','/icons/apple-touch-icon.png'];
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    for(const path of PUBLIC_FILES){
      try{
        const response=await fetch(path,{cache:'no-store',redirect:'error'});
        if(!response.ok||response.redirected||new URL(response.url).pathname!==path)continue;
        if(path==='/offline.html'){
          if(!response.headers.get('content-type')?.includes('text/html'))continue;
          if(!(await response.clone().text()).includes('data-zytrix-offline'))continue;
        }else if(!response.headers.get('content-type')?.startsWith('image/png'))continue;
        await cache.put(path,response);
      }catch{/* A sign-in gate or unavailable asset must never become an offline cache entry. */}
    }
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  for(const key of await caches.keys())if(key.startsWith('zytrix-public-')&&key!==CACHE)await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  // Leave APIs, RSC, auth, maps, external URLs and mutations entirely to the network.
  if(request.method!=='GET'||request.mode!=='navigate'||url.origin!==self.location.origin||!['/','/credits','/offline.html'].includes(url.pathname))return;
  event.respondWith((async()=>{
    try{return await fetch(request);}catch{
      const cache=await caches.open(CACHE),offline=await cache.match('/offline.html');
      return offline||new Response('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Sem conexão</title><h1>Zytrix está sem conexão</h1><p>Reconecte para consultar ou salvar dados.</p><a href="/">Tentar novamente</a></html>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});
    }
  })());
});
