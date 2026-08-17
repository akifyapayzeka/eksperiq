import Link from "next/link";
import { appConfig } from "@/lib/constants/app";

export function SiteFooter() {
  return (
    <footer className="no-print border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 pb-28 pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pb-8 lg:px-8">
        <p>{appConfig.name} profesyonel ekspertizin yerine geçmez.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/geri-bildirim" className="hover:text-foreground">
            Geri bildirim
          </Link>
          <Link href="/gizlilik" className="hover:text-foreground">
            Gizlilik
          </Link>
          <Link href="/kullanim-kosullari" className="hover:text-foreground">
            Kullanım koşulları
          </Link>
        </div>
      </div>
    </footer>
  );
}
