"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Home, LayoutGrid, MessageSquareText } from "lucide-react";

const items = [
  { href: "/", label: "Ana Sayfa", icon: Home },
  { href: "/analiz", label: "Analiz", icon: ClipboardList },
  { href: "/analizlerim", label: "Analizlerim", icon: LayoutGrid },
  { href: "/geri-bildirim", label: "Geri Bildirim", icon: MessageSquareText },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobil alt menü"
      className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {items.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[0.7rem] font-semibold ${
                isActive ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon aria-hidden="true" className="h-5 w-5" />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
