import type { ReactNode } from "react";

/**
 * Pins primary form/report actions above the mobile bottom nav on small
 * screens; becomes an inline block on larger viewports (sm:static).
 */
export function StickyMobileAction({ children }: { children: ReactNode }) {
  return (
    <div className="no-print sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-10 -mx-4 mt-6 border-t border-border bg-card/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
      {children}
    </div>
  );
}
