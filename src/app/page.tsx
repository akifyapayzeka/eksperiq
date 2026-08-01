import Link from "next/link";
import {
  ArrowUpRight,
  Camera,
  CarFront,
  ChartNoAxesCombined,
  ClipboardCheck,
  FileSearch,
  Gauge,
  HeartPulse,
  Plus,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { appConfig } from "@/lib/constants/app";

const summaryItems = [
  { value: "4", label: "başlangıç yolu" },
  { value: "100", label: "puanlık risk skoru" },
  { value: "0", label: "kalıcı kayıt" },
];

const entryActions = [
  {
    icon: CarFront,
    title: "İlanı analiz et",
    description: "İlan linkini ekle, araç bilgilerini seçeneklerle tamamla, riskleri ve satıcı sorularını gör.",
    href: "/analiz",
    cta: "İlan analizi",
  },
  {
    icon: FileSearch,
    title: "Ekspertiz raporu incele",
    description: "Rapor metnini veya rapor dosyasını ekle, kritik ifadeleri ve baktırılacak noktaları çıkar.",
    href: "/ekspertiz-raporu",
    cta: "Rapor incele",
  },
  {
    icon: Camera,
    title: "Çizik veya hasar fotoğrafı sor",
    description: "Araç fotoğrafını yükle, olası çizik/göçük notlarını ve ne yaptırman gerektiğini öğren.",
    href: "/fotograf-hasar",
    cta: "Fotoğraf kontrolü",
  },
  {
    icon: HeartPulse,
    title: "Kendi aracını takip et",
    description: "Bakım tarihi, yağ değişimi, muayene ve araç geçmişi için basit takip ekranlarını kullan.",
    href: "/arac-saglik-karnesi",
    cta: "Aracımı ekle",
  },
];

const quickModules = [
  { icon: Wrench, title: "Bakım Takibi", href: "/bakim-takibi" },
  { icon: ChartNoAxesCombined, title: "Araç Değer Takibi", href: "/arac-deger-takibi" },
  { icon: ClipboardCheck, title: "Uzmanlık Kontrol Listesi", href: "/kontrol-listesi" },
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
            <h1 className="mt-7 max-w-xl text-3xl font-semibold leading-tight sm:text-5xl">Araban için tek asistan.</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-200">
              İlanı, ekspertiz raporunu, hasar fotoğrafını veya bakım bilgilerini ekle; neye baktırman gerektiğini sade
              bir raporda gör.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/analiz"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-base font-semibold text-slate-950 hover:bg-slate-100 focus-visible:ring-4 focus-visible:ring-teal-200"
              >
                <Plus aria-hidden="true" className="h-5 w-5" />
                Başla
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
                Ne yapmak istiyorsun?
              </h2>
              <span className="text-sm font-medium text-slate-500">Basit seçim</span>
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

          <section aria-labelledby="entry-title">
            <h2 id="entry-title" className="sr-only">
              Başlangıç seçenekleri
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {entryActions.map((item) => (
                <Link
                  key={item.title}
                  aria-label={item.cta}
                  href={item.href}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-700"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-sky-50 text-teal-800">
                      <item.icon aria-hidden="true" className="h-6 w-6" />
                    </span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="h-5 w-5 text-slate-400 transition group-hover:text-teal-700"
                    />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold leading-tight text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  <span className="mt-5 inline-flex min-h-10 items-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white">
                    {item.cta}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="garage-title"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Kendi aracın</p>
                <h2 id="garage-title" className="mt-1 text-2xl font-semibold text-slate-950">
                  Garaj ve bakım takibi
                </h2>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  href="/bakim-takibi"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-900 hover:border-teal-700"
                >
                  <Wrench aria-hidden="true" className="h-4 w-4" />
                  Bakım
                </Link>
                <Link
                  href="/analiz"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <Plus aria-hidden="true" className="h-4 w-4" />
                  Araç ekle
                </Link>
              </div>
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
              EksperIQ araçları
            </h2>
            <p className="mt-2 text-base leading-7 text-slate-600">
              İlan, fotoğraf, bakım ve değer takibi için ayrı karar destek ekranları.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {quickModules.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-sky-50 text-teal-800">
                      <item.icon aria-hidden="true" className="h-6 w-6" />
                    </span>
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">Aç</span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold leading-snug text-slate-900">{item.title}</h3>
                </Link>
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
              Bakım takibi, sağlık karnesi ve satış hazırlığı modülleri ayrı ekranlarda karar desteği sunar.
            </p>
          </section>

          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600 shadow-sm">
            <div className="flex gap-3">
              <Gauge aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
              <p>Risk skorları mevcut bilgilere göre hesaplanır; kesin hüküm yerine inceleme önceliği sunar.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
