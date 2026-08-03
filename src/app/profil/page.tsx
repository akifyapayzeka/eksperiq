import Link from "next/link";
import { CarFront, MessageSquareText, ShieldCheck, UserRound } from "lucide-react";
import { appConfig } from "@/lib/constants/app";

export default function ProfilePage() {
  return (
    <main className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-white/10">
            <UserRound aria-hidden="true" className="h-7 w-7" />
          </div>
          <p className="mt-6 text-sm font-semibold text-teal-200">Profil</p>
          <h1 className="mt-2 text-3xl font-semibold">EksperIQ ücretsiz kullanılabilir.</h1>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex gap-3">
            <ShieldCheck aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-teal-700" />
            <div>
              <h2 className="font-semibold text-slate-950">Gizlilik sınırı</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{appConfig.privacy}</p>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex gap-3">
            <MessageSquareText aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-teal-700" />
            <div>
              <h2 className="font-semibold text-slate-950">Destek ve geri bildirim</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Sorun, öneri veya eksik kural bildirirken plaka, telefon, açık adres ya da satıcı bilgisi paylaşmayın.
                Geri bildirimler uygulama içinde saklanmaz.
              </p>
            </div>
          </div>
          <Link
            href="/geri-bildirim"
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-slate-300 px-5 text-base font-semibold text-slate-950 hover:bg-slate-50 sm:w-auto"
          >
            Geri bildirim gönder
          </Link>
        </section>

        <div className="mt-5">
          <Link
            href="/analiz"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full transition active:scale-95 bg-teal-700 px-5 text-base font-semibold text-white hover:bg-teal-800 sm:w-auto"
          >
            <CarFront aria-hidden="true" className="h-5 w-5" />
            Yeni analiz başlat
          </Link>
        </div>
      </div>
    </main>
  );
}
