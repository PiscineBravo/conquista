// Conquista: tiene in memoria il gioco e le librerie, così si apre anche senza rete
const VERSION='conquista-v1';
const CORE=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png',
  'https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js',
  'https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js',
  'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json',
  'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>Promise.allSettled(CORE.map(u=>c.add(u)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  // la pagina del gioco: prima la rete (per avere gli aggiornamenti), poi la copia salvata
  if(req.mode==='navigate'){e.respondWith(fetch(req).then(r=>{const c=r.clone();caches.open(VERSION).then(x=>x.put('./index.html',c));return r}).catch(()=>caches.match('./index.html')));return}
  // librerie, mappa e icone: dalla memoria se ci sono
  if(url.origin===location.origin||/cdnjs|jsdelivr|unpkg/.test(url.host)){
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok){const c=r.clone();caches.open(VERSION).then(x=>x.put(req,c))}return r})));
  }
});
