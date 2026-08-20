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
const STAGE_RANGE: Record<Exclude<ImportStage, "done">, { floor: number; ceiling: number; halfLifeSeconds: number }> = {
  "checking-url": { floor: 1, ceiling: 8, halfLifeSeconds: 1 },
  "opening-page": { floor: 8, ceiling: 72, halfLifeSeconds: 10 },
  normalizing: { floor: 72, ceiling: 99, halfLifeSeconds: 18 },
};

/**
 * Asymptotically eases from a stage's floor toward its ceiling as time
 * passes, never quite reaching it — so the number keeps creeping up for as
 * long as the real operation takes, instead of parking at a fixed value.
 *
 * A prior version of this tried to continue easing from the previous
 * stage's last-shown percent instead of jumping to the new stage's own
 * floor, to avoid a visible jump on a fast stage transition. That requires
 * feeding the previous render's own output back in as this render's floor
 * — which, wired through React's "adjust state during render" pattern,
 * turned into a self-reinforcing loop (each render's result became a
 * strictly higher floor for the next, so it never stabilized in one pass)
 * and crashed the screen with "Too many re-renders" in production. Simple
 * and correct beats smooth and crash-prone: back to a pure function of the
 * current stage alone.
 */
export function computeDisplayPercent(stage: ImportStage | null, stageStartedAt: string | null, now: number): number {
  if (!stage) return 0;
  if (stage === "done") return 100;
  const range = STAGE_RANGE[stage];
  if (!stageStartedAt) return range.floor;
  const elapsedSeconds = Math.max(0, (now - new Date(stageStartedAt).getTime()) / 1000);
  const eased = 1 - Math.exp(-elapsedSeconds / range.halfLifeSeconds);
  const easedPercent = range.floor + (range.ceiling - range.floor) * eased;
  const slowCreep = Math.min(2.5, elapsedSeconds / 24);
  return Math.min(range.ceiling, Math.floor(easedPercent + slowCreep));
}
