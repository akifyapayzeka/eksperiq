"use client";

import { useEffect, useMemo, useState } from "react";
import { CarFront, CheckSquare } from "lucide-react";
import { testDriveDisclaimer, testDriveGroups } from "@/lib/vehicle-checks/test-drive";
import { loadTestDriveChecklist, saveTestDriveChecklist } from "@/lib/storage/test-drive-storage";

const allItems = testDriveGroups.flatMap((group) => group.items);

export default function TestDriveChecklistPage() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setCheckedItems(new Set(loadTestDriveChecklist(allItems))));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const progress = useMemo(() => `${checkedItems.size} / ${allItems.length}`, [checkedItems]);

  function toggleItem(item: string) {
    setCheckedItems((current) => {
      const next = new Set(current);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      saveTestDriveChecklist([...next]);
      return next;
    });
  }

  return (
    <main className="flex-1 bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
          <CarFront aria-hidden="true" className="h-9 w-9 text-teal-200" />
          <p className="mt-5 text-sm font-semibold text-teal-200">Test Sürüşü Kontrol Listesi</p>
          <h1 className="mt-2 text-3xl font-semibold">Test sürüşünde neye dikkat etmeli?</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">{testDriveDisclaimer}</p>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Tamamlanan: {progress}</h2>
            <CheckSquare aria-hidden="true" className="h-5 w-5 text-teal-700" />
          </div>
        </section>

        {testDriveGroups.map((group) => (
          <section
            key={group.id}
            className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">{group.title}</h2>
            <div className="mt-4 grid gap-3">
              {group.items.map((item) => (
                <label
                  key={item}
                  className="flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300"
                >
                  <input
                    type="checkbox"
                    checked={checkedItems.has(item)}
                    onChange={() => toggleItem(item)}
                    className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 accent-teal-700 dark:border-slate-600"
                  />
                  {item}
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
