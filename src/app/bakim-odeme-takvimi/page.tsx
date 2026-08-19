"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, BellOff, CalendarClock, Pencil, Plus, Trash2 } from "lucide-react";
import { HeroCard } from "@/components/cards/hero-card";
import { AppShell } from "@/components/layout/app-shell";
import {
  cancelNotificationsForDeletedReminder,
  disableNotifications as disableReminderNotifications,
  enableNotifications as enableReminderNotifications,
  getNotificationState,
  syncNotifications,
} from "@/lib/push/notifications";
import type { NotificationState } from "@/lib/push/notifications";
import { daysUntil, defaultMtvReminders, sortByUrgency, urgencyOf } from "@/lib/reminders/model";
import { createReminderId, deleteReminder, loadReminders, upsertReminder } from "@/lib/storage/reminders-storage";
import { reminderCategoryLabels } from "@/lib/reminders/types";
import type { ReminderCategory, ReminderRecord, ReminderRecurrence } from "@/lib/reminders/types";
import { VehicleSwitcher } from "@/components/vehicles/vehicle-switcher";
import { VehicleFormSheet } from "@/components/vehicles/vehicle-form-sheet";
import { filterByVehicle, recordVehicleId } from "@/lib/vehicles/model";
import { createVehicleId, deleteVehicle, loadVehicles, upsertVehicle } from "@/lib/storage/vehicle-storage";
import type { VehicleProfile } from "@/lib/vehicles/types";
import { SecondaryButton } from "@/components/ui/button";
import { formatTryAmount, formatTurkishLiraInputValue, parseTurkishLiraInput } from "@/lib/format/money";

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

const urgencyBadgeClass: Record<string, string> = {
  overdue: "bg-destructive/10 text-destructive",
  urgent: "bg-warning/10 text-warning",
  upcoming: "bg-accent/10 text-accent",
  later: "bg-success/10 text-success",
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
  return formatTryAmount(amount, 2);
}

