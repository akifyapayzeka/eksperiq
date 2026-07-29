import { describe, expect, it } from "vitest";
import { candidatesByStatus, ruleCandidates, ruleFeedbackIssueTitle } from "@/lib/feedback/rule-candidates";

describe("rule candidates", () => {
  it("keeps early feedback candidates outside the active rule engine", () => {
    expect(ruleCandidates.map((candidate) => candidate.status)).toEqual(["accepted", "accepted", "accepted"]);
  });

  it("links every candidate to an affected rule file and validation question", () => {
    for (const candidate of ruleCandidates) {
      expect(candidate.moduleId).toBe("listing-analysis");
      expect(candidate.affectedRuleFile).toMatch(/^src\/lib\/analysis\/rules\/.+-rules\.ts$/);
      expect(candidate.validationQuestion.length).toBeGreaterThan(20);
      expect(candidate.expectedFinding.recommendation.length).toBeGreaterThan(20);
      expect(candidate.feedbackRecord.issueTitle).toMatch(/^\[Kural geri bildirimi\]/);
      expect(candidate.feedbackRecord.anonymizedInputFields.length).toBeGreaterThanOrEqual(3);
      expect(candidate.feedbackRecord.acceptanceEvidence.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("filters candidates by review status", () => {
    expect(candidatesByStatus("needs-feedback")).toHaveLength(0);
    expect(candidatesByStatus("accepted")).toHaveLength(3);
  });

  it("derives issue titles from the feedback record", () => {
    expect(ruleFeedbackIssueTitle(ruleCandidates[0])).toBe("[Kural geri bildirimi] Garaj kullanımı iddiası");
  });
});
