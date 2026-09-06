import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const isNativePlatform = vi.fn(() => false);
vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: () => isNativePlatform() },
}));

const currentEntitlement = vi.fn();
const purchase = vi.fn();
const restore = vi.fn();
const fetchProducts = vi.fn();
vi.mock("@/lib/pro/native-entitlement-plugin", () => ({
  EksperIQEntitlementPlugin: {
    currentEntitlement: (options: unknown) => currentEntitlement(options),
    purchase: (options: unknown) => purchase(options),
    restore: () => restore(),
    fetchProducts: (options: unknown) => fetchProducts(options),
  },
}));

describe("SubscriptionManager", () => {
  beforeEach(() => {
    isNativePlatform.mockReturnValue(false);
    currentEntitlement.mockReset();
    purchase.mockReset();
    restore.mockReset();
    fetchProducts.mockReset();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getProducts", () => {
    it("returns an empty catalog on the web without calling the native plugin", async () => {
      const { SubscriptionManager } = await import("@/lib/pro/subscription-manager");
      await expect(SubscriptionManager.getProducts()).resolves.toEqual([]);
      expect(fetchProducts).not.toHaveBeenCalled();
    });

    it("fetches and caches the real product catalog on native", async () => {
      isNativePlatform.mockReturnValue(true);
      fetchProducts.mockResolvedValue({
        products: [{ productId: "com.eksperiq.app.pro.monthly", displayName: "EksperIQ Pro", displayPrice: "₺150" }],
      });
      const { SubscriptionManager } = await import("@/lib/pro/subscription-manager");

      const first = await SubscriptionManager.getProducts();
      const second = await SubscriptionManager.getProducts();

      expect(first).toHaveLength(1);
      expect(second).toBe(first);
      expect(fetchProducts).toHaveBeenCalledTimes(1);
    });

    it("clearProductsCache forces a fresh native fetch", async () => {
      isNativePlatform.mockReturnValue(true);
      fetchProducts.mockResolvedValue({ products: [] });
      const { SubscriptionManager } = await import("@/lib/pro/subscription-manager");

      await SubscriptionManager.getProducts();
      SubscriptionManager.clearProductsCache();
      await SubscriptionManager.getProducts();

      expect(fetchProducts).toHaveBeenCalledTimes(2);
    });

    it("never claims a cached catalog when the native fetch fails", async () => {
      isNativePlatform.mockReturnValue(true);
      fetchProducts.mockRejectedValue(new Error("not implemented"));
      const { SubscriptionManager } = await import("@/lib/pro/subscription-manager");

      await expect(SubscriptionManager.getProducts()).resolves.toEqual([]);
    });
  });

  describe("getSnapshot", () => {
    it("is always free on the web", async () => {
      const { SubscriptionManager } = await import("@/lib/pro/subscription-manager");
      await expect(SubscriptionManager.getSnapshot()).resolves.toMatchObject({ tier: "free", state: "free" });
      expect(currentEntitlement).not.toHaveBeenCalled();
    });

    it("resolves the pro tier when only the pro product is active", async () => {
      isNativePlatform.mockReturnValue(true);
      const { SubscriptionManager, PRO_MONTHLY_PRODUCT_ID } = await import("@/lib/pro/subscription-manager");
      currentEntitlement.mockImplementation((options: { productId: string }) =>
        Promise.resolve(options.productId === PRO_MONTHLY_PRODUCT_ID ? { state: "pro" } : { state: "free" }),
      );

      await expect(SubscriptionManager.getSnapshot()).resolves.toMatchObject({ tier: "pro", state: "pro" });
    });

    it("ranks proPlus over pro when both are unexpectedly active simultaneously", async () => {
      isNativePlatform.mockReturnValue(true);
      const { SubscriptionManager } = await import("@/lib/pro/subscription-manager");
      currentEntitlement.mockResolvedValue({ state: "pro" });

      await expect(SubscriptionManager.getSnapshot()).resolves.toMatchObject({ tier: "proPlus", state: "pro" });
    });

    it("never claims a paid tier for a non-active state like billingRetry", async () => {
      isNativePlatform.mockReturnValue(true);
      const { SubscriptionManager, PRO_MONTHLY_PRODUCT_ID } = await import("@/lib/pro/subscription-manager");
      currentEntitlement.mockImplementation((options: { productId: string }) =>
        Promise.resolve(options.productId === PRO_MONTHLY_PRODUCT_ID ? { state: "billingRetry" } : { state: "free" }),
      );

      await expect(SubscriptionManager.getSnapshot()).resolves.toMatchObject({ tier: "free", state: "billingRetry" });
    });

    it("falls back to an unknown, non-paid snapshot when native reads fail", async () => {
      isNativePlatform.mockReturnValue(true);
      const { SubscriptionManager } = await import("@/lib/pro/subscription-manager");
      currentEntitlement.mockRejectedValue(new Error("not implemented"));

      await expect(SubscriptionManager.getSnapshot()).resolves.toMatchObject({ tier: "free", state: "unknown" });
    });
  });

  describe("purchase", () => {
    it("throws on the web instead of pretending to purchase", async () => {
      const { SubscriptionManager } = await import("@/lib/pro/subscription-manager");
      await expect(SubscriptionManager.purchase("com.eksperiq.app.pro.monthly")).rejects.toThrow();
      expect(purchase).not.toHaveBeenCalled();
    });

    it("resolves the purchased tier and clears the product cache on success", async () => {
      isNativePlatform.mockReturnValue(true);
      fetchProducts.mockResolvedValue({ products: [{ productId: "x", displayName: "x", displayPrice: "x" }] });
      purchase.mockResolvedValue({ state: "pro" });
      const { SubscriptionManager, PRO_PLUS_MONTHLY_PRODUCT_ID } = await import("@/lib/pro/subscription-manager");

      await SubscriptionManager.getProducts();
      const result = await SubscriptionManager.purchase(PRO_PLUS_MONTHLY_PRODUCT_ID);

      expect(result).toMatchObject({ tier: "proPlus", state: "pro", cancelled: undefined });
      await SubscriptionManager.getProducts();
      expect(fetchProducts).toHaveBeenCalledTimes(2);
    });

    it("does not clear the product cache when the user cancels", async () => {
      isNativePlatform.mockReturnValue(true);
      fetchProducts.mockResolvedValue({ products: [{ productId: "x", displayName: "x", displayPrice: "x" }] });
      purchase.mockResolvedValue({ state: "free", cancelled: true });
      const { SubscriptionManager, PRO_MONTHLY_PRODUCT_ID } = await import("@/lib/pro/subscription-manager");

      await SubscriptionManager.getProducts();
      const result = await SubscriptionManager.purchase(PRO_MONTHLY_PRODUCT_ID);

      expect(result.cancelled).toBe(true);
      await SubscriptionManager.getProducts();
      expect(fetchProducts).toHaveBeenCalledTimes(1);
    });
  });

  describe("restore", () => {
    it("is a no-op on the web", async () => {
      const { SubscriptionManager } = await import("@/lib/pro/subscription-manager");
      await expect(SubscriptionManager.restore()).resolves.toEqual({ restored: false });
      expect(restore).not.toHaveBeenCalled();
    });

    it("delegates to the native plugin on native", async () => {
      isNativePlatform.mockReturnValue(true);
      restore.mockResolvedValue({ restored: true });
      const { SubscriptionManager } = await import("@/lib/pro/subscription-manager");

      await expect(SubscriptionManager.restore()).resolves.toEqual({ restored: true });
    });
  });
});