export default function MaintenancePaymentCalendarPage() {
  const [reminders, setReminders] = useState<ReminderRecord[]>([]);
  const [vehicles, setVehicles] = useState<VehicleProfile[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [pushState, setPushState] = useState<NotificationState>("unsupported");
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
  const [isVehicleSheetOpen, setIsVehicleSheetOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      const loadedVehicles = loadVehicles();
      const loaded = loadReminders();
      if (cancelled) return;
      setVehicles(loadedVehicles);
      setSelectedVehicleId(loadedVehicles[0]?.id ?? "");
      setReminders(loaded);
      getNotificationState()
        .then((state) => {
          if (cancelled) return;
          setPushState(state);
          if (state === "subscribed") void syncNotifications(loaded);
        })
        .catch(() => setPushState("unsupported"));
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const remindersForVehicle = useMemo(
    () => filterByVehicle(reminders, selectedVehicleId, vehicles),
    [reminders, selectedVehicleId, vehicles],
  );
  const sorted = useMemo(() => sortByUrgency(remindersForVehicle), [remindersForVehicle]);
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
    resetForm();
  }

  function addVehicle(label: string) {
    const vehicle: VehicleProfile = { id: createVehicleId(), label, createdAt: new Date().toISOString() };
    setVehicles(upsertVehicle(vehicle));
    setSelectedVehicleId(vehicle.id);
    resetForm();
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
    const remainingReminders = reminders.filter((item) => recordVehicleId(item, vehicles) !== id);
    for (const removed of reminders.filter((item) => recordVehicleId(item, vehicles) === id)) {
      deleteReminder(removed.id);
      void cancelNotificationsForDeletedReminder(removed.id);
    }
    persist(remainingReminders);
    setSelectedVehicleId(result.vehicles[0]?.id ?? "");
    resetForm();
  }

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
    if (pushState === "subscribed") void syncNotifications(records);
  }

  function addMtvInstallments() {
    if (!selectedVehicleId) return;
    const hasMtv = remindersForVehicle.some((item) => item.category === "mtv");
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
      vehicleId: selectedVehicleId,
    }));

    let next = reminders;
    for (const record of created) {
      upsertReminder(record);
      next = [...next, record];
    }
    persist(next);
    setFormMessage("MTV taksit tarihleri eklendi. Tutarı ödeme yaklaştıkça kayıttan düzenleyebilirsiniz.");
  }

  function submitForm() {
    if (!selectedVehicleId) return;
    if (!title.trim() || !dueDate) {
      setFormMessage("Başlık ve tarih zorunludur.");
      return;
    }

    const parsedAmount = amount.trim() ? parseTurkishLiraInput(amount) : undefined;
    if (parsedAmount === null || (parsedAmount !== undefined && parsedAmount < 0)) {
      setFormMessage("Tutar geçerli bir TL tutarı olmalıdır (örn. 1.200,50).");
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
      vehicleId: existing?.vehicleId ?? selectedVehicleId,
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
    setAmount(record.amount !== undefined ? formatTurkishLiraInputValue(record.amount) : "");
    setNote(record.note ?? "");
    setRecurrence(record.recurrence);
    setFormMessage("");
  }

  function removeRecord(id: string) {
    deleteReminder(id);
    void cancelNotificationsForDeletedReminder(id);
    persist(reminders.filter((item) => item.id !== id));
  }

  async function enableNotifications() {
    setPushBusy(true);
    setPushMessage("");
    const result = await enableReminderNotifications(reminders);
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
    const result = await disableReminderNotifications(reminders);
    setPushBusy(false);
    setPushState("unsubscribed");
    setPushMessage(
      result.serverDeleted
        ? "Bildirimler kapatıldı."
        : "Bildirimler bu cihazda kapatıldı. Sunucudaki kayıt şu anda silinemedi, en geç 90 gün içinde otomatik olarak silinir.",
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl pt-6">
        <HeroCard
          icon={CalendarClock}
          eyebrow="Bakım ve Ödeme Takvimi"
          title="MTV, sigorta, muayene ve bakım tarihlerini tek yerde tut"
          description="Tutarları siz girersiniz; güncel MTV/sigorta tutarlarını resmi kaynaktan doğrulayın. Bu ekran yalnızca cihazınızda saklanır, hesaba kaydedilmez."
          tone="accent"
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
          vehicleCount={vehicles.length}
          onClose={() => setIsVehicleSheetOpen(false)}
          onSaved={handleVehicleSaved}
        />

        <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Bell aria-hidden="true" className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold text-foreground">Bildirimler</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Açarsanız, bir tarihe 30 gün ve 15 gün kala telefonunuza bildirim gönderilir (uygulama kapalıyken de).
          </p>
          {pushState === "not-configured" ? (
            <p className="mt-3 rounded-theme-sm border border-warning/30 bg-warning/10 px-3 py-2 text-sm font-medium text-foreground">
              Bildirim servisi henüz yapılandırılmadı.
            </p>
          ) : pushState === "unsupported" ? (
            <p className="mt-3 rounded-theme-sm border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
              Bu tarayıcı/cihaz bildirim göndermeyi desteklemiyor.
            </p>
          ) : pushState === "denied" ? (
            <p className="mt-3 rounded-theme-sm border border-warning/30 bg-warning/10 px-3 py-2 text-sm font-medium text-foreground">
              Bildirim izni reddedilmiş. Tarayıcı/cihaz ayarlarından izni yeniden açabilirsiniz.
            </p>
          ) : pushState === "subscribed" ? (
            <button
              type="button"
              onClick={disableNotifications}
              disabled={pushBusy}
              className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-border px-5 font-semibold text-foreground disabled:opacity-50"
            >
              <BellOff aria-hidden="true" className="h-5 w-5" />
              Bildirimleri kapat
            </button>
          ) : (
            <button
              type="button"
              onClick={enableNotifications}
              disabled={pushBusy}
              className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-5 font-semibold text-primary-foreground disabled:opacity-50"
            >
              <Bell aria-hidden="true" className="h-5 w-5" />
              Bildirimleri aç
            </button>
          )}
          {pushMessage ? <p className="mt-3 text-sm font-medium text-foreground/80">{pushMessage}</p> : null}
        </section>

        <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">{editingId ? "Kaydı düzenle" : "Kayıt ekle"}</h2>
          <div className="mt-3">
            <button
              type="button"
              onClick={addMtvInstallments}
              disabled={!selectedVehicleId}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full transition active:scale-95 border border-accent px-4 text-sm font-semibold text-accent disabled:opacity-50"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              MTV taksitlerini ekle (Ocak/Temmuz)
            </button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-foreground/90">
              Tür
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as ReminderCategory)}
                className="min-h-12 rounded-theme-sm border border-border px-3"
              >
                {Object.entries(reminderCategoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground/90">
              Başlık
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="min-h-12 rounded-theme-sm border border-border px-3"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground/90">
              Son tarih
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="min-h-12 rounded-theme-sm border border-border px-3"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground/90">
              Tutar (opsiyonel, TL)
              <input
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Örn. 1.200,50"
                className="min-h-12 rounded-theme-sm border border-border px-3"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground/90">
              Tekrar
              <select
                value={recurrence}
                onChange={(event) => setRecurrence(event.target.value as ReminderRecurrence)}
                className="min-h-12 rounded-theme-sm border border-border px-3"
              >
                {Object.entries(recurrenceLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-4 grid gap-2 text-sm font-medium text-foreground/90">
            Not (opsiyonel)
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="min-h-20 rounded-theme-sm border border-border px-3 py-3"
            />
          </label>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={submitForm}
              disabled={!selectedVehicleId}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full transition active:scale-95 bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-50 dark:bg-card dark:text-foreground"
            >
              <Plus aria-hidden="true" className="h-5 w-5" />
              {editingId ? "Kaydı güncelle" : "Kaydı ekle"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex min-h-12 items-center justify-center rounded-full transition active:scale-95 border border-border px-5 font-semibold text-foreground/90"
              >
                Vazgeç
              </button>
            ) : null}
          </div>
          {formMessage ? (
            <p role="status" className="mt-3 text-sm font-medium text-foreground/80">
              {formMessage}
            </p>
          ) : null}
        </section>

        <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">Takvim</h2>
          <div className="mt-4 grid gap-3">
            {sorted.length ? (
              sorted.map((record) => {
                const days = daysUntil(record.dueDate);
                const urgency = urgencyOf(days);
                const amountLabel = formatAmount(record.amount);
                return (
                  <article key={record.id} className="rounded-theme-sm border border-border bg-muted p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase text-accent">
                          {reminderCategoryLabels[record.category]}
                        </p>
                        <h3 className="mt-1 font-semibold text-foreground">{record.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatDate(record.dueDate)}
                          {amountLabel ? ` · ${amountLabel}` : ""}
                          {record.recurrence !== "none" ? ` · ${recurrenceLabels[record.recurrence]}` : ""}
                        </p>
                        {record.note ? (
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{record.note}</p>
                        ) : null}
                        {record.history.length ? (
                          <p className="mt-2 text-xs text-muted-foreground">
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
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${urgencyBadgeClass[urgency]}`}
                      >
                        {urgencyLabel(days)}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-3">
                      <button
                        type="button"
                        onClick={() => editRecord(record)}
                        className="text-sm font-semibold text-accent hover:underline"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => removeRecord(record.id)}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-destructive hover:underline"
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                        Sil
                      </button>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="rounded-theme-sm bg-muted p-4 text-sm text-muted-foreground">
                Henüz takip edilen tarih yok.
              </p>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
