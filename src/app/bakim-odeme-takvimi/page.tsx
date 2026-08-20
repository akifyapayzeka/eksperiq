"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, BellOff, CalendarClock, ChevronRight, ShieldCheck, Wrench } from "lucide-react";
import { HeroCard } from "@/components/cards/hero-card";
import { AppShell } from "@/components/layout/app-shell";
import {
  disableNotifications as disableReminderNotifications,
  enableNotifications as enableReminderNotifications,
  getNotificationState,
  syncNotifications,
} from "@/lib/push/notifications";
import type { NotificationState } from "@/lib/push/notifications";
import { loadReminders } from "@/lib/storage/reminders-storage";
import type { ReminderRecord } from "@/lib/reminders/types";

export default function MaintenancePaymentCalendarHubPage() {
  const [reminders, setReminders] = useState<ReminderRecord[]>([]);
  const [pushState, setPushState] = useState<NotificationState>("unsupported");
  const [pushMessage, setPushMessage] = useState("");
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      const loaded = loadReminders();
      if (cancelled) return;
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
          title="Bakım ve vergi tarihlerinizi ayrı ayrı yönetin"
          description="MTV, sigorta, muayene ve bakım tarihlerini araç bazında takip edin. Bu ekranlar yalnızca cihazınızda saklanır, hesaba kaydedilmez."
          tone="accent"
        />

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link
            href="/bakim-odeme-takvimi/bakim"
            className="flex items-center justify-between gap-3 rounded-theme border border-border bg-card p-5 shadow-sm transition hover:border-accent"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <Wrench aria-hidden="true" className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold text-foreground">Bakım</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">Bakım, muayene, lastik ve akü</span>
              </span>
            </span>
            <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0 text-muted-foreground" />
          </Link>
          <Link
            href="/bakim-odeme-takvimi/vergi"
            className="flex items-center justify-between gap-3 rounded-theme border border-border bg-card p-5 shadow-sm transition hover:border-accent"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <ShieldCheck aria-hidden="true" className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold text-foreground">Vergi ve Ödeme</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">MTV, trafik sigortası, kasko</span>
              </span>
            </span>
            <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0 text-muted-foreground" />
          </Link>
        </div>

        <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Bell aria-hidden="true" className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold text-foreground">Bildirimler</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Açarsanız, bir tarihe 30 gün ve 15 gün kala telefonunuza bildirim gönderilir (uygulama kapalıyken de). Bu
            ayar bakım ve vergi tarihlerinin tümü için geçerlidir.
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
      </div>
    </AppShell>
  );
}
