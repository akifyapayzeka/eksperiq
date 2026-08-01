"use client";

import { useEffect, useState } from "react";
import { HeartPulse, Plus } from "lucide-react";
import { loadAnalysis } from "@/lib/storage/analysis-storage";
import type { AnalysisResult } from "@/lib/analysis/types";

type RecordItem = {
  type: string;
  title: string;
  detail: string;
};

export default function VehicleHealthRecordPage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [type, setType] = useState("Bakım");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [records, setRecords] = useState<RecordItem[]>([]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setAnalysis(loadAnalysis()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function addRecord() {
    if (!title.trim()) return;
    setRecords((current) => [{ type, title: title.trim(), detail: detail.trim() }, ...current]);
    setTitle("");
    setDetail("");
  }

  return (
    <main className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
          <HeartPulse aria-hidden="true" className="h-9 w-9 text-teal-200" />
          <p className="mt-5 text-sm font-semibold text-teal-200">Araç Sağlık Karnesi</p>
          <h1 className="mt-2 text-3xl font-semibold">Analiz, bakım ve notları tek ekranda tut</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Bu MVP kayıtları kalıcı hesaba yazmaz. Sayfa, mevcut oturumdaki analiz raporu ve bu ekranda eklediğiniz
            notlarla çalışır.
          </p>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Araç özeti</h2>
          {analysis ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Araç</p>
                <p className="mt-1 font-semibold text-slate-950">
                  {analysis.input.year} {analysis.input.brand} {analysis.input.model}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Risk skoru</p>
                <p className="mt-1 font-semibold text-slate-950">{analysis.totalScore}/100</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Kontrol başlığı</p>
                <p className="mt-1 font-semibold text-slate-950">{analysis.inspectionFocus.length}</p>
              </div>
            </div>
          ) : (
            <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              Henüz oturumda analiz yok. Yeni araç analizi oluşturduğunuzda burada araç özeti görünecek.
            </p>
          )}
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Kayıt ekle</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="grid gap-2 text-sm font-medium text-slate-800">
              Tür
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="min-h-12 rounded-xl border border-slate-300 px-3"
              >
                <option>Bakım</option>
                <option>Ekspertiz</option>
                <option>Hasar notu</option>
                <option>Masraf</option>
                <option>Hatırlatma</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800 sm:col-span-2">
              Başlık
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="min-h-12 rounded-xl border border-slate-300 px-3"
                placeholder="Örn. 90 bin km bakımı"
              />
            </label>
          </div>
          <label className="mt-4 grid gap-2 text-sm font-medium text-slate-800">
            Detay
            <textarea
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              className="min-h-24 rounded-xl border border-slate-300 px-3 py-3"
            />
          </label>
          <button
            type="button"
            onClick={addRecord}
            className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 font-semibold text-white"
          >
            <Plus aria-hidden="true" className="h-5 w-5" />
            Kaydı ekle
          </button>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Zaman çizelgesi</h2>
          <div className="mt-4 grid gap-3">
            {records.length ? (
              records.map((record, index) => (
                <article
                  key={`${record.title}-${index}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-xs font-semibold uppercase text-teal-800">{record.type}</p>
                  <h3 className="mt-1 font-semibold text-slate-950">{record.title}</h3>
                  {record.detail ? <p className="mt-2 text-sm leading-6 text-slate-600">{record.detail}</p> : null}
                </article>
              ))
            ) : (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Henüz kayıt eklenmedi.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
