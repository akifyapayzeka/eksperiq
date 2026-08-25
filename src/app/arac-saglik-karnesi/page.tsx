"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarClock, ChevronRight, Pencil, Plus, ShieldCheck, Trash2, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { loadAnalysis } from "@/lib/storage/analysis-storage";
import {
  createHealthRecordId,
  deleteHealthRecord,
  loadHealthRecords,
  upsertHealthRecord,
} from "@/lib/storage/health-record-storage";
import { scoreTrend } from "@/lib/health-record/model";
import { healthRecordTypes } from "@/lib/health-record/types";
import type { HealthRecord, HealthRecordType } from "@/lib/health-record/types";
import type { AnalysisResult } from "@/lib/analysis/types";
import { VehicleFormSheet } from "@/components/vehicles/vehicle-form-sheet";
import { VehicleCard } from "@/components/cards/vehicle-card";
import { filterByVehicle, recordVehicleId } from "@/lib/vehicles/model";
import { deleteVehicle, loadVehicles } from "@/lib/storage/vehicle-storage";
import type { VehicleProfile } from "@/lib/vehicles/types";
import { daysUntil, sortByUrgency } from "@/lib/reminders/model";
import { loadReminders } from "@/lib/storage/reminders-storage";
import { MAINTENANCE_CATEGORIES, reminderCategoryLabels, TAX_CATEGORIES } from "@/lib/reminders/types";
import type { ReminderRecord } from "@/lib/reminders/types";
import { AppShell } from "@/components/layout/app-shell";
import { RepairCostEstimator } from "@/components/repair-cost/repair-cost-estimator";

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
  const [isAddVehicleSheetOpen, setIsAddVehicleSheetOpen] = useState(false);
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const loadedVehicles = loadVehicles();
      setVehicles(loadedVehicles);
      setSelectedVehicleId(loadedVehicles[0]?.id ?? "");
      setAnalysis(loadAnalysis());
      setRecords(loadHealthRecords());
      setReminders(loadReminders());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const recordsForVehicle = useMemo(
    () => filterByVehicle(records, selectedVehicleId, vehicles),
    [records, selectedVehicleId, vehicles],
  );
  const remindersForVehicle = useMemo(
    () => filterByVehicle(reminders, selectedVehicleId, vehicles),
    [reminders, selectedVehicleId, vehicles],
  );
  const maintenanceReminders = useMemo(
    () =>
      sortByUrgency(remindersForVehicle.filter((item) => MAINTENANCE_CATEGORIES.includes(item.category))).slice(0, 3),
    [remindersForVehicle],
  );
  const taxReminders = useMemo(
    () => sortByUrgency(remindersForVehicle.filter((item) => TAX_CATEGORIES.has(item.category))).slice(0, 3),
    [remindersForVehicle],
  );
  const trend = useMemo(() => scoreTrend(recordsForVehicle), [recordsForVehicle]);
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null;
  const canDeleteSelectedVehicle = vehicles.length > 1 && Boolean(selectedVehicleId);

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
    setIsRecordFormOpen(false);
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
        <section aria-labelledby="vehicle-section-title">
          <div className="flex items-end justify-between gap-3">
            <h2 id="vehicle-section-title" className="font-heading text-lg font-bold text-foreground">
              Aracım
            </h2>
            <button
              type="button"
              onClick={() => setIsAddVehicleSheetOpen(true)}
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-accent"
            >
              <Plus aria-hidden="true" className="h-3.5 w-3.5" />
              Yeni araç
            </button>
          </div>

          {selectedVehicle ? (
            <div className="mt-3">
              <VehicleCard
                vehicle={selectedVehicle}
                action={
                  <div className="grid gap-3">
                    {vehicles.length > 1 ? (
                      <label className="grid gap-2 text-sm font-medium text-foreground/90">
                        Araç seç
                        <select
                          value={selectedVehicleId}
                          onChange={(event) => selectVehicle(event.target.value)}
                          className="min-h-11 rounded-theme-sm border border-border bg-input px-3 text-foreground shadow-sm focus:border-accent focus:ring-4 focus:ring-accent/15"
                        >
                          {vehicles.map((vehicle) => (
                            <option key={vehicle.id} value={vehicle.id}>
                              {vehicle.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setIsVehicleSheetOpen(true)}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-accent px-4 text-sm font-semibold text-accent"
                      >
                        <Pencil aria-hidden="true" className="h-4 w-4" />
                        Düzenle
                      </button>
                      {canDeleteSelectedVehicle ? (
                        <button
                          type="button"
                          onClick={() => removeVehicle(selectedVehicle.id)}
                          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-destructive/30 px-4 text-sm font-semibold text-destructive"
                        >
                          <Trash2 aria-hidden="true" className="h-4 w-4" />
                          Sil
                        </button>
                      ) : null}
                    </div>
                  </div>
                }
              />
            </div>
          ) : (
            <p className="mt-3 rounded-theme-sm bg-muted p-4 text-sm text-muted-foreground">
              Henüz araç eklenmedi. Yukarıdaki &quot;Araç ekle&quot; ile ilk aracınızı ekleyin.
            </p>
          )}
        </section>

        <VehicleFormSheet
          open={isVehicleSheetOpen}
          vehicle={selectedVehicle}
          vehicleCount={vehicles.length}
          onClose={() => setIsVehicleSheetOpen(false)}
          onSaved={handleVehicleSaved}
        />
        <VehicleFormSheet
          open={isAddVehicleSheetOpen}
          vehicle={null}
          vehicleCount={vehicles.length}
          onClose={() => setIsAddVehicleSheetOpen(false)}
          onSaved={(saved) => {
            handleVehicleSaved(saved);
            setIsAddVehicleSheetOpen(false);
          }}
        />

        <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <CalendarClock aria-hidden="true" className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold text-foreground">Bakım ve vergi takvimi</h2>
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Bakım, muayene, lastik, akü, MTV, sigorta ve kasko tarihleri seçili araç için burada özetlenir.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <GarageReminderCard
              href="/bakim-odeme-takvimi/bakim"
              icon={Wrench}
              title="Bakım takvimi"
              description="Bakım, muayene, lastik ve akü"
              reminders={maintenanceReminders}
            />
            <GarageReminderCard
              href="/bakim-odeme-takvimi/vergi"
              icon={ShieldCheck}
              title="Vergi ve ödeme takvimi"
              description="MTV, trafik sigortası ve kasko"
              reminders={taxReminders}
            />
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
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-foreground">Kayıt ekle</h2>
            {!isRecordFormOpen && (
              <button
                type="button"
                onClick={() => setIsRecordFormOpen(true)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-accent px-4 text-sm font-semibold text-accent"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
                Yeni kayıt
              </button>
            )}
          </div>
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
          {isRecordFormOpen && (
            <>
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
            </>
          )}
        </section>

        <RepairCostEstimator />

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

function reminderDueLabel(record: ReminderRecord): string {
  const days = daysUntil(record.dueDate);
  if (days < 0) return `${Math.abs(days)} gün gecikti`;
  if (days === 0) return "Bugün";
  return `${days} gün kaldı`;
}

function GarageReminderCard({
  href,
  icon: Icon,
  title,
  description,
  reminders,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  reminders: ReminderRecord[];
}) {
  return (
    <Link
      href={href}
      className="group rounded-theme-sm border border-border bg-muted p-4 transition hover:border-accent hover:bg-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-card text-accent">
            <Icon aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{title}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <ChevronRight
          aria-hidden="true"
          className="mt-2 h-5 w-5 shrink-0 text-muted-foreground group-hover:text-accent"
        />
      </div>
      <div className="mt-4 grid gap-2">
        {reminders.length ? (
          reminders.map((record) => (
            <div key={record.id} className="rounded-theme-sm border border-border bg-card px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{record.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{reminderCategoryLabels[record.category]}</p>
                </div>
                <span className="shrink-0 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                  {reminderDueLabel(record)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-theme-sm border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
            Bu araç için yaklaşan kayıt yok.
          </p>
        )}
      </div>
    </Link>
  );
}
