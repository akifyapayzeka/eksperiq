import { describe, expect, it } from "vitest";
import {
  isPro,
  unavailableEntitlementProvider,
  type EntitlementProvider,
  type EntitlementSnapshot,
} from "@/lib/pro/entitlement";

describe("isPro", () => {
  it("is always false until real purchase verification is wired up", async () => {
    await expect(isPro()).resolves.toBe(false);
  });

  it("resolves the default provider to a free snapshot, never a fake pro state", async () => {
    const snapshot = await unavailableEntitlementProvider.getEntitlement();
    expect(snapshot.state).toBe("free");
    expect(snapshot.checkedAt).toBeTruthy();
  });

  it("treats pro and gracePeriod states as entitled", async () => {
    const proProvider: EntitlementProvider = {
      async getEntitlement(): Promise<EntitlementSnapshot> {
        return { state: "pro", checkedAt: new Date().toISOString() };
      },
    };
    const graceProvider: EntitlementProvider = {
      async getEntitlement(): Promise<EntitlementSnapshot> {
        return { state: "gracePeriod", checkedAt: new Date().toISOString() };
      },
    };

    await expect(isPro(proProvider)).resolves.toBe(true);
    await expect(isPro(graceProvider)).resolves.toBe(true);
  });

  it("treats expired, billingRetry, revoked, and unknown states as not entitled", async () => {
    const states = ["expired", "billingRetry", "revoked", "unknown"] as const;
    for (const state of states) {
      const provider: EntitlementProvider = {
        async getEntitlement(): Promise<EntitlementSnapshot> {
          return { state, checkedAt: new Date().toISOString() };
        },
      };
      await expect(isPro(provider)).resolves.toBe(false);
    }
  });
});
