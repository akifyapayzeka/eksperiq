"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Wrench } from "lucide-react";

const maintenanceItems = [
  { name: "Motor yağı ve filtreler", intervalKm: 10000, intervalMonths: 12 },
  { name: "Fren balatası kontrolü", intervalKm: 20000, intervalMonths: 12 },
  { name: "Lastik kontrolü", intervalKm: 10000, intervalMonths: 6 },
  { name: "Akü kontrolü", intervalKm: 15000, intervalMonths: 12 },
  { name: "Muayene", intervalKm: 0, intervalMonths: 24 },
  { name: "Trafik sigortası", intervalKm: 0, intervalMonths: 12 },
];

function monthDiff(from: string) {
  if (!from) return 999;
  const date = new Date(from);
  const now = new Date();
  return Math.max(0, (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth());
}

export default function MaintenanceTrackingPage() {
  const [currentKm, setCurrentKm] = useState("90000");
  const [lastKm, setLastKm] = useState("82000");
  const [lastDate, setLastDate] = useState("");

  const rows = useMemo(() => {
    const kmSince = Math.max(0, Number(currentKm) - Number(lastKm));
    const monthsSince = monthDiff(lastDate);

    return maintenanceItems.map((item) => {
      const kmDue = item.intervalKm > 0 && kmSince >= item.intervalKm * 0.8;
      const dateDue = monthsSince >= item.intervalMonths * 0.8;
      const status = kmDue || dateDue ? "Yakın kontrol" : "Takipte";
      return { ...item, status, kmSince, monthsSince };
    });
  }, [currentKm, lastDate, lastKm]);

  return (
    <main className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
          <Wrench aria-hidden="true" className="h-9 w-9 text-teal-200" />
          <p className="mt-5 text-sm font-semibold text-teal-200">Bakım Takibi</p>
          <h1 className="mt-2 text-3xl font-semibold">Yaklaşan bakım ve evrak kontrolleri</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Bu hesaplama genel hatırlatma üretir. Servis planı, motor tipi ve kullanım koşulları ayrıca kontrol
            edilmelidir.
          </p>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="grid gap-2 text-sm font-medium text-slate-800">
              Güncel kilometre
              <input
                value={currentKm}
                onChange={(event) => setCurrentKm(event.target.value)}
                type="number"
                className="min-h-12 rounded-xl border border-slate-300 px-3"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800">
              Son bakım km
              <input
                value={lastKm}
                onChange={(event) => setLastKm(event.target.value)}
                type="number"
                className="min-h-12 rounded-xl border border-slate-300 px-3"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-800">
              Son bakım tarihi
              <input
                value={lastDate}
                onChange={(event) => setLastDate(event.target.value)}
                type="date"
                className="min-h-12 rounded-xl border border-slate-300 px-3"
              />
            </label>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <CalendarClock aria-hidden="true" className="h-5 w-5 text-teal-700" />
            <h2 className="text-xl font-semibold text-slate-950">Takip özeti</h2>
          </div>
          <div className="mt-4 grid gap-3">
            {rows.map((item) => (
              <article key={item.name} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-950">{item.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Son bakımdan beri yaklaşık {item.kmSince.toLocaleString("tr-TR")} km
                      {lastDate
                        ? ` ve ${item.monthsSince} ay geçti.`
                        : " geçti. Tarih girerseniz süre takibi de yapılır."}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${item.status === "Yakın kontrol" ? "bg-amber-50 text-amber-800" : "bg-teal-50 text-teal-800"}`}
                  >
                    {item.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
