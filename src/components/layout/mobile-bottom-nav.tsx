"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CarFront, ClipboardList, FileText, House, UserRound } from "lucide-react";

/**
 * Exactly 5 items, mounted once in RootLayout and reused on every page —
 * do not create per-page copies of this component.
 */
const NAV_ITEMS = [
  { href: "/", label: "Ana Sayfa", icon: House },
  { href: "/analiz", label: "Analiz", icon: ClipboardList },
  { href: "/arac-saglik-karnesi", label: "Garajım", icon: CarFront },
  { href: "/analizlerim", label: "Geçmiş", icon: FileText },
  { href: "/profil", label: "Profil", icon: UserRound },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Ana navigasyon"
      className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-theme px-1 py-1.5 text-center text-[0.64rem] font-semibold leading-tight transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span
                className={`flex h-8 w-11 items-center justify-center rounded-full ${isActive ? "bg-secondary" : ""}`}
              >
                <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={isActive ? 2.1 : 1.8} />
              </span>
              <span className={`max-w-full text-balance font-heading ${isActive ? "font-bold" : "font-semibold"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
