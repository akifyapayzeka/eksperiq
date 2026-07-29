import { describe, expect, it } from "vitest";
import { candidatesByStatus, ruleCandidates } from "@/lib/feedback/rule-candidates";

describe("rule candidates", () => {
  it("keeps early feedback candidates outside the active rule engine", () => {
    expect(ruleCandidates.map((candidate) => candidate.status)).toEqual([
      "needs-feedback",
      "needs-feedback",
      "needs-feedback",
    ]);
  });

  it("links every candidate to an affected rule file and validation question", () => {
    for (const candidate of ruleCandidates) {
      expect(candidate.moduleId).toBe("listing-analysis");
      expect(candidate.affectedRuleFile).toMatch(/^src\/lib\/analysis\/rules\/.+-rules\.ts$/);
      expect(candidate.validationQuestion.length).toBeGreaterThan(20);
      expect(candidate.expectedFinding.recommendation.length).toBeGreaterThan(20);
    }
  });

  it("filters candidates by review status", () => {
    expect(candidatesByStatus("needs-feedback")).toHaveLength(3);
    expect(candidatesByStatus("accepted")).toEqual([]);
  });
});
