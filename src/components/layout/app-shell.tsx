import type { ReactNode } from "react";

/**
 * Consistent page-content wrapper: max width, horizontal padding, and the
 * bottom padding that keeps content clear of the fixed mobile bottom nav.
 * SiteHeader / SiteFooter / MobileBottomNav are already mounted once in
 * RootLayout, so pages only need to wrap their content in AppShell.
 */
export function AppShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <main className={`flex-1 bg-background ${className}`}>
      <div className="mx-auto max-w-5xl px-4 pb-28 sm:px-6 sm:pb-10 lg:px-8">{children}</div>
    </main>
  );
}
