import Link from "next/link";
import { ChevronRight, FileText, Info, MessageSquareText, ShieldCheck, Search } from "lucide-react";
import { appConfig } from "@/lib/constants/app";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { AccountSection } from "@/components/profile/account-section";
import { ProfileWelcomeBanner } from "@/components/profile/welcome-banner";
import { ProfilePlansPromoSection } from "@/components/profile/plans-promo-section";
import { DataManagementSection } from "@/components/profile/data-management-section";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { DisclaimerCard } from "@/components/ui/alert";

const supportLinks = [
  { href: "/resmi-sorgu-rehberi", label: "Resmi Sorgu Rehberi", icon: Search },
  { href: "/geri-bildirim", label: "Geri bildirim gönder", icon: MessageSquareText },
  { href: "/gizlilik", label: "Gizlilik politikası", icon: ShieldCheck },
  { href: "/kullanim-kosullari", label: "Kullanım koşulları", icon: FileText },
  { href: "/hakkinda", label: "Hakkında ve uygulama sürümü", icon: Info },
];

export default function ProfilePage() {
  return (
    <AppShell>
      <ProfileWelcomeBanner />
      <PageHeader eyebrow="Hesap ve Ayarlar" title="Profil ve Ayarlar" />

      <AccountSection />

      <ProfilePlansPromoSection />

      <section className="mt-4 rounded-theme border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-bold text-foreground">Görünüm</h2>
            <p className="mt-1 text-sm text-muted-foreground">Açık, koyu veya sistem temasını seç.</p>
          </div>
          <ThemeToggle />
        </div>
      </section>

      <div className="mt-4">
        <DataManagementSection />
      </div>

      <section className="mt-4 overflow-hidden rounded-theme border border-border bg-card shadow-sm">
        <h2 className="px-5 pt-5 font-heading font-bold text-foreground">Destek ve Yasal</h2>
        <div className="mt-3">
          {supportLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-14 w-full items-center gap-3 border-t border-border px-5 py-4 text-left transition hover:bg-secondary"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <item.icon aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </span>
              <span className="flex-1 text-sm font-semibold text-foreground">{item.label}</span>
              <ChevronRight
                aria-hidden="true"
                className="h-[18px] w-[18px] shrink-0 text-muted-foreground"
                strokeWidth={1.8}
              />
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-4">
        <DisclaimerCard>{appConfig.privacy}</DisclaimerCard>
      </div>

    </AppShell>
  );
}
