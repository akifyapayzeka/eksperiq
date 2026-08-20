import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const scriptPath = join(process.cwd(), "scripts", "check-storekit-release-gate.mjs");

function runGate(env: Record<string, string>) {
  return () =>
    execFileSync(process.execPath, [scriptPath], {
      env: {
        ...process.env,
        ...env,
      },
      encoding: "utf8",
    });
}

describe("check-storekit-release-gate", () => {
  it("passes while StoreKit purchases are disabled", () => {
    expect(runGate({})).not.toThrow();
  });

  it("fails if StoreKit purchases are enabled before App Store products and sandbox purchase are verified", () => {
    expect(runGate({ NEXT_PUBLIC_STOREKIT_PURCHASES_ENABLED: "true" })).toThrow();
  });

  it("passes only when product ids and sandbox purchase are explicitly verified", () => {
    expect(
      runGate({
        NEXT_PUBLIC_STOREKIT_PURCHASES_ENABLED: "true",
        STOREKIT_APP_STORE_PRODUCTS_VERIFIED: "true",
        STOREKIT_SANDBOX_PURCHASE_VERIFIED: "true",
      }),
    ).not.toThrow();
  });
});
