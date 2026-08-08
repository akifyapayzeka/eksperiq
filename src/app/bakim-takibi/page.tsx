"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarClock, Wrench } from "lucide-react";
import { HeroCard } from "@/components/cards/hero-card";
import { AppShell } from "@/components/layout/app-shell";

const maintenanceItems = [
  { name: "Motor yağı ve filtreler", intervalKm: 10000, intervalMonths: 12 },
  { name: "Fren balatası kontrolü", intervalKm: 20000, intervalMonths: 12 },
  { name: "Lastik kontrolü", intervalKm: 10000, intervalMonths: 6 },
  { name: "Akü kontrolü", intervalKm: 15000, intervalMonths: 12 },
  { name: "Muayene", intervalKm: 0, intervalMonths: 24 },
  { name: "Trafik sigortası", intervalKm: 0, intervalMonths: 12 },
];

function monthDiff(from: string) {
  if (!from) return 999;
  const date = new Date(from);
  const now = new Date();
  return Math.max(0, (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth());
}

export default function MaintenanceTrackingPage() {
  const [currentKm, setCurrentKm] = useState("90000");
  const [lastKm, setLastKm] = useState("82000");
  const [lastDate, setLastDate] = useState("");

  const rows = useMemo(() => {
    const kmSince = Math.max(0, Number(currentKm) - Number(lastKm));
    const monthsSince = monthDiff(lastDate);

    return maintenanceItems.map((item) => {
      const kmDue = item.intervalKm > 0 && kmSince >= item.intervalKm * 0.8;
      const dateDue = monthsSince >= item.intervalMonths * 0.8;
      const status = kmDue || dateDue ? "Yakın kontrol" : "Takipte";
      return { ...item, status, kmSince, monthsSince };
    });
  }, [currentKm, lastDate, lastKm]);

  return (
    <AppShell>
      <div className="max-w-4xl pt-6">
        <HeroCard
          icon={Wrench}
          eyebrow="Bakım Takibi"
          title="Yaklaşan bakım ve evrak kontrolleri"
          description="Bu hesaplama genel hatırlatma üretir. Servis planı, motor tipi ve kullanım koşulları ayrıca kontrol edilmelidir."
        />

        <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="grid gap-2 text-sm font-medium text-foreground/90">
              Güncel kilometre
              <input
                value={currentKm}
                onChange={(event) => setCurrentKm(event.target.value)}
                type="number"
                className="min-h-12 rounded-theme-sm border border-border px-3"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground/90">
              Son bakım km
              <input
                value={lastKm}
                onChange={(event) => setLastKm(event.target.value)}
                type="number"
                className="min-h-12 rounded-theme-sm border border-border px-3"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground/90">
              Son bakım tarihi
              <input
                value={lastDate}
                onChange={(event) => setLastDate(event.target.value)}
                type="date"
                className="min-h-12 rounded-theme-sm border border-border px-3"
              />
            </label>
          </div>
        </section>

        <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <CalendarClock aria-hidden="true" className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold text-foreground">Takip özeti</h2>
          </div>
          <div className="mt-4 grid gap-3">
            {rows.map((item) => (
              <article key={item.name} className="rounded-theme-sm border border-border bg-muted p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{item.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Son bakımdan beri yaklaşık {item.kmSince.toLocaleString("tr-TR")} km
                      {lastDate
                        ? ` ve ${item.monthsSince} ay geçti.`
                        : " geçti. Tarih girerseniz süre takibi de yapılır."}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${item.status === "Yakın kontrol" ? "bg-warning/10 text-warning " : "bg-accent/10 text-accent "}`}
                  >
                    {item.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-theme border border-border bg-muted p-5">
          <p className="text-sm text-foreground/80">
            Bu ekran tek seferlik, kayıtsız bir tahmindir. Tarihleri hatırlatmalı ve birden fazla araç için ayrı ayrı
            takip etmek isterseniz Bakım ve Ödeme Takvimi&apos;ni kullanabilirsiniz.
          </p>
          <Link
            href="/bakim-odeme-takvimi"
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
          >
            Bakım ve Ödeme Takvimi&apos;ne git
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
