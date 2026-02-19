/**
 * Nova Schola — Nuke Service Worker
 *
 * This replaces the old sw.js (v1.2.0) that cached stale JS chunks
 * (MathTutor-B0aq64cR.js, etc.) and caused runtime errors after rebuilds.
 *
 * Strategy: take control immediately, wipe all caches, then pass every
 * fetch straight to the network. No more caching.
 */

self.addEventListener('install', function() {
  self.skipWaiting(); // take control without waiting for old SW to die
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(names.map(function(name) {
        console.log('[Nova-SW] Deleting stale cache:', name);
        return caches.delete(name);
      }));
    }).then(function() {
      console.log('[Nova-SW] All caches cleared. Taking control.');
      return self.clients.claim(); // control all open tabs immediately
    })
  );
});

// Pass every request straight to the network — no caching at all
self.addEventListener('fetch', function(event) {
  event.respondWith(fetch(event.request));
});
