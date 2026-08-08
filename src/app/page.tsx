"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Bell,
  CarFront,
  ClipboardPaste,
  FileCheck2,
  FileText,
  ScanSearch,
  ShieldCheck,
  UserRound,
  Wrench,
} from "lucide-react";
import { appConfig } from "@/lib/constants/app";
import { openAnalysisFromHistory } from "@/lib/storage/analysis-storage";
import { loadAnalysisHistory } from "@/lib/storage/analysis-history-storage";
import { loadVehicles } from "@/lib/storage/vehicle-storage";
import { loadReminders } from "@/lib/storage/reminders-storage";
import { loadExpenses } from "@/lib/storage/expenses-storage";
import { sortByUrgency, daysUntil, urgencyOf } from "@/lib/reminders/model";
import { monthKey, totalAmount } from "@/lib/expenses/model";
import { reminderCategoryLabels } from "@/lib/reminders/types";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeader } from "@/components/layout/section-header";
import { HeroCard } from "@/components/cards/hero-card";
import { StatGrid } from "@/components/cards/stat-card";
import { AnalysisCard } from "@/components/cards/analysis-card";
import { ReminderCard } from "@/components/cards/reminder-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton, Skeleton } from "@/components/ui/skeleton";
import { DisclaimerCard } from "@/components/ui/alert";
import { IconButton, PrimaryButton } from "@/components/ui/button";
import type { AnalysisResult } from "@/lib/analysis/types";
import type { ReminderRecord } from "@/lib/reminders/types";

const shortcuts = [
  { icon: CarFront, title: "Garajım", href: "/arac-saglik-karnesi" },
  { icon: FileText, title: "Analizlerim", href: "/analizlerim" },
  { icon: FileCheck2, title: "Raporlarım", href: "/sonuc" },
  { icon: Wrench, title: "Bakım Takibi", href: "/bakim-takibi" },
];

