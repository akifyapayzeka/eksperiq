import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100dvh-8rem)] items-center bg-background px-4 py-10 text-foreground">
      <section className="mx-auto w-full max-w-xl rounded-lg border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-semibold text-accent">EksperIQ</p>
        <h1 className="mt-3 text-2xl font-semibold">Sayfa bulunamadı</h1>
        <p className="mt-3 text-base leading-7 text-foreground/80">
          Aradığınız sayfa taşınmış veya kaldırılmış olabilir. Bağlantıyı kontrol edin ya da ana sayfadan devam edin.
        </p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-accent px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
          href="/"
        >
          Ana sayfaya dön
        </Link>
      </section>
    </main>
  );
}
