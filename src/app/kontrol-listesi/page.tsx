"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckSquare, ClipboardCheck, FileText } from "lucide-react";
import { loadAnalysis, loadChecklist, saveChecklist } from "@/lib/storage/analysis-storage";

const fallbackChecklist = [
  "Ruhsat sahibini doğruladım",
  "Tramer kaydını gördüm",
  "Kilometre geçmişini kontrol ettim",
  "Aracı soğuk çalıştırdım",
  "Bağımsız ekspertize götürdüm",
  "Şasi numarasını doğruladım",
  "Rehin ve haciz durumunu kontrol ettim",
  "Test sürüşü yaptım",
  "Satış sözleşmesini okudum",
  "Ödemeyi güvenli yöntemle yapacağım",
];

export default function ChecklistPage() {
  const analysis = useMemo(() => loadAnalysis(), []);
  const checklist = analysis?.finalChecklist ?? fallbackChecklist;
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => new Set(loadChecklist(checklist)));

  function toggleItem(item: string) {
    setCheckedItems((current) => {
      const next = new Set(current);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      saveChecklist([...next]);
      return next;
    });
  }

  return (
    <main className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
          <ClipboardCheck aria-hidden="true" className="h-9 w-9 text-teal-200" />
          <p className="mt-5 text-sm font-semibold text-teal-200">Uzmanlık Kontrol Listesi</p>
          <h1 className="mt-2 text-3xl font-semibold">Satın alma öncesi son kontroller</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Bu liste karar desteği sağlar. Resmi kayıt sorgusu, servis kontrolü ve bağımsız ekspertizin yerine geçmez.
          </p>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-950">
              Tamamlanan kontroller {checkedItems.size} / {checklist.length}
            </h2>
            <CheckSquare aria-hidden="true" className="h-5 w-5 text-teal-700" />
          </div>
          <div className="mt-5 grid gap-3">
            {checklist.map((item) => (
              <label
                key={item}
                className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-800"
              >
                <input
                  type="checkbox"
                  checked={checkedItems.has(item)}
                  onChange={() => toggleItem(item)}
                  className="h-5 w-5 rounded border-slate-300 accent-teal-700"
                />
                {item}
              </label>
            ))}
          </div>
        </section>

        <Link
          href="/sonuc"
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-base font-semibold text-white hover:bg-slate-800 sm:w-auto"
        >
          <FileText aria-hidden="true" className="h-5 w-5" />
          Analiz raporuna dön
        </Link>
      </div>
    </main>
  );
}
