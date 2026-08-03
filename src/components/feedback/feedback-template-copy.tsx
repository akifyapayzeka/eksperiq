"use client";

import { useState } from "react";
import { ClipboardCopy } from "lucide-react";

const feedbackTemplate = `EksperIQ kullanıcı testi notu

Cihaz / tarayıcı:
Test edilen akış:
Araç bilgisi anonim özeti:

Nerede takıldım?

Beklediğim şey neydi?

Risk skoru veya sonuç dili nasıl hissettirdi?

Eksik gördüğüm satıcı sorusu / ekspertiz kontrolü:

Kişisel veri eklemedim: Evet`;

export function FeedbackTemplateCopy() {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function copyTemplate() {
    try {
      await navigator.clipboard.writeText(feedbackTemplate);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold text-slate-950">Anonim test notu şablonu</h2>
      <p className="mt-2 text-slate-700">
        Test kullanıcısından not alırken bu şablonu kopyalayın. Plaka, telefon, açık adres veya satıcı adı eklemeyin.
      </p>
      <pre className="mt-4 max-h-64 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-5 whitespace-pre-wrap text-slate-100">
        {feedbackTemplate}
      </pre>
      <button
        type="button"
        onClick={copyTemplate}
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 font-semibold text-white hover:bg-slate-800 sm:w-auto"
      >
        <ClipboardCopy aria-hidden="true" className="h-4 w-4" />
        Anonim not şablonunu kopyala
      </button>
      <p className="mt-3 min-h-5 text-sm text-slate-600" role="status">
        {status === "copied" ? "Anonim test notu şablonu panoya kopyalandı." : null}
        {status === "failed" ? "Kopyalama tarayıcı tarafından engellendi. Şablonu elle seçebilirsiniz." : null}
      </p>
    </div>
  );
}
