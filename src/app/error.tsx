"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[calc(100dvh-8rem)] items-center bg-slate-50 px-4 py-10 text-slate-950">
      <section className="mx-auto w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-teal-700">EksperIQ</p>
        <h1 className="mt-3 text-2xl font-semibold">Bir şeyler ters gitti</h1>
        <p className="mt-3 text-base leading-7 text-slate-700">
          Beklenmeyen bir hata oluştu. Girdiğiniz bilgiler sunucuya kaydedilmediği için kaybolmaz; tekrar deneyebilir
          veya ana sayfaya dönebilirsiniz.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Tekrar dene
          </button>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-800 hover:border-teal-700"
            href="/"
          >
            Ana sayfaya dön
          </Link>
        </div>
      </section>
    </main>
  );
}
