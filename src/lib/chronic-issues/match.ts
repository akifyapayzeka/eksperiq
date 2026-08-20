import type { VehicleFormData } from "@/lib/schemas/vehicle";
import type { ChronicIssue, EngineVariant, ModelEntry } from "./types";
import { CHRONIC_ISSUES_DB } from "./data";

export type MatchedIssue = ChronicIssue & {
  engineLabel: string;
  /** True when we couldn't pin down the exact engine variant (missing engineSize/engine code in the listing) and are showing every engine's issues for this brand/model/year as a broader, less certain set. */
  broadMatch: boolean;
};

function normalize(value: string | undefined | null): string {
  return (value ?? "")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function parseDisplacement(text: string): number | null {
  const match = text.replace(",", ".").match(/(\d(?:\.\d)?)/);
  if (!match) return null;
  const value = Number.parseFloat(match[1]);
  return Number.isFinite(value) ? value : null;
}

function engineMatchesDisplacement(engine: EngineVariant, displacement: number): boolean {
  const engineDisplacement = parseDisplacement(engine.engineLabel);
  return engineDisplacement !== null && Math.abs(engineDisplacement - displacement) < 0.05;
}

/** Sellers very often spell out the engine code ("1.2 TSI", "1.6 dCi") directly in the ad text — use it to disambiguate engines that share the same displacement. */
function descriptionMentionsEngine(engine: EngineVariant, haystack: string): boolean {
  const label = normalize(engine.engineLabel).replace(/\s+/g, " ");
  if (!label) return false;
  if (label.includes("dq200") && /\bdsg\b|yarı otomatik|yari otomatik/.test(haystack)) return true;
  const engineCode = label.match(/\b[a-z]{1,4}\d{1,4}[a-z]*\b/u)?.[0];
  return (
    haystack.includes(label) ||
    haystack.includes(label.replace(/\s+/g, "")) ||
    Boolean(engineCode && haystack.includes(engineCode))
  );
}

function trimMatches(engine: EngineVariant, trim: string): boolean {
  if (!engine.trims?.length) return true;
  if (!trim) return true;
  return engine.trims.some((candidate) => trim.includes(normalize(candidate)));
}

function withinYearRange(entry: ModelEntry, engine: EngineVariant, year: number): boolean {
  const from = engine.yearFrom ?? entry.yearFrom;
  const to = engine.yearTo ?? entry.yearTo;
  return year >= from && year <= to;
}

/**
 * Finds the "bilinen kronik sorunlar" that apply to a specific listing. This
 * is deliberately informational-only — it never touches the risk score,
 * since it describes the model/engine family in general, not this specific
 * car's condition or history.
 */
export function findChronicIssues(
  input: Pick<
    VehicleFormData,
    "brand" | "model" | "year" | "fuelType" | "transmission" | "engineSize" | "trim" | "sellerDescription"
  >,
): {
  entry: ModelEntry | null;
  issues: MatchedIssue[];
} {
  const brand = normalize(input.brand);
  const model = normalize(input.model);
  if (!brand || !model) return { entry: null, issues: [] };

  const entry = CHRONIC_ISSUES_DB.find(
    (candidate) => normalize(candidate.brand) === brand && normalize(candidate.model) === model,
  );
  if (!entry || input.year < entry.yearFrom || input.year > entry.yearTo) {
    return { entry: entry ?? null, issues: [] };
  }

  const inputTrim = normalize(input.trim);
  const enginesInYear = entry.engines.filter(
    (engine) => withinYearRange(entry, engine, input.year) && trimMatches(engine, inputTrim),
  );
  const fuelType = normalize(input.fuelType);
  const byFuel = fuelType ? enginesInYear.filter((engine) => normalize(engine.fuelType) === fuelType) : enginesInYear;
  const transmission = normalize(input.transmission);
  const byTransmission = transmission
    ? byFuel.filter((engine) => !engine.transmission || normalize(engine.transmission) === transmission)
    : byFuel;

  const displacement = parseDisplacement(input.engineSize ?? "");
  const descriptionHaystack = normalize(`${input.trim ?? ""} ${input.sellerDescription ?? ""}`);

  let matched: EngineVariant[];
  let broadMatch = false;

  const byDescription = byTransmission.filter((engine) => descriptionMentionsEngine(engine, descriptionHaystack));
  if (byDescription.length > 0) {
    matched = byDescription;
  } else if (displacement !== null) {
    const byDisplacement = byTransmission.filter((engine) => engineMatchesDisplacement(engine, displacement));
    matched = byDisplacement;
  } else {
    // No engine code in the description and no displacement entered — show
    // everything for this brand/model/year/fuel as a broader, clearly-
    // labeled set rather than nothing at all.
    matched = byTransmission;
    broadMatch = byTransmission.length > 1;
  }

  const issues: MatchedIssue[] = matched.flatMap((engine) =>
    engine.issues.map((issue) => ({ ...issue, engineLabel: engine.engineLabel, broadMatch })),
  );

  return { entry, issues };
}
