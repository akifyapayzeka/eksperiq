"use client";

import { ShieldCheck } from "lucide-react";
import { ReminderCalendarScreen } from "@/components/reminders/reminder-calendar-screen";
import { TAX_CATEGORIES } from "@/lib/reminders/types";
import type { ReminderCategory } from "@/lib/reminders/types";

const VERGI_CATEGORIES: ReminderCategory[] = Array.from(TAX_CATEGORIES);

export default function TaxPaymentCalendarPage() {
  return (
    <ReminderCalendarScreen
      icon={ShieldCheck}
      eyebrow="Vergi ve Ödeme Takvimi"
      title="MTV, trafik sigortası ve kasko tarihlerini takip edin"
      description="Tutarları siz girersiniz; güncel MTV/sigorta tutarlarını resmi kaynaktan doğrulayın. Bu ekran yalnızca cihazınızda saklanır, hesaba kaydedilmez."
      categories={VERGI_CATEGORIES}
      showMtvButton
      backHref="/bakim-odeme-takvimi"
      backLabel="Bakım ve Ödeme Takvimi"
    />
  );
}
