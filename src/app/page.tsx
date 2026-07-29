import Link from "next/link";
import {
  ArrowUpRight,
  BellPlus,
  Camera,
  CarFront,
  ChartNoAxesCombined,
  ClipboardCheck,
  Gauge,
  Plus,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { appConfig } from "@/lib/constants/app";

const summaryItems = [
  { value: "0", label: "kayıtlı veri" },
  { value: "58", label: "demo risk skoru" },
  { value: "3", label: "yakında modül" },
];

const upcomingModules = [
  { icon: Camera, title: "Fotoğraftan Hasar Analizi" },
  { icon: Wrench, title: "Bakım Takibi" },
  { icon: ChartNoAxesCombined, title: "Araç Değer Takibi" },
];

const garageSignals = [
  { icon: Wrench, label: "Son bakım", value: "Kullanıcı girecek" },
  { icon: ShieldCheck, label: "Muayene", value: "Tarih bekleniyor" },
  { icon: ClipboardCheck, label: "Evrak", value: "Kontrol listesi" },
];

export default function Home() {
  return (
    <main className="flex-1 bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:gap-8 lg:px-8 lg:py-10">
        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-b-[2rem] rounded-t-lg bg-slate-900 px-5 pb-7 pt-5 text-white shadow-lg shadow-slate-200 sm:rounded-2xl">
            <div className="flex items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold">
                <CarFront aria-hidden="true" className="h-4 w-4" />
                {appConfig.name}
              </div>
              <span className="rounded-full bg-teal-300 px-3 py-1 text-xs font-bold text-slate-950">Ücretsiz MVP</span>
            </div>
            <h1 className="mt-7 max-w-xl text-3xl font-semibold leading-tight sm:text-5xl">
              Araç ilanını daha bilinçli değerlendir.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-200">
              İlan bilgilerini gir; riskli noktaları, satıcı sorularını ve ekspertiz kontrol listesini aynı ekranda gör.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/analiz"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-base font-semibold text-slate-950 hover:bg-slate-100 focus-visible:ring-4 focus-visible:ring-teal-200"
              >
                <Plus aria-hidden="true" className="h-5 w-5" />
                Ücretsiz analiz et
              </Link>
              <Link
                href="/moduller"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 text-base font-semibold text-white hover:bg-white/10"
              >
                Yol haritası
                <ArrowUpRight aria-hidden="true" className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600 shadow-sm">
            {appConfig.privacy}
          </p>
        </div>

        <div className="mt-6 space-y-5 lg:mt-0">
          <section
            aria-labelledby="summary-title"
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 id="summary-title" className="text-xl font-semibold text-slate-950">
                Analiz özetin
              </h2>
              <span className="text-sm font-medium text-slate-500">Oturum bazlı</span>
            </div>
            <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200">
              {summaryItems.map((item) => (
                <div key={item.label} className="border-r border-slate-200 p-4 last:border-r-0">
                  <p className="text-2xl font-semibold text-slate-950">{item.value}</p>
                  <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="latest-title">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">En son inceleme</p>
                <h2 id="latest-title" className="mt-1 text-2xl font-semibold text-slate-950">
                  Son analiz örneği
                </h2>
              </div>
              <Link href="/analiz" className="text-sm font-semibold text-teal-700 hover:text-teal-900">
                Yeni analiz
              </Link>
            </div>
            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-sky-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Orta risk
                    </p>
                    <h3 className="mt-4 text-2xl font-semibold leading-tight text-slate-950">
                      2020 Volkswagen Passat 1.6 TDI
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">İlan analizi demo kartı</p>
                  </div>
                  <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-xl bg-white/70">
                    <CarFront aria-hidden="true" className="h-14 w-14 text-slate-500" />
                  </div>
                </div>
              </div>
              <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-full border-4 border-amber-400 text-lg font-bold text-slate-950">
                    64
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">Risk skoru</p>
                    <p className="text-sm leading-6 text-slate-600">Bulgular belge ve ekspertizle doğrulanmalı.</p>
                  </div>
                </div>
                <Link
                  href="/analiz"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-base font-semibold text-white hover:bg-slate-800"
                >
                  Rapor oluştur
                  <ArrowUpRight aria-hidden="true" className="h-5 w-5" />
                </Link>
              </div>
            </article>
          </section>

          <section
            aria-labelledby="garage-title"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Kayıtsız MVP modu</p>
                <h2 id="garage-title" className="mt-1 text-2xl font-semibold text-slate-950">
                  Garaj fikri hazır
                </h2>
              </div>
              <Link
                href="/moduller"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
                Araç ekle
              </Link>
            </div>
            <div className="mt-5 grid gap-3">
              {garageSignals.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-sky-100 text-teal-800">
                      <item.icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span className="font-medium text-slate-800">{item.label}</span>
                  </div>
                  <span className="text-right text-sm font-semibold text-slate-600">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="upcoming-title">
            <h2 id="upcoming-title" className="text-2xl font-semibold text-slate-950">
              Yakında EksperIQ içinde
            </h2>
            <p className="mt-2 text-base leading-7 text-slate-600">Araç yolculuğunu daha şeffaf kılacak araçlar.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {upcomingModules.map((item) => (
                <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-sky-50 text-teal-800">
                      <item.icon aria-hidden="true" className="h-6 w-6" />
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                      Yakında
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold leading-snug text-slate-900">{item.title}</h3>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-white/10">
              <Sparkles aria-hidden="true" className="h-6 w-6" />
            </div>
            <h2 className="mt-6 max-w-md text-2xl font-semibold leading-tight">
              Aracını ekle, zaman içinde bakım ve değerini takip et
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
              Bu bölüm ileride bakım takibi, sağlık karnesi ve satış hazırlığı modülleriyle açılacak.
            </p>
          </section>

          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600 shadow-sm">
            <div className="flex gap-3">
              <Gauge aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
              <p>Risk skorları mevcut bilgilere göre hesaplanır; kesin hüküm yerine inceleme önceliği sunar.</p>
            </div>
          </div>

          <div className="fixed inset-x-4 bottom-4 z-20 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl shadow-slate-900/10 backdrop-blur sm:hidden">
            <Link
              href="/analiz"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-base font-semibold text-white"
            >
              <BellPlus aria-hidden="true" className="h-5 w-5" />
              Yeni analiz başlat
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
