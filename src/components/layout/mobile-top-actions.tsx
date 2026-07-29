"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck, FileText, Lock, Plus, UserRound } from "lucide-react";

const actions = [
  { href: "/moduller", label: "Profil", icon: UserRound, locked: true },
  { href: "/analiz", label: "Yeni Analiz", icon: Plus, locked: false },
  { href: "/sonuc", label: "Analiz Raporu", icon: FileText, locked: false },
  { href: "/sonuc", label: "Kontrol Listesi", icon: ClipboardCheck, locked: false },
];

export function MobileTopActions() {
  const pathname = usePathname();

  return (
    <div className="no-print sticky top-16 z-20 border-b border-slate-200 bg-slate-50/95 py-2 backdrop-blur sm:hidden">
      <nav aria-label="Mobil hızlı işlemler" className="overflow-x-auto px-3 [scrollbar-width:none]">
        <div className="flex min-w-max gap-2">
          {actions.map((action) => {
            const isActive = pathname === action.href || (action.href !== "/" && pathname.startsWith(action.href));
            const Icon = action.icon;
            const content = (
              <>
                {action.locked ? (
                  <Lock aria-hidden="true" className="h-4 w-4" />
                ) : (
                  <Icon aria-hidden="true" className="h-4 w-4" />
                )}
                <span>{action.label}</span>
              </>
            );

            if (action.locked) {
              return (
                <span
                  key={action.label}
                  aria-disabled="true"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 text-sm font-semibold text-slate-400 shadow-sm"
                >
                  {content}
                </span>
              );
            }

            return (
              <Link
                key={action.label}
                href={action.href}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold shadow-sm ${
                  isActive
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950"
                }`}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
