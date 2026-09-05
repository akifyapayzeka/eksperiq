"use client";

import { useEffect, useRef, useState } from "react";
import { Download, HardDrive, Trash2, Upload } from "lucide-react";
import { deleteAllLocalData } from "@/lib/data-management/delete-all";
import { exportDataAsJson, importDataFromJson } from "@/lib/data-management/export-import";
import { formatBytes, getStorageUsageSummary } from "@/lib/data-management/storage-usage";
import type { StorageUsageSummary } from "@/lib/data-management/storage-usage";

/**
 * Bu bölüm uzun süre kodda vardı ama hiçbir ekrana bağlı değildi:
 * `deleteAllLocalData`, `exportDataAsJson`, `importDataFromJson` ve
 * `getStorageUsageSummary` yazılmış, test edilmiş, sonra onları çağıran
 * bileşen silinmişti. Yani kullanıcının verisini toptan silmesinin ya da
 * dışa aktarmasının hiçbir yolu yoktu.
 */

const CONFIRM_PHRASE = "SİL";

export function DataManagementSection() {
  const [usage, setUsage] = useState<StorageUsageSummary | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void getStorageUsageSummary()
        .then(setUsage)
        .catch(() => setUsage(null));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function downloadExport() {
    try {
      const json = exportDataAsJson();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `eksperiq-verilerim-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage("Verileriniz JSON dosyası olarak indirildi.");
    } catch {
      setMessage("Dışa aktarma tamamlanamadı. Cihazınızda yer olduğundan emin olup tekrar deneyin.");
    }
  }

  async function importFromFile(file: File) {
    const raw = await file.text().catch(() => null);
    if (raw === null) {
      setMessage("Dosya okunamadı.");
      return;
    }
    const result = importDataFromJson(raw);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setMessage(`${result.importedKeys.length} veri grubu içe aktarıldı. Değişiklikleri görmek için sayfayı yenileyin.`);
    void getStorageUsageSummary()
      .then(setUsage)
      .catch(() => undefined);
  }

  /**
   * Cihazdaki silme her koşulda yapılır ve başarılıdır; `serverDeleted` ise
   * sunucudaki push kaydının gerçekten silindiğinin doğrulanıp
   * doğrulanmadığını söyler. Doğrulanmadıysa bunu kullanıcıya söylüyoruz —
   * garanti edemediğimiz bir şeyi "silindi" diye sunmuyoruz.
   */
  async function deleteEverything() {
    setIsDeleting(true);
    setMessage("");
    const { serverDeleted } = await deleteAllLocalData();
    setIsDeleting(false);
    setConfirmText("");
    setUsage(await getStorageUsageSummary().catch(() => null));
    setMessage(
      serverDeleted
        ? "Tüm verileriniz bu cihazdan silindi."
        : "Verileriniz bu cihazdan silindi. Sunucudaki bildirim kaydı şu anda silinemedi; en geç 90 gün içinde kendiliğinden silinir.",
    );
  }

  return (
    <section className="mt-4 rounded-theme border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <HardDrive aria-hidden="true" className="h-5 w-5 text-accent" />
        <h2 className="text-xl font-semibold text-foreground">Verilerim</h2>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Analizler, araçlar, hatırlatmalar ve fotoğraf kayıtları yalnızca bu cihazda saklanır. Buradan yedek alabilir,
        yedeği geri yükleyebilir veya hepsini kalıcı olarak silebilirsiniz.
      </p>

      {usage ? (
        <p className="mt-3 rounded-theme-sm bg-muted p-3 text-sm text-foreground/80">
          Bu cihazda kullanılan alan: <strong className="text-foreground">{formatBytes(usage.totalLocalBytes)}</strong>
          {usage.usageBytes !== null ? <> (fotoğraflar dahil toplam {formatBytes(usage.usageBytes)})</> : null}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={downloadExport}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-foreground/90 transition hover:border-accent"
        >
          <Download aria-hidden="true" className="h-4 w-4" />
          Verilerimi dışa aktar
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-foreground/90 transition hover:border-accent"
        >
          <Upload aria-hidden="true" className="h-4 w-4" />
          Yedeği geri yükle
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          aria-label="Yedek dosyası seç"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void importFromFile(file);
          }}
        />
      </div>

      <div className="mt-5 rounded-theme-sm border border-destructive/30 bg-destructive/5 p-4">
        <p className="text-sm font-semibold text-foreground">Tüm verilerimi sil</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Analizler, araçlar, hatırlatmalar, giderler ve fotoğraf kayıtları kalıcı olarak silinir. Bu işlem geri
          alınamaz. Devam etmek için aşağıya <strong className="text-foreground">{CONFIRM_PHRASE}</strong> yazın.
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          App Store aboneliğiniz bundan etkilenmez; aboneliği iptal etmek için App Store &gt; Abonelikler ekranını
          kullanın.
        </p>
        <label className="mt-3 grid gap-2 text-sm font-medium text-foreground/90">
          Onay
          <input
            type="text"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            className="min-h-11 rounded-theme-sm border border-border bg-input px-3 text-foreground shadow-sm focus:border-accent focus:ring-4 focus:ring-accent/15"
          />
        </label>
        <button
          type="button"
          onClick={() => void deleteEverything()}
          disabled={confirmText.trim() !== CONFIRM_PHRASE || isDeleting}
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-destructive px-4 text-sm font-semibold text-destructive-foreground transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
          {isDeleting ? "Siliniyor…" : "Tüm verilerimi sil"}
        </button>
      </div>

      {message ? (
        <p
          role="status"
          className="mt-4 rounded-theme-sm border border-border bg-muted p-3 text-sm font-medium text-foreground"
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}
