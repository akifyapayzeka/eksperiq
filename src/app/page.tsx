"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowUpRight,
  Camera,
  CarFront,
  FileCheck2,
  FileSearch,
  FileText,
  Plus,
  ShieldCheck,
  UserRound,
  Wrench,
} from "lucide-react";
import { appConfig } from "@/lib/constants/app";
import { openAnalysisFromHistory } from "@/lib/storage/analysis-storage";
import { loadAnalysisHistory } from "@/lib/storage/analysis-history-storage";
import { loadVehicles } from "@/lib/storage/vehicle-storage";
import { riskBucket } from "@/lib/analysis/risk-bucket";
import type { AnalysisResult } from "@/lib/analysis/types";

const primaryActions = [
  {
    icon: Plus,
    title: "Yeni Analiz",
    description: "Almak istediğiniz aracın bilgilerini seçin, varsa fotoğraf veya ekspertiz raporu ekleyin.",
    href: "/analiz",
    cta: "Analiz başlat",
  },
  {
    icon: CarFront,
    title: "Garajım",
    description: "Kendi aracınız için bakım, ekspertiz, hasar notu ve hatırlatma kayıtlarını takip edin.",
    href: "/arac-saglik-karnesi",
    cta: "Garajı aç",
  },
  {
    icon: FileText,
    title: "Analizlerim",
    description: "Daha önce oluşturduğunuz analizleri ve araç özetlerini görün.",
    href: "/analizlerim",
    cta: "Analizlere git",
  },
  {
    icon: FileCheck2,
    title: "Raporlarım",
    description: "Son risk raporunu, satıcı sorularını ve ekspertiz kontrol listesini açın.",
    href: "/sonuc",
    cta: "Raporu aç",
  },
  {
    icon: UserRound,
    title: "Profil",
    description: "Gizlilik, geri bildirim ve uygulama kullanım bilgilerine ulaşın.",
    href: "/profil",
    cta: "Profili aç",
  },
];

const analysisInputs = [
  { icon: CarFront, title: "Araç bilgileri", text: "Marka, model, yıl, km, fiyat, yakıt ve vites bilgileri." },
  { icon: Camera, title: "Araç fotoğrafı", text: "Çizik, göçük veya kozmetik kontrol için fotoğraf notu." },
  { icon: FileSearch, title: "Ekspertiz raporu", text: "Rapor metni, PDF veya rapor fotoğrafı üzerinden kontrol." },
  { icon: Wrench, title: "Bakım bilgileri", text: "Triger, şanzıman, muayene, lastik, akü ve fatura durumu." },
];

const riskBadgeStyles: Record<ReturnType<typeof riskBucket>, string> = {
  high: "bg-red-50 text-red-700",
  medium: "bg-amber-50 text-amber-800",
  low: "bg-emerald-50 text-emerald-700",
};

export default function Home() {
  const router = useRouter();
  const [historyCount, setHistoryCount] = useState(0);
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [latest, setLatest] = useState<AnalysisResult | null>(null);

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
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function openLatestReport() {
    if (!latest) return;
    openAnalysisFromHistory(latest);
    router.push("/sonuc");
  }

  const latestBucket = latest ? riskBucket(latest.totalScore) : null;

  return (
    <main className="flex-1 bg-slate-50">
      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-lg shadow-slate-200 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold">
            <CarFront aria-hidden="true" className="h-4 w-4" />
            {appConfig.name}
          </div>
          <h1 className="mt-7 max-w-2xl text-3xl font-semibold leading-tight sm:text-5xl">
            Araç almadan ya da kendi aracını takip ederken neye bakacağını gör.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">
            Link gerekmiyor. Araç bilgilerini seçin, varsa fotoğraf veya ekspertiz raporu ekleyin; EksperIQ riskleri,
            soruları ve kontrol adımlarını sade bir raporda toplasın.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/analiz"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-base font-semibold text-slate-950 hover:bg-slate-100"
            >
              <Plus aria-hidden="true" className="h-5 w-5" />
              Yeni analiz başlat
            </Link>
            <Link
              href="/arac-saglik-karnesi"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 px-5 text-base font-semibold text-white hover:bg-white/10"
            >
              Garajıma git
              <ArrowUpRight aria-hidden="true" className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <section
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          aria-labelledby="analysis-summary"
        >
          <h2 id="analysis-summary" className="text-xl font-semibold text-slate-950">
            Analiz özetin
          </h2>
          <div className="mt-4 grid grid-cols-3 divide-x divide-slate-200 overflow-hidden rounded-2xl border border-slate-200">
            <div className="p-4">
              <strong className="block text-2xl text-slate-950">{historyCount}</strong>
              <span className="text-sm text-slate-600">analiz yapıldı</span>
            </div>
            <div className="p-4">
              <strong className="block text-2xl text-slate-950">{averageScore ?? "-"}</strong>
              <span className="text-sm text-slate-600">ort. risk skoru</span>
            </div>
            <div className="p-4">
              <strong className="block text-2xl text-slate-950">{vehicleCount}</strong>
              <span className="text-sm text-slate-600">araç takipte</span>
            </div>
          </div>

          {latest && latestBucket ? (
            <div className="mt-5">
              <p className="text-sm font-semibold uppercase text-slate-500">En son inceleme</p>
              <article className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <div className="flex gap-4 p-5">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white">
                    <CarFront aria-hidden="true" className="h-8 w-8 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col items-start gap-2 sm:flex-row sm:justify-between">
                      <h3 className="text-lg font-semibold leading-tight text-slate-950">
                        {latest.input.year} {latest.input.brand} {latest.input.model}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-sm font-semibold ${riskBadgeStyles[latestBucket]}`}
                      >
                        {latest.totalScore} — {latest.riskLabel}
                      </span>
                    </div>
                    <p className="mt-2 flex items-start gap-2 text-sm text-slate-700">
                      <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      {latest.findings[0]?.title ?? "Öncelikli bulgu yok"}
                    </p>
                    <button
                      type="button"
                      onClick={openLatestReport}
                      className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-slate-900 px-4 text-sm font-semibold text-white"
                    >
                      Raporu Aç
                      <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            </div>
          ) : null}
        </section>

        <section aria-labelledby="main-actions" className="mt-6">
          <h2 id="main-actions" className="text-2xl font-semibold text-slate-950">
            Ana ekran
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {primaryActions.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className={`group rounded-2xl border bg-white p-5 shadow-sm transition hover:border-teal-700 ${
                  item.title === "Yeni Analiz" ? "border-slate-900 ring-1 ring-slate-900" : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-sky-50 text-teal-800">
                    <item.icon aria-hidden="true" className="h-6 w-6" />
                  </span>
                  <ArrowUpRight aria-hidden="true" className="h-5 w-5 text-slate-400 group-hover:text-teal-700" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                <span className="mt-5 inline-flex min-h-10 items-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white">
                  {item.cta}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldCheck aria-hidden="true" className="mt-1 h-6 w-6 shrink-0 text-teal-700" />
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Analiz nasıl başlar?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Kullanıcı araç bilgilerini kendisi seçer veya yazar. Fotoğraf ve ekspertiz raporu kullanıcı tarafından
                yüklenirse analizde destek veri olarak kullanılır. İlan sitelerinden gizli veri çekilmez.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {analysisInputs.map((item) => (
              <article key={item.title} className="rounded-2xl bg-slate-50 p-4">
                <item.icon aria-hidden="true" className="h-5 w-5 text-teal-800" />
                <h3 className="mt-3 font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <p className="mt-6 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-teal-950">
          {appConfig.privacy}
        </p>
      </section>
    </main>
  );
}
