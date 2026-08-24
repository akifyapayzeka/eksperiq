import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { hashOriginalTransactionId, saveEntitlementRecord, getEntitlementRecord } = require("../../api/_lib/iap-store.js") as {
  hashOriginalTransactionId: (id: string, environment?: string) => string;
  saveEntitlementRecord: (id: string, record: unknown, environment?: string) => Promise<unknown>;
  getEntitlementRecord: (id: string, environment?: string) => Promise<unknown>;
};

/**
 * Apple's App Store Server Notifications V2 legitimately delivers both
 * Sandbox and Production notifications to the same webhook URL. Without
 * environment folded into the storage key, a Sandbox notification for a
 * given originalTransactionId could read or overwrite the Production
 * record for the same conceptual id (or vice versa) — this is what the key
 * scheme must prevent.
 */
describe("iap-store environment isolation", () => {
  it("hashes the same id differently across environments", () => {
    expect(hashOriginalTransactionId("txn-1", "Production")).not.toBe(hashOriginalTransactionId("txn-1", "Sandbox"));
  });

  it("defaults to Production when no environment is passed, for backward compatibility", () => {
    expect(hashOriginalTransactionId("txn-1")).toBe(hashOriginalTransactionId("txn-1", "Production"));
  });

  it("a Sandbox record for an id never overwrites or is visible as that id's Production record", async () => {
    await saveEntitlementRecord("txn-shared", { state: "pro", tag: "prod" }, "Production");
    await saveEntitlementRecord("txn-shared", { state: "revoked", tag: "sandbox" }, "Sandbox");

    const prodRecord = (await getEntitlementRecord("txn-shared", "Production")) as { tag: string } | null;
    const sandboxRecord = (await getEntitlementRecord("txn-shared", "Sandbox")) as { tag: string } | null;

    expect(prodRecord?.tag).toBe("prod");
    expect(sandboxRecord?.tag).toBe("sandbox");
  });
});
