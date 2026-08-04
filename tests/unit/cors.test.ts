import { describe, expect, it, vi } from "vitest";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { applyCorsHeaders, handlePreflight } = require("../../api/_lib/cors.js");

function mockResponse() {
  const headers = new Map<string, string>();
  return {
    statusCode: 0,
    ended: false,
    setHeader: vi.fn((name: string, value: string) => headers.set(name, value)),
    end: vi.fn(function (this: { ended: boolean }) {
      this.ended = true;
    }),
    getHeader: (name: string) => headers.get(name),
  };
}

describe("applyCorsHeaders", () => {
  it("allows the native (Capacitor iOS) origin", () => {
    const request = { headers: { origin: "capacitor://localhost" }, method: "POST" };
    const response = mockResponse();

    applyCorsHeaders(request, response);

    expect(response.getHeader("Access-Control-Allow-Origin")).toBe("capacitor://localhost");
    expect(response.getHeader("Vary")).toBe("Origin");
    expect(response.getHeader("Access-Control-Allow-Methods")).toContain("POST");
    expect(response.getHeader("Access-Control-Allow-Headers")).toContain("X-EksperIQ-Install-Id");
  });

  it("does not echo back an arbitrary/unknown origin", () => {
    const request = { headers: { origin: "https://evil.example.com" }, method: "POST" };
    const response = mockResponse();

    applyCorsHeaders(request, response);

    expect(response.getHeader("Access-Control-Allow-Origin")).toBeUndefined();
  });

  it("is a no-op for same-origin requests (no Origin header)", () => {
    const request = { headers: {}, method: "POST" };
    const response = mockResponse();

    applyCorsHeaders(request, response);

    expect(response.getHeader("Access-Control-Allow-Origin")).toBeUndefined();
  });
});

describe("handlePreflight", () => {
  it("short-circuits an OPTIONS request with 204 and reports it handled", () => {
    const request = { method: "OPTIONS" };
    const response = mockResponse();

    const handled = handlePreflight(request, response);

    expect(handled).toBe(true);
    expect(response.statusCode).toBe(204);
    expect(response.end).toHaveBeenCalled();
  });

  it("leaves non-OPTIONS requests untouched", () => {
    const request = { method: "POST" };
    const response = mockResponse();

    const handled = handlePreflight(request, response);

    expect(handled).toBe(false);
    expect(response.end).not.toHaveBeenCalled();
  });
});
