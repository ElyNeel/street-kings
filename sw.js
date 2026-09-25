// Street Kings offline support. Online it always fetches the latest version; offline it plays from the saved copy.
const CACHE = 'street-kings-3eb219828c';
const FILES = ["./", "./index.html", "./privacy.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];
// music files never change (the hash is in the name), so they are kept in their own cache and served from it
const MUSIC_CACHE = 'street-kings-music';
const MUSIC_FILES = ["music/ne-1919.5d166132.mp3", "music/ne-1926.d89adf94.mp3", "music/ne-it-aint-adding-up.72f04209.mp3", "music/sega-mauritius.3275df74.mp3"];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== MUSIC_CACHE).map(k => caches.delete(k))))
  .then(() => caches.open(MUSIC_CACHE)).then(c => c.keys().then(rs => Promise.all(rs.filter(r => !MUSIC_FILES.some(f => r.url.endsWith('/' + f))).map(r => c.delete(r)))))
  .then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  if (MUSIC_FILES.some(f => e.request.url.endsWith('/' + f))) {
    e.respondWith(caches.open(MUSIC_CACHE).then(c => c.match(e.request).then(m => m || fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }))));
    return;
  }
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request).then(m => m || caches.match('./index.html'))));
});
