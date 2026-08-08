import Link from "next/link";
import { CarFront } from "lucide-react";
import { appConfig } from "@/lib/constants/app";
import { PrimaryButton } from "@/components/ui/button";

const links = [
  { href: "/arac-saglik-karnesi", label: "Garajım" },
  { href: "/analizlerim", label: "Geçmiş" },
  { href: "/moduller", label: "Modüller" },
  { href: "/profil", label: "Profil" },
];

export function SiteHeader() {
  return (
    <header className="no-print sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-h-11 items-center gap-2 font-heading font-bold text-foreground">
          <CarFront aria-hidden="true" className="h-6 w-6 text-accent" />
          {appConfig.name}
        </Link>
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
        <PrimaryButton href="/analiz">Yeni Analiz</PrimaryButton>
      </div>
    </header>
  );
}
