"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BellOff,
  BookOpenCheck,
  CarFront,
  ClipboardPaste,
  MapPinned,
  ScanSearch,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { appConfig } from "@/lib/constants/app";
import { loadVehicles } from "@/lib/storage/vehicle-storage";
import { loadReminders } from "@/lib/storage/reminders-storage";
import {
  disableNotifications,
  enableNotifications,
  getNotificationState,
  type NotificationState,
} from "@/lib/push/notifications";
import { sortByUrgency, daysUntil, urgencyOf } from "@/lib/reminders/model";
import { reminderCategoryLabels, TAX_CATEGORIES } from "@/lib/reminders/types";
import type { ReminderRecord } from "@/lib/reminders/types";
import { VEHICLE_FUEL_LABELS, VEHICLE_TRANSMISSION_LABELS, type VehicleProfile } from "@/lib/vehicles/types";
import { AppShell } from "@/components/layout/app-shell";
import { SectionHeader } from "@/components/layout/section-header";
import { HeroCard } from "@/components/cards/hero-card";
import { VehicleCard } from "@/components/cards/vehicle-card";
import { ReminderCard } from "@/components/cards/reminder-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton } from "@/components/ui/skeleton";
import { DisclaimerCard } from "@/components/ui/alert";
import { IconButton, PrimaryButton } from "@/components/ui/button";

const MAX_LIST_ITEMS = 4;

function homeVehicleSpec(vehicle: VehicleProfile): string {
  return [
    vehicle.brand,
    vehicle.model,
    vehicle.engineSize,
    vehicle.trim,
    vehicle.modelYear ? String(vehicle.modelYear) : null,
    vehicle.fuel ? VEHICLE_FUEL_LABELS[vehicle.fuel] : null,
    vehicle.transmission ? VEHICLE_TRANSMISSION_LABELS[vehicle.transmission] : null,
  ]
    .filter(Boolean)
    .join(" ");
}

function ReminderList({
  items,
  emptyIcon,
  emptyTitle,
  emptyDescription,
}: {
  items: ReminderRecord[];
  emptyIcon: typeof Bell;
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (!items.length) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />;
  }
  return (
    <div className="overflow-hidden rounded-theme border border-border bg-card shadow-sm">
      {items.map((reminder) => {
        const days = daysUntil(reminder.dueDate);
        return (
          <ReminderCard
            key={reminder.id}
            title={reminder.title || reminderCategoryLabels[reminder.category]}
            subtitle={reminderCategoryLabels[reminder.category]}
            days={days}
            urgency={urgencyOf(days)}
          />
        );
      })}
    </div>
  );
}

