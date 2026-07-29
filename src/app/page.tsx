import Link from "next/link";
import { AlertTriangle, ClipboardCheck, MessageSquareText, ShieldCheck } from "lucide-react";
import { appConfig } from "@/lib/constants/app";

const benefits = [
  { icon: AlertTriangle, title: "Riskli noktaları belirle" },
  { icon: MessageSquareText, title: "Satıcıya doğru soruları sor" },
  { icon: ClipboardCheck, title: "Ekspertize hazırlıklı git" },
];

export default function Home() {
  return (
    <main className="flex-1">
      <section className="mx-auto grid min-h-[calc(100vh-160px)] max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-900">
            <ShieldCheck aria-hidden="true" className="h-4 w-4" />
            Ücretsiz, tarayıcı oturumunda çalışan MVP
          </div>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
              İkinci el araç ilanını daha bilinçli değerlendir.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-700">
              Araç bilgilerini gir. Riskli noktaları, satıcıya sorulacak soruları ve ekspertiz kontrol listesini
              saniyeler içinde gör.
            </p>
          </div>
          <Link
            href="/analiz"
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-slate-950 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:ring-4 focus-visible:ring-teal-200"
          >
            Ücretsiz analiz et
          </Link>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">{appConfig.privacy}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70">
          <div className="rounded-lg bg-slate-950 p-5 text-white">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Örnek rapor</span>
              <span className="rounded-full bg-amber-300 px-3 py-1 text-sm font-semibold text-slate-950">67 / 100</span>
            </div>
            <h2 className="mt-6 text-2xl font-semibold">Dikkatli incelenmeli</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{appConfig.tagline}</p>
          </div>
          <div className="mt-4 grid gap-3">
            {benefits.map((item) => (
              <div
                key={item.title}
                className="flex min-h-16 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <item.icon aria-hidden="true" className="h-5 w-5 text-teal-700" />
                <span className="font-medium text-slate-900">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
