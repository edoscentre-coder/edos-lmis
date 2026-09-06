// Minimal service worker: caches the app shell (including the built JS/CSS
// chunks, via the Workbox-injected precache manifest below) for resilience on
// flaky or absent connections. The actual offline write-capture (specimen
// collection, result entry) is handled client-side via IndexedDB in
// lib/offline/*, not through fetch interception here — Next.js Server Actions
// are awkward to replay reliably from inside a service worker, so the
// IndexedDB queue + the browser's online/offline events is the source of
// truth for sync.
const CACHE_NAME = "edoslmis-shell-v1";

// Replaced at build time with the list of built assets by
// workbox-webpack-plugin's InjectManifest (see workboxOptions.swSrc in
// next.config.ts). Never edit this line's shape by hand.
const PRECACHE_URLS = ["/", ...self.__WB_MANIFEST.map((entry) => entry.url)];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => {})
  );
  // No unconditional self.skipWaiting() here: a waiting worker only takes
  // over once the page explicitly asks it to (see the "message" listener
  // below), so an in-progress task is never interrupted by a silent reload.
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
