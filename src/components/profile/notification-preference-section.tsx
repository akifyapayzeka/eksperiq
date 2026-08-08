"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { loadReminders } from "@/lib/storage/reminders-storage";
import {
  disableNotifications,
  enableNotifications,
  getNotificationState,
  type NotificationState,
} from "@/lib/push/notifications";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui/skeleton";

const STATE_COPY: Record<NotificationState, { title: string; description: string }> = {
  unsupported: {
    title: "Bu cihazda desteklenmiyor",
    description: "Tarayıcınız veya cihazınız bildirim iznini desteklemiyor.",
  },
  "not-configured": {
    title: "Bildirimler şu an kapalı",
    description: "Sunucu tarafı bildirim yapılandırması henüz aktif değil.",
  },
  denied: {
    title: "Bildirim izni reddedildi",
    description: "Bildirimleri açmak için cihaz ayarlarından izin vermeniz gerekir.",
  },
  unsubscribed: {
    title: "Hatırlatma bildirimleri kapalı",
    description: "Yaklaşan bakım ve ödeme hatırlatmaları için bildirim açabilirsiniz.",
  },
  subscribed: {
    title: "Hatırlatma bildirimleri açık",
    description: "Yaklaşan hatırlatmalar için bildirim alacaksınız.",
  },
};

/**
 * Thin UI wiring over the existing src/lib/push notification lib
 * (getNotificationState/enableNotifications/disableNotifications) — no new
 * business logic, just the profile-page control that was missing one.
 */
export function NotificationPreferenceSection() {
  const [isReady, setIsReady] = useState(false);
  const [state, setState] = useState<NotificationState>("unsubscribed");
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void getNotificationState().then((next) => {
        setState(next);
        setIsReady(true);
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  async function toggle() {
    setIsBusy(true);
    setMessage(null);
    try {
      if (state === "subscribed") {
        const result = await disableNotifications(loadReminders());
        setState("unsubscribed");
        setMessage(
          result.serverDeleted ? "Bildirimler kapatıldı." : "Bildirimler kapatıldı; sunucu kaydı gecikmeli silinecek.",
        );
      } else {
        const result = await enableNotifications(loadReminders());
        if (result.ok) {
          setState("subscribed");
          setMessage("Bildirimler açıldı.");
        } else {
          setMessage(result.error ?? "Bildirim izni alınamadı.");
        }
      }
    } finally {
      setIsBusy(false);
    }
  }

  const copy = STATE_COPY[state];
  const canToggle = state === "subscribed" || state === "unsubscribed";

  return (
    <section className="rounded-theme border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          {state === "subscribed" ? (
            <Bell aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.8} />
          ) : (
            <BellOff aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.8} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-heading font-bold text-foreground">Bildirim Tercihleri</h2>
          {!isReady ? (
            <LoadingSkeleton rows={1} className="mt-2 [&>div]:p-0 [&>div]:border-0 [&>div]:shadow-none" />
          ) : (
            <>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{copy.description}</p>
              {canToggle ? (
                state === "subscribed" ? (
                  <SecondaryButton onClick={toggle} disabled={isBusy} className="mt-3">
                    Bildirimleri kapat
                  </SecondaryButton>
                ) : (
                  <PrimaryButton onClick={toggle} disabled={isBusy} className="mt-3">
                    Bildirimleri aç
                  </PrimaryButton>
                )
              ) : null}
              {message ? (
                <p className="mt-2 text-sm text-accent" role="status">
                  {message}
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
