import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { activeAdapter, type ChatMessage } from "@/lib/assistant";
import { haptic } from "@/lib/native";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "دستیار هوشمند | آپ استودیو" },
      { name: "description", content: "دستیار آپ استودیو برای پاسخ به سوالات رزرو، خدمات و آدرس." },
      { property: "og:title", content: "دستیار آپ استودیو" },
      { property: "og:description", content: "پرسش‌های خود درباره استودیو را بپرسید." },
    ],
  }),
  component: Assistant,
});

const SUGGEST = ["چطور استودیو را رزرو کنم؟", "آدرس استودیو کجاست؟", "تعرفه اجاره استودیو چقدر است؟", "برای عکاسی فشن چه نورهایی دارید؟"];

function Assistant() {
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth" }), [msgs, typing]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || typing) return;
    haptic();
    const next = [...msgs, { id: crypto.randomUUID(), role: "user" as const, content: t }];
    setMsgs(next);
    setInput("");
    setTyping(true);
    try {
      const reply = await activeAdapter.send(next);
      setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: reply }]);
    } catch {
      setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: "خطا در ارتباط. دوباره تلاش کنید." }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col">
      <header className="flex items-center gap-3 px-5 pt-8 pb-4">
        <span className="grid size-11 place-items-center rounded-full bg-ink text-ink-foreground"><Sparkles className="size-5" strokeWidth={1.5} /></span>
        <div>
          <h1 className="text-xl font-bold">دستیار آپ</h1>
          <p className="text-xs text-muted-foreground">{activeAdapter.connected ? "آنلاین" : "نسخه‌ی پیش‌نمایش — هوش مصنوعی به‌زودی متصل می‌شود"}</p>
        </div>
      </header>

      <div className="flex-1 space-y-3 px-4">
        {msgs.length === 0 && (
          <div className="animate-rise pt-6">
            <p className="px-1 text-sm text-muted-foreground">چه کمکی از دستم برمی‌آید؟</p>
            <div className="mt-4 grid gap-2">
              {SUGGEST.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-2xl border border-border bg-card px-4 py-3 text-right text-sm transition hover:border-gold">{s}</button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m) => (
          <div key={m.id} className={cn("flex animate-rise", m.role === "user" ? "justify-start" : "justify-end")}>
            <div className={cn("max-w-[82%] rounded-3xl px-4 py-3 text-sm leading-7", m.role === "user" ? "rounded-br-md bg-ink text-ink-foreground" : "rounded-bl-md border border-border bg-card")}>
              {m.content}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-end" aria-live="polite" aria-label="در حال نوشتن">
            <div className="flex gap-1 rounded-3xl rounded-bl-md border border-border bg-card px-4 py-4">
              {[0, 150, 300].map((d) => <span key={d} className="size-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${d}ms` }} />)}
            </div>
          </div>
        )}
        <div ref={end} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="sticky bottom-24 mx-3 mt-4 flex items-end gap-2 rounded-3xl border border-border bg-card p-2 shadow-sm">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          placeholder="پیام خود را بنویسید..."
          aria-label="پیام"
          className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none"
        />
        <button type="submit" aria-label="ارسال" disabled={!input.trim() || typing} className="grid size-10 place-items-center rounded-full bg-ink text-ink-foreground transition disabled:opacity-30">
          <ArrowUp className="size-4" />
        </button>
      </form>
    </div>
  );
}
