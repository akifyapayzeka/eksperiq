"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarClock, HeartPulse, Plus } from "lucide-react";
import { loadAnalysis } from "@/lib/storage/analysis-storage";
import { loadReminders } from "@/lib/storage/reminders-storage";
import {
  createHealthRecordId,
  deleteHealthRecord,
  loadHealthRecords,
  upsertHealthRecord,
} from "@/lib/storage/health-record-storage";
import { daysUntil, sortByUrgency, urgencyOf } from "@/lib/reminders/model";
import { scoreTrend } from "@/lib/health-record/model";
import { reminderCategoryLabels } from "@/lib/reminders/types";
import { healthRecordTypes } from "@/lib/health-record/types";
import type { ReminderRecord } from "@/lib/reminders/types";
import type { HealthRecord, HealthRecordType } from "@/lib/health-record/types";
import type { AnalysisResult } from "@/lib/analysis/types";
import { VehicleSwitcher } from "@/components/vehicles/vehicle-switcher";
import { filterByVehicle, recordVehicleId } from "@/lib/vehicles/model";
import { createVehicleId, deleteVehicle, loadVehicles, upsertVehicle } from "@/lib/storage/vehicle-storage";
import type { VehicleProfile } from "@/lib/vehicles/types";

const urgencyStyles: Record<string, string> = {
  overdue: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  urgent: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  upcoming: "bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  later: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

function urgencyLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)} gün gecikti`;
  if (days === 0) return "Bugün";
  return `${days} gün kaldı`;
}

export default function VehicleHealthRecordPage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [type, setType] = useState<HealthRecordType>("Bakım");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [score, setScore] = useState("");
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [reminders, setReminders] = useState<ReminderRecord[]>([]);
  const [vehicles, setVehicles] = useState<VehicleProfile[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const loadedVehicles = loadVehicles();
      setVehicles(loadedVehicles);
      setSelectedVehicleId(loadedVehicles[0]?.id ?? "");
      setAnalysis(loadAnalysis());
      setReminders(loadReminders());
      setRecords(loadHealthRecords());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const remindersForVehicle = useMemo(
    () => filterByVehicle(reminders, selectedVehicleId, vehicles),
    [reminders, selectedVehicleId, vehicles],
  );
  const recordsForVehicle = useMemo(
    () => filterByVehicle(records, selectedVehicleId, vehicles),
    [records, selectedVehicleId, vehicles],
  );
  const upcomingReminders = useMemo(() => sortByUrgency(remindersForVehicle).slice(0, 4), [remindersForVehicle]);
  const trend = useMemo(() => scoreTrend(recordsForVehicle), [recordsForVehicle]);

  function selectVehicle(id: string) {
    setSelectedVehicleId(id);
  }

  function addVehicle(label: string) {
    const vehicle: VehicleProfile = { id: createVehicleId(), label, createdAt: new Date().toISOString() };
    setVehicles(upsertVehicle(vehicle));
    setSelectedVehicleId(vehicle.id);
  }

  function renameVehicle(id: string, label: string) {
    const existing = vehicles.find((item) => item.id === id);
    if (!existing) return;
    setVehicles(upsertVehicle({ ...existing, label }));
  }

  function removeVehicle(id: string) {
    const result = deleteVehicle(id);
    if (!result.ok) return;
    setVehicles(result.vehicles);
    const idsToRemove = records.filter((item) => recordVehicleId(item, vehicles) === id).map((item) => item.id);
    for (const recordId of idsToRemove) deleteHealthRecord(recordId);
    setRecords(records.filter((item) => !idsToRemove.includes(item.id)));
    setSelectedVehicleId(result.vehicles[0]?.id ?? "");
  }

  function addRecord() {
    if (!selectedVehicleId) return;
    if (!title.trim()) return;
    const parsedScore = score.trim() ? Number(score) : undefined;
    if (
      score.trim() &&
      (parsedScore === undefined || Number.isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100)
    ) {
      return;
    }

    const record: HealthRecord = {
      id: createHealthRecordId(),
      type,
      title: title.trim(),
      detail: detail.trim(),
      date,
      score: parsedScore,
      createdAt: new Date().toISOString(),
      vehicleId: selectedVehicleId,
    };

    upsertHealthRecord(record);
    setRecords((current) => [record, ...current]);
    setTitle("");
    setDetail("");
    setScore("");
  }

  function removeRecord(id: string) {
    deleteHealthRecord(id);
    setRecords((current) => current.filter((item) => item.id !== id));
  }

  function addCurrentScore() {
    if (!analysis || !selectedVehicleId) return;
    const record: HealthRecord = {
      id: createHealthRecordId(),
      type: "Sağlık Skoru",
      title: "Analiz skoru",
      detail: `${analysis.input.year} ${analysis.input.brand} ${analysis.input.model} analizinden.`,
      date: new Date().toISOString().slice(0, 10),
      score: analysis.totalScore,
      createdAt: new Date().toISOString(),
      vehicleId: selectedVehicleId,
    };
    upsertHealthRecord(record);
    setRecords((current) => [record, ...current]);
  }

  return (
    <main className="flex-1 bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
          <HeartPulse aria-hidden="true" className="h-9 w-9 text-teal-200" />
          <p className="mt-5 text-sm font-semibold text-teal-200">Araç Sağlık Karnesi</p>
          <h1 className="mt-2 text-3xl font-semibold">Analiz, bakım ve notları tek ekranda tut</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Bu ekranda eklediğiniz kayıtlar hesaba değil, yalnızca bu cihaza kaydedilir. Araç özeti ise mevcut tarayıcı
            oturumundaki son analiz raporundan gelir.
          </p>
        </section>

        <div className="mt-5">
          <VehicleSwitcher
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            onSelect={selectVehicle}
            onAdd={addVehicle}
            onRename={renameVehicle}
            onDelete={removeVehicle}
          />
        </div>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Araç özeti</h2>
          {analysis ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <p className="text-sm text-slate-600 dark:text-slate-400">Araç</p>
                <p className="mt-1 font-semibold text-slate-950 dark:text-white">
                  {analysis.input.year} {analysis.input.brand} {analysis.input.model}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <p className="text-sm text-slate-600 dark:text-slate-400">Risk skoru</p>
                <p className="mt-1 font-semibold text-slate-950 dark:text-white">{analysis.totalScore}/100</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <p className="text-sm text-slate-600 dark:text-slate-400">Kontrol başlığı</p>
                <p className="mt-1 font-semibold text-slate-950 dark:text-white">{analysis.inspectionFocus.length}</p>
              </div>
            </div>
          ) : (
            <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
              Henüz oturumda analiz yok. Yeni araç analizi oluşturduğunuzda burada araç özeti görünecek.
            </p>
          )}
        </section>

        <section
          className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          aria-labelledby="upcoming-dates"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarClock aria-hidden="true" className="h-5 w-5 text-teal-700" />
              <h2 id="upcoming-dates" className="text-xl font-semibold text-slate-950 dark:text-white">
                Yaklaşan tarihler
              </h2>
            </div>
            <Link
              href="/bakim-odeme-takvimi"
              className="inline-flex items-center gap-1 text-sm font-semibold text-teal-800 hover:underline"
            >
              Tümünü gör
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {upcomingReminders.length ? (
              upcomingReminders.map((record) => {
                const days = daysUntil(record.dueDate);
                const urgency = urgencyOf(days);
                return (
                  <div
                    key={record.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase text-teal-800">
                        {reminderCategoryLabels[record.category]}
                      </p>
                      <p className="font-semibold text-slate-950 dark:text-white">{record.title}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${urgencyStyles[urgency]}`}>
                      {urgencyLabel(days)}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
                Henüz MTV, sigorta, muayene veya bakım tarihi eklenmedi.{" "}
                <Link href="/bakim-odeme-takvimi" className="font-semibold text-teal-800 hover:underline">
                  Bakım ve Ödeme Takvimi
                </Link>{" "}
                sayfasından ekleyebilirsiniz.
              </p>
            )}
          </div>
        </section>

        {trend.length ? (
          <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Sağlık skoru trendi</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Kayıt eklerken girdiğiniz skorların zaman içindeki değişimi. Tek bir teşhis değil, kendi notlarınızın
              özetidir.
            </p>
            {trend.length >= 2 ? (
              <ScoreTrendChart points={trend} />
            ) : (
              <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
                Trend görmek için en az iki skorlu kayıt gerekir.
              </p>
            )}
          </section>
        ) : null}

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Kayıt ekle</h2>
          {analysis ? (
            <button
              type="button"
              onClick={addCurrentScore}
              disabled={!selectedVehicleId}
              className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-teal-700 px-4 text-sm font-semibold text-teal-800 disabled:opacity-50"
            >
              Şu anki analiz skorunu ({analysis.totalScore}) trende ekle
            </button>
          ) : null}
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="grid gap-2 text-sm font-medium text-slate-800 dark:text-slate-300">
              Tür
              <select
                value={type}
                onChange={(event) => setType(event.target.value as HealthRecordType)}
                className="min-h-12 rounded-xl border border-slate-300 px-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {healthRecordTypes.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800 sm:col-span-2 dark:text-slate-300">
              Başlık
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="min-h-12 rounded-xl border border-slate-300 px-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="Örn. 90 bin km bakımı"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800 dark:text-slate-300">
              Tarih
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="min-h-12 rounded-xl border border-slate-300 px-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800 dark:text-slate-300">
              Skor (opsiyonel, 0-100)
              <input
                type="number"
                min="0"
                max="100"
                value={score}
                onChange={(event) => setScore(event.target.value)}
                className="min-h-12 rounded-xl border border-slate-300 px-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </label>
          </div>
          <label className="mt-4 grid gap-2 text-sm font-medium text-slate-800 dark:text-slate-300">
            Detay
            <textarea
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              className="min-h-24 rounded-xl border border-slate-300 px-3 py-3 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </label>
          <button
            type="button"
            onClick={addRecord}
            disabled={!selectedVehicleId}
            className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
          >
            <Plus aria-hidden="true" className="h-5 w-5" />
            Kaydı ekle
          </button>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Zaman çizelgesi</h2>
          <div className="mt-4 grid gap-3">
            {recordsForVehicle.length ? (
              [...recordsForVehicle]
                .sort((a, b) => (a.date < b.date ? 1 : -1))
                .map((record) => (
                  <article
                    key={record.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase text-teal-800">
                          {record.type}
                          {typeof record.score === "number" ? ` · Skor ${record.score}` : ""}
                        </p>
                        <h3 className="mt-1 font-semibold text-slate-950 dark:text-white">{record.title}</h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {new Date(`${record.date}T00:00:00`).toLocaleDateString("tr-TR")}
                        </p>
                        {record.detail ? (
                          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{record.detail}</p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRecord(record.id)}
                        className="shrink-0 text-sm font-semibold text-red-700 hover:underline"
                      >
                        Sil
                      </button>
                    </div>
                  </article>
                ))
            ) : (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
                Henüz kayıt eklenmedi.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function ScoreTrendChart({ points }: { points: { id: string; date: string; score: number }[] }) {
  const width = 320;
  const height = 120;
  const padding = 16;
  const maxScore = 100;

  const stepX = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;
  const coordinates = points.map((point, index) => ({
    x: padding + index * stepX,
    y: padding + (1 - point.score / maxScore) * (height - padding * 2),
    point,
  }));
  const path = coordinates.map((coord, index) => `${index === 0 ? "M" : "L"}${coord.x},${coord.y}`).join(" ");

  return (
    <div className="mt-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Zaman içinde sağlık skoru trendi"
        className="w-full"
      >
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#c3c2b7"
          strokeWidth={1}
        />
        <path d={path} fill="none" stroke="#0f766e" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {coordinates.map((coord) => (
          <circle key={coord.point.id} cx={coord.x} cy={coord.y} r={4} fill="#0f766e">
            <title>
              {new Date(`${coord.point.date}T00:00:00`).toLocaleDateString("tr-TR")}: {coord.point.score}
            </title>
          </circle>
        ))}
      </svg>
      <details className="mt-2">
        <summary className="cursor-pointer text-sm font-semibold text-teal-800">Tablo olarak gör</summary>
        <table className="mt-3 w-full text-left text-sm">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400">
              <th className="py-1 font-medium">Tarih</th>
              <th className="py-1 font-medium">Skor</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="py-1 text-slate-800 dark:text-slate-300">
                  {new Date(`${point.date}T00:00:00`).toLocaleDateString("tr-TR")}
                </td>
                <td className="py-1 text-slate-800 dark:text-slate-300">{point.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
