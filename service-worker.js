const CACHE_NAME = "vatandas-portali-shell-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./privacy.html",
  "./manifest.webmanifest",
  "./icon.svg",
  "./TANITIM%205.jpg",
  "./tan%C4%B1t%C4%B1m.jpg",
  "./tan%C4%B1t%C4%B1m%201.jpg",
  "./tan%C4%B1t%C4%B1m%202.jpg",
  "./tan%C4%B1t%C4%B1m%203.jpg",
  "./tan%C4%B1t%C4%B1m%204.jpg"
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
