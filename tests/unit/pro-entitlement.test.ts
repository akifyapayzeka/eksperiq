import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

const isNativePlatform = vi.fn(() => false);
vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => isNativePlatform() },
}));

const currentEntitlement = vi.fn();
const purchase = vi.fn();
const restore = vi.fn();
vi.mock("@/lib/pro/native-entitlement-plugin", () => ({
  EksperIQEntitlementPlugin: {
    currentEntitlement: (options: unknown) => currentEntitlement(options),
    purchase: (options: unknown) => purchase(options),
    restore: () => restore(),
  },
}));

describe("nativeStoreKitEntitlementProvider", () => {
  beforeEach(() => {
    isNativePlatform.mockReturnValue(false);
    currentEntitlement.mockReset();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is honestly free on the web (no native plugin to call)", async () => {
    const { nativeStoreKitEntitlementProvider } = await import("@/lib/pro/entitlement");
    const snapshot = await nativeStoreKitEntitlementProvider.getEntitlement();
    expect(snapshot.state).toBe("free");
    expect(currentEntitlement).not.toHaveBeenCalled();
  });

  it("resolves to unknown, never pro, when the native plugin call fails (e.g. not compiled in yet)", async () => {
    isNativePlatform.mockReturnValue(true);
    currentEntitlement.mockRejectedValue(new Error("not implemented on ios"));
    const { nativeStoreKitEntitlementProvider } = await import("@/lib/pro/entitlement");

    const snapshot = await nativeStoreKitEntitlementProvider.getEntitlement();

    expect(snapshot.state).toBe("unknown");
  });

  it("checks every known product id and forwards whichever one is active", async () => {
    isNativePlatform.mockReturnValue(true);
    const { nativeStoreKitEntitlementProvider, PRO_MONTHLY_PRODUCT_ID, ALL_PRODUCT_IDS } = await import(
      "@/lib/pro/entitlement"
    );
    currentEntitlement.mockImplementation((options: { productId: string }) =>
      Promise.resolve(
        options.productId === PRO_MONTHLY_PRODUCT_ID
          ? { state: "pro", expiresAt: "2027-01-01T00:00:00.000Z" }
          : { state: "free" },
      ),
    );

    const snapshot = await nativeStoreKitEntitlementProvider.getEntitlement();

    expect(currentEntitlement).toHaveBeenCalledTimes(ALL_PRODUCT_IDS.length);
    expect(currentEntitlement).toHaveBeenCalledWith({ productId: PRO_MONTHLY_PRODUCT_ID });
    expect(snapshot.state).toBe("pro");
    expect(snapshot.expiresAt).toBe("2027-01-01T00:00:00.000Z");
  });
});

describe("purchasePro", () => {
  beforeEach(() => {
    isNativePlatform.mockReturnValue(false);
    purchase.mockReset();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws on web — there is no purchase mechanism there", async () => {
    const { purchasePro } = await import("@/lib/pro/entitlement");
    await expect(purchasePro()).rejects.toThrow();
    expect(purchase).not.toHaveBeenCalled();
  });

  it("calls the native plugin with the configured product id on native", async () => {
    isNativePlatform.mockReturnValue(true);
    purchase.mockResolvedValueOnce({ state: "pro" });
    const { purchasePro, PRO_MONTHLY_PRODUCT_ID } = await import("@/lib/pro/entitlement");

    const snapshot = await purchasePro();

    expect(purchase).toHaveBeenCalledWith({ productId: PRO_MONTHLY_PRODUCT_ID });
    expect(snapshot.state).toBe("pro");
  });
});

describe("restorePurchases", () => {
  beforeEach(() => {
    isNativePlatform.mockReturnValue(false);
    restore.mockReset();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is a no-op on web", async () => {
    const { restorePurchases } = await import("@/lib/pro/entitlement");
    await expect(restorePurchases()).resolves.toEqual({ restored: false });
    expect(restore).not.toHaveBeenCalled();
  });

  it("calls the native plugin on native", async () => {
    isNativePlatform.mockReturnValue(true);
    restore.mockResolvedValueOnce({ restored: true });
    const { restorePurchases } = await import("@/lib/pro/entitlement");

    await expect(restorePurchases()).resolves.toEqual({ restored: true });
  });
});
