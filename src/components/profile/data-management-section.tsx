"use client";

import { useEffect, useRef, useState } from "react";
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

export function DataManagementSection() {
  const [usage, setUsage] = useState<StorageUsageSummary | null>(null);
  const [importMessage, setImportMessage] = useState("");
  const [importStatus, setImportStatus] = useState<"idle" | "ok" | "error">("idle");
  const [deleteMode, setDeleteMode] = useState<"idle" | "confirming" | "deleting">("idle");
  const [deleteServerWarning, setDeleteServerWarning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    URL.revokeObjectURL(url);
  }

  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImportStatus("idle");
    setImportMessage("");

    try {
      const text = await file.text();
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
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex gap-3">
        <Database aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-teal-700" />
        <div className="w-full">
          <h2 className="font-semibold text-slate-950 dark:text-white">Verilerim</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Tüm kayıtlarınız yalnızca bu cihazda tutulur. Verilerinizi yedekleyebilir, başka bir cihaza aktarabilir veya
            tamamen silebilirsiniz.
          </p>

          {deleteServerWarning ? (
            <p
              role="alert"
              className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
            >
              Cihazdaki tüm veriler silindi. Sunucudaki bildirim aboneliği kaydı şu anda silinemedi (bağlantı sorunu
              olabilir); en geç 90 gün içinde otomatik olarak silinir. Bildirimleri tekrar açarsanız kayıt yeniden
              oluşturulur ve normal şekilde çalışır.
            </p>
          ) : null}

          {usage ? (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-800/50">
              <p className="font-medium text-slate-950 dark:text-white">
                Cihazda kullanılan alan: {formatBytes(usage.totalLocalBytes + usage.totalSessionBytes)}
              </p>
              <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-400">
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
              className="inline-flex min-h-11 items-center gap-2 rounded-full transition active:scale-95 border border-slate-300 px-4 text-sm font-semibold text-slate-950 hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
            >
              <Download aria-hidden="true" className="h-4 w-4" />
              Verilerimi dışa aktar
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-11 items-center gap-2 rounded-full transition active:scale-95 border border-slate-300 px-4 text-sm font-semibold text-slate-950 hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
            >
              <Upload aria-hidden="true" className="h-4 w-4" />
              Yedekten içe aktar
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="sr-only"
              onChange={(event) => void handleImportFile(event)}
            />
          </div>

          {importMessage ? (
            <p
              role="status"
              className={`mt-3 text-sm font-medium ${
                importStatus === "error" ? "text-red-700 dark:text-red-400" : "text-teal-800 dark:text-teal-300"
              }`}
            >
              {importMessage}
            </p>
          ) : null}

          <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
            {deleteMode === "idle" ? (
              <button
                type="button"
                onClick={() => setDeleteMode("confirming")}
                className="inline-flex min-h-11 items-center gap-2 rounded-full transition active:scale-95 border border-red-200 px-4 text-sm font-semibold text-red-700 hover:border-red-400 dark:border-red-900 dark:hover:border-red-700"
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
                Tüm verilerimi sil
              </button>
            ) : (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900">
                <p className="text-sm text-red-900">
                  Bu cihazdaki tüm {appConfig.name} kayıtları (araçlar, hatırlatmalar, giderler, analizler,
                  fotoğraflar), bildirim aboneliği ve önbellek silinecek. Bu işlem geri alınamaz.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleConfirmDelete()}
                    disabled={deleteMode === "deleting"}
                    className="inline-flex min-h-11 items-center rounded-full transition active:scale-95 bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
                  >
                    {deleteMode === "deleting" ? "Siliniyor..." : "Evet, tümünü sil"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteMode("idle")}
                    disabled={deleteMode === "deleting"}
                    className="inline-flex min-h-11 items-center rounded-full transition active:scale-95 border border-slate-300 px-4 text-sm font-semibold text-slate-800 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
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
