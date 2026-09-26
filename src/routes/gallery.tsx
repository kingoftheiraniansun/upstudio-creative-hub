import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Home, Lock, Volume2, VolumeX, X, Play } from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES, MEDIA, PHOTOS, type Category, type Photo } from "@/lib/studio";
import { haptic, platform, saveImage, setWallpaper } from "@/lib/native";
import { warmGallery } from "@/lib/sw-register";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "گالری نمونه‌کارها | آپ استودیو" },
      { name: "description", content: "۱۷ نمونه‌کار منتخب آپ استودیو در مد و فشن، پرتره، ورزشی و هنری." },
      { property: "og:title", content: "گالری آپ استودیو" },
      { property: "og:description", content: "نمونه‌کارهای مد، پرتره، ورزشی و هنری." },
    ],
  }),
  component: Gallery,
});

function FeaturedReel() {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const toggleSound = () => {
    const v = ref.current;
    if (!v) return;
    haptic();
    v.muted = !v.muted;
    setMuted(v.muted);
    if (v.paused) v.play();
  };
  return (
    <div className="relative mx-3 overflow-hidden rounded-3xl bg-ink">
      <video
        ref={ref}
        src={MEDIA.reel}
        poster={MEDIA.poster}
        muted
        loop
        autoPlay
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="aspect-[4/5] w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4 text-ink-foreground">
        <div>
          <p className="text-[10px] tracking-[0.35em] text-ink-foreground/70">SHOWREEL</p>
          <p className="font-bold">ریل معرفی استودیو</p>
        </div>
        <div className="flex gap-2">
          {!playing && (
            <button aria-label="پخش" onClick={() => ref.current?.play()} className="grid size-11 place-items-center rounded-full bg-ink-foreground/15 backdrop-blur">
              <Play className="size-5" />
            </button>
          )}
          <button
            aria-label={muted ? "روشن کردن صدا" : "بی‌صدا"}
            onClick={toggleSound}
            className="flex h-11 items-center gap-2 rounded-full bg-ink-foreground px-4 text-sm font-medium text-ink"
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            {muted ? "صدا" : "بی‌صدا"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Tile({ p, onOpen }: { p: Photo; onOpen: (el: HTMLElement) => void }) {
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState(false);
  return (
    <button
      onClick={(e) => onOpen(e.currentTarget)}
      className="relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-2xl bg-muted"
      aria-label={`نمایش تصویر ${p.id}`}
    >
      {!loaded && !err && <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted to-secondary" />}
      {err ? (
        <div className="grid aspect-[9/16] place-items-center text-xs text-muted-foreground">تصویر در دسترس نیست</div>
      ) : (
        <img
          src={p.thumb}
          srcSet={`${p.thumb} 400w, ${p.src} 1080w`}
          sizes="(max-width: 640px) 50vw, 33vw"
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setErr(true)}
          className={cn("aspect-[9/16] w-full object-cover transition-all duration-700", loaded ? "scale-100 opacity-100" : "scale-105 opacity-0")}
        />
      )}
    </button>
  );
}

function Viewer({ list, index, origin, onClose, onIndex }: {
  list: Photo[]; index: number; origin: DOMRect | null; onClose: () => void; onIndex: (i: number) => void;
}) {
  const [phase, setPhase] = useState<"enter" | "open" | "leave">("enter");
  const touch = useRef<number | null>(null);
  const p = list[index];
  const isAndroid = platform() === "android";

  useEffect(() => {
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setPhase("open")));
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") next();
      if (e.key === "ArrowRight") prev();
    };
    addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { cancelAnimationFrame(r); removeEventListener("keydown", k); document.body.style.overflow = ""; };
  });

  const close = () => { setPhase("leave"); setTimeout(onClose, 350); };
  const next = () => { haptic(); onIndex((index + 1) % list.length); };
  const prev = () => { haptic(); onIndex((index - 1 + list.length) % list.length); };

  // Shared-element style: animate from the tapped tile's rect to fullscreen.
  const vw = typeof window !== "undefined" ? window.innerWidth : 1;
  const vh = typeof window !== "undefined" ? window.innerHeight : 1;
  const from = origin
    ? `translate(${origin.left + origin.width / 2 - vw / 2}px, ${origin.top + origin.height / 2 - vh / 2}px) scale(${origin.width / Math.min(vw, vh * 9 / 16)})`
    : "scale(0.9)";
  const transform = phase === "open" ? "none" : from;

  const save = async () => {
    haptic("medium");
    const r = await saveImage(p.src, `upstudio-${p.id}.jpg`);
    if (r === "downloaded") toast.success(platform() === "ios" ? "تصویر باز شد؛ نگه دارید و «Save to Photos» را بزنید." : "تصویر دانلود شد.");
  };
  const wall = async (t: "home" | "lock") => {
    haptic("medium");
    try {
      if (await setWallpaper(p.src, t)) return toast.success("والپیپر تنظیم شد.");
    } catch {}
    await saveImage(p.src, `upstudio-${p.id}.jpg`);
    toast("تصویر ذخیره شد. از گالری گوشی: «تنظیم به عنوان والپیپر» را انتخاب کنید.");
  };

  return (
    <div
      className={cn("fixed inset-0 z-50 flex flex-col bg-ink transition-colors duration-300", phase === "open" ? "bg-ink" : "bg-ink/0")}
      role="dialog"
      aria-modal="true"
      aria-label="نمایش تمام‌صفحه"
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current == null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) (dx > 0 ? next : prev)();
        touch.current = null;
      }}
    >
      <div className={cn("relative z-10 flex items-center justify-between p-4 pt-safe text-ink-foreground transition-opacity", phase === "open" ? "opacity-100" : "opacity-0")}>
        <button aria-label="بستن" onClick={close} className="grid size-10 place-items-center rounded-full bg-ink-foreground/10"><X className="size-5" /></button>
        <span className="text-xs tabular-nums text-ink-foreground/70">{index + 1} / {list.length}</span>
      </div>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <img
          key={p.id}
          src={p.src}
          alt=""
          style={{ transform, transition: "transform 420ms cubic-bezier(0.2,0.8,0.2,1), opacity 300ms" }}
          className={cn("max-h-full max-w-full object-contain", phase === "leave" && "opacity-0")}
        />
        <button aria-label="قبلی" onClick={prev} className="absolute right-2 hidden size-10 place-items-center rounded-full bg-ink-foreground/10 text-ink-foreground sm:grid"><ChevronRight /></button>
        <button aria-label="بعدی" onClick={next} className="absolute left-2 hidden size-10 place-items-center rounded-full bg-ink-foreground/10 text-ink-foreground sm:grid"><ChevronLeft /></button>
      </div>
      <div className={cn("flex flex-wrap justify-center gap-2 p-4 pb-safe transition-opacity", phase === "open" ? "opacity-100" : "opacity-0")}>
        {isAndroid ? (
          <>
            <button onClick={() => wall("home")} className="flex items-center gap-2 rounded-full bg-ink-foreground px-4 py-2.5 text-sm text-ink"><Home className="size-4" /> والپیپر صفحه اصلی</button>
            <button onClick={() => wall("lock")} className="flex items-center gap-2 rounded-full bg-ink-foreground/15 px-4 py-2.5 text-sm text-ink-foreground"><Lock className="size-4" /> صفحه قفل</button>
          </>
        ) : null}
        <button onClick={save} className={cn("mb-4 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm", isAndroid ? "bg-ink-foreground/15 text-ink-foreground" : "bg-ink-foreground text-ink")}>
          <Download className="size-4" /> {platform() === "ios" ? "ذخیره در Photos / والپیپر" : "ذخیره تصویر"}
        </button>
      </div>
    </div>
  );
}

