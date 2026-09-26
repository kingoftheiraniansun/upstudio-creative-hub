import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [off, setOff] = useState(false);
  useEffect(() => {
    const u = () => setOff(!navigator.onLine);
    u();
    addEventListener("online", u);
    addEventListener("offline", u);
    return () => { removeEventListener("online", u); removeEventListener("offline", u); };
  }, []);
  if (!off) return null;
  return (
    <div role="status" className="fixed inset-x-0 top-0 z-40 flex items-center justify-center gap-2 bg-ink py-2 pt-safe text-xs text-ink-foreground">
      <WifiOff className="size-3.5" /> آفلاین هستید — نسخه‌ی ذخیره‌شده نمایش داده می‌شود
    </div>
  );
}
