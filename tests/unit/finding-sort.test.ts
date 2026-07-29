import { describe, expect, it } from "vitest";
import { sortFindings } from "@/lib/analysis/engine";
import type { AnalysisFinding } from "@/lib/analysis/types";

const findings: AnalysisFinding[] = [
  {
    id: "low",
    category: "Evrak",
    severity: "low",
    title: "Düşük",
    explanation: "",
    recommendation: "",
  },
  {
    id: "high",
    category: "Hasar",
    severity: "high",
    title: "Yüksek",
    explanation: "",
    recommendation: "",
  },
  {
    id: "medium",
    category: "Bakım",
    severity: "medium",
    title: "Orta",
    explanation: "",
    recommendation: "",
  },
];

describe("finding sorting", () => {
  it("orders findings by severity before presentation", () => {
    expect(sortFindings(findings).map((finding) => finding.severity)).toEqual(["high", "medium", "low"]);
  });

  it("does not mutate the original finding array", () => {
    sortFindings(findings);
    expect(findings.map((finding) => finding.id)).toEqual(["low", "high", "medium"]);
  });
});
