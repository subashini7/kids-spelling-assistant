const CACHE_NAME = "spellquest-v1";

// All static assets to pre-cache on install
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/app.js",
  "/styles.css",
  "/words.json",
  "/manifest.json",
  "/icons/icon-72x72.png",
  "/icons/icon-96x96.png",
  "/icons/icon-128x128.png",
  "/icons/icon-144x144.png",
  "/icons/icon-152x152.png",
  "/icons/icon-192x192.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png",
];

// ─── Install ───────────────────────────────────────────────────────────────
// Pre-cache all static assets so the app works offline immediately.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()) // Activate new SW without waiting
  );
});

// ─── Activate ──────────────────────────────────────────────────────────────
// Delete any old caches from previous versions.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim()) // Take control of all open tabs
  );
});

// ─── Fetch ─────────────────────────────────────────────────────────────────
// Strategy per resource type:
//   words.json      → Network-first (keeps word list fresh; falls back to cache)
//   app.js          → Network-first (picks up code updates; falls back to cache)
//   Everything else → Cache-first  (fast loads; falls back to network)
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests and cross-origin requests (e.g. HuggingFace CDN)
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  const isNetworkFirst =
    url.pathname.endsWith("words.json") ||
    url.pathname.endsWith("app.js");

  event.respondWith(
    isNetworkFirst ? networkFirst(request) : cacheFirst(request)
  );
});

// ─── Strategy: Network-first ───────────────────────────────────────────────
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response("Offline and no cache available.", { status: 503 });
  }
}

// ─── Strategy: Cache-first ─────────────────────────────────────────────────
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    // Return a bare offline page if even the network fails
    return new Response(
      `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Offline</title></head>
<body style="font-family:sans-serif;text-align:center;padding:2rem;">
  <h1>You're offline</h1>
  <p>Please reconnect to the internet and try again.</p>
  <button onclick="location.reload()">Retry</button>
</body>
</html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }
}
