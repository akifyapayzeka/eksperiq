"use client";

import { useMemo, useState } from "react";
import { Camera, CheckCircle2, ImagePlus, ShieldAlert } from "lucide-react";

const areas = [
  "Ön tampon",
  "Arka tampon",
  "Sağ ön çamurluk",
  "Sol ön çamurluk",
  "Kapılar",
  "Kaput",
  "Bagaj kapağı",
  "Tavan",
  "Farlar",
  "Stop lambaları",
  "Jantlar",
  "Lastikler",
  "Camlar",
];

const findings = ["Çizik", "Göçük", "Boya çatlağı", "Renk farkı", "Panel hizasızlığı", "Pas", "Çatlak", "Kırık"];
const confidenceLevels = ["Düşük olasılık", "Orta olasılık", "Yüksek olasılık"];

type DamageFinding = {
  area: string;
  finding: string;
  confidence: string;
  note: string;
};

export default function PhotoDamagePage() {
  const [area, setArea] = useState(areas[0]);
  const [finding, setFinding] = useState(findings[0]);
  const [confidence, setConfidence] = useState(confidenceLevels[1]);
  const [note, setNote] = useState("");
  const [items, setItems] = useState<DamageFinding[]>([]);
  const [fileCount, setFileCount] = useState(0);

  const priority = useMemo(() => {
    if (items.some((item) => item.confidence === "Yüksek olasılık")) return "Ekspertizde öncelikli kontrol edilmeli";
    if (items.length) return "Fotoğraflar ekspertiz öncesi notlandı";
    return "Henüz bulgu eklenmedi";
  }, [items]);

  function addFinding() {
    setItems((current) => [...current, { area, finding, confidence, note: note.trim() }]);
    setNote("");
  }

  return (
    <main className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
          <Camera aria-hidden="true" className="h-9 w-9 text-teal-200" />
          <p className="mt-5 text-sm font-semibold text-teal-200">Fotoğraftan Hasar Analizi</p>
          <h1 className="mt-2 text-3xl font-semibold">Fotoğrafları inceleme notuna çevir</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Bu MVP fotoğrafları sunucuya yüklemez ve AI hasar tespiti yapmaz. Görselde gördüğünüz olası bulguları seçip
            ekspertize götürülecek kısa bir kontrol listesi üretir.
          </p>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="grid min-h-24 cursor-pointer place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
            <ImagePlus aria-hidden="true" className="h-8 w-8 text-teal-700" />
            <span className="mt-2 text-sm font-semibold text-slate-950">Fotoğraf seç</span>
            <span className="mt-1 text-xs text-slate-600">Dosyalar yalnızca bu cihazda önizleme amacıyla seçilir.</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(event) => setFileCount(event.currentTarget.files?.length ?? 0)}
            />
          </label>
          {fileCount ? (
            <p className="mt-3 rounded-xl bg-teal-50 px-3 py-2 text-sm font-medium text-teal-900" role="status">
              {fileCount} fotoğraf seçildi. Şimdi görünen olası bulguları aşağıdan işaretleyin.
            </p>
          ) : null}
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Olası bulgu ekle</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="grid gap-2 text-sm font-medium text-slate-800">
              Bölge
              <select
                value={area}
                onChange={(event) => setArea(event.target.value)}
                className="min-h-12 rounded-xl border border-slate-300 px-3"
              >
                {areas.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800">
              Bulgu
              <select
                value={finding}
                onChange={(event) => setFinding(event.target.value)}
                className="min-h-12 rounded-xl border border-slate-300 px-3"
              >
                {findings.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800">
              Güven seviyesi
              <select
                value={confidence}
                onChange={(event) => setConfidence(event.target.value)}
                className="min-h-12 rounded-xl border border-slate-300 px-3"
              >
                {confidenceLevels.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-4 grid gap-2 text-sm font-medium text-slate-800">
            Not
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="min-h-24 rounded-xl border border-slate-300 px-3 py-3"
              placeholder="Örn. sağ ön kapıda ışıkta belli olan renk farkı var."
            />
          </label>
          <button
            type="button"
            onClick={addFinding}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-slate-950 px-5 font-semibold text-white sm:w-auto"
          >
            Bulguyu ekle
          </button>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldAlert aria-hidden="true" className="h-5 w-5 text-teal-700" />
            <h2 className="text-xl font-semibold text-slate-950">Foto kontrol özeti</h2>
          </div>
          <p className="mt-2 text-sm font-medium text-slate-700">{priority}</p>
          <div className="mt-4 grid gap-3">
            {items.length ? (
              items.map((item, index) => (
                <article
                  key={`${item.area}-${item.finding}-${index}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="font-semibold text-slate-950">
                    {item.area}: {item.finding}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{item.confidence}</p>
                  {item.note ? <p className="mt-2 text-sm leading-6 text-slate-600">{item.note}</p> : null}
                </article>
              ))
            ) : (
              <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Henüz bulgu eklenmedi. Kesin hasar iddiası üretmeyin; görünen işaretleri ekspertizde doğrulatın.
              </p>
            )}
          </div>
          <p className="mt-4 flex gap-2 text-sm leading-6 text-slate-600">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
            EksperIQ fotoğrafa bakarak kesin hasar kararı vermez; yalnızca kontrol edilmesi gereken olası noktaları
            düzenler.
          </p>
        </section>
      </div>
    </main>
  );
}
