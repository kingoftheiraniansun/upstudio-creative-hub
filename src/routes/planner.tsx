import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { Aperture, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { recommendSetup } from "@/lib/planner.functions";
import { haptic } from "@/lib/native";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "برنامه‌ریز عکاسی | آپ استودیو" },
      { name: "description", content: "هدف عکاسی خود را بنویسید تا چیدمان و تجهیزات مناسب آپ استودیو پیشنهاد شود." },
      { property: "og:title", content: "برنامه‌ریز عکاسی آپ استودیو" },
      { property: "og:description", content: "پیشنهاد هوشمند چیدمان، نور و تجهیزات برای پروژه‌ی شما." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Planner,
});

const EXAMPLES = ["کمپین لباس پاییزه با حس سینمایی و تیره", "پرتره‌ی حرفه‌ای برای لینکدین", "ریلز محصول عطر با پس‌زمینه‌ی رنگی"];

function Planner() {
  const run = useServerFn(recommendSetup);
  const [goals, setGoals] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (goals.trim().length < 5 || loading) return;
    haptic(); setLoading(true); setError(null); setResult(null);
    try {
      const r = await run({ data: { goals } });
      if (r.ok) { setResult(r.text); haptic("success"); } else setError(r.error);
    } catch { setError("خطا در ارتباط. دوباره تلاش کنید."); }
    finally { setLoading(false); }
  };

  return (
    <div className="pb-8">
      <PageHeader kicker="Shoot Planner" title="برنامه‌ریز عکاسی" sub="هدف و حس پروژه‌تان را بنویسید؛ چیدمان استودیو و تجهیزات مناسب پیشنهاد می‌شود." />
      <div className="space-y-3 px-3">
        <textarea rows={4} value={goals} onChange={(e) => setGoals(e.target.value)} maxLength={1500}
          placeholder="مثلاً: عکاسی فشن برای برند لباس، ۳ مدل، حس مینیمال و روشن..."
          className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm leading-7 outline-none focus:border-gold focus:ring-2 focus:ring-ring/30" />
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {EXAMPLES.map((e) => <button key={e} onClick={() => setGoals(e)} className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs">{e}</button>)}
        </div>
        <button onClick={submit} disabled={loading || goals.trim().length < 5}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-4 text-sm font-medium text-ink-foreground transition disabled:opacity-40">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Aperture className="size-4" />}
          {loading ? "در حال طراحی پیشنهاد..." : "دریافت پیشنهاد"}
        </button>
        {error && <p className="rounded-2xl bg-secondary p-4 text-sm text-destructive">{error}</p>}
        {loading && <div className="space-y-2 rounded-3xl border border-border bg-card p-5">{[90, 70, 80, 50].map((w) => <div key={w} className="h-3 animate-pulse rounded bg-secondary" style={{ width: `${w}%` }} />)}</div>}
        {result && (
          <div className="animate-rise rounded-3xl border border-border bg-card p-5">
            <div className="prose prose-sm max-w-none text-sm leading-7 [&_h1]:text-base [&_h2]:text-base [&_h3]:text-sm [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pr-5 [&_ol]:list-decimal [&_ol]:pr-5">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
            <Link to="/booking" className="mt-4 flex items-center justify-center rounded-full border border-border py-3 text-sm">رزرو با این چیدمان</Link>
          </div>
        )}
      </div>
    </div>
  );
}
