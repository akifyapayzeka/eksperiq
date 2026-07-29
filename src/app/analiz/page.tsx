import { AnalysisForm } from "@/components/forms/analysis-form";

export default function AnalysisPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-950">Araç ilanı analizi</h1>
          <p className="mt-2 max-w-2xl leading-7 text-slate-700">
            Bilgileri bildiğiniz kadarıyla doldurun. Eksik alanlar da raporda satıcıdan istenecek bilgiler olarak
            değerlendirilir.
          </p>
        </div>
        <AnalysisForm />
      </div>
    </main>
  );
}
