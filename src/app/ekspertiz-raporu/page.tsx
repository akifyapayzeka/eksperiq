"use client";

import { useMemo, useState } from "react";
import { FileSearch } from "lucide-react";

const riskKeywords = [
  ["şasi", "Şasi/podye ifadesi var; ekspertizde özellikle doğrulanmalı."],
  ["podye", "Podye ifadesi var; yapısal işlem riski ayrıca kontrol edilmeli."],
  ["airbag", "Airbag ifadesi var; emniyet sistemi arıza taraması istenmeli."],
  ["değişen", "Değişen parça ifadesi var; hangi parçalar olduğu netleştirilmeli."],
  ["boyalı", "Boyalı parça ifadesi var; boya kalınlığı ve işlem sebebi sorulmalı."],
  ["yağ kaçağı", "Yağ kaçağı ifadesi var; motor/şanzıman kontrolü öncelikli olmalı."],
];

export default function ExpertiseReportPage() {
  const [reportText, setReportText] = useState("");

  const findings = useMemo(() => {
    const normalized = reportText.toLocaleLowerCase("tr-TR");
    return riskKeywords.filter(([keyword]) => normalized.includes(keyword)).map(([, message]) => message);
  }, [reportText]);

  return (
    <main className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
          <FileSearch aria-hidden="true" className="h-9 w-9 text-teal-200" />
          <p className="mt-5 text-sm font-semibold text-teal-200">Ekspertiz Raporu Analizi</p>
          <h1 className="mt-2 text-3xl font-semibold">Rapor metnindeki kritik ifadeleri yakala</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            PDF okuma henüz eklenmedi. Rapor metnini yapıştırın; sistem kritik ifadeleri kural tabanlı olarak öne
            çıkarır.
          </p>
        </section>
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="grid gap-2 text-sm font-medium text-slate-800">
            Ekspertiz raporu metni
            <textarea
              value={reportText}
              onChange={(event) => setReportText(event.target.value)}
              className="min-h-48 rounded-xl border border-slate-300 px-3 py-3"
              placeholder="Rapordaki boya, değişen, mekanik ve elektronik bulguları buraya yapıştırın."
            />
          </label>
        </section>
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Öne çıkan maddeler</h2>
          <div className="mt-4 grid gap-3">
            {findings.length ? (
              findings.map((item) => (
                <p
                  key={item}
                  className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"
                >
                  {item}
                </p>
              ))
            ) : (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                Kritik anahtar ifade yakalanmadı. Bu, raporun temiz olduğu anlamına gelmez; tüm maddeleri ekspertiz
                firmasıyla doğrulayın.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
