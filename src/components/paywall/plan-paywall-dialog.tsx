"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { IconButton } from "@/components/ui/button";
import { PaywallPlansScreen } from "@/components/paywall/paywall-plans";

export function PlanPaywallDialog({
  open,
  headline,
  description,
  dismissLabel,
  onDismiss,
}: {
  open: boolean;
  headline: string;
  description: string;
  dismissLabel?: string;
  onDismiss?: () => void;
}) {
  useEffect(() => {
    if (!open || !onDismiss) return;
    const dismiss = onDismiss;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") dismiss();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onDismiss]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/45 p-4 sm:items-center"
      role="presentation"
      onClick={onDismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="plan-paywall-title"
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-theme border border-border bg-card p-5 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        {onDismiss ? (
          <div className="mb-2 flex justify-end">
            <IconButton icon={X} label="Kapat" onClick={onDismiss} />
          </div>
        ) : null}
        <div id="plan-paywall-title">
          <PaywallPlansScreen
            headline={headline}
            description={description}
            dismissLabel={dismissLabel}
            onDismiss={onDismiss}
          />
        </div>
      </div>
    </div>
  );
}
