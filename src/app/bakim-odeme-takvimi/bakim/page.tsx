"use client";

import { Wrench } from "lucide-react";
import { ReminderCalendarScreen } from "@/components/reminders/reminder-calendar-screen";
import { MAINTENANCE_CATEGORIES } from "@/lib/reminders/types";

export default function MaintenanceCalendarPage() {
  return (
    <ReminderCalendarScreen
      icon={Wrench}
      eyebrow="Bakım Takvimi"
      title="Bakım, muayene, lastik ve akü tarihlerini takip edin"
      description="Bu ekran yalnızca cihazınızda saklanır, hesaba kaydedilmez."
      categories={MAINTENANCE_CATEGORIES}
      backHref="/bakim-odeme-takvimi"
      backLabel="Bakım ve Ödeme Takvimi"
    />
  );
}
