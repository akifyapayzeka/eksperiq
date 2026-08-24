import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { NativeProductInfo } from "@/lib/pro/native-entitlement-plugin";

const purchasePlan = vi.fn();
const restorePurchases = vi.fn();
const getProducts = vi.fn();

async function renderPaywall(storeKitEnabled: boolean, products: NativeProductInfo[] = []) {
  vi.resetModules();
  purchasePlan.mockReset();
  restorePurchases.mockReset();
  getProducts.mockReset();
  getProducts.mockResolvedValue(products);
  if (storeKitEnabled) {
    process.env.NEXT_PUBLIC_STOREKIT_PURCHASES_ENABLED = "true";
  } else {
    delete process.env.NEXT_PUBLIC_STOREKIT_PURCHASES_ENABLED;
  }

  vi.doMock("@/lib/pro/entitlement", () => ({
    purchasePlan,
    restorePurchases,
  }));
  vi.doMock("@/lib/pro/subscription-manager", () => ({
    SubscriptionManager: { getProducts },
  }));

  const { PaywallPlansScreen } = await import("@/components/paywall/paywall-plans");
  render(
    <PaywallPlansScreen
      headline="Pro ile devam edin"
      description="Daha fazla analiz kullanın."
      dismissLabel="Geri dön"
      onDismiss={vi.fn()}
    />,
  );
}

describe("PaywallPlansScreen", () => {
  afterEach(() => {
    cleanup();
    vi.doUnmock("@/lib/pro/entitlement");
    vi.doUnmock("@/lib/pro/subscription-manager");
    delete process.env.NEXT_PUBLIC_STOREKIT_PURCHASES_ENABLED;
  });

  it("shows a free plan card and never renders a fabricated price for unloaded products", async () => {
    await renderPaywall(false);

    expect(screen.getByText("Ücretsiz")).toBeInTheDocument();
    expect(screen.getByText("₺0")).toBeInTheDocument();

    await waitFor(() => {
      expect(getProducts).toHaveBeenCalled();
    });
    // No real product data was supplied — must show a neutral placeholder, never a guessed number.
    expect(screen.queryByText(/TL/)).not.toBeInTheDocument();
  });

  it("does not start a StoreKit purchase while App Store products are not verified", async () => {
    await renderPaywall(false);

    const disabledCtas = screen.getAllByRole("button", { name: /App Store onayı bekleniyor/i });
    expect(disabledCtas).toHaveLength(2);
    expect(screen.queryByRole("button", { name: /Satın almaları geri yükle/i })).not.toBeInTheDocument();

    fireEvent.click(disabledCtas[0]);

    expect(purchasePlan).not.toHaveBeenCalled();
    expect(screen.getByText(/Pro abonelikleri App Store Connect ürünleri/i)).toBeInTheDocument();
  });

  it("renders the real localized price once the native product catalog resolves", async () => {
    await renderPaywall(false, [
      {
        productId: "com.eksperiq.app.pro.monthly",
        displayName: "EksperIQ Pro",
        displayPrice: "₺149,99",
        periodUnit: "month",
        periodValue: 1,
      },
    ]);

    expect(await screen.findByText("₺149,99")).toBeInTheDocument();
  });

  it("starts the native purchase flow only when the StoreKit release flag is enabled", async () => {
    purchasePlan.mockResolvedValueOnce({ state: "unknown" });
    await renderPaywall(true);

    fireEvent.click(screen.getByRole("button", { name: "EksperIQ Pro'a geç" }));

    await waitFor(() => {
      expect(purchasePlan).toHaveBeenCalledWith("com.eksperiq.app.pro.monthly");
    });
    expect(screen.getByRole("button", { name: /Satın almaları geri yükle/i })).toBeInTheDocument();
  });

  it("always shows Privacy, Terms, and Manage Subscriptions links regardless of the release flag", async () => {
    await renderPaywall(false);

    expect(screen.getByRole("link", { name: "Gizlilik Politikası" })).toHaveAttribute("href", "/gizlilik");
    expect(screen.getByRole("link", { name: "Kullanım Koşulları" })).toHaveAttribute("href", "/kullanim-kosullari");
    expect(screen.getByRole("link", { name: /Abonelikleri Yönet/i })).toHaveAttribute(
      "href",
      "https://apps.apple.com/account/subscriptions",
    );
  });
});
