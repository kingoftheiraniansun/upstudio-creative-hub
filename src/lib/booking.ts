import { STUDIO } from "./studio";

export type BookingRequest = {
  name: string; phone: string; date: string; time: string; duration: string;
  service: string; equipment: string[]; notes: string;
};

export const SERVICES = ["عکاسی مد و فشن", "پرتره", "عکاسی ورزشی", "عکاسی هنری", "تبلیغاتی / محصول", "فیلم‌برداری / ریلز", "اجاره استودیو خالی"];
export const EQUIPMENT = ["نور استروب", "نور ثابت LED", "بک‌دراپ رنگی", "سایکلوراما", "دود / افکت", "گریم و آماده‌سازی"];
export const DURATIONS = ["۱ ساعت", "۲ ساعت", "۳ ساعت", "۴ ساعت", "نیم‌روز (۶ ساعت)", "تمام‌روز"];

export function toWhatsAppText(b: BookingRequest) {
  const dateFa = b.date ? new Date(b.date).toLocaleDateString("fa-IR") : "—";
  return [
    "سلام، درخواست رزرو آپ استودیو 📸",
    `👤 نام: ${b.name}`,
    `📞 تماس: ${b.phone}`,
    `📅 تاریخ: ${dateFa}`,
    `⏰ ساعت شروع: ${b.time}`,
    `⏳ مدت: ${b.duration}`,
    `🎬 نوع پروژه: ${b.service}`,
    `💡 تجهیزات: ${b.equipment.length ? b.equipment.join("، ") : "—"}`,
    b.notes ? `📝 توضیحات: ${b.notes}` : "",
  ].filter(Boolean).join("\n");
}

/**
 * Integration point: replace the body with your booking API call.
 * Current behaviour copies the message and opens WhatsApp (wa.link can't carry text).
 */
export async function submitBooking(b: BookingRequest): Promise<{ via: "whatsapp"; text: string }> {
  const text = toWhatsAppText(b);
  try { await navigator.clipboard.writeText(text); } catch {}
  window.open(STUDIO.whatsapp, "_blank", "noopener,noreferrer");
  return { via: "whatsapp", text };
}
