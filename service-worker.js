const CACHE_NAME = "vatandas-portali-shell-v2";
const APP_SHELL = [
  "./",
  "./index.html",
  "./privacy.html",
  "./manifest.webmanifest",
  "./icon.svg",
  "./assets/visitor-counter.css",
  "./assets/visitor-counter.js",
  "./assets/promo/01-portal.svg",
  "./assets/promo/02-resmi-kurumlar.svg",
  "./assets/promo/03-hesaplayicilar.svg",
  "./assets/promo/04-canli-bilgiler.svg",
  "./assets/promo/05-mobil.svg",
  "./assets/promo/06-kullanima-hazir.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith("vatandas-portali-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response.ok) return response;
          return caches.open(CACHE_NAME)
            .then((cache) => cache.put(request, response.clone()))
            .catch((error) => console.error("Sayfa önbelleğe alınamadı:", error))
            .then(() => response);
        })
        .catch(async () => (await caches.match(request)) || caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (!response.ok) return response;
      return caches.open(CACHE_NAME)
        .then((cache) => cache.put(request, response.clone()))
        .catch((error) => console.error("Kaynak önbelleğe alınamadı:", error))
        .then(() => response);
    }))
  );
});