function Gallery() {
  const [filter, setFilter] = useState<Category | "all">("all");
  const [open, setOpen] = useState<{ i: number; rect: DOMRect | null } | null>(null);
  const list = filter === "all" ? PHOTOS : PHOTOS.filter((p) => p.category === filter);

  useEffect(() => {
    const idle = (window as any).requestIdleCallback ?? ((f: () => void) => setTimeout(f, 1500));
    idle(() => warmGallery(PHOTOS.flatMap((p) => [p.thumb, p.src]).concat(MEDIA.poster, MEDIA.logo)));
  }, []);

  return (
    <div>
      <PageHeader kicker="Portfolio" title="گالری" sub="۱۷ قاب منتخب از پروژه‌های آپ استودیو — برای استفاده آفلاین ذخیره می‌شوند." />
      <FeaturedReel />
      <div role="tablist" className="no-scrollbar sticky top-0 z-20 flex gap-2 overflow-x-auto bg-background/90 px-5 py-4 backdrop-blur">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={filter === c.id}
            onClick={() => { haptic(); setFilter(c.id); }}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm transition-all",
              filter === c.id ? "border-ink bg-ink text-ink-foreground" : "border-border text-muted-foreground",
            )}
          >
            {c.label}
            <span className="ms-1.5 text-[10px] opacity-60">
              {c.id === "all" ? PHOTOS.length : PHOTOS.filter((p) => p.category === c.id).length}
            </span>
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="p-10 text-center text-sm text-muted-foreground">موردی در این دسته نیست.</p>
      ) : (
        <div className="columns-2 gap-3 px-3 sm:columns-3">
          {list.map((p, i) => (
            <Tile key={p.id} p={p} onOpen={(el) => { haptic(); setOpen({ i, rect: el.getBoundingClientRect() }); }} />
          ))}
        </div>
      )}
      {open && (
        <Viewer list={list} index={open.i} origin={open.rect} onClose={() => setOpen(null)} onIndex={(i) => setOpen({ i, rect: null })} />
      )}
    </div>
  );
}
