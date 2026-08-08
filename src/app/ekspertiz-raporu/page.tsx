"use client";

import { useMemo, useState } from "react";
import { FileSearch, Upload } from "lucide-react";
import { HeroCard } from "@/components/cards/hero-card";
import { AppShell } from "@/components/layout/app-shell";

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
    <AppShell>
      <div className="max-w-3xl pt-6">
        <HeroCard
          icon={FileSearch}
          eyebrow="Ekspertiz Raporu Analizi"
          title="Ekspertiz raporunu kontrol notuna çevir"
          description="PDF veya rapor fotoğrafını seçebilir, rapordaki metni de yapıştırabilirsiniz. İlk sürümde kritik ifadeler kural tabanlı olarak öne çıkarılır."
        />
        <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
          <label className="grid min-h-28 cursor-pointer place-items-center rounded-theme border border-dashed border-border bg-muted p-4 text-center">
            <Upload aria-hidden="true" className="h-8 w-8 text-accent" />
            <span className="mt-2 text-sm font-semibold text-foreground">Ekspertiz raporu veya fotoğraf seç</span>
            <span className="mt-1 text-xs leading-5 text-muted-foreground">
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
            <div className="mt-3 rounded-theme-sm border border-accent/25 bg-accent/10 p-3">
              <p className="text-sm font-semibold text-foreground">{fileNames.length} dosya seçildi.</p>
              <p className="mt-1 text-sm leading-6 text-foreground/90">
                Otomatik OCR henüz sınırlı olduğu için rapordaki önemli metni aşağıdaki alana yapıştırmanız analizi
                netleştirir.
              </p>
              <ul className="mt-2 grid gap-1 text-xs text-foreground/90">
                {fileNames.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
        <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
          <label className="grid gap-2 text-sm font-medium text-foreground/90">
            Ekspertiz raporu metni
            <textarea
              value={reportText}
              onChange={(event) => setReportText(event.target.value)}
              className="min-h-48 rounded-theme-sm border border-border px-3 py-3"
              placeholder="Rapordaki boya, değişen, mekanik ve elektronik bulguları buraya yapıştırın."
            />
          </label>
        </section>
        <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">Öne çıkan maddeler</h2>
          <div className="mt-4 grid gap-3">
            {findings.length ? (
              findings.map((item) => (
                <p
                  key={item}
                  className="rounded-theme-sm border border-warning/30 bg-warning/10 p-4 text-sm leading-6 text-foreground"
                >
                  {item}
                </p>
              ))
            ) : (
              <p className="rounded-theme-sm bg-muted p-4 text-sm text-muted-foreground">
                Kritik anahtar ifade yakalanmadı. Bu, raporun temiz olduğu anlamına gelmez; tüm maddeleri ekspertiz
                firmasıyla doğrulayın.
              </p>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
