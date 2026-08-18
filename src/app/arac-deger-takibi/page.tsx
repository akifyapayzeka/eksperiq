"use client";

import { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import { HeroCard } from "@/components/cards/hero-card";
import { AppShell } from "@/components/layout/app-shell";

export default function VehicleValueTrackingPage() {
  const [askingPrice, setAskingPrice] = useState("1200000");
  const [marketLow, setMarketLow] = useState("1100000");
  const [marketHigh, setMarketHigh] = useState("1300000");
  const [sampleCount, setSampleCount] = useState("8");

  const summary = useMemo(() => {
    const price = Number(askingPrice);
    const low = Number(marketLow);
    const high = Number(marketHigh);
    if (!price || !low || !high || high < low) return "Karşılaştırma için geçerli fiyat aralığı girin.";
    if (price < low) return "İlan fiyatı girdiğiniz piyasa aralığının altında görünüyor. Sebebi mutlaka sorulmalı.";
    if (price > high)
      return "İlan fiyatı girdiğiniz piyasa aralığının üzerinde görünüyor. Donanım, bakım ve hasar durumu ile gerekçelendirin.";
    return "İlan fiyatı girdiğiniz piyasa aralığının içinde görünüyor. Yine de hasar, bakım ve kilometre farkını ayrıca değerlendirin.";
  }, [askingPrice, marketHigh, marketLow]);

  const sampleReliabilityNote = useMemo(() => {
    const samples = Number(sampleCount);
    if (!samples || samples <= 0) return null;
    if (samples < 3)
      return "Yalnızca 1-2 ilanla karşılaştırıyorsunuz; bu aralık tesadüfi olabilir, güvenilirliği düşüktür.";
    if (samples < 6) return "Az sayıda ilanla karşılaştırıyorsunuz; mümkünse örnek sayısını artırın.";
    return null;
  }, [sampleCount]);

  return (
    <AppShell>
      <div className="max-w-3xl pt-6">
        <HeroCard
          icon={TrendingUp}
          eyebrow="Araç Değer Takibi"
          title="Manuel piyasa aralığıyla fiyatı oku"
          description="EksperIQ ilan sitelerinden otomatik veri çekmez. Kendi gördüğün benzer ilan aralığını girerek karar desteği alırsın."
          tone="accent"
        />
        <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-foreground/90">
              İncelenen ilan fiyatı
              <input
                type="number"
                value={askingPrice}
                onChange={(event) => setAskingPrice(event.target.value)}
                className="min-h-12 rounded-theme-sm border border-border px-3"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground/90">
              Benzer ilan sayısı
              <input
                type="number"
                value={sampleCount}
                onChange={(event) => setSampleCount(event.target.value)}
                className="min-h-12 rounded-theme-sm border border-border px-3"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground/90">
              Gördüğünüz düşük aralık
              <input
                type="number"
                value={marketLow}
                onChange={(event) => setMarketLow(event.target.value)}
                className="min-h-12 rounded-theme-sm border border-border px-3"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground/90">
              Gördüğünüz yüksek aralık
              <input
                type="number"
                value={marketHigh}
                onChange={(event) => setMarketHigh(event.target.value)}
                className="min-h-12 rounded-theme-sm border border-border px-3"
              />
            </label>
          </div>
        </section>
        <section className="mt-5 rounded-theme border border-accent/20 bg-accent/10 p-5 text-foreground">
          <h2 className="text-xl font-semibold">Fiyat yorumu</h2>
          <p className="mt-3 leading-7">{summary}</p>
          {sampleReliabilityNote ? (
            <p className="mt-3 rounded-theme-sm border border-warning/30 bg-warning/10 px-3 py-2 text-sm font-medium text-foreground">
              {sampleReliabilityNote}
            </p>
          ) : null}
          <p className="mt-3 text-sm leading-6">
            Bu ekran kesin araç değeri vermez. Aralık kullanıcı girdisine bağlıdır; şehir, hasar, donanım ve aciliyet
            sonucu değiştirir.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
