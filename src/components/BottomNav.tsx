import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Images, CalendarDays, Sparkles, Phone } from "lucide-react";
import { haptic } from "@/lib/native";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/", label: "خانه", icon: Home },
  { to: "/gallery", label: "گالری", icon: Images },
  { to: "/booking", label: "رزرو", icon: CalendarDays },
  { to: "/assistant", label: "دستیار", icon: Sparkles },
  { to: "/contact", label: "تماس", icon: Phone },
] as const;

export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav aria-label="منوی اصلی" className="fixed inset-x-0 bottom-0 z-40 pb-safe">
      <div className="mx-auto mb-3 flex max-w-md items-center justify-between gap-1 rounded-full border border-border/70 bg-card/85 px-2 py-1.5 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.25)] backdrop-blur-xl mx-3 sm:mx-auto">
        {TABS.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? path === "/" : path.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={() => haptic()}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-full py-1.5 text-[10.5px] transition-all duration-300",
                active ? "bg-ink text-ink-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("size-[18px] transition-transform duration-300", active && "scale-110")} strokeWidth={1.6} />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
