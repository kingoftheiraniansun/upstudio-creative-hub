import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { EQUIPMENT, SERVICES } from "./booking";

const SYSTEM = `You are the shoot-planning assistant of UP Studio, a photo/video studio in Tehran.
Reply in Persian (Farsi), concise, using markdown headings and bullet lists.
Recommend: 1) the best project type from: ${SERVICES.join(", ")}
2) studio setup (backdrop, set layout, mood), 3) lighting & equipment chosen ONLY from: ${EQUIPMENT.join(", ")}
4) suggested session duration, 5) 2-3 practical tips. Never invent prices; say pricing is confirmed via WhatsApp.`;

export const recommendSetup = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ goals: z.string().trim().min(5).max(1500) }).parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { ok: false as const, error: "سرویس هوش مصنوعی پیکربندی نشده است." };
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        instructions: SYSTEM,
        input: [{ role: "user", content: data.goals }],
        reasoning: { effort: "low" },
        store: false,
        stream: true,
      }),
    });
    if (!res.ok || !res.body) {
      const msg = res.status === 429 ? "درخواست‌ها زیاد است؛ کمی بعد تلاش کنید."
        : res.status === 402 ? "اعتبار هوش مصنوعی تمام شده است."
        : "خطا در دریافت پیشنهاد.";
      return { ok: false as const, error: msg };
    }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "", text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const l of lines) {
        if (!l.startsWith("data:")) continue;
        const p = l.slice(5).trim();
        if (!p || p === "[DONE]") continue;
        try {
          const ev = JSON.parse(p);
          if (ev.type === "response.output_text.delta") text += ev.delta;
          if (ev.type === "response.refusal.delta" || ev.type === "error") return { ok: false as const, error: "امکان پاسخ به این درخواست نیست." };
        } catch {}
      }
    }
    return text.trim() ? { ok: true as const, text } : { ok: false as const, error: "پاسخی دریافت نشد." };
  });
