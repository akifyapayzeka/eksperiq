import { ScanSearch } from "lucide-react";
import { AnalysisForm } from "@/components/forms/analysis-form";
import { AppShell } from "@/components/layout/app-shell";
import { HeroCard } from "@/components/cards/hero-card";

export default function AnalysisPage() {
  return (
    <AppShell>
      <div className="pt-6">
        <HeroCard
          icon={ScanSearch}
          title="Yeni araç analizi"
          description="Almak istediğiniz araç için bilgileri seçin veya yazın. Eksik alanlar raporda satıcıdan istenecek bilgiler olarak değerlendirilir."
        />
      </div>
      <div className="mt-5">
        <AnalysisForm />
      </div>
    </AppShell>
  );
}
