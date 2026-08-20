import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const isNativePlatform = vi.fn(() => false);
vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => isNativePlatform() },
}));

const currentEntitlement = vi.fn();
vi.mock("@/lib/pro/native-entitlement-plugin", () => ({
  EksperIQEntitlementPlugin: {
    currentEntitlement: (options: unknown) => currentEntitlement(options),
    purchase: vi.fn(),
    restore: vi.fn(),
  },
}));

describe("resolveSubscriptionTier", () => {
  beforeEach(() => {
    isNativePlatform.mockReturnValue(false);
    currentEntitlement.mockReset();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is always free on the web", async () => {
    const { resolveSubscriptionTier } = await import("@/lib/pro/tier");
    await expect(resolveSubscriptionTier()).resolves.toBe("free");
    expect(currentEntitlement).not.toHaveBeenCalled();
  });

  it("is free on native when nothing is active", async () => {
    isNativePlatform.mockReturnValue(true);
    currentEntitlement.mockResolvedValue({ state: "free" });
    const { resolveSubscriptionTier } = await import("@/lib/pro/tier");

    await expect(resolveSubscriptionTier()).resolves.toBe("free");
  });

  it("distinguishes pro from proPlus by product id, unlike the raw EntitlementState", async () => {
    isNativePlatform.mockReturnValue(true);
    const { PRO_PLUS_MONTHLY_PRODUCT_ID } = await import("@/lib/pro/entitlement");
    currentEntitlement.mockImplementation((options: { productId: string }) =>
      Promise.resolve(options.productId === PRO_PLUS_MONTHLY_PRODUCT_ID ? { state: "pro" } : { state: "free" }),
    );
    const { resolveSubscriptionTier } = await import("@/lib/pro/tier");

    await expect(resolveSubscriptionTier()).resolves.toBe("proPlus");
  });

  it("resolves to pro when only the pro product is active", async () => {
    isNativePlatform.mockReturnValue(true);
    const { PRO_MONTHLY_PRODUCT_ID } = await import("@/lib/pro/entitlement");
    currentEntitlement.mockImplementation((options: { productId: string }) =>
      Promise.resolve(options.productId === PRO_MONTHLY_PRODUCT_ID ? { state: "pro" } : { state: "free" }),
    );
    const { resolveSubscriptionTier } = await import("@/lib/pro/tier");

    await expect(resolveSubscriptionTier()).resolves.toBe("pro");
  });

  it("never claims a paid tier when the native plugin call fails", async () => {
    isNativePlatform.mockReturnValue(true);
    currentEntitlement.mockRejectedValue(new Error("not implemented on ios"));
    const { resolveSubscriptionTier } = await import("@/lib/pro/tier");

    await expect(resolveSubscriptionTier()).resolves.toBe("free");
  });
});
