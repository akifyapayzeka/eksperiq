import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/arac-saglik-karnesi",
}));

import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

describe("MobileBottomNav", () => {
  it("always renders exactly the 5 required items, in order", () => {
    render(<MobileBottomNav />);
    const nav = screen.getByRole("navigation", { name: "Ana navigasyon" });
    const links = nav.querySelectorAll("a");
    const labels = Array.from(links).map((link) => link.textContent);
    expect(labels).toEqual(["Ana Sayfa", "Analiz", "Garajım", "Geçmiş", "Profil"]);
  });

  it("links to the real routes, not placeholder hrefs", () => {
    render(<MobileBottomNav />);
    const nav = screen.getByRole("navigation", { name: "Ana navigasyon" });
    const hrefs = Array.from(nav.querySelectorAll("a")).map((link) => link.getAttribute("href"));
    expect(hrefs).toEqual(["/", "/analiz", "/arac-saglik-karnesi", "/analizlerim", "/profil"]);
  });

  it("marks the current route active via aria-current", () => {
    render(<MobileBottomNav />);
    const activeLink = screen.getByRole("link", { name: "Garajım", current: "page" });
    expect(activeLink).toHaveAttribute("href", "/arac-saglik-karnesi");
  });
});
