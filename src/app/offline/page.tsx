import Link from "next/link";
import { Logo } from "@/components/layout/logo";

export default function OfflinePage() {
  return (
    <main className="flex min-h-[calc(100dvh-8rem)] items-center bg-background px-4 py-10 text-foreground">
      <section className="mx-auto w-full max-w-xl rounded-lg border border-border bg-card p-6 shadow-sm">
        <Logo variant="dikey" className="h-16 w-auto" />
        <h1 className="mt-5 text-2xl font-semibold">Bağlantı gerekiyor</h1>
        <p className="mt-3 text-base leading-7 text-foreground/80">
          Analiz ekranını açmak ve güncel uygulama dosyalarını yüklemek için internet bağlantısı gerekir. Girdiğiniz
          ilan ve araç bilgileri sunucuya kaydedilmez.
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
