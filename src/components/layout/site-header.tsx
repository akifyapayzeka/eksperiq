import Link from "next/link";
import { CarFront } from "lucide-react";
import { appConfig } from "@/lib/constants/app";

const links = [
  { href: "/arac-saglik-karnesi", label: "Garajım" },
  { href: "/analizlerim", label: "Analizlerim" },
  { href: "/sonuc", label: "Raporlarım" },
  { href: "/profil", label: "Profil" },
];

export function SiteHeader() {
  return (
    <header className="no-print sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-h-11 items-center gap-2 font-semibold text-slate-950 dark:text-white">
          <CarFront aria-hidden="true" className="h-6 w-6 text-teal-700 dark:text-teal-400" />
          {appConfig.name}
        </Link>
        <nav aria-label="Ana menü" className="hidden items-center gap-1 sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/analiz"
          className="inline-flex min-h-11 items-center rounded-full transition active:scale-95 bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Yeni Analiz
        </Link>
      </div>
    </header>
  );
}
