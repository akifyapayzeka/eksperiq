"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarClock, HeartPulse, Pencil, Plus } from "lucide-react";
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
import { VehicleFormSheet } from "@/components/vehicles/vehicle-form-sheet";
import { filterByVehicle, recordVehicleId } from "@/lib/vehicles/model";
import { createVehicleId, deleteVehicle, loadVehicles, upsertVehicle } from "@/lib/storage/vehicle-storage";
import type { VehicleProfile } from "@/lib/vehicles/types";
import { AppShell } from "@/components/layout/app-shell";
import { HeroCard } from "@/components/cards/hero-card";
import { ReminderCard } from "@/components/cards/reminder-card";
import { SecondaryButton } from "@/components/ui/button";

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
  const [isVehicleSheetOpen, setIsVehicleSheetOpen] = useState(false);

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
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null;

  function handleVehicleSaved(saved: VehicleProfile) {
    setVehicles((current) => {
      const index = current.findIndex((item) => item.id === saved.id);
      return index === -1 ? [...current, saved] : current.map((item, i) => (i === index ? saved : item));
    });
    setSelectedVehicleId(saved.id);
  }

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
    <AppShell className="pt-6">
      <>
        <HeroCard
          icon={HeartPulse}
          title="Analiz, bakım ve notları tek ekranda tut"
          description="Bu ekranda eklediğiniz kayıtlar hesaba değil, yalnızca bu cihaza kaydedilir. Araç özeti ise mevcut tarayıcı oturumundaki son analiz raporundan gelir."
        />

        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
          <VehicleSwitcher
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            onSelect={selectVehicle}
            onAdd={addVehicle}
            onRename={renameVehicle}
            onDelete={removeVehicle}
          />
          <SecondaryButton onClick={() => setIsVehicleSheetOpen(true)} className="sm:mt-0">
            <Pencil aria-hidden="true" className="h-4 w-4" />
            Araç bilgilerini düzenle
          </SecondaryButton>
        </div>

        <VehicleFormSheet
          open={isVehicleSheetOpen}
          vehicle={selectedVehicle}
          onClose={() => setIsVehicleSheetOpen(false)}
          onSaved={handleVehicleSaved}
        />

        <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">Araç özeti</h2>
          {analysis ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-theme-sm bg-muted p-4">
                <p className="text-sm text-muted-foreground">Araç</p>
                <p className="mt-1 font-semibold text-foreground">
                  {analysis.input.year} {analysis.input.brand} {analysis.input.model}
                </p>
              </div>
              <div className="rounded-theme-sm bg-muted p-4">
                <p className="text-sm text-muted-foreground">Risk skoru</p>
                <p className="mt-1 font-semibold text-foreground">{analysis.totalScore}/100</p>
              </div>
              <div className="rounded-theme-sm bg-muted p-4">
                <p className="text-sm text-muted-foreground">Kontrol başlığı</p>
                <p className="mt-1 font-semibold text-foreground">{analysis.inspectionFocus.length}</p>
              </div>
            </div>
          ) : (
            <p className="mt-3 rounded-theme-sm bg-muted p-4 text-sm text-muted-foreground">
              Henüz oturumda analiz yok. Yeni araç analizi oluşturduğunuzda burada araç özeti görünecek.
            </p>
          )}
        </section>

        <section
          className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm"
          aria-labelledby="upcoming-dates"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarClock aria-hidden="true" className="h-5 w-5 text-accent" />
              <h2 id="upcoming-dates" className="text-xl font-semibold text-foreground">
                Yaklaşan tarihler
              </h2>
            </div>
            <Link
              href="/bakim-odeme-takvimi"
              className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
            >
              Tümünü gör
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 overflow-hidden rounded-theme-sm border border-border">
            {upcomingReminders.length ? (
              upcomingReminders.map((record) => {
                const days = daysUntil(record.dueDate);
                return (
                  <ReminderCard
                    key={record.id}
                    title={record.title}
                    subtitle={reminderCategoryLabels[record.category]}
                    days={days}
                    urgency={urgencyOf(days)}
                  />
                );
              })
            ) : (
              <p className="bg-muted p-4 text-sm text-muted-foreground">
                Henüz MTV, sigorta, muayene veya bakım tarihi eklenmedi.{" "}
                <Link href="/bakim-odeme-takvimi" className="font-semibold text-accent hover:underline">
                  Bakım ve Ödeme Takvimi
                </Link>{" "}
                sayfasından ekleyebilirsiniz.
              </p>
            )}
          </div>
        </section>

        {trend.length ? (
          <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground">Sağlık skoru trendi</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Kayıt eklerken girdiğiniz skorların zaman içindeki değişimi. Tek bir teşhis değil, kendi notlarınızın
              özetidir.
            </p>
            {trend.length >= 2 ? (
              <ScoreTrendChart points={trend} />
            ) : (
              <p className="mt-4 rounded-theme-sm bg-muted p-4 text-sm text-muted-foreground">
                Trend görmek için en az iki skorlu kayıt gerekir.
              </p>
            )}
          </section>
        ) : null}

        <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">Kayıt ekle</h2>
          {analysis ? (
            <button
              type="button"
              onClick={addCurrentScore}
              disabled={!selectedVehicleId}
              className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-accent px-4 text-sm font-semibold text-accent disabled:opacity-50"
            >
              Şu anki analiz skorunu ({analysis.totalScore}) trende ekle
            </button>
          ) : null}
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="grid gap-2 text-sm font-medium text-foreground/90">
              Tür
              <select
                value={type}
                onChange={(event) => setType(event.target.value as HealthRecordType)}
                className="min-h-12 rounded-theme-sm border border-border px-3"
              >
                {healthRecordTypes.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground/90 sm:col-span-2">
              Başlık
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="min-h-12 rounded-theme-sm border border-border px-3"
                placeholder="Örn. 90 bin km bakımı"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground/90">
              Tarih
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="min-h-12 rounded-theme-sm border border-border px-3"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground/90">
              Skor (opsiyonel, 0-100)
              <input
                type="number"
                min="0"
                max="100"
                value={score}
                onChange={(event) => setScore(event.target.value)}
                className="min-h-12 rounded-theme-sm border border-border px-3"
              />
            </label>
          </div>
          <label className="mt-4 grid gap-2 text-sm font-medium text-foreground/90">
            Detay
            <textarea
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              className="min-h-24 rounded-theme-sm border border-border px-3 py-3"
            />
          </label>
          <button
            type="button"
            onClick={addRecord}
            disabled={!selectedVehicleId}
            className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-50 dark:bg-card dark:text-foreground"
          >
            <Plus aria-hidden="true" className="h-5 w-5" />
            Kaydı ekle
          </button>
        </section>

        <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">Zaman çizelgesi</h2>
          <div className="mt-4 grid gap-3">
            {recordsForVehicle.length ? (
              [...recordsForVehicle]
                .sort((a, b) => (a.date < b.date ? 1 : -1))
                .map((record) => (
                  <article key={record.id} className="rounded-theme-sm border border-border bg-muted p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase text-accent">
                          {record.type}
                          {typeof record.score === "number" ? ` · Skor ${record.score}` : ""}
                        </p>
                        <h3 className="mt-1 font-semibold text-foreground">{record.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(`${record.date}T00:00:00`).toLocaleDateString("tr-TR")}
                        </p>
                        {record.detail ? (
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{record.detail}</p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRecord(record.id)}
                        className="shrink-0 text-sm font-semibold text-destructive hover:underline"
                      >
                        Sil
                      </button>
                    </div>
                  </article>
                ))
            ) : (
              <p className="rounded-theme-sm bg-muted p-4 text-sm text-muted-foreground">Henüz kayıt eklenmedi.</p>
            )}
          </div>
        </section>
      </>
    </AppShell>
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
          className="stroke-border"
          strokeWidth={1}
        />
        <path
          d={path}
          fill="none"
          className="stroke-accent"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {coordinates.map((coord) => (
          <circle key={coord.point.id} cx={coord.x} cy={coord.y} r={4} className="fill-accent">
            <title>
              {new Date(`${coord.point.date}T00:00:00`).toLocaleDateString("tr-TR")}: {coord.point.score}
            </title>
          </circle>
        ))}
      </svg>
      <details className="mt-2">
        <summary className="cursor-pointer text-sm font-semibold text-accent">Tablo olarak gör</summary>
        <table className="mt-3 w-full text-left text-sm">
          <thead>
            <tr className="text-muted-foreground">
              <th className="py-1 font-medium">Tarih</th>
              <th className="py-1 font-medium">Skor</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.id} className="border-t border-border">
                <td className="py-1 text-foreground/90">
                  {new Date(`${point.date}T00:00:00`).toLocaleDateString("tr-TR")}
                </td>
                <td className="py-1 text-foreground/90">{point.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
