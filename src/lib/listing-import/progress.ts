import type { ImportStage } from "./import-listing";

/**
 * Each in-progress stage's displayed-percent range and how quickly it
 * approaches its ceiling. The real native "progress" events only fire at
 * stage boundaries (opening-page / normalizing / done — see
 * EksperIQListingFetchPlugin.swift), and a stage can legitimately sit there
 * for several seconds (page load, AI call). Jumping straight to a fixed
 * percentage per stage and then holding it made the bar look frozen; this
 * instead eases the number up continuously within the current stage's
 * range so the user can see it's still working.
 */
const STAGE_RANGE: Record<Exclude<ImportStage, "done">, { floor: number; ceiling: number; halfLifeSeconds: number }> =
  {
    "checking-url": { floor: 1, ceiling: 8, halfLifeSeconds: 1 },
    "opening-page": { floor: 8, ceiling: 70, halfLifeSeconds: 8 },
    normalizing: { floor: 70, ceiling: 95, halfLifeSeconds: 5 },
  };

/**
 * Asymptotically eases from a stage's floor toward its ceiling as time
 * passes, never quite reaching it — so the number keeps creeping up for as
 * long as the real operation takes, instead of parking at a fixed value.
 *
 * `continueFrom` is the percent already on screen from the previous stage.
 * A stage's *configured* floor (e.g. normalizing's 70) is really "at least
 * this far in" — reasonable as a starting point when nothing has been
 * shown yet, but if "opening-page" finished quickly and its own easing had
 * only reached, say, ~25% before normalizing began, jumping straight to 70
 * reads as broken (reported: "20%'den 70%'e atlıyor"). Continuing the
 * easing from wherever the number already was — toward the new stage's
 * ceiling, at the new stage's pace — keeps it visually continuous instead.
 * The configured floor is still the fallback for the very first stage,
 * when there's nothing to continue from yet.
 */
export function computeDisplayPercent(
  stage: ImportStage | null,
  stageStartedAt: string | null,
  now: number,
  continueFrom = 0,
): number {
  if (!stage) return 0;
  if (stage === "done") return 100;
  const range = STAGE_RANGE[stage];
  const floor = continueFrom > 0 ? continueFrom : range.floor;
  const ceiling = Math.max(range.ceiling, floor);
  if (!stageStartedAt) return floor;
  const elapsedSeconds = Math.max(0, (now - new Date(stageStartedAt).getTime()) / 1000);
  const eased = 1 - Math.exp(-elapsedSeconds / range.halfLifeSeconds);
  return Math.round(floor + (ceiling - floor) * eased);
}
