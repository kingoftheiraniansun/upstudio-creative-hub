import { createFileRoute } from "@tanstack/react-router";
import { Copy, Instagram, Mail, MapPin, MessageCircle, Navigation, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { STUDIO, ext, mapEmbed, mapsUrl } from "@/lib/studio";
import { copyText, haptic } from "@/lib/native";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تماس با آپ استودیو | آدرس و راه‌های ارتباطی" },
      { name: "description", content: "تلفن، ایمیل، واتساپ، تلگرام، اینستاگرام و آدرس آپ استودیو در تهران." },
      { property: "og:title", content: "تماس با آپ استودیو" },
      { property: "og:description", content: "راه‌های ارتباطی و موقعیت آپ استودیو روی نقشه." },
    ],
  }),
  component: Contact,
});

async function copy(v: string) {
  haptic();
  (await copyText(v)) ? toast.success("کپی شد") : toast.error("کپی ممکن نشد");
}

function Contact() {
  const rows = [
    { icon: Phone, label: "تماس مستقیم", value: STUDIO.phoneDisplay, href: STUDIO.phoneTel, copy: STUDIO.phoneRaw, ltr: true },
    { icon: Mail, label: "ایمیل", value: STUDIO.email, href: `mailto:${STUDIO.email}`, copy: STUDIO.email, ltr: true },
  ];
  const socials = [
    { icon: MessageCircle, label: "واتساپ", href: STUDIO.whatsapp },
    { icon: Send, label: "تلگرام", href: STUDIO.telegram },
    { icon: Instagram, label: "اینستاگرام", href: STUDIO.instagram },
  ];
  return (
    <div>
      <PageHeader kicker="Contact" title="با ما در ارتباط باشید" sub="پاسخگویی همه‌روزه — برای هماهنگی و بازدید از استودیو." />
      <div className="space-y-3 px-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3 rounded-3xl border border-border bg-card p-3">
            <a href={r.href} onClick={() => haptic("medium")} className="flex flex-1 items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-ink text-ink-foreground"><r.icon className="size-4" /></span>
              <span>
                <span className="block text-xs text-muted-foreground">{r.label}</span>
                <span dir={r.ltr ? "ltr" : undefined} className="block font-medium">{r.value}</span>
              </span>
            </a>
            <button aria-label={`کپی ${r.label}`} onClick={() => copy(r.copy)} className="grid size-10 place-items-center rounded-full bg-secondary"><Copy className="size-4" /></button>
          </div>
        ))}

        <div className="grid grid-cols-3 gap-3">
          {socials.map((s) => (
            <a key={s.label} href={s.href} {...ext} onClick={() => haptic()} className="flex flex-col items-center gap-2 rounded-3xl border border-border bg-card py-5 text-xs transition active:scale-95">
              <s.icon className="size-5" strokeWidth={1.5} /> {s.label}
            </a>
          ))}
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <div className="relative h-56 bg-muted">
            <iframe title="موقعیت آپ استودیو" src={mapEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-full w-full grayscale-[40%]" />
          </div>
          <div className="p-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 size-4 shrink-0 text-gold" />
              <p className="text-sm leading-7">{STUDIO.address}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <a href={mapsUrl} {...ext} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm text-ink-foreground"><Navigation className="size-4" /> مسیریابی</a>
              <button onClick={() => copy(STUDIO.address)} className="flex items-center gap-2 rounded-full border border-border px-4 text-sm"><Copy className="size-4" /> کپی آدرس</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
