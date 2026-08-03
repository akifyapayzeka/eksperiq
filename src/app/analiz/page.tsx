import { CarFront } from "lucide-react";
import { AnalysisForm } from "@/components/forms/analysis-form";

export default function AnalysisPage() {
  return (
    <main className="flex-1 bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-6 rounded-3xl bg-slate-900 p-6 text-white shadow-lg shadow-slate-200 sm:p-8">
          <CarFront aria-hidden="true" className="h-9 w-9 text-teal-200" />
          <h1 className="mt-5 text-3xl font-semibold">Yeni araç analizi</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-200">
            Almak istediğiniz araç için bilgileri seçin veya yazın. Eksik alanlar raporda satıcıdan istenecek bilgiler
            olarak değerlendirilir.
          </p>
        </div>
        <AnalysisForm />
      </div>
    </main>
  );
}
