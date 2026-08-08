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
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="text-lg font-semibold text-foreground">Anonim test notu şablonu</h2>
      <p className="mt-2 text-foreground/80">
        Test kullanıcısından not alırken bu şablonu kopyalayın. Plaka, telefon, açık adres veya satıcı adı eklemeyin.
      </p>
      <pre className="mt-4 max-h-64 overflow-auto rounded-theme-sm bg-primary p-4 text-xs leading-5 whitespace-pre-wrap text-primary-foreground/90">
        {feedbackTemplate}
      </pre>
      <button
        type="button"
        onClick={copyTemplate}
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground hover:opacity-90 sm:w-auto"
      >
        <ClipboardCopy aria-hidden="true" className="h-4 w-4" />
        Anonim not şablonunu kopyala
      </button>
      <p className="mt-3 min-h-5 text-sm text-muted-foreground" role="status">
        {status === "copied" ? "Anonim test notu şablonu panoya kopyalandı." : null}
        {status === "failed" ? "Kopyalama tarayıcı tarafından engellendi. Şablonu elle seçebilirsiniz." : null}
      </p>
    </div>
  );
}
