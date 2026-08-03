import Link from "next/link";
import { appConfig } from "@/lib/constants/app";

export function SiteFooter() {
  return (
    <footer className="no-print border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 dark:text-slate-400">
        <p>{appConfig.name} profesyonel ekspertizin yerine geçmez.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/geri-bildirim" className="hover:text-slate-950 dark:hover:text-white">
            Geri bildirim
          </Link>
          <Link href="/gizlilik" className="hover:text-slate-950 dark:hover:text-white">
            Gizlilik
          </Link>
          <Link href="/kullanim-kosullari" className="hover:text-slate-950 dark:hover:text-white">
            Kullanım koşulları
          </Link>
        </div>
      </div>
    </footer>
  );
}