export default function Home() {
  const [isReady, setIsReady] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleProfile[]>([]);
  const [reminders, setReminders] = useState<ReminderRecord[]>([]);
  const [notificationState, setNotificationState] = useState<NotificationState>("unsubscribed");
  const [notificationBusy, setNotificationBusy] = useState(false);
  const [notificationToast, setNotificationToast] = useState<{ text: string; nonce: number } | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setVehicles(loadVehicles());

      const sorted = sortByUrgency(loadReminders());
      setReminders(sorted);

      void getNotificationState().then(setNotificationState);

      setIsReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!notificationToast) return;
    const timer = window.setTimeout(() => setNotificationToast(null), 2000);
    return () => window.clearTimeout(timer);
  }, [notificationToast]);

  async function toggleNotifications() {
    if (notificationBusy) return;
    setNotificationBusy(true);
    try {
      if (notificationState === "subscribed") {
        await disableNotifications(loadReminders());
        setNotificationState("unsubscribed");
        setNotificationToast((current) => ({ text: "Bildirimler kapalı", nonce: (current?.nonce ?? 0) + 1 }));
      } else {
        const result = await enableNotifications(loadReminders());
        if (result.ok) {
          setNotificationState("subscribed");
          setNotificationToast((current) => ({ text: "Bildirimler açık", nonce: (current?.nonce ?? 0) + 1 }));
        } else {
          setNotificationToast((current) => ({
            text: result.error ?? "Bildirim izni alınamadı",
            nonce: (current?.nonce ?? 0) + 1,
          }));
        }
      }
    } finally {
      setNotificationBusy(false);
    }
  }

  const maintenanceReminders = reminders
    .filter((reminder) => !TAX_CATEGORIES.has(reminder.category))
    .slice(0, MAX_LIST_ITEMS);
  const taxReminders = reminders.filter((reminder) => TAX_CATEGORIES.has(reminder.category)).slice(0, MAX_LIST_ITEMS);
  const vehicleHeaderSpec = vehicles[0] ? homeVehicleSpec(vehicles[0]) : "";

  return (
    <AppShell>
      <header className="flex items-center justify-between gap-4 px-1 pb-6 pt-8">
        <div>
          <p className="text-sm text-muted-foreground">Araç karar asistanın</p>
          <h1 className="mt-1 font-heading text-[26px] font-bold tracking-tight text-foreground sm:text-3xl">
            Aracınız için bugün ne yapalım?
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Hidden on mobile: the bottom tab bar's "Profil" tab already covers this. */}
          <IconButton icon={UserRound} label="Profili aç" href="/profil" className="hidden sm:flex" />
          <IconButton
            icon={notificationState === "subscribed" ? Bell : BellOff}
            label={notificationState === "subscribed" ? "Bildirimleri kapat" : "Bildirimleri aç"}
            onClick={toggleNotifications}
            disabled={notificationBusy}
          />
        </div>
      </header>

      {notificationToast ? (
        <div
          key={notificationToast.nonce}
          role="status"
          className="animate-toast-pop pointer-events-none fixed inset-x-0 top-16 z-40 flex justify-center px-4"
        >
          <p className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg">
            {notificationToast.text}
          </p>
        </div>
      ) : null}

      <HeroCard
        icon={ScanSearch}
        title="Yeni analiz oluştur"
        description="Satın almayı düşündüğünüz bir ilanı mı, yoksa kendi aracınızı mı analiz edeceksiniz? Devam edin, seçenekleri gösterelim."
        action={
          <PrimaryButton
            href="/analiz"
            className="flex w-full items-center justify-between bg-card px-4 py-3.5 text-left text-card-foreground hover:opacity-100"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <ClipboardPaste aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <span className="text-sm font-semibold">Yeni analiz oluştur</span>
            </span>
          </PrimaryButton>
        }
      />

      <section className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link href="/satin-alma-rehberi" className="rounded-theme border border-accent/25 bg-accent/5 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-accent/10 text-accent">
              <BookOpenCheck aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-semibold text-foreground">Satın alma rehberi</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                İlan, satıcı, ekspertiz, masraf, test sürüşü ve noter adımlarını sırayla görün.
              </p>
            </div>
          </div>
        </Link>
        <Link
          href="/yakinimdaki-hizmetler?kategori=ekspertiz"
          className="rounded-theme border border-success/25 bg-success/5 p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-success/10 text-success">
              <MapPinned aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-semibold text-foreground">Ekspertiz / noter / servis bul</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Araç neredeyse o şehirde kontrol noktası bulun, yol tarifiyle gidin.
              </p>
            </div>
          </div>
        </Link>
      </section>

      <section className="mt-7">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h2 className="font-heading text-lg font-bold text-foreground">Aracım</h2>
              {vehicleHeaderSpec ? (
                <span className="truncate text-sm font-normal text-muted-foreground">{vehicleHeaderSpec}</span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Kayıtlı tüm araçlar</p>
          </div>
          <div className="shrink-0 text-sm font-semibold text-accent">
            <Link href="/arac-saglik-karnesi">Garajı aç</Link>
          </div>
        </div>
        {!isReady ? (
          <LoadingSkeleton />
        ) : vehicles.length ? (
          <div className="grid gap-3">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CarFront}
            title="Henüz araç eklenmedi"
            description="Garajına araç ekleyerek bakım, vergi ve gider kayıtlarını takip et."
            action={<PrimaryButton href="/arac-saglik-karnesi">Araç ekle</PrimaryButton>}
          />
        )}
      </section>

      <section className="mt-7">
        <SectionHeader
          title="Yaklaşan bakım"
          description="Muayene, bakım, lastik ve akü hatırlatmaları"
          action={<Link href="/bakim-odeme-takvimi/bakim">Tümü</Link>}
        />
        {!isReady ? (
          <LoadingSkeleton />
        ) : (
          <ReminderList
            items={maintenanceReminders}
            emptyIcon={Bell}
            emptyTitle="Yaklaşan bakım yok"
            emptyDescription="Bakım takvimine hatırlatma ekleyebilirsin."
          />
        )}
      </section>

      <section className="mt-7">
        <SectionHeader
          title="Yaklaşan vergi ve ödemeler"
          description="MTV, trafik sigortası ve kasko"
          action={<Link href="/bakim-odeme-takvimi/vergi">Tümü</Link>}
        />
        {!isReady ? (
          <LoadingSkeleton />
        ) : (
          <ReminderList
            items={taxReminders}
            emptyIcon={Bell}
            emptyTitle="Yaklaşan vergi/ödeme yok"
            emptyDescription="Ödeme takvimine hatırlatma ekleyebilirsin."
          />
        )}
      </section>

      <div className="mt-7">
        <DisclaimerCard>
          <p className="flex items-start gap-2">
            <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            EksperIQ kesin hüküm vermez; olası risk sinyallerini ve güven seviyesini gösterir. {appConfig.privacy}
          </p>
        </DisclaimerCard>
      </div>
    </AppShell>
  );
}
