/**
 * Hathcocked Recipes — service worker.
 *
 * The point of this file is that the recipe you opened yesterday still opens
 * in a kitchen with one bar of signal.
 *
 * Strategy per resource type:
 *   /_next/static/*  immutable hashed builds  -> cache first, forever
 *   /api/photo/*     recipe photos            -> cache first, refresh behind
 *   pages            HTML                     -> network first, fall back to cache
 *
 * Bump CACHE_VERSION to evict everything on the next visit.
 */

const CACHE_VERSION = "v1";
const STATIC = `hathcocked-static-${CACHE_VERSION}`;
const PAGES = `hathcocked-pages-${CACHE_VERSION}`;
const PHOTOS = `hathcocked-photos-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline";

const PRECACHE = ["/", "/saved", OFFLINE_URL, "/manifest.webmanifest", "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PAGES)
      // Individual failures shouldn't abort the whole install.
      .then((c) => Promise.allSettled(PRECACHE.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("hathcocked-") && !k.endsWith(CACHE_VERSION))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res && res.ok) cache.put(request, res.clone());
  return res;
}

async function networkFirst(request) {
  const cache = await caches.open(PAGES);
  try {
    const res = await fetch(request);
    if (res && res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    const hit = await cache.match(request);
    if (hit) return hit;
    const offline = await cache.match(OFFLINE_URL);
    if (offline) return offline;
    throw new Error("offline and nothing cached");
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache the cache-busting endpoint.
  if (url.pathname.startsWith("/api/revalidate")) return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC));
    return;
  }

  if (url.pathname.startsWith("/api/photo/")) {
    event.respondWith(cacheFirst(request, PHOTOS));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (["style", "script", "font", "image"].includes(request.destination)) {
    event.respondWith(cacheFirst(request, STATIC));
  }
});
