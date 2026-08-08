"use client";

import { useEffect, useMemo, useState } from "react";
import { CarFront, CheckSquare } from "lucide-react";
import { HeroCard } from "@/components/cards/hero-card";
import { AppShell } from "@/components/layout/app-shell";
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
    <AppShell>
      <div className="max-w-3xl pt-6">
        <HeroCard
          icon={CarFront}
          eyebrow="Test Sürüşü Kontrol Listesi"
          title="Test sürüşünde neye dikkat etmeli?"
          description={<>{testDriveDisclaimer}</>}
        />

        <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-foreground">Tamamlanan: {progress}</h2>
            <CheckSquare aria-hidden="true" className="h-5 w-5 text-accent" />
          </div>
        </section>

        {testDriveGroups.map((group) => (
          <section key={group.id} className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">{group.title}</h2>
            <div className="mt-4 grid gap-3">
              {group.items.map((item) => (
                <label
                  key={item}
                  className="flex min-h-14 cursor-pointer items-start gap-3 rounded-theme-sm border border-border bg-muted p-4 text-sm font-medium text-foreground/90"
                >
                  <input
                    type="checkbox"
                    checked={checkedItems.has(item)}
                    onChange={() => toggleItem(item)}
                    className="mt-0.5 h-5 w-5 shrink-0 rounded border-border accent-accent"
                  />
                  {item}
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
