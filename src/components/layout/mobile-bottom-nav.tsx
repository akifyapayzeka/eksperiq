"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CarFront, FileCheck2, FileText, Plus, UserRound } from "lucide-react";

const sideItems = [
  { href: "/arac-saglik-karnesi", label: "Garajım", icon: CarFront },
  { href: "/analizlerim", label: "Analizlerim", icon: FileText },
  { href: "/sonuc", label: "Raporlarım", icon: FileCheck2 },
  { href: "/profil", label: "Profil", icon: UserRound },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const orderedItems = [sideItems[0], sideItems[1], null, sideItems[2], sideItems[3]] as const;

  return (
    <nav
      aria-label="Mobil alt menü"
      className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:hidden dark:border-slate-800 dark:bg-slate-900/95"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 items-end gap-1">
        {orderedItems.map((item, index) => {
          if (!item) {
            const isActive = pathname === "/analiz";

            return (
              <Link
                key="new-analysis"
                href="/analiz"
                aria-current={isActive ? "page" : undefined}
                className={`relative -mt-7 flex min-h-[4.75rem] flex-col items-center justify-center gap-1 rounded-2xl px-1 text-center text-[0.68rem] font-bold leading-tight shadow-lg ${
                  isActive ? "bg-slate-950 text-white" : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-950 dark:bg-slate-100">
                  <Plus aria-hidden="true" className="h-5 w-5" />
                </span>
                <span>Yeni Analiz</span>
              </Link>
            );
          }

          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={`${item.href}-${index}`}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-center text-[0.64rem] font-semibold leading-tight ${
                isActive ? "bg-slate-100 text-slate-950" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon aria-hidden="true" className="h-5 w-5" />
              <span className="max-w-full text-balance">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
