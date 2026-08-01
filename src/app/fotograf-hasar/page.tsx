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
const isPhotoAiEnabled = process.env.NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED === "true";

type DamageFinding = {
  area: string;
  finding: string;
  confidence: string;
  note: string;
};

type AiPhotoFinding = {
  id: string;
  area: string;
  signal: string;
  confidence: "low" | "medium" | "high";
  explanation: string;
  recommendation: string;
};

type AiPhotoAnalysis = {
  isVehiclePhoto: boolean;
  summary: string;
  findings: AiPhotoFinding[];
  disclaimer: string;
};

export default function PhotoDamagePage() {
  const [area, setArea] = useState("");
  const [finding, setFinding] = useState("");
  const [confidence, setConfidence] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState<DamageFinding[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [fileCount, setFileCount] = useState(0);
  const [isVehiclePhoto, setIsVehiclePhoto] = useState<"" | "yes" | "no">("");
  const [formMessage, setFormMessage] = useState("");
  const [aiStatus, setAiStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [aiMessage, setAiMessage] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<AiPhotoAnalysis | null>(null);
  const canRunAi = isPhotoAiEnabled && Boolean(files.length) && isVehiclePhoto !== "no" && aiStatus !== "loading";

  const priority = useMemo(() => {
    if (items.some((item) => item.confidence === "Yüksek olasılık")) return "Ekspertizde öncelikli kontrol edilmeli";
    if (items.length) return "Fotoğraflar ekspertiz öncesi notlandı";
    return "Henüz bulgu eklenmedi";
  }, [items]);

  function addFinding() {
    if (!fileCount) {
      setFormMessage("Önce araç fotoğrafı seçin. Araç dışı görseller için hasar raporu oluşturmayın.");
      return;
    }

    if (isVehiclePhoto !== "yes") {
      setFormMessage("Bu ekran yalnızca araç fotoğrafları içindir. Fotoğrafta araç görünmüyorsa bulgu eklenmez.");
      return;
    }

    if (!area || !finding || !confidence) {
      setFormMessage("Bölge, bulgu ve güven seviyesi seçmeden rapora madde eklenmez.");
      return;
    }

    setItems((current) => [...current, { area, finding, confidence, note: note.trim() }]);
    setFormMessage("Bulgu eklendi. Bu madde kesin hasar kararı değil, ekspertizde kontrol notudur.");
    setArea("");
    setFinding("");
    setConfidence("");
    setNote("");
  }

  async function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Dosya okunamadı."));
      reader.onerror = () => reject(new Error("Dosya okunamadı."));
      reader.readAsDataURL(file);
    });
  }

  async function analyzePhotosWithAi() {
    if (!files.length) {
      setAiStatus("error");
      setAiMessage("Önce araç fotoğrafı seçin. Araç görünmüyorsa bu ekranda hasar bulgusu oluşturmayın.");
      return;
    }

    if (isVehiclePhoto === "no") {
      setAiStatus("error");
      setAiMessage("Araç görünmediğini belirttiğiniz fotoğraf için AI hasar analizi çalıştırılmaz.");
      return;
    }

    if (!isPhotoAiEnabled) {
      setAiStatus("error");
      setAiMessage("AI fotoğraf kontrolü şu anda kapalı. Manuel kontrol notu ekleyebilirsiniz.");
      return;
    }

    setAiStatus("loading");
    setAiMessage("");
    setAiAnalysis(null);

    try {
      const images = await Promise.all(
        files.slice(0, 4).map(async (file) => ({
          name: file.name,
          mimeType: file.type || "image/jpeg",
          dataUrl: await fileToDataUrl(file),
        })),
      );

      const response = await fetch("/api/ai/photo-damage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          images,
          userNote: note,
        }),
      });

      const payload = (await response.json()) as { analysis?: AiPhotoAnalysis; error?: string; remaining?: number };
      if (!response.ok || !payload.analysis) {
        setAiStatus("error");
        setAiMessage(formatAiError(payload.error, response.status));
        return;
      }

      setAiAnalysis(payload.analysis);
      setAiStatus("ready");
      setAiMessage(
        payload.analysis.isVehiclePhoto
          ? `AI fotoğraf kontrolü tamamlandı.${typeof payload.remaining === "number" ? ` Bugün kalan hak: ${payload.remaining}` : ""}`
          : "AI bu görselde araç veya araç parçası güvenle tespit edemedi. Hasar bulgusu oluşturulmadı.",
      );
    } catch {
      setAiStatus("error");
      setAiMessage(
        "AI fotoğraf kontrolüne şu anda ulaşılamadı. Fotoğrafınız kaybolmadı; manuel bulgu ekleyebilir veya biraz sonra tekrar deneyebilirsiniz.",
      );
    }
  }

  function formatAiError(error: string | undefined, status: number) {
    if (status === 429) {
      return error?.includes("limit")
        ? "Bugünkü AI fotoğraf kontrol hakkı doldu. Manuel bulgu ekleyerek devam edebilirsiniz."
        : "AI fotoğraf kontrolü şu anda kapalı. Manuel bulgu ekleyerek devam edebilirsiniz.";
    }

    if (status === 400) {
      return "Fotoğraf işlenemedi. Lütfen araç görünen JPG/PNG fotoğraf seçin veya manuel bulgu ekleyin.";
    }

    if (error?.toLocaleLowerCase("tr-TR").includes("openrouter")) {
      return "AI servisinden şu anda güvenilir yanıt alınamadı. Manuel bulgu ekleyerek rapora devam edebilirsiniz.";
    }

    return "AI fotoğraf analizi şu anda tamamlanamadı. Manuel bulgu ekleyerek devam edebilirsiniz.";
  }

  function confidenceLabel(value: AiPhotoFinding["confidence"]) {
    if (value === "high") return "Yüksek güven";
    if (value === "medium") return "Orta güven";
    return "Düşük güven";
  }

  return (
    <main className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
          <Camera aria-hidden="true" className="h-9 w-9 text-teal-200" />
          <p className="mt-5 text-sm font-semibold text-teal-200">Fotoğraftan Hasar Analizi</p>
          <h1 className="mt-2 text-3xl font-semibold">Fotoğrafları inceleme notuna çevir</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Fotoğrafta araç görünüyorsa AI destekli ön kontrol isteyebilir veya gördüğünüz olası bulguları manuel seçip
            ekspertize götürülecek kısa bir kontrol listesi oluşturabilirsiniz.
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
              onChange={(event) => {
                const selectedFiles = Array.from(event.currentTarget.files ?? []).slice(0, 4);
                setFiles(selectedFiles);
                setFileCount(selectedFiles.length);
                setIsVehiclePhoto("");
                setFormMessage("");
                setItems([]);
                setAiStatus("idle");
                setAiMessage("");
                setAiAnalysis(null);
              }}
            />
          </label>
          {fileCount ? (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm font-semibold text-amber-950">{fileCount} fotoğraf seçildi.</p>
              <p className="mt-1 text-sm leading-6 text-amber-900">
                Devam etmeden önce fotoğrafta araç göründüğünü doğrulayın. Araç dışı görseller analiz notuna çevrilmez.
              </p>
            </div>
          ) : null}
        </section>

        <section className="mt-5 rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Camera aria-hidden="true" className="h-5 w-5 text-teal-700" />
            <h2 className="text-xl font-semibold text-slate-950">AI fotoğraf kontrolü</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Seçtiğiniz araç fotoğrafı görüntü anlayan AI modeline gönderilir. Araç görünmüyorsa AI hasar bulgusu
            üretmemelidir.
          </p>
          {!isPhotoAiEnabled ? (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-950">
              Canlı AI fotoğraf kontrolü şu anda kapalı. Bu ekranda manuel kontrol notu oluşturabilirsiniz.
            </p>
          ) : null}
          <button
            type="button"
            onClick={analyzePhotosWithAi}
            disabled={!canRunAi}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-teal-700 px-5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {aiStatus === "loading" ? "AI inceliyor" : "AI ile fotoğrafı analiz et"}
          </button>
          {files.length && isVehiclePhoto === "no" ? (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-950">
              Araç görünmüyor seçildiği için AI hasar analizi kapatıldı. Araç fotoğrafı seçip “araç görünüyor”
              seçeneğini işaretleyerek tekrar deneyebilirsiniz.
            </p>
          ) : null}
          {aiMessage ? (
            <p
              className={`mt-3 rounded-xl px-3 py-2 text-sm font-medium ${
                aiStatus === "error" ? "bg-red-50 text-red-700" : "bg-teal-50 text-teal-900"
              }`}
              role="status"
            >
              {aiMessage}
            </p>
          ) : null}
          {aiAnalysis ? (
            <div className="mt-4 grid gap-3">
              <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {aiAnalysis.summary}
              </p>
              {aiAnalysis.findings.length ? (
                aiAnalysis.findings.map((item) => (
                  <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase text-teal-800">{confidenceLabel(item.confidence)}</p>
                    <h3 className="mt-1 font-semibold text-slate-950">
                      {item.area}: {item.signal}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.explanation}</p>
                    <p className="mt-2 text-sm font-medium text-slate-800">{item.recommendation}</p>
                  </article>
                ))
              ) : (
                <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  AI bu fotoğraf için hasar bulgusu üretmedi.
                </p>
              )}
              <p className="text-xs leading-5 text-slate-500">{aiAnalysis.disclaimer}</p>
            </div>
          ) : null}
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Olası bulgu ekle</h2>
          <fieldset className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <legend className="px-1 text-sm font-semibold text-slate-950">Fotoğraf doğrulaması</legend>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium text-slate-800">
              <input
                type="radio"
                name="vehicle-photo"
                checked={isVehiclePhoto === "yes"}
                onChange={() => {
                  setIsVehiclePhoto("yes");
                  setFormMessage("");
                }}
                className="h-5 w-5 accent-teal-700"
              />
              Fotoğrafta araç veya araç parçası görünüyor
            </label>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium text-slate-800">
              <input
                type="radio"
                name="vehicle-photo"
                checked={isVehiclePhoto === "no"}
                onChange={() => {
                  setIsVehiclePhoto("no");
                  setItems([]);
                  setFormMessage("Araç görünmeyen fotoğraflar için hasar bulgusu oluşturulmaz.");
                }}
                className="h-5 w-5 accent-red-600"
              />
              Araç görünmüyor veya emin değilim
            </label>
          </fieldset>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="grid gap-2 text-sm font-medium text-slate-800">
              Bölge
              <select
                value={area}
                onChange={(event) => setArea(event.target.value)}
                className="min-h-12 rounded-xl border border-slate-300 px-3"
              >
                <option value="">Bölge seçin</option>
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
                <option value="">Bulgu seçin</option>
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
                <option value="">Güven seviyesi seçin</option>
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
            disabled={!fileCount || isVehiclePhoto !== "yes"}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-slate-950 px-5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Bulguyu ekle
          </button>
          {formMessage ? (
            <p
              className={`mt-3 rounded-xl px-3 py-2 text-sm font-medium ${
                formMessage.includes("eklendi") ? "bg-teal-50 text-teal-900" : "bg-amber-50 text-amber-950"
              }`}
              role="status"
            >
              {formMessage}
            </p>
          ) : null}
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
