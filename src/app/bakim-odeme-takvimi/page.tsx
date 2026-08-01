"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, BellOff, CalendarClock, Plus, Trash2 } from "lucide-react";
import { getPushState, subscribeToPush, syncRemindersToPush, unsubscribeFromPush } from "@/lib/push/client";
import type { PushSupportState } from "@/lib/push/client";
import { daysUntil, defaultMtvReminders, sortByUrgency, urgencyOf } from "@/lib/reminders/model";
import { createReminderId, deleteReminder, loadReminders, upsertReminder } from "@/lib/storage/reminders-storage";
import { reminderCategoryLabels } from "@/lib/reminders/types";
import type { ReminderCategory, ReminderRecord, ReminderRecurrence } from "@/lib/reminders/types";

const categoryDefaultTitles: Record<ReminderCategory, string> = {
  mtv: "MTV taksiti",
  "trafik-sigortasi": "Trafik sigortası yenileme",
  kasko: "Kasko yenileme",
  muayene: "Muayene",
  bakim: "Bakım",
  lastik: "Lastik değişimi",
  aku: "Akü kontrolü",
  diger: "Hatırlatma",
};

const recurrenceLabels: Record<ReminderRecurrence, string> = {
  none: "Tekrarlamaz",
  yearly: "Her yıl",
  semiannual: "6 ayda bir",
};

const urgencyStyles: Record<string, string> = {
  overdue: "bg-red-50 text-red-700",
  urgent: "bg-amber-50 text-amber-800",
  upcoming: "bg-sky-50 text-sky-800",
  later: "bg-slate-100 text-slate-600",
};

function urgencyLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)} gün gecikti`;
  if (days === 0) return "Bugün";
  return `${days} gün kaldı`;
}

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("tr-TR");
}

function formatAmount(amount?: number): string | null {
  if (typeof amount !== "number") return null;
  return `${amount.toLocaleString("tr-TR")} TL`;
}

export default function MaintenancePaymentCalendarPage() {
  const [reminders, setReminders] = useState<ReminderRecord[]>([]);
  const [pushState, setPushState] = useState<PushSupportState>("unsupported");
  const [pushMessage, setPushMessage] = useState("");
  const [pushBusy, setPushBusy] = useState(false);

  const [category, setCategory] = useState<ReminderCategory>("mtv");
  const [title, setTitle] = useState(categoryDefaultTitles.mtv);
  const [dueDate, setDueDate] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [recurrence, setRecurrence] = useState<ReminderRecurrence>("none");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setReminders(loadReminders()));
    getPushState()
      .then(setPushState)
      .catch(() => setPushState("unsupported"));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const sorted = useMemo(() => sortByUrgency(reminders), [reminders]);

  function resetForm() {
    setCategory("mtv");
    setTitle(categoryDefaultTitles.mtv);
    setDueDate("");
    setAmount("");
    setNote("");
    setRecurrence("none");
    setEditingId(null);
  }

  function persist(records: ReminderRecord[]) {
    setReminders(records);
    if (pushState === "subscribed") void syncRemindersToPush(records);
  }

  function addMtvInstallments() {
    const hasMtv = reminders.some((item) => item.category === "mtv");
    if (hasMtv) {
      setFormMessage("MTV taksitleri zaten listede. Tutarları güncellemek için ilgili kaydı düzenleyin.");
      return;
    }

    const now = new Date();
    const created = defaultMtvReminders(now).map((template) => ({
      id: createReminderId(),
      category: template.category,
      title: template.title,
      dueDate: template.dueDate,
      recurrence: "yearly" as const,
      history: [],
      createdAt: now.toISOString(),
    }));

    let next = reminders;
    for (const record of created) next = [...next, record];
    persist(next);
    setFormMessage("MTV taksit tarihleri eklendi. Tutarı ödeme yaklaştıkça kayıttan düzenleyebilirsiniz.");
  }

  function submitForm() {
    if (!title.trim() || !dueDate) {
      setFormMessage("Başlık ve tarih zorunludur.");
      return;
    }

    const parsedAmount = amount.trim() ? Number(amount) : undefined;
    if (amount.trim() && (parsedAmount === undefined || Number.isNaN(parsedAmount) || parsedAmount < 0)) {
      setFormMessage("Tutar geçerli bir sayı olmalıdır.");
      return;
    }

    const existing = editingId ? reminders.find((item) => item.id === editingId) : undefined;
    const record: ReminderRecord = {
      id: existing?.id ?? createReminderId(),
      category,
      title: title.trim(),
      dueDate,
      amount: parsedAmount,
      note: note.trim() || undefined,
      recurrence,
      history: existing?.history ?? [],
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    upsertReminder(record);
    const next = editingId ? reminders.map((item) => (item.id === editingId ? record : item)) : [...reminders, record];
    persist(next);
    setFormMessage(editingId ? "Kayıt güncellendi." : "Kayıt eklendi.");
    resetForm();
  }

  function editRecord(record: ReminderRecord) {
    setEditingId(record.id);
    setCategory(record.category);
    setTitle(record.title);
    setDueDate(record.dueDate);
    setAmount(record.amount !== undefined ? String(record.amount) : "");
    setNote(record.note ?? "");
    setRecurrence(record.recurrence);
    setFormMessage("");
  }

  function removeRecord(id: string) {
    deleteReminder(id);
    persist(reminders.filter((item) => item.id !== id));
  }

  async function enableNotifications() {
    setPushBusy(true);
    setPushMessage("");
    const result = await subscribeToPush(reminders);
    setPushBusy(false);
    if (!result.ok) {
      setPushMessage(result.error ?? "Bildirimler açılamadı.");
      return;
    }
    setPushState("subscribed");
    setPushMessage("Bildirimler açık. Son tarihten 30 ve 15 gün kala bildirim alacaksınız.");
  }

  async function disableNotifications() {
    setPushBusy(true);
    await unsubscribeFromPush();
    setPushBusy(false);
    setPushState("unsubscribed");
    setPushMessage("Bildirimler kapatıldı.");
  }

  return (
    <main className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
          <CalendarClock aria-hidden="true" className="h-9 w-9 text-teal-200" />
          <p className="mt-5 text-sm font-semibold text-teal-200">Bakım ve Ödeme Takvimi</p>
          <h1 className="mt-2 text-3xl font-semibold">MTV, sigorta, muayene ve bakım tarihlerini tek yerde tut</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Tutarları siz girersiniz; güncel MTV/sigorta tutarlarını resmi kaynaktan doğrulayın. Bu ekran yalnızca
            cihazınızda saklanır, hesaba kaydedilmez.
          </p>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Bell aria-hidden="true" className="h-5 w-5 text-teal-700" />
            <h2 className="text-xl font-semibold text-slate-950">Bildirimler</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Açarsanız, bir tarihe 30 gün ve 15 gün kala telefonunuza bildirim gönderilir (uygulama kapalıyken de).
          </p>
          {pushState === "not-configured" ? (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-950">
              Bildirim servisi henüz yapılandırılmadı.
            </p>
          ) : pushState === "unsupported" ? (
            <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Bu tarayıcı/cihaz bildirim göndermeyi desteklemiyor.
            </p>
          ) : pushState === "denied" ? (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-950">
              Bildirim izni reddedilmiş. Tarayıcı/cihaz ayarlarından izni yeniden açabilirsiniz.
            </p>
          ) : pushState === "subscribed" ? (
            <button
              type="button"
              onClick={disableNotifications}
              disabled={pushBusy}
              className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 font-semibold text-slate-900 disabled:opacity-50"
            >
              <BellOff aria-hidden="true" className="h-5 w-5" />
              Bildirimleri kapat
            </button>
          ) : (
            <button
              type="button"
              onClick={enableNotifications}
              disabled={pushBusy}
              className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 font-semibold text-white disabled:opacity-50"
            >
              <Bell aria-hidden="true" className="h-5 w-5" />
              Bildirimleri aç
            </button>
          )}
          {pushMessage ? <p className="mt-3 text-sm font-medium text-slate-700">{pushMessage}</p> : null}
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">{editingId ? "Kaydı düzenle" : "Kayıt ekle"}</h2>
          <div className="mt-3">
            <button
              type="button"
              onClick={addMtvInstallments}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-teal-700 px-4 text-sm font-semibold text-teal-800"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              MTV taksitlerini ekle (Ocak/Temmuz)
            </button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-800">
              Tür
              <select
                value={category}
                onChange={(event) => {
                  const next = event.target.value as ReminderCategory;
                  setCategory(next);
                  if (!editingId) setTitle(categoryDefaultTitles[next]);
                }}
                className="min-h-12 rounded-xl border border-slate-300 px-3"
              >
                {Object.entries(reminderCategoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800">
              Başlık
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="min-h-12 rounded-xl border border-slate-300 px-3"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800">
              Son tarih
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="min-h-12 rounded-xl border border-slate-300 px-3"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800">
              Tutar (opsiyonel, TL)
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="min-h-12 rounded-xl border border-slate-300 px-3"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800">
              Tekrar
              <select
                value={recurrence}
                onChange={(event) => setRecurrence(event.target.value as ReminderRecurrence)}
                className="min-h-12 rounded-xl border border-slate-300 px-3"
              >
                {Object.entries(recurrenceLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
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
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={submitForm}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 font-semibold text-white"
            >
              <Plus aria-hidden="true" className="h-5 w-5" />
              {editingId ? "Kaydı güncelle" : "Kaydı ekle"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 px-5 font-semibold text-slate-800"
              >
                Vazgeç
              </button>
            ) : null}
          </div>
          {formMessage ? <p className="mt-3 text-sm font-medium text-slate-700">{formMessage}</p> : null}
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Takvim</h2>
          <div className="mt-4 grid gap-3">
            {sorted.length ? (
              sorted.map((record) => {
                const days = daysUntil(record.dueDate);
                const urgency = urgencyOf(days);
                const amountLabel = formatAmount(record.amount);
                return (
                  <article key={record.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase text-teal-800">
                          {reminderCategoryLabels[record.category]}
                        </p>
                        <h3 className="mt-1 font-semibold text-slate-950">{record.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {formatDate(record.dueDate)}
                          {amountLabel ? ` · ${amountLabel}` : ""}
                          {record.recurrence !== "none" ? ` · ${recurrenceLabels[record.recurrence]}` : ""}
                        </p>
                        {record.note ? <p className="mt-2 text-sm leading-6 text-slate-600">{record.note}</p> : null}
                        {record.history.length ? (
                          <p className="mt-2 text-xs text-slate-500">
                            Geçmiş:{" "}
                            {record.history
                              .map(
                                (entry) =>
                                  `${formatDate(entry.date)}${formatAmount(entry.amount) ? ` (${formatAmount(entry.amount)})` : ""}`,
                              )
                              .join(", ")}
                          </p>
                        ) : null}
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${urgencyStyles[urgency]}`}
                      >
                        {urgencyLabel(days)}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-3">
                      <button
                        type="button"
                        onClick={() => editRecord(record)}
                        className="text-sm font-semibold text-teal-800 hover:underline"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => removeRecord(record.id)}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-red-700 hover:underline"
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                        Sil
                      </button>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Henüz takip edilen tarih yok.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
