// Single registration point for /sw.js (media offline cache + push).
// Never registers in dev, iframes, or Lovable preview hosts.
export function registerSW() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  const h = location.hostname;
  const blocked =
    !import.meta.env.PROD ||
    window.top !== window.self ||
    h.startsWith("id-preview--") ||
    h.startsWith("preview--") ||
    /(^|\.)lovableproject(-dev)?\.com$/.test(h) ||
    /(^|\.)beta\.lovable\.dev$/.test(h) ||
    new URLSearchParams(location.search).has("sw");
  if (blocked) {
    navigator.serviceWorker.getRegistrations().then((rs) =>
      rs.forEach((r) => r.active?.scriptURL.endsWith("/sw.js") && r.unregister()),
    );
    return;
  }
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}

/** Warm the gallery cache so the last gallery opens offline (works with or without SW via Cache API). */
export async function warmGallery(urls: string[]) {
  if (typeof caches === "undefined") return;
  try {
    const c = await caches.open("up-media-v1");
    const have = new Set((await c.keys()).map((r) => new URL(r.url).pathname));
    await Promise.all(urls.filter((u) => !have.has(u)).map((u) => c.add(u).catch(() => {})));
    localStorage.setItem("up.gallery.cachedAt", new Date().toISOString());
  } catch {}
}
