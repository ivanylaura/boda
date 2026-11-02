// Guarda la web en el móvil para que funcione sin cobertura.
// Si cambias algo de la web, sube este número para que los móviles se actualicen.
const VERSION = "boda-v1-4";
const ARCHIVOS = ["./", "index.html", "web.html", "llegada.html", "gracias.html", "menu.html", "mesas.html", "manifest.webmanifest",
  "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Tipografías de Google: se guardan la primera vez
  if (url.host === "fonts.googleapis.com" || url.host === "fonts.gstatic.com") {
    e.respondWith(caches.match(req).then((r) => r || fetch(req).then((res) => {
      const copia = res.clone(); caches.open(VERSION).then((c) => c.put(req, copia)); return res;
    })));
    return;
  }

  if (url.origin !== location.origin) return;

  // Web: primero intenta la versión nueva; sin conexión, usa la guardada
  e.respondWith(fetch(req).then((res) => {
    const copia = res.clone(); caches.open(VERSION).then((c) => c.put(req, copia)); return res;
  }).catch(() => caches.match(req).then((r) => r || caches.match("index.html"))));
});
