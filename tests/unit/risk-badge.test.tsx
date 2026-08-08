import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RiskBadge } from "@/components/ui/risk-badge";
import { riskBucket } from "@/lib/analysis/risk-bucket";

describe("RiskBadge", () => {
  it("always renders a text label alongside color, for every risk bucket (never color-only)", () => {
    const cases: Array<{ score: number; expectedLabel: string }> = [
      { score: 85, expectedLabel: "Düşük risk" },
      { score: 70, expectedLabel: "Orta risk" },
      { score: 30, expectedLabel: "Yüksek risk" },
    ];

    for (const { score, expectedLabel } of cases) {
      const { unmount } = render(<RiskBadge score={score} />);
      expect(screen.getByText(new RegExp(expectedLabel))).toBeInTheDocument();
      unmount();
    }
  });

  it("matches riskBucket() for every score 0-100 — single source of truth, no separate calculation", () => {
    for (let score = 0; score <= 100; score += 5) {
      const bucket = riskBucket(score);
      const { unmount } = render(<RiskBadge score={score} />);
      const expectedText = bucket === "low" ? "Düşük risk" : bucket === "medium" ? "Orta risk" : "Yüksek risk";
      expect(screen.getByText(new RegExp(expectedText))).toBeInTheDocument();
      unmount();
    }
  });
});
