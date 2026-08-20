import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const purchasePlan = vi.fn();
const restorePurchases = vi.fn();

async function renderPaywall(storeKitEnabled: boolean) {
  vi.resetModules();
  purchasePlan.mockReset();
  restorePurchases.mockReset();
  if (storeKitEnabled) {
    process.env.NEXT_PUBLIC_STOREKIT_PURCHASES_ENABLED = "true";
  } else {
    delete process.env.NEXT_PUBLIC_STOREKIT_PURCHASES_ENABLED;
  }

  vi.doMock("@/lib/pro/entitlement", () => ({
    purchasePlan,
    restorePurchases,
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
    delete process.env.NEXT_PUBLIC_STOREKIT_PURCHASES_ENABLED;
  });

  it("does not start a StoreKit purchase while App Store products are not verified", async () => {
    await renderPaywall(false);

    const disabledCtas = screen.getAllByRole("button", { name: /App Store onayı bekleniyor/i });
    expect(disabledCtas).toHaveLength(2);
    expect(screen.getByText(/150 TL/)).toBeInTheDocument();
    expect(screen.getByText(/400 TL/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Satın almaları geri yükle/i })).not.toBeInTheDocument();

    fireEvent.click(disabledCtas[0]);

    expect(purchasePlan).not.toHaveBeenCalled();
    expect(screen.getByText(/Pro abonelikleri App Store Connect ürünleri/i)).toBeInTheDocument();
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
});
