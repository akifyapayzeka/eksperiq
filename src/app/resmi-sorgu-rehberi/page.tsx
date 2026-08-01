"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckSquare, ShieldCheck } from "lucide-react";
import { officialLookupDisclaimer, officialLookupItems } from "@/lib/vehicle-checks/official-lookup";
import { createSessionChecklistStore } from "@/lib/storage/session-checklist";
import { appConfig } from "@/lib/constants/app";

const store = createSessionChecklistStore(appConfig.officialLookupChecklistStorageKey);
const allTitles = officialLookupItems.map((item) => item.title);

export default function OfficialLookupGuidePage() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setCheckedItems(new Set(store.load(allTitles))));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const progress = useMemo(() => `${checkedItems.size} / ${allTitles.length}`, [checkedItems]);

  function toggleItem(title: string) {
    setCheckedItems((current) => {
      const next = new Set(current);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      store.save([...next]);
      return next;
    });
  }

  return (
    <main className="flex-1 bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
          <ShieldCheck aria-hidden="true" className="h-9 w-9 text-teal-200" />
          <p className="mt-5 text-sm font-semibold text-teal-200">Resmi Sorgu Rehberi</p>
          <h1 className="mt-2 text-3xl font-semibold">Hangi bilgiyi nereden doğrularsınız?</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">{officialLookupDisclaimer}</p>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-950">Kontrol ettiklerim: {progress}</h2>
            <CheckSquare aria-hidden="true" className="h-5 w-5 text-teal-700" />
          </div>
          <div className="mt-4 grid gap-3">
            {officialLookupItems.map((item) => (
              <label
                key={item.id}
                className="flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <input
                  type="checkbox"
                  checked={checkedItems.has(item.title)}
                  onChange={() => toggleItem(item.title)}
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 accent-teal-700"
                />
                <div>
                  <p className="font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.where}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{item.note}</p>
                </div>
              </label>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
