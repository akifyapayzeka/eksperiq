"use client";

import { useEffect } from "react";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = "Onayla",
  cancelLabel = "Vazgeç",
  destructive = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-description"
        className="w-full max-w-sm rounded-theme border border-border bg-card p-5 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirmation-dialog-title" className="font-heading text-lg font-bold text-foreground">
          {title}
        </h2>
        <p id="confirmation-dialog-description" className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <SecondaryButton onClick={onCancel} className="sm:order-1">
            {cancelLabel}
          </SecondaryButton>
          <PrimaryButton
            autoFocus
            onClick={onConfirm}
            className={
              destructive ? "bg-destructive text-destructive-foreground hover:opacity-90 sm:order-2" : "sm:order-2"
            }
          >
            {confirmLabel}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
