"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckSquare, ShieldCheck } from "lucide-react";
import { HeroCard } from "@/components/cards/hero-card";
import { AppShell } from "@/components/layout/app-shell";
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
    <AppShell>
      <div className="max-w-3xl pt-6">
        <HeroCard
          icon={ShieldCheck}
          eyebrow="Resmi Sorgu Rehberi"
          title="Hangi bilgiyi nereden doğrularsınız?"
          description={<>{officialLookupDisclaimer}</>}
        />

        <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-foreground">Kontrol ettiklerim: {progress}</h2>
            <CheckSquare aria-hidden="true" className="h-5 w-5 text-accent" />
          </div>
          <div className="mt-4 grid gap-3">
            {officialLookupItems.map((item) => (
              <label
                key={item.id}
                className="flex min-h-14 cursor-pointer items-start gap-3 rounded-theme-sm border border-border bg-muted p-4"
              >
                <input
                  type="checkbox"
                  checked={checkedItems.has(item.title)}
                  onChange={() => toggleItem(item.title)}
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-border accent-accent"
                />
                <div>
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.where}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.note}</p>
                </div>
              </label>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
