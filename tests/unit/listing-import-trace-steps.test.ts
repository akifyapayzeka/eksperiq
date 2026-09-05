import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * api/debug/listing-import-trace.js, gövdedeki `step` değerini bir allowlist'e
 * karşı doğruluyor ve listede olmayanı 400 ile reddediyor. Gönderen taraf ise
 * (JS ve Swift) sonucu hiç kontrol etmeyen fire-and-forget bir ping —
 * reddedilen iz kaydı hiçbir iz bırakmadan kayboluyor.
 *
 * Bu gerçekten oldu: `js-client-timeout-grace` adımı arka plan/ön plan
 * yarışını düzelten "grace window" yolunda gönderiliyordu ama allowlist'e
 * eklenmemişti. Bu endpoint'in tek varlık sebebi cihaz konsolu olmaması;
 * logları okuyan kişi "grace yolu hiç çalışmamış" diye yanlış sonuca varırdı
 * — oysa çalışıyor, kaydı sunucu atıyordu.
 *
 * Bu test iki listeyi birbirine bağlar: gönderilen her adım izinli olmalı.
 */

const repoRoot = path.join(__dirname, "..", "..");

function read(relativePath: string): string {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function allowedSteps(): Set<string> {
  const source = read("api/debug/listing-import-trace.js");
  const block = source.match(/ALLOWED_STEPS = new Set\(\[([\s\S]*?)\]\)/);
  if (!block) throw new Error("ALLOWED_STEPS bloğu bulunamadı — endpoint yapısı değişmiş olabilir.");
  return new Set([...block[1].matchAll(/"([a-z-]+)"/g)].map((match) => match[1]));
}

function sentSteps(): Set<string> {
  const js = read("src/lib/listing-import/import-listing.ts");
  const swift = read("ios/App/App/Plugins/EksperIQListingFetchPlugin.swift");
  const steps = new Set<string>();
  // JS: trace("...") — ternary ve çok satırlı çağrılar dahil, `trace(`
  // sonrasındaki tüm string literalleri topla.
  for (const call of js.matchAll(/\btrace\(([\s\S]{0,200}?)\)/g)) {
    for (const literal of call[1].matchAll(/"(js-[a-z-]+)"/g)) steps.add(literal[1]);
  }
  for (const call of swift.matchAll(/DiagnosticTrace\.send\("(swift-[a-z-]+)"/g)) steps.add(call[1]);
  return steps;
}

describe("listing-import iz kaydı adımları", () => {
  it("gönderen tarafta kullanılan her adım endpoint'in allowlist'inde vardır", () => {
    const allowed = allowedSteps();
    const missing = [...sentSteps()].filter((step) => !allowed.has(step)).sort();

    expect(missing, `allowlist'te olmayan adımlar 400 ile sessizce düşer: ${missing.join(", ")}`).toEqual([]);
  });

  it("adım listeleri boş kalmaz — regex bozulursa test sessizce geçmesin", () => {
    expect(allowedSteps().size).toBeGreaterThan(10);
    expect(sentSteps().size).toBeGreaterThan(10);
  });
});
