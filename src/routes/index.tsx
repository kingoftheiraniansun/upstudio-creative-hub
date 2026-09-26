import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpLeft, Globe, Loader2, Images, CalendarDays } from "lucide-react";
import { MEDIA, PHOTOS, STUDIO, ext } from "@/lib/studio";
import { haptic } from "@/lib/native";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "آپ استودیو | UP Studio — استودیو عکاسی" },
      { name: "description", content: "استودیو عکاسی آپ: مد و فشن، پرتره، ورزشی و هنری. رزرو آنلاین استودیو در تهران." },
      { property: "og:title", content: "آپ استودیو | UP Studio" },
      { property: "og:description", content: "استودیو عکاسی مد، پرتره، ورزشی و هنری در تهران." },
    ],
  }),
  component: Home,
});

function Home() {
  const [frame, setFrame] = useState<"idle" | "loading" | "shown">("idle");
  return (
    <div>
      <section className="relative mx-3 mt-3 h-[68vh] overflow-hidden rounded-3xl bg-ink">
        <video
          src={MEDIA.reelMuted}
          poster={MEDIA.poster}
          muted
          loop
          autoPlay
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-ink-foreground">
          <img src={MEDIA.logo} alt="" className="mb-4 size-11 invert" />
          <p className="text-[11px] tracking-[0.4em] text-ink-foreground/70">UP STUDIO · TEHRAN</p>
          <h1 className="mt-2 text-[2rem] font-extrabold leading-[1.3]">نور، قاب، روایت.</h1>
          <p className="mt-2 max-w-xs text-sm leading-7 text-ink-foreground/80">استودیو عکاسی مد، پرتره، ورزشی و هنری.</p>
          <div className="mt-5 flex gap-2">
            <Link to="/booking" onClick={() => haptic("medium")} className="inline-flex items-center gap-2 rounded-full bg-ink-foreground px-5 py-2.5 text-sm font-medium text-ink">
              <CalendarDays className="size-4" /> رزرو استودیو
            </Link>
            <Link to="/gallery" className="inline-flex items-center gap-2 rounded-full border border-ink-foreground/30 px-5 py-2.5 text-sm backdrop-blur">
              <Images className="size-4" /> نمونه‌کارها
            </Link>
          </div>
        </div>
      </section>

      <section className="px-5 pt-8">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-bold">منتخب نمونه‌کارها</h2>
          <Link to="/gallery" className="text-xs text-muted-foreground">مشاهده همه</Link>
        </div>
        <div className="no-scrollbar -mx-5 mt-4 flex gap-3 overflow-x-auto px-5">
          {PHOTOS.slice(0, 6).map((p) => (
            <Link key={p.id} to="/gallery" className="w-32 shrink-0 overflow-hidden rounded-2xl bg-muted">
              <img src={p.thumb} alt="" loading="lazy" className="aspect-[9/16] w-full object-cover" />
            </Link>
          ))}
        </div>
      </section>

      <section className="px-3 pt-10">
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <div className="flex items-center justify-between gap-3 p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-secondary"><Globe className="size-5" strokeWidth={1.5} /></span>
              <div>
                <h2 className="font-bold">وب‌سایت استودیو</h2>
                <p dir="ltr" className="text-right text-xs text-muted-foreground">upstudio.ct.ws</p>
              </div>
            </div>
            <a href={STUDIO.website} {...ext} className="inline-flex items-center gap-1 rounded-full bg-ink px-4 py-2 text-xs text-ink-foreground">
              باز کردن <ArrowUpLeft className="size-3.5" />
            </a>
          </div>
          {frame === "idle" ? (
            <button
              onClick={() => { haptic(); setFrame("loading"); }}
              className="relative block h-64 w-full overflow-hidden border-t border-border"
            >
              <img src={PHOTOS[9].src} alt="" loading="lazy" className="h-full w-full object-cover opacity-80" />
              <span className="absolute inset-0 grid place-items-center bg-ink/30 text-sm font-medium text-ink-foreground">نمایش وب‌سایت در برنامه</span>
            </button>
          ) : (
            <div className="relative h-[70vh] border-t border-border">
              {frame === "loading" && (
                <div className="absolute inset-0 grid place-items-center bg-muted text-sm text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              )}
              <iframe
                title="وب‌سایت آپ استودیو"
                src={STUDIO.website}
                onLoad={() => setFrame("shown")}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                className="h-full w-full bg-card"
              />
              <p className="absolute inset-x-0 bottom-0 bg-card/90 p-2 text-center text-[11px] text-muted-foreground backdrop-blur">
                اگر صفحه نمایش داده نشد، از دکمه «باز کردن» استفاده کنید.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
