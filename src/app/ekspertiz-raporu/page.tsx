"use client";

import { useMemo, useState } from "react";
import { FileSearch, Upload } from "lucide-react";

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
  const [fileNames, setFileNames] = useState<string[]>([]);

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
          <h1 className="mt-2 text-3xl font-semibold">Ekspertiz raporunu kontrol notuna çevir</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            PDF veya rapor fotoğrafını seçebilir, rapordaki metni de yapıştırabilirsiniz. İlk sürümde kritik ifadeler
            kural tabanlı olarak öne çıkarılır.
          </p>
        </section>
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="grid min-h-28 cursor-pointer place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
            <Upload aria-hidden="true" className="h-8 w-8 text-teal-700" />
            <span className="mt-2 text-sm font-semibold text-slate-950">Ekspertiz raporu veya fotoğraf seç</span>
            <span className="mt-1 text-xs leading-5 text-slate-600">
              PDF/JPG/PNG dosyası seçebilirsiniz. Dosya bu MVP&apos;de kalıcı hesaba kaydedilmez.
            </span>
            <input
              type="file"
              accept="application/pdf,image/*"
              multiple
              className="sr-only"
              onChange={(event) => {
                const selectedFiles = Array.from(event.currentTarget.files ?? []).slice(0, 6);
                setFileNames(selectedFiles.map((file) => file.name));
              }}
            />
          </label>
          {fileNames.length ? (
            <div className="mt-3 rounded-xl border border-teal-200 bg-teal-50 p-3">
              <p className="text-sm font-semibold text-teal-950">{fileNames.length} dosya seçildi.</p>
              <p className="mt-1 text-sm leading-6 text-teal-900">
                Otomatik OCR henüz sınırlı olduğu için rapordaki önemli metni aşağıdaki alana yapıştırmanız analizi
                netleştirir.
              </p>
              <ul className="mt-2 grid gap-1 text-xs text-teal-900">
                {fileNames.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>
          ) : null}
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
