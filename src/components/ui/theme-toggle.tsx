"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, SunMoon } from "lucide-react";
import {
  applyThemePreference,
  readThemePreference,
  writeThemePreference,
  type ThemePreference,
} from "@/lib/theme/theme-preference";

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "system", label: "Sistem", icon: SunMoon },
  { value: "light", label: "Açık", icon: Sun },
  { value: "dark", label: "Koyu", icon: Moon },
];

export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setPreference(readThemePreference());
      setIsReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function choose(next: ThemePreference) {
    setPreference(next);
    writeThemePreference(next);
    applyThemePreference(next);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Görünüm teması"
      className="inline-flex items-center gap-1 rounded-theme border border-border bg-muted p-1"
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = isReady && preference === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={option.label}
            onClick={() => choose(option.value)}
            className={`flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-[calc(var(--radius-theme)-0.25rem)] px-3 text-xs font-semibold transition-colors ${
              isActive
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
