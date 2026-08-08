"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { IconButton } from "@/components/ui/button";

/**
 * Slides up from the bottom on small screens, centers as a modal card on
 * larger ones. Used for the shared vehicle add/edit flow and other
 * short, focused forms launched on top of a page.
 */
export function BottomSheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 sm:items-center sm:p-4" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bottom-sheet-title"
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-theme-lg border border-border bg-card p-5 shadow-lg sm:max-w-lg sm:rounded-theme-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="bottom-sheet-title" className="font-heading text-lg font-bold text-foreground">
            {title}
          </h2>
          <IconButton icon={X} label="Kapat" onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}
