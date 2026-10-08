const CACHE = 'ifc-v1.6';
const ASSETS = [
  './', './index.html', './manifest.json', './favicon.svg', './css/style.css',
  './js/app.js','./js/jdn.js','./js/ifc.js','./js/calendars.js','./js/holidays.js',
  './js/ics.js','./js/diff.js','./js/router.js','./js/i18n.js','./js/ui.js',
  './locales/ru.js','./locales/en.js','./locales/de.js','./locales/fr.js','./locales/it.js',
  './locales/es.js','./locales/pt.js','./locales/uk.js','./locales/id.js','./locales/zh.js',
  './locales/hi.js','./locales/he.js','./locales/ar.js','./locales/tr.js','./locales/pl.js',
  './locales/ja.js','./locales/ko.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return resp;
    }).catch(() => caches.match('./index.html')))
  );
});