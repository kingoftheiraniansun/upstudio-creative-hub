import { useEffect, useRef, useState } from "react";
import { MEDIA } from "@/lib/studio";

/** Launch intro: silent reel (audio stripped at build + muted playback), cinematic fade out. */
export function IntroReel({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  const finish = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(onDone, 900);
  };
  useEffect(() => {
    const v = ref.current;
    if (v) {
      v.muted = true;
      v.volume = 0;
      v.play().catch(() => {});
    }
    const t = setTimeout(finish, 15000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      className={`fixed inset-0 z-50 bg-ink transition-all duration-[900ms] ease-out ${leaving ? "scale-105 opacity-0" : "opacity-100"}`}
      role="dialog"
      aria-label="معرفی آپ استودیو"
    >
      <video
        ref={ref}
        src={MEDIA.reelMuted}
        poster={MEDIA.poster}
        muted
        playsInline
        autoPlay
        preload="auto"
        onEnded={finish}
        onVolumeChange={(e) => { (e.currentTarget as HTMLVideoElement).muted = true; }}
        className="absolute inset-0 h-full w-full animate-kenburns object-cover opacity-90"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-5 p-8 pb-safe">
        <img src={MEDIA.logo} alt="UP Studio" className="size-16 animate-rise invert" />
        <p className="animate-rise text-sm tracking-[0.4em] text-ink-foreground/80 [animation-delay:300ms]">UP STUDIO</p>
        <button
          onClick={finish}
          className="mb-8 rounded-full border border-ink-foreground/30 px-6 py-2 text-sm text-ink-foreground backdrop-blur transition hover:bg-ink-foreground/10"
        >
          ورود
        </button>
      </div>
    </div>
  );
}
