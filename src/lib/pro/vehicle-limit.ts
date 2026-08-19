import type { SubscriptionTier } from "./tier";

/**
 * How many vehicles each tier may keep in the garage at once. The paywall
 * never states these numbers — it markets this as "add more vehicles"
 * rather than "up to N vehicles" (see paywall-plans.tsx).
 */
const VEHICLE_LIMIT: Record<SubscriptionTier, number> = {
  free: 1,
  pro: 5,
  proPlus: 20,
};

export function getVehicleLimit(tier: SubscriptionTier): number {
  return VEHICLE_LIMIT[tier];
}

export function canAddVehicle(tier: SubscriptionTier, currentVehicleCount: number): boolean {
  return currentVehicleCount < getVehicleLimit(tier);
}
