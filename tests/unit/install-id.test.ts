import { afterEach, describe, expect, it } from "vitest";
import { getInstallId } from "@/lib/api/install-id";

describe("getInstallId", () => {
  afterEach(() => {
    window.localStorage.removeItem("eksperiq:install-id");
  });

  it("generates and persists an id on first call", () => {
    expect(window.localStorage.getItem("eksperiq:install-id")).toBeNull();
    const id = getInstallId();
    expect(id).toBeTruthy();
    expect(window.localStorage.getItem("eksperiq:install-id")).toBe(id);
  });

  it("returns the same id on subsequent calls", () => {
    const first = getInstallId();
    const second = getInstallId();
    expect(second).toBe(first);
  });
});
