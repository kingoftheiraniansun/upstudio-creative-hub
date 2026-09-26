// Native bridges. In a Capacitor build, plugins are exposed on window.Capacitor.Plugins.
// Every function degrades gracefully on the plain web.
type Plugins = Record<string, any>;
function plugins(): Plugins | undefined {
  if (typeof window === "undefined") return;
  return (window as any).Capacitor?.Plugins;
}
export const isNative = () => typeof window !== "undefined" && !!(window as any).Capacitor?.isNativePlatform?.();
export const platform = (): "ios" | "android" | "web" => {
  if (typeof navigator === "undefined") return "web";
  const cap = (window as any).Capacitor?.getPlatform?.();
  if (cap === "ios" || cap === "android") return cap;
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) return "ios";
  if (/Android/i.test(navigator.userAgent)) return "android";
  return "web";
};

export function haptic(style: "light" | "medium" | "success" = "light") {
  const h = plugins()?.Haptics;
  if (h) {
    style === "success" ? h.notification?.({ type: "SUCCESS" }) : h.impact?.({ style: style.toUpperCase() });
    return;
  }
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(style === "success" ? [10, 40, 10] : style === "medium" ? 16 : 8);
  }
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

async function fetchFile(url: string, name: string) {
  const blob = await (await fetch(url)).blob();
  return new File([blob], name, { type: blob.type || "image/jpeg" });
}

/** iOS / generic: share sheet (Save Image) or download fallback. */
export async function saveImage(url: string, name: string): Promise<"shared" | "downloaded" | "cancelled"> {
  try {
    const file = await fetchFile(url, name);
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "UP Studio" });
      return "shared";
    }
  } catch (e) {
    if ((e as Error).name === "AbortError") return "cancelled";
  }
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  return "downloaded";
}

/**
 * Android wallpaper. Requires a native plugin registered as "Wallpaper" in the
 * Capacitor Android project exposing setWallpaper({ url, target: "home"|"lock"|"both" })
 * (backed by android.app.WallpaperManager). Returns false on the web so the UI falls back.
 */
export async function setWallpaper(url: string, target: "home" | "lock"): Promise<boolean> {
  const w = plugins()?.Wallpaper;
  if (!w) return false;
  await w.setWallpaper({ url: new URL(url, location.href).href, target });
  return true;
}

/**
 * iOS Live Activity / Dynamic Island hook. Needs an ActivityKit widget extension
 * plus a Capacitor plugin named "LiveActivity" with start/update/end methods.
 * Not available in browsers — callers show a web status card instead.
 */
export async function startReservationActivity(data: { title: string; date: string; time: string }) {
  const la = plugins()?.LiveActivity;
  if (!la) return false;
  await la.start(data);
  return true;
}
