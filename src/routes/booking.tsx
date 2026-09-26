import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Check, Copy, Send, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { DURATIONS, EQUIPMENT, SERVICES, submitBooking, type BookingRequest } from "@/lib/booking";
import { haptic, startReservationActivity, copyText } from "@/lib/native";
import { enablePush, pushState, localNotify } from "@/lib/push";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/booking")({
  head: () => ({
    meta: [
      { title: "رزرو استودیو | آپ استودیو" },
      { name: "description", content: "فرم رزرو آنلاین آپ استودیو؛ ارسال مستقیم درخواست از طریق واتساپ." },
      { property: "og:title", content: "رزرو آپ استودیو" },
      { property: "og:description", content: "استودیو را برای عکاسی یا فیلم‌برداری رزرو کنید." },
    ],
  }),
  component: Booking,
});

const field = "w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-ring/30";

function Booking() {
  const [b, setB] = useState<BookingRequest>({ name: "", phone: "", date: "", time: "", duration: DURATIONS[1], service: SERVICES[0], equipment: [], notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<string | null>(null);
  const set = <K extends keyof BookingRequest>(k: K, v: BookingRequest[K]) => setB((s) => ({ ...s, [k]: v }));
  const today = new Date().toISOString().slice(0, 10);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (b.name.trim().length < 2) er.name = "نام را وارد کنید";
    if (!/^[+\d۰-۹\s-]{8,16}$/.test(b.phone.trim())) er.phone = "شماره معتبر وارد کنید";
    if (!b.date) er.date = "تاریخ را انتخاب کنید";
    if (!b.time) er.time = "ساعت را انتخاب کنید";
    setErrors(er);
    if (Object.keys(er).length) { haptic("medium"); return; }
    haptic("success");
    const r = await submitBooking(b);
    setSent(r.text);
    startReservationActivity({ title: b.service, date: b.date, time: b.time }).catch(() => {});
    localNotify("درخواست رزرو ارسال شد", "پس از تأیید استودیو به شما اطلاع می‌دهیم.");
  };

  const push = async () => {
    const r = await enablePush();
    if (r === "granted") toast.success("اعلان‌ها فعال شد.");
    else if (r === "iframe") toast("برای فعال‌سازی اعلان، برنامه را در یک تب جدا باز کنید.");
    else if (r === "denied") toast("اعلان‌ها مسدود است؛ از تنظیمات مرورگر اجازه دهید.");
    else toast("این دستگاه از اعلان وب پشتیبانی نمی‌کند.");
  };

  return (
    <div>
      <PageHeader kicker="Reservation" title="رزرو استودیو" sub="فرم را کامل کنید؛ پیام رزرو آماده شده و واتساپ استودیو باز می‌شود." />

      {sent ? (
        <div className="mx-3 animate-rise rounded-3xl border border-border bg-card p-6">
          <div className="grid size-12 place-items-center rounded-full bg-ink text-ink-foreground"><Check /></div>
          <h2 className="mt-4 text-lg font-bold">پیام رزرو آماده است</h2>
          <p className="mt-1 text-sm leading-7 text-muted-foreground">متن کپی شد — در گفتگوی واتساپ آن را جای‌گذاری (Paste) و ارسال کنید.</p>
          <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-secondary p-4 font-sans text-xs leading-6">{sent}</pre>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={async () => { await copyText(sent); haptic(); toast.success("کپی شد"); }} className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm"><Copy className="size-4" /> کپی دوباره</button>
            <button onClick={() => setSent(null)} className="rounded-full px-4 py-2 text-sm text-muted-foreground">رزرو جدید</button>
          </div>
          <div className="mt-5 flex items-start gap-3 rounded-2xl bg-secondary p-4 text-xs leading-6 text-muted-foreground">
            <Smartphone className="mt-0.5 size-4 shrink-0" />
            وضعیت رزرو: <b className="text-foreground">در انتظار تأیید</b>. در نسخه‌ی iOS برنامه، این وضعیت در Dynamic Island نمایش داده خواهد شد.
          </div>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4 px-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="نام و نام خانوادگی" err={errors.name}><input className={field} value={b.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" /></F>
            <F label="شماره تماس" err={errors.phone}><input className={field} dir="ltr" inputMode="tel" value={b.phone} onChange={(e) => set("phone", e.target.value)} placeholder="09xx xxx xxxx" autoComplete="tel" /></F>
            <F label="تاریخ" err={errors.date}><input type="date" min={today} className={field} value={b.date} onChange={(e) => set("date", e.target.value)} /></F>
            <F label="ساعت شروع" err={errors.time}><input type="time" className={field} value={b.time} onChange={(e) => set("time", e.target.value)} /></F>
          </div>
          <F label="مدت زمان">
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              {DURATIONS.map((d) => <Chip key={d} on={b.duration === d} onClick={() => set("duration", d)}>{d}</Chip>)}
            </div>
          </F>
          <F label="نوع پروژه">
            <div className="flex flex-wrap gap-2">
              {SERVICES.map((s) => <Chip key={s} on={b.service === s} onClick={() => set("service", s)}>{s}</Chip>)}
            </div>
          </F>
          <F label="تجهیزات و نورپردازی">
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT.map((q) => (
                <Chip key={q} on={b.equipment.includes(q)} onClick={() => set("equipment", b.equipment.includes(q) ? b.equipment.filter((x) => x !== q) : [...b.equipment, q])}>{q}</Chip>
              ))}
            </div>
          </F>
          <F label="توضیحات"><textarea rows={3} className={field} value={b.notes} onChange={(e) => set("notes", e.target.value)} placeholder="تعداد افراد، مود بورد، نیازهای خاص..." /></F>
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-4 text-sm font-medium text-ink-foreground transition active:scale-[0.98]">
            <Send className="size-4" /> ارسال درخواست از طریق واتساپ
          </button>
        </form>
      )}

      <div className="mx-3 mt-6 flex items-center justify-between gap-3 rounded-3xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-secondary"><Bell className="size-4" /></span>
          <div>
            <p className="text-sm font-bold">اعلان تأیید رزرو</p>
            <p className="text-xs text-muted-foreground">دریافت خبر تأیید یا تغییر زمان</p>
          </div>
        </div>
        <button onClick={push} className="rounded-full border border-border px-4 py-2 text-xs">
          {typeof window !== "undefined" && pushState() === "granted" ? "فعال" : "فعال‌سازی"}
        </button>
      </div>
    </div>
  );
}

function F({ label, err, children }: { label: string; err?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {err && <span className="mt-1 block text-xs text-destructive">{err}</span>}
    </label>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={() => { haptic(); onClick(); }} aria-pressed={on}
      className={cn("shrink-0 rounded-full border px-4 py-2 text-xs transition-all", on ? "border-ink bg-ink text-ink-foreground" : "border-border bg-card text-foreground")}>
      {children}
    </button>
  );
}
