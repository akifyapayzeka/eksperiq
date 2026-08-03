"use client";

import { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";

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
    <main className="flex-1 bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
          <TrendingUp aria-hidden="true" className="h-9 w-9 text-teal-200" />
          <p className="mt-5 text-sm font-semibold text-teal-200">Araç Değer Takibi</p>
          <h1 className="mt-2 text-3xl font-semibold">Manuel piyasa aralığıyla fiyatı oku</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            EksperIQ ilan sitelerini scrape etmez. Kullanıcının kendi gördüğü benzer ilan aralığıyla karar desteği
            üretir.
          </p>
        </section>
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-800 dark:text-slate-300">
              İncelenen ilan fiyatı
              <input
                type="number"
                value={askingPrice}
                onChange={(event) => setAskingPrice(event.target.value)}
                className="min-h-12 rounded-xl border border-slate-300 px-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800 dark:text-slate-300">
              Benzer ilan sayısı
              <input
                type="number"
                value={sampleCount}
                onChange={(event) => setSampleCount(event.target.value)}
                className="min-h-12 rounded-xl border border-slate-300 px-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800 dark:text-slate-300">
              Gördüğünüz düşük aralık
              <input
                type="number"
                value={marketLow}
                onChange={(event) => setMarketLow(event.target.value)}
                className="min-h-12 rounded-xl border border-slate-300 px-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800 dark:text-slate-300">
              Gördüğünüz yüksek aralık
              <input
                type="number"
                value={marketHigh}
                onChange={(event) => setMarketHigh(event.target.value)}
                className="min-h-12 rounded-xl border border-slate-300 px-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </label>
          </div>
        </section>
        <section className="mt-5 rounded-2xl border border-teal-100 bg-teal-50 p-5 text-teal-950 dark:bg-teal-950/40 dark:text-teal-200 dark:border-teal-900">
          <h2 className="text-xl font-semibold">Fiyat yorumu</h2>
          <p className="mt-3 leading-7">{summary}</p>
          {sampleReliabilityNote ? (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-950 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900">
              {sampleReliabilityNote}
            </p>
          ) : null}
          <p className="mt-3 text-sm leading-6">
            Bu ekran kesin araç değeri vermez. Aralık kullanıcı girdisine bağlıdır; şehir, hasar, donanım ve aciliyet
            sonucu değiştirir.
          </p>
        </section>
      </div>
    </main>
  );
}
