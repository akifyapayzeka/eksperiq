import Link from "next/link";
import { CarFront, ShieldCheck, UserRound } from "lucide-react";
import { appConfig } from "@/lib/constants/app";

const profileItems = [
  { label: "Üyelik", value: "Hesapsız kullanım" },
  { label: "Veri saklama", value: "Tarayıcı oturumu" },
  { label: "Aktif modül", value: "İlan Analizi" },
];

export default function ProfilePage() {
  return (
    <main className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-white/10">
            <UserRound aria-hidden="true" className="h-7 w-7" />
          </div>
          <p className="mt-6 text-sm font-semibold text-teal-200">Profil</p>
          <h1 className="mt-2 text-3xl font-semibold">EksperIQ hesabı olmadan kullanılabilir.</h1>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            İlk sürümde giriş yapılmaz. Analiz bilgileri hesabınıza kaydedilmez ve yalnızca mevcut tarayıcı oturumunda
            tutulur.
          </p>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Kullanım özeti</h2>
          <div className="mt-4 grid gap-3">
            {profileItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">
                <span className="text-sm font-medium text-slate-600">{item.label}</span>
                <span className="text-right text-sm font-semibold text-slate-950">{item.value}</span>
              </div>
            ))}
          </div>
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

        <Link
          href="/analiz"
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 text-base font-semibold text-white hover:bg-teal-800 sm:w-auto"
        >
          <CarFront aria-hidden="true" className="h-5 w-5" />
          Yeni analiz başlat
        </Link>
      </div>
    </main>
  );
}
