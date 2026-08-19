"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { appConfig } from "@/lib/constants/app";
import { PrimaryButton } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

const links = [
  { href: "/arac-saglik-karnesi", label: "Garajım" },
  { href: "/analizlerim", label: "Geçmiş" },
  { href: "/moduller", label: "Modüller" },
  { href: "/profil", label: "Profil" },
];

// The bottom tab bar (mobile-bottom-nav.tsx) already anchors these 5 —
// every other screen is a drill-down reached by tapping into something,
// so it needs an explicit way back instead of relying on an edge-swipe
// gesture the user might never discover.
const ROOT_PATHS = new Set(["/", "/analiz", "/arac-saglik-karnesi", "/analizlerim", "/profil"]);

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const showBackButton = !ROOT_PATHS.has(pathname);

  return (
    <header
      className="no-print sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-1">
          {showBackButton ? (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Geri"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-foreground/80 hover:bg-secondary hover:text-foreground"
            >
              <ChevronLeft aria-hidden="true" className="h-6 w-6" />
            </button>
          ) : null}
          <Link
            href="/"
            className="flex min-h-11 min-w-0 items-center gap-2 font-heading font-bold text-foreground"
            aria-label={appConfig.name}
          >
            <Logo variant="amblem" className="h-8 w-auto shrink-0 sm:hidden" />
            <span className="truncate text-base font-heading font-bold text-foreground sm:hidden">
              {appConfig.name}
            </span>
            <Logo variant="yatay" className="hidden h-7 w-auto sm:block" />
          </Link>
        </div>
        <nav aria-label="Ana menü" className="hidden items-center gap-1 sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-theme px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {/* Hidden on mobile: the bottom tab bar's "Analiz" tab already covers this. */}
        <PrimaryButton href="/analiz" className="hidden sm:inline-flex">
          Yeni Analiz
        </PrimaryButton>
      </div>
    </header>
  );
}
