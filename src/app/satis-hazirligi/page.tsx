"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { loadSaleChecklist, saveSaleChecklist } from "@/lib/storage/sale-checklist-storage";

const saleChecklist = [
  "Son bakım faturalarını hazırla",
  "Muayene ve sigorta tarihlerini kontrol et",
  "Tramer detay belgesini hazırla",
  "Yedek anahtarı bul",
  "Lastik durumunu ve üretim tarihini not et",
  "İç/dış temizlik yaptır",
  "Gündüz ve temiz fonda fotoğraf çek",
  "Boyalı/değişen parçaları ilanda açık yaz",
  "Rehin/haciz durumunu kontrol et",
  "Satış sebebini kısa ve net hazırla",
];

export default function SmartSalePreparationPage() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setChecked(new Set(loadSaleChecklist(saleChecklist))));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function toggle(item: string) {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      saveSaleChecklist([...next]);
      return next;
    });
  }

  return (
    <main className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
          <Sparkles aria-hidden="true" className="h-9 w-9 text-teal-200" />
          <p className="mt-5 text-sm font-semibold text-teal-200">Akıllı Satış Hazırlığı</p>
          <h1 className="mt-2 text-3xl font-semibold">İlana çıkmadan önce eksikleri kapat</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Bu liste satış garantisi vermez; aracınızı daha şeffaf ve düzenli sunmanıza yardımcı olur.
          </p>
        </section>
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-950">Hazırlık listesi</h2>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-800">
              {checked.size}/{saleChecklist.length}
            </span>
          </div>
          <div className="mt-4 grid gap-3">
            {saleChecklist.map((item) => (
              <label
                key={item}
                className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-800"
              >
                <input
                  type="checkbox"
                  checked={checked.has(item)}
                  onChange={() => toggle(item)}
                  className="h-5 w-5 accent-teal-700"
                />
                {item}
              </label>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