/**
 * Native taraftaki `currentEntitlement(productId:)` ürüne göre filtre
 * yapmıyordu: `Product.SubscriptionInfo.status` bir abonelik GRUBUNUN
 * durumlarını döndürür ve EksperIQ'nun altı ürünü de tek grupta. `.first`
 * alındığı için her ürün sorgusu aynı grup cevabını veriyordu.
 *
 * Bu testler o durumun JS tarafındaki SONUCUNU gösteriyor: altı ürün de
 * "aktif" derse tier çözümü Pro+'ı seçiyor — yani Pro abonesi Pro+ hakkı
 * kazanıyor. Native düzeltme (productID ile filtreleme) bunu kaynağında
 * kapatıyor; bu testler de yalnızca doğru ürünün aktif dönmesi hâlinde
 * doğru paketin seçildiğini kilitliyor.
 */
describe("tier çözümü — hangi ürünün aktif olduğu önemli", () => {
  it("yalnızca Pro aylık aktifse Pro verir, Pro+ değil", async () => {
    isNativePlatform.mockReturnValue(true);
    currentEntitlement.mockImplementation(async ({ productId }: { productId: string }) =>
      productId === "com.eksperiq.app.pro.monthly" ? { state: "pro" } : { state: "free" },
    );

    const { SubscriptionManager } = await import("@/lib/pro/subscription-manager");
    const snapshot = await SubscriptionManager.getSnapshot();

    expect(snapshot.state).toBe("pro");
    expect(snapshot.tier).toBe("pro");
  });

  it("yalnızca Pro+ haftalık aktifse Pro+ verir", async () => {
    isNativePlatform.mockReturnValue(true);
    currentEntitlement.mockImplementation(async ({ productId }: { productId: string }) =>
      productId === "com.eksperiq.app.proplus.weekly" ? { state: "pro" } : { state: "free" },
    );

    const { SubscriptionManager } = await import("@/lib/pro/subscription-manager");
    const snapshot = await SubscriptionManager.getSnapshot();

    expect(snapshot.tier).toBe("proPlus");
  });

  it("native taraf ürün ayrımı yapmazsa Pro abonesi Pro+ kazanır — bu davranış kaynağında düzeltildi", async () => {
    isNativePlatform.mockReturnValue(true);
    // Duzeltilmeden onceki native davranisin taklidi: her urun icin ayni
    // grup cevabi. Tier cozumu en ust paketi seciyor.
    currentEntitlement.mockResolvedValue({ state: "pro" });

    const { SubscriptionManager } = await import("@/lib/pro/subscription-manager");
    const snapshot = await SubscriptionManager.getSnapshot();

    expect(snapshot.tier).toBe("proPlus");
  });
});
