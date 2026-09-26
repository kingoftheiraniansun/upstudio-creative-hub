// UP Studio service worker: media cache-first, pages network-first w/ offline fallback, push.
const MEDIA = "up-media-v1";
const PAGES = "up-pages-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || url.pathname.startsWith("/~oauth")) return;

  if (url.pathname.startsWith("/media/") && !url.pathname.endsWith(".mp4")) {
    event.respondWith(
      caches.open(MEDIA).then(async (c) => {
        const hit = await c.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) c.put(req, res.clone());
        return res;
      }),
    );
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(PAGES).then((c) => c.put(req, copy));
          return res;
        })
        .catch(async () => (await caches.match(req)) || (await caches.match("/gallery")) || Response.error()),
    );
  }
});

self.addEventListener("push", (event) => {
  let data = { title: "آپ استودیو", body: "رزرو شما به‌روزرسانی شد." };
  try { data = { ...data, ...event.data.json() }; } catch {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body, icon: "/icon-192.png", badge: "/icon-192.png", dir: "rtl", lang: "fa", data: data.url || "/booking",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data || "/"));
});
