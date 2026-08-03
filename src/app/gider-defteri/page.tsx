"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Wallet } from "lucide-react";
import { approximateCostPerKm, monthlyTotals, totalAmount, totalByCategory } from "@/lib/expenses/model";
import { expenseCategoryLabels } from "@/lib/expenses/types";
import type { ExpenseCategory, ExpenseRecord } from "@/lib/expenses/types";
import { createExpenseId, deleteExpense, loadExpenses, upsertExpense } from "@/lib/storage/expenses-storage";
import { VehicleSwitcher } from "@/components/vehicles/vehicle-switcher";
import { filterByVehicle, recordVehicleId } from "@/lib/vehicles/model";
import { createVehicleId, deleteVehicle, loadVehicles, upsertVehicle } from "@/lib/storage/vehicle-storage";
import type { VehicleProfile } from "@/lib/vehicles/types";

function formatTl(amount: number): string {
  return `${amount.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} TL`;
}

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("tr-TR");
}

export default function ExpenseLedgerPage() {
  const [records, setRecords] = useState<ExpenseRecord[]>([]);
  const [vehicles, setVehicles] = useState<VehicleProfile[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("yakit");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [odometer, setOdometer] = useState("");
  const [note, setNote] = useState("");
  const [formMessage, setFormMessage] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const loadedVehicles = loadVehicles();
      setVehicles(loadedVehicles);
      setSelectedVehicleId(loadedVehicles[0]?.id ?? "");
      setRecords(loadExpenses());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const recordsForVehicle = useMemo(
    () => filterByVehicle(records, selectedVehicleId, vehicles),
    [records, selectedVehicleId, vehicles],
  );
  const months = useMemo(() => monthlyTotals(recordsForVehicle), [recordsForVehicle]);
  const maxMonthTotal = useMemo(() => Math.max(1, ...months.map((month) => month.total)), [months]);
  const categoryTotals = useMemo(() => totalByCategory(recordsForVehicle), [recordsForVehicle]);
  const overallTotal = useMemo(() => totalAmount(recordsForVehicle), [recordsForVehicle]);
  const costPerKm = useMemo(() => approximateCostPerKm(recordsForVehicle), [recordsForVehicle]);
  const sortedRecords = useMemo(
    () => [...recordsForVehicle].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [recordsForVehicle],
  );

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
    if (!result.ok) {
      setFormMessage("Son araç profili silinemez.");
      return;
    }
    setVehicles(result.vehicles);
    const idsToRemove = records.filter((item) => recordVehicleId(item, vehicles) === id).map((item) => item.id);
    for (const recordId of idsToRemove) deleteExpense(recordId);
    setRecords(records.filter((item) => !idsToRemove.includes(item.id)));
    setSelectedVehicleId(result.vehicles[0]?.id ?? "");
  }

  function submitExpense() {
    if (!selectedVehicleId) return;
    const parsedAmount = Number(amount);
    if (!amount.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormMessage("Geçerli bir tutar girin.");
      return;
    }
    if (!date) {
      setFormMessage("Tarih zorunludur.");
      return;
    }
    const parsedOdometer = odometer.trim() ? Number(odometer) : undefined;
    if (odometer.trim() && (parsedOdometer === undefined || Number.isNaN(parsedOdometer) || parsedOdometer < 0)) {
      setFormMessage("Kilometre geçerli bir sayı olmalıdır.");
      return;
    }

    const record: ExpenseRecord = {
      id: createExpenseId(),
      category,
      amount: parsedAmount,
      date,
      odometer: parsedOdometer,
      note: note.trim() || undefined,
      createdAt: new Date().toISOString(),
      vehicleId: selectedVehicleId,
    };

    upsertExpense(record);
    setRecords((current) => [...current, record]);
    setAmount("");
    setDate("");
    setOdometer("");
    setNote("");
    setFormMessage("Gider eklendi.");
  }

  function removeExpense(id: string) {
    deleteExpense(id);
    setRecords((current) => current.filter((item) => item.id !== id));
  }

  return (
    <main className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
          <Wallet aria-hidden="true" className="h-9 w-9 text-teal-200" />
          <p className="mt-5 text-sm font-semibold text-teal-200">Gider Defteri</p>
          <h1 className="mt-2 text-3xl font-semibold">Aracının maliyetini zaman içinde gör</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Yakıt, bakım, sigorta ve diğer masrafları kaydedin; aylık toplam ve yaklaşık km başı maliyeti görün. Bu
            kayıtlar bilgilendirme amaçlıdır, resmi mali kayıt yerine geçmez ve yalnızca bu cihazda saklanır.
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

        <section className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Toplam gider (kayıtlı ay sayısı kadar)</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{formatTl(overallTotal)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Yaklaşık km başı maliyet</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">
              {costPerKm !== null
                ? `${costPerKm.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} TL/km`
                : "Bilgi yetersiz"}
            </p>
            {costPerKm === null ? (
              <p className="mt-1 text-xs text-slate-500">En az iki kayıtta kilometre girerseniz hesaplanır.</p>
            ) : null}
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Aylık gider</h2>
          <div className="mt-5 flex h-40 items-end gap-2 border-b border-slate-300">
            {months.map((month) => (
              <div key={month.monthKey} className="flex flex-1 flex-col items-center justify-end gap-1">
                {month.total > 0 ? (
                  <span className="text-[0.65rem] font-medium text-slate-600">
                    {month.total.toLocaleString("tr-TR", { maximumFractionDigits: 0, notation: "compact" })}
                  </span>
                ) : null}
                <div
                  title={`${month.label}: ${formatTl(month.total)}`}
                  className="w-full rounded-t bg-teal-700"
                  style={{ height: `${Math.max(2, (month.total / maxMonthTotal) * 100)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            {months.map((month) => (
              <span key={month.monthKey} className="flex-1 text-center text-[0.65rem] text-slate-500">
                {month.label}
              </span>
            ))}
          </div>

          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-semibold text-teal-800">Tablo olarak gör</summary>
            <table className="mt-3 w-full text-left text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="py-1 font-medium">Ay</th>
                  <th className="py-1 font-medium">Toplam</th>
                </tr>
              </thead>
              <tbody>
                {months.map((month) => (
                  <tr key={month.monthKey} className="border-t border-slate-100">
                    <td className="py-1 text-slate-800">{month.label}</td>
                    <td className="py-1 text-slate-800">{formatTl(month.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </section>

        {overallTotal > 0 ? (
          <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Kategoriye göre toplam</h2>
            <div className="mt-4 grid gap-2">
              {Object.entries(categoryTotals).map(([key, total]) => (
                <div key={key} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span className="text-sm font-medium text-slate-800">
                    {expenseCategoryLabels[key as ExpenseCategory]}
                  </span>
                  <span className="text-sm font-semibold text-slate-950">{formatTl(total ?? 0)}</span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Gider ekle</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-800">
              Tür
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as ExpenseCategory)}
                className="min-h-12 rounded-xl border border-slate-300 px-3"
              >
                {Object.entries(expenseCategoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800">
              Tutar (TL)
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="min-h-12 rounded-xl border border-slate-300 px-3"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800">
              Tarih
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="min-h-12 rounded-xl border border-slate-300 px-3"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800">
              Kilometre (opsiyonel)
              <input
                type="number"
                min="0"
                value={odometer}
                onChange={(event) => setOdometer(event.target.value)}
                className="min-h-12 rounded-xl border border-slate-300 px-3"
              />
            </label>
          </div>
          <label className="mt-4 grid gap-2 text-sm font-medium text-slate-800">
            Not (opsiyonel)
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="min-h-20 rounded-xl border border-slate-300 px-3 py-3"
            />
          </label>
          <button
            type="button"
            onClick={submitExpense}
            disabled={!selectedVehicleId}
            className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 font-semibold text-white disabled:opacity-50"
          >
            <Plus aria-hidden="true" className="h-5 w-5" />
            Gideri kaydet
          </button>
          {formMessage ? (
            <p role="status" className="mt-3 text-sm font-medium text-slate-700">
              {formMessage}
            </p>
          ) : null}
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Kayıtlar</h2>
          <div className="mt-4 grid gap-3">
            {sortedRecords.length ? (
              sortedRecords.map((record) => (
                <article key={record.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-teal-800">
                        {expenseCategoryLabels[record.category]}
                      </p>
                      <p className="mt-1 font-semibold text-slate-950">{formatTl(record.amount)}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {formatDate(record.date)}
                        {typeof record.odometer === "number" ? ` · ${record.odometer.toLocaleString("tr-TR")} km` : ""}
                      </p>
                      {record.note ? <p className="mt-1 text-sm text-slate-600">{record.note}</p> : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExpense(record.id)}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-red-700 hover:underline"
                    >
                      <Trash2 aria-hidden="true" className="h-4 w-4" />
                      Sil
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Henüz gider eklenmedi.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
