// Single source of truth for studio contact details and media assets.
export const STUDIO = {
  name: "آپ استودیو",
  nameEn: "UP Studio",
  handle: "uplabstudio",
  website: "https://upstudio.ct.ws",
  phoneDisplay: "۰۹۰۱ ۵۷۹ ۳۳۱۲",
  phoneTel: "tel:+989015793312",
  phoneRaw: "+989015793312",
  email: "info@uplabstudio.com",
  whatsapp: "https://wa.link/pcjlml",
  telegram: "https://t.me/uplabstudio",
  instagram: "https://www.instagram.com/uplabstudio?igsh=MWd5ZTZhbG16azR1OA==",
  address:
    "آزادگان غرب به شرق، خیابان شمس آباد، بعد از زیرگذر، پلاک ۲۶ (بلوک‌زنی تک) (مینوسپهر)، انتهای مجموعه، آپ استودیو",
  lat: 35.642205,
  lng: 51.267854,
};

export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${STUDIO.lat},${STUDIO.lng}`;
export const mapEmbed = `https://maps.google.com/maps?q=${STUDIO.lat},${STUDIO.lng}&z=16&output=embed`;

export const MEDIA = {
  logo: "/media/logo.png",
  // Audio track stripped at build time (ffmpeg -an). Playback is also forced muted.
  reelMuted: "/media/reel-muted.mp4",
  reel: "/media/reel.mp4",
  poster: "/media/reel-poster.jpg",
};

export type Category = "fashion" | "portrait" | "sports" | "art";
export const CATEGORIES: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "همه" },
  { id: "fashion", label: "مد و فشن" },
  { id: "portrait", label: "پرتره" },
  { id: "sports", label: "ورزشی" },
  { id: "art", label: "هنری" },
];

const cat: Category[] = [
  "sports", "fashion", "fashion", "art", "fashion", "fashion", "fashion", "fashion", "portrait",
  "portrait", "fashion", "portrait", "art", "sports", "art", "sports", "art",
];

export type Photo = { id: string; src: string; thumb: string; category: Category; w: number; h: number };
export const PHOTOS: Photo[] = cat.map((c, i) => {
  const n = String(i + 1).padStart(2, "0");
  return { id: n, src: `/media/gallery/p${n}.jpg`, thumb: `/media/gallery/t${n}.jpg`, category: c, w: 1080, h: 2016 };
});

export const ext = { target: "_blank", rel: "noopener noreferrer" } as const;
