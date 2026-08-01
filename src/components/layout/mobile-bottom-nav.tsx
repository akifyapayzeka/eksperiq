"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CarFront, FileText, Plus } from "lucide-react";

const items = [
  { href: "/analiz", label: "Yeni Analiz", icon: Plus },
  { href: "/analizlerim", label: "Analizlerim", icon: FileText },
  { href: "/arac-saglik-karnesi", label: "Garaj", icon: CarFront },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobil alt menü"
      className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-center text-[0.72rem] font-semibold leading-tight ${
                isActive ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
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
