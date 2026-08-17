import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("profile data export download", () => {
  const source = readFileSync("src/components/profile/data-management-section.tsx", "utf8");

  it("keeps the JSON blob URL alive long enough for Safari/WebView downloads", () => {
    expect(source).toContain("window.setTimeout(() => URL.revokeObjectURL(url), 1000)");
    expect(source).not.toContain("link.click();\n    document.body.removeChild(link);\n    URL.revokeObjectURL(url);");
  });
});
