// AI assistant adapter. Replace `activeAdapter` with your own implementation
// (e.g. a server function that calls your model). The UI only depends on this interface.
export type ChatMessage = { id: string; role: "user" | "assistant"; content: string };

export interface AssistantAdapter {
  readonly connected: boolean;
  send(history: ChatMessage[]): Promise<string>;
}

/** Placeholder: no live AI. Answers from studio info so the UI is usable until real code is plugged in. */
const offlineAdapter: AssistantAdapter = {
  connected: false,
  async send(history) {
    await new Promise((r) => setTimeout(r, 700));
    const q = history[history.length - 1]?.content ?? "";
    if (/رزرو|نوبت|وقت/.test(q)) return "برای رزرو، به تب «رزرو» بروید؛ فرم را پر کنید تا پیام آماده در واتساپ استودیو ارسال شود.";
    if (/آدرس|کجا|مسیر/.test(q)) return "آپ استودیو: آزادگان غرب به شرق، خیابان شمس آباد، بعد از زیرگذر، پلاک ۲۶. مسیریابی در تب «تماس» است.";
    if (/قیمت|هزینه|تعرفه/.test(q)) return "تعرفه‌ها بسته به مدت و تجهیزات متفاوت است. لطفاً از طریق واتساپ یا تماس با شماره ۰۹۰۱۵۷۹۳۳۱۲ استعلام بگیرید.";
    return "دستیار هوشمند به‌زودی متصل می‌شود. فعلاً می‌توانم درباره‌ی رزرو، آدرس و راه‌های تماس راهنمایی کنم.";
  },
};

export const activeAdapter: AssistantAdapter = offlineAdapter;
