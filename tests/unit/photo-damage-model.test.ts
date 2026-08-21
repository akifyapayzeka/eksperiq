import { describe, expect, it } from "vitest";
import {
  confidenceFromProbability,
  normalizeProbability,
  photoDamageDisclaimer,
  photoDamageSignals,
  vehiclePhotoAreas,
} from "@/lib/photo-damage/model";

describe("photo damage model", () => {
  it("covers all planned vehicle photo areas", () => {
    expect(vehiclePhotoAreas).toEqual([
      "front-bumper",
      "rear-bumper",
      "right-fender",
      "left-fender",
      "doors",
      "hood",
      "trunk-lid",
      "roof",
      "headlights",
      "tail-lights",
      "wheels",
      "tires",
      "windows",
      "dashboard",
      "instrument-cluster",
    ]);
  });

  it("covers all planned photo damage signals", () => {
    expect(photoDamageSignals).toEqual([
      "dent",
      "scratch",
      "paint-crack",
      "color-mismatch",
      "panel-misalignment",
      "headlight-replacement",
      "rust",
      "crack",
      "broken-part",
      "warning-light",
      "check-engine-light",
      "oil-pressure-warning",
      "temperature-warning",
      "battery-charge-warning",
      "brake-abs-warning",
      "tire-pressure-warning",
      "airbag-warning",
    ]);
  });

  it("normalizes probabilities to a 0-100 integer range", () => {
    expect(normalizeProbability(-12)).toBe(0);
    expect(normalizeProbability(38.6)).toBe(39);
    expect(normalizeProbability(101)).toBe(100);
    expect(normalizeProbability(Number.NaN)).toBe(0);
  });

  it("maps probability boundaries to confidence levels", () => {
    expect(confidenceFromProbability(0)).toBe("low");
    expect(confidenceFromProbability(39)).toBe("low");
    expect(confidenceFromProbability(40)).toBe("medium");
    expect(confidenceFromProbability(69)).toBe("medium");
    expect(confidenceFromProbability(70)).toBe("high");
    expect(confidenceFromProbability(100)).toBe("high");
  });

  it("states that photo analysis is not a definitive damage guarantee", () => {
    expect(photoDamageDisclaimer).toContain("kesin hasar");
    expect(photoDamageDisclaimer).toContain("arıza tespiti değildir");
    expect(photoDamageDisclaimer).toContain("uyarı lambaları");
    expect(photoDamageDisclaimer).toContain("olasılık");
    expect(photoDamageDisclaimer).toContain("güven seviyesi");
  });
});
