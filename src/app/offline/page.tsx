import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="flex min-h-[calc(100dvh-8rem)] items-center bg-slate-50 px-4 py-10 text-slate-950">
      <section className="mx-auto w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-teal-700">EksperIQ</p>
        <h1 className="mt-3 text-2xl font-semibold">Bağlantı gerekiyor</h1>
        <p className="mt-3 text-base leading-7 text-slate-700">
          Analiz ekranını açmak ve güncel uygulama dosyalarını yüklemek için internet bağlantısı gerekir. Girdiğiniz
          ilan ve araç bilgileri sunucuya kaydedilmez.
        </p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
          href="/"
        >
          Ana sayfaya dön
        </Link>
      </section>
    </main>
  );
}
