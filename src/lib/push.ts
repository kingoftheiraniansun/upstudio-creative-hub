// Push architecture for reservation confirmations.
// Web: service worker (/sw.js) handles "push" + "notificationclick". To go live, supply a
// VAPID public key (VITE_PUSH_VAPID_KEY) and a server endpoint that stores subscriptions
// (see registerSubscription). Native: use @capacitor/push-notifications with FCM/APNs.
export type PushState = "unsupported" | "iframe" | "default" | "granted" | "denied";

export function pushState(): PushState {
  if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) return "unsupported";
  if (window.top !== window.self) return "iframe";
  return Notification.permission as PushState;
}

async function registerSubscription(sub: PushSubscription) {
  // Integration point: POST the subscription to your booking backend.
  localStorage.setItem("up.push.sub", JSON.stringify(sub));
}

export async function enablePush(): Promise<PushState> {
  const s = pushState();
  if (s === "unsupported" || s === "iframe") return s;
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return perm as PushState;
  const reg = await navigator.serviceWorker.ready.catch(() => null);
  const key = import.meta.env.VITE_PUSH_VAPID_KEY as string | undefined;
  if (reg && key) {
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
    await registerSubscription(sub);
  }
  return "granted";
}

export async function localNotify(title: string, body: string) {
  if (pushState() !== "granted") return;
  const reg = await navigator.serviceWorker.getRegistration();
  if (reg) reg.showNotification(title, { body, icon: "/icon-192.png", dir: "rtl", lang: "fa" });
  else new Notification(title, { body });
}
