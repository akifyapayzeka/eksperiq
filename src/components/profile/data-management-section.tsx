"use client";

import { useEffect, useState } from "react";
import { Database, Download, Trash2, Upload } from "lucide-react";
import { appConfig } from "@/lib/constants/app";
import { exportDataAsJson, importDataFromJson } from "@/lib/data-management/export-import";
import { deleteAllLocalData } from "@/lib/data-management/delete-all";
import { formatBytes, getStorageUsageSummary, type StorageUsageSummary } from "@/lib/data-management/storage-usage";

const exportLabels: Record<string, string> = {
  vehicles: "Araçlar",
  reminders: "Bakım ve ödeme hatırlatmaları",
  expenses: "Gider defteri",
  healthRecords: "Araç sağlık karnesi",
  photoAnalyses: "Fotoğraf analizleri",
  comparison: "Karşılaştırma listesi",
  analysisHistory: "Analiz geçmişi",
};

// The delete-all flow reloads the page immediately after clearing local
// storage, so a plain useState result would be lost before it could render —
// this one-shot sessionStorage flag survives the reload so the (rare)
// server-deletion failure can still be shown honestly afterward.
const SERVER_DELETE_WARNING_KEY = "eksperiq:delete-all-server-warning";
const IMPORT_INPUT_ID = "eksperiq-profile-import-backup";

function readImportFile(file: File): Promise<string> {
  if (typeof file.text === "function") {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error ?? new Error("FileReader failed"));
    reader.readAsText(file);
  });
}

export function DataManagementSection() {
  const [usage, setUsage] = useState<StorageUsageSummary | null>(null);
  const [importMessage, setImportMessage] = useState("");
  const [importStatus, setImportStatus] = useState<"idle" | "ok" | "error">("idle");
  const [deleteMode, setDeleteMode] = useState<"idle" | "confirming" | "deleting">("idle");
  const [deleteServerWarning, setDeleteServerWarning] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getStorageUsageSummary().then((summary) => {
      if (!cancelled) setUsage(summary);
    });
    const frame = window.requestAnimationFrame(() => {
      if (window.sessionStorage.getItem(SERVER_DELETE_WARNING_KEY)) {
        window.sessionStorage.removeItem(SERVER_DELETE_WARNING_KEY);
        setDeleteServerWarning(true);
      }
    });
    return () => {
      window.cancelAnimationFrame(frame);
      cancelled = true;
    };
  }, []);

  function handleExport() {
    const json = exportDataAsJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `eksperiq-yedek-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImportStatus("idle");
    setImportMessage("");

    try {
      const text = await readImportFile(file);
      const result = importDataFromJson(text);
      if (!result.ok) {
        setImportStatus("error");
        setImportMessage(result.error);
        return;
      }
      setImportStatus("ok");
      setImportMessage(
        `${result.importedKeys.length} kayıt türü içe aktarıldı. Değişikliklerin görünmesi için sayfayı yenileyin.`,
      );
      const summary = await getStorageUsageSummary();
      setUsage(summary);
    } catch {
      setImportStatus("error");
      setImportMessage("Dosya okunamadı.");
    }
  }

  async function handleConfirmDelete() {
    setDeleteMode("deleting");
    const result = await deleteAllLocalData();
    if (!result.serverDeleted) {
      window.sessionStorage.setItem(SERVER_DELETE_WARNING_KEY, "1");
    }
    window.location.reload();
  }

  return (
    <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
      <div className="flex gap-3">
        <Database aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-accent" />
        <div className="w-full">
          <h2 className="font-semibold text-foreground">Verilerim</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Tüm kayıtlarınız yalnızca bu cihazda tutulur. Verilerinizi yedekleyebilir, başka bir cihaza aktarabilir veya
            tamamen silebilirsiniz.
          </p>

          {deleteServerWarning ? (
            <p
              role="alert"
              className="mt-3 rounded-theme-sm border border-warning/30 bg-warning/10 px-3 py-2 text-sm font-medium text-warning"
            >
              Cihazdaki tüm veriler silindi. Sunucudaki bildirim aboneliği kaydı şu anda silinemedi (bağlantı sorunu
              olabilir); en geç 90 gün içinde otomatik olarak silinir. Bildirimleri tekrar açarsanız kayıt yeniden
              oluşturulur ve normal şekilde çalışır.
            </p>
          ) : null}

          {usage ? (
            <div className="mt-4 rounded-theme-sm border border-border bg-muted p-3 text-sm">
              <p className="font-medium text-foreground">
                Cihazda kullanılan alan: {formatBytes(usage.totalLocalBytes + usage.totalSessionBytes)}
              </p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                {usage.entries
                  .filter((entry) => entry.bytes > 0)
                  .map((entry) => (
                    <li key={entry.label} className="flex justify-between gap-3">
                      <span>{exportLabels[entry.label] ?? entry.label}</span>
                      <span>{formatBytes(entry.bytes)}</span>
                    </li>
                  ))}
                {usage.entries.every((entry) => entry.bytes === 0) ? <li>Henüz kayıtlı veri yok.</li> : null}
              </ul>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex min-h-11 items-center gap-2 rounded-full transition active:scale-95 border border-border px-4 text-sm font-semibold text-foreground hover:bg-muted dark:hover:opacity-90"
            >
              <Download aria-hidden="true" className="h-4 w-4" />
              Verilerimi dışa aktar
            </button>
            <label
              htmlFor={IMPORT_INPUT_ID}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-foreground transition hover:bg-muted active:scale-95 dark:hover:opacity-90"
            >
              <Upload aria-hidden="true" className="h-4 w-4" />
              Yedekten içe aktar
            </label>
            <input
              id={IMPORT_INPUT_ID}
              type="file"
              accept="application/json"
              aria-label="Yedek dosyası"
              className="sr-only"
              onChange={(event) => void handleImportFile(event)}
            />
          </div>

          {importMessage ? (
            <p
              role="status"
              className={`mt-3 text-sm font-medium ${importStatus === "error" ? "text-destructive" : "text-accent"}`}
            >
              {importMessage}
            </p>
          ) : null}

          <div className="mt-5 border-t border-border pt-4">
            {deleteMode === "idle" ? (
              <button
                type="button"
                onClick={() => setDeleteMode("confirming")}
                className="inline-flex min-h-11 items-center gap-2 rounded-full transition active:scale-95 border border-destructive/30 px-4 text-sm font-semibold text-destructive hover:border-destructive"
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
                Tüm verilerimi sil
              </button>
            ) : (
              <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                <p className="text-sm text-destructive">
                  Bu cihazdaki tüm {appConfig.name} kayıtları (araçlar, hatırlatmalar, giderler, analizler,
                  fotoğraflar), bildirim aboneliği ve önbellek silinecek. Bu işlem geri alınamaz.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleConfirmDelete()}
                    disabled={deleteMode === "deleting"}
                    className="inline-flex min-h-11 items-center rounded-full transition active:scale-95 bg-destructive px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    {deleteMode === "deleting" ? "Siliniyor..." : "Evet, tümünü sil"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteMode("idle")}
                    disabled={deleteMode === "deleting"}
                    className="inline-flex min-h-11 items-center rounded-full transition active:scale-95 border border-border px-4 text-sm font-semibold text-foreground/90 disabled:opacity-50"
                  >
                    Vazgeç
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
