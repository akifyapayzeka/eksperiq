"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[calc(100dvh-8rem)] items-center bg-background px-4 py-10 text-foreground">
      <section className="mx-auto w-full max-w-xl rounded-lg border border-border bg-card p-6 shadow-sm">
        <Logo variant="dikey" className="h-16 w-auto" />
        <h1 className="mt-5 text-2xl font-semibold">Bir şeyler ters gitti</h1>
        <p className="mt-3 text-base leading-7 text-foreground/80">
          Beklenmeyen bir hata oluştu. Girdiğiniz bilgiler sunucuya kaydedilmediği için kaybolmaz; tekrar deneyebilir
          veya ana sayfaya dönebilirsiniz.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center justify-center rounded-full transition active:scale-95 bg-accent px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Tekrar dene
          </button>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-full transition active:scale-95 border border-border px-4 text-sm font-semibold text-foreground/90 hover:border-accent"
            href="/"
          >
            Ana sayfaya dön
          </Link>
        </div>
      </section>
    </main>
  );
}
