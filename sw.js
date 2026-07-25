const VERSION = '3.0.0';
const BUILD = '2026.07.25.01';
const CACHE_NAME = 'cue-timer-v3-0-0';
const CORE_ASSETS = [
  './',
  './index.html',
  './cue_timer_v3_0_0.html',
  './manifest.webmanifest',
  './seimei_program_timer_icon_play_180.png',
  './seimei_program_timer_icon_play_192.png',
  './seimei_program_timer_icon_play_512.png',
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS.map(url => new Request(url,{cache:'reload'})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>(key.startsWith('seimei-program-timer-')||key.startsWith('cue-timer-'))&&key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('message', event => {
  if(event.data?.type==='SKIP_WAITING') self.skipWaiting();
  if(event.data?.type==='GET_VERSION' && event.ports?.[0]) event.ports[0].postMessage({version:VERSION,build:BUILD,cacheName:CACHE_NAME});
  if(event.data?.type==='CLEAR_CACHES') event.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(key=>caches.delete(key)))));
});
async function networkFirst(request){
  const cache=await caches.open(CACHE_NAME);
  try{const response=await fetch(request,{cache:'no-store'});if(response?.ok)cache.put(request,response.clone());return response;}
  catch(e){return (await caches.match(request))||(await caches.match('./index.html'));}
}
async function cacheFirst(request){
  const cached=await caches.match(request);if(cached)return cached;
  const response=await fetch(request);if(response?.ok){const cache=await caches.open(CACHE_NAME);cache.put(request,response.clone());}return response;
}
self.addEventListener('fetch', event => {
  if(event.request.method!=='GET')return;
  const request=event.request,url=new URL(request.url);if(url.origin!==location.origin)return;
  if(request.mode==='navigate'||url.pathname.endsWith('/index.html')||url.pathname.endsWith('/cue_timer_v3_0_0.html')){event.respondWith(networkFirst(request));return;}
  event.respondWith(cacheFirst(request));
});
