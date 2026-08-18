"use client";

import { useState } from "react";
import { MapPinned } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { HeroCard } from "@/components/cards/hero-card";
import { NearbyPlaceFinder } from "@/components/places/nearby-place-finder";
import { placeCategoryLabels, type PlaceCategory } from "@/lib/places/types";

const categories: PlaceCategory[] = ["ekspertiz", "noter", "servis"];

export default function NearbyServicesPage() {
  const [category, setCategory] = useState<PlaceCategory>("ekspertiz");

  return (
    <AppShell>
      <div className="max-w-4xl pt-6">
        <HeroCard
          icon={MapPinned}
          eyebrow="Araç Alırken"
          title="Yakınımdaki ekspertiz, noter ve servis"
          description="Aracı almadan önce ya da hemen sonrasında uğrayacağınız firmaları konumunuza göre bulun. Satın alma kararınızı bu ekran değil, analiz sonucunuz belirler — burada sadece gidilecek yeri bulursunuz."
          tone="accent"
        />

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`inline-flex min-h-11 shrink-0 items-center justify-center rounded-full px-4 text-sm font-semibold ${
                category === item
                  ? "bg-primary text-primary-foreground dark:bg-card dark:text-foreground"
                  : "border border-border text-foreground/80"
              }`}
            >
              {placeCategoryLabels[item]}
            </button>
          ))}
        </div>

        <NearbyPlaceFinder key={category} category={category} />
      </div>
    </AppShell>
  );
}