export default function Home() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [latest, setLatest] = useState<AnalysisResult | null>(null);
  const [nextReminder, setNextReminder] = useState<ReminderRecord | null>(null);
  const [monthExpenseTotal, setMonthExpenseTotal] = useState<number | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const history = loadAnalysisHistory();
      setHistoryCount(history.length);
      setVehicleCount(loadVehicles().length);
      setLatest(history[0]?.result ?? null);
      setAverageScore(
        history.length
          ? Math.round(history.reduce((sum, record) => sum + record.result.totalScore, 0) / history.length)
          : null,
      );

      const reminders = sortByUrgency(loadReminders());
      setNextReminder(reminders[0] ?? null);

      const expenses = loadExpenses();
      const currentMonth = monthKey(new Date().toISOString());
      setMonthExpenseTotal(totalAmount(expenses.filter((record) => monthKey(record.date) === currentMonth)));

      setIsReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function openLatestReport() {
    if (!latest) return;
    openAnalysisFromHistory(latest);
    router.push("/sonuc");
  }

  const reminderDays = nextReminder ? daysUntil(nextReminder.dueDate) : null;

  return (
    <AppShell>
      <header className="flex items-center justify-between gap-4 px-1 pb-6 pt-8">
        <div>
          <p className="text-sm text-muted-foreground">Araç karar asistanın</p>
          <h1 className="mt-1 font-heading text-[26px] font-bold tracking-tight text-foreground sm:text-3xl">
            Aracınız için bugün ne yapalım?
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <IconButton icon={UserRound} label="Profili aç" href="/profil" />
          <IconButton
            icon={Bell}
            label="Hatırlatmalar"
            href="/bakim-odeme-takvimi"
            withNotificationDot={Boolean(nextReminder)}
          />
        </div>
      </header>

      <HeroCard
        icon={ScanSearch}
        title="Yeni İlan Analiz Et"
        description="Araç bilgilerini ve ilan açıklamasını gir. Belirsizlikleri kanıtlarıyla birlikte inceleyelim."
        action={
          <PrimaryButton
            href="/analiz"
            className="flex w-full items-center justify-between bg-card px-4 py-3.5 text-left text-card-foreground hover:opacity-100"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <ClipboardPaste aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <span className="text-sm font-semibold">Yeni analiz başlat</span>
            </span>
          </PrimaryButton>
        }
      />

      <section className="mt-6" aria-labelledby="analysis-summary">
        <SectionHeader title="Analiz özetin" description={undefined} action="Son 90 gün" />
        {isReady ? (
          <StatGrid
            items={[
              { key: "count", value: historyCount, label: "analiz yapıldı" },
              { key: "score", value: averageScore ?? "—", label: "ort. risk skoru" },
              { key: "vehicles", value: vehicleCount, label: "araç takipte" },
            ]}
          />
        ) : (
          <div className="grid grid-cols-3 gap-0 rounded-theme border border-border bg-card p-4 shadow-sm">
            <Skeleton className="h-10 w-full" />
          </div>
        )}
      </section>

      <section className="mt-7">
        <SectionHeader
          title="Son analizin"
          description="En son inceleme"
          action={<Link href="/analizlerim">Tümü</Link>}
        />
        {!isReady ? (
          <LoadingSkeleton />
        ) : latest ? (
          <AnalysisCard
            title={`${latest.input.year} ${latest.input.brand} ${latest.input.model}`}
            dateLabel="İlan analizi"
            score={latest.totalScore}
            findingLabel={latest.findings[0]?.title ?? "Öncelikli bulgu yok"}
            onOpen={openLatestReport}
          />
        ) : (
          <EmptyState
            icon={FileText}
            title="Henüz analiz yok"
            description="İlk ilan analizini başlatarak risk skorunu ve önerilen kontrolleri gör."
            action={<PrimaryButton href="/analiz">Analiz başlat</PrimaryButton>}
          />
        )}
      </section>

      <section className="mt-7">
        <SectionHeader
          title="Garajın"
          description="Kayıtlı araçlar ve yaklaşan hatırlatma"
          action={<Link href="/arac-saglik-karnesi">Garajı aç</Link>}
        />
        {!isReady ? (
          <LoadingSkeleton />
        ) : vehicleCount === 0 ? (
          <EmptyState
            icon={CarFront}
            title="Henüz araç eklenmedi"
            description="Garajına araç ekleyerek bakım, hatırlatma ve gider kayıtlarını takip et."
            action={<PrimaryButton href="/arac-saglik-karnesi">Araç ekle</PrimaryButton>}
          />
        ) : nextReminder && reminderDays !== null ? (
          <div className="overflow-hidden rounded-theme border border-border bg-card shadow-sm">
            <ReminderCard
              title={nextReminder.title || reminderCategoryLabels[nextReminder.category]}
              subtitle={reminderCategoryLabels[nextReminder.category]}
              days={reminderDays}
              urgency={urgencyOf(reminderDays)}
            />
          </div>
        ) : (
          <EmptyState
            icon={Bell}
            title="Yaklaşan hatırlatma yok"
            description="Bakım ve ödeme takvimine hatırlatma ekleyebilirsin."
          />
        )}
      </section>

      <section className="mt-7">
        <SectionHeader title="Bu ayki giderlerin" action={<Link href="/gider-defteri">Gider defteri</Link>} />
        {!isReady ? (
          <Skeleton className="h-16 w-full rounded-theme" />
        ) : monthExpenseTotal !== null && monthExpenseTotal > 0 ? (
          <div className="rounded-theme border border-border bg-card p-4 shadow-sm">
            <p className="font-heading text-2xl font-bold text-foreground">
              {monthExpenseTotal.toLocaleString("tr-TR", {
                style: "currency",
                currency: "TRY",
                maximumFractionDigits: 0,
              })}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Bu ay kaydedilen toplam gider</p>
          </div>
        ) : (
          <EmptyState
            icon={FileCheck2}
            title="Henüz gider kaydı yok"
            description="Yakıt, bakım veya sigorta giderlerini gider defterine ekleyebilirsin."
          />
        )}
      </section>

      <section className="mt-7">
        <SectionHeader
          title="Diğer araçlar"
          description="EksperIQ'nun sunduğu tüm modüller"
          action={<Link href="/moduller">Tüm modüller</Link>}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {shortcuts.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-[104px] flex-col justify-between rounded-theme border border-border bg-card p-4 shadow-sm transition hover:border-accent"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-theme bg-secondary text-secondary-foreground">
                <item.icon aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </span>
              <span className="font-heading text-xs font-bold leading-4 text-foreground">{item.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-6">
        <DisclaimerCard>
          <p className="flex items-start gap-2">
            <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            {appConfig.privacy}
          </p>
        </DisclaimerCard>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck aria-hidden="true" className="h-4 w-4 text-success" />
        EksperIQ kesin hüküm vermez; olası risk sinyallerini ve güven seviyesini gösterir.
      </div>
    </AppShell>
  );
}
