import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const scanRoots = ["src", "docs", "README.md"];
const allowedExtensions = new Set([".md", ".ts", ".tsx"]);

const forbiddenClaims = [
  "kesin al",
  "kesin al\u0131n\u0131r",
  "asla alma",
  "hasars\u0131zd\u0131r",
  "sorunsuzdur",
  "ekspertize gerek yok",
  "sat\u0131n almaya uygundur",
];

const safeContextMarkers = [
  "garanti etmez",
  "yerine ge\u00e7mez",
  "i\u00e7ermiyor",
  "i\u00e7ermez",
  "d\u00fczeltilir",
  "\u00fcretmiyor",
  "\u00fcretirse",
  "\u00fcretiyorsa",
  "iddias\u0131",
  "alg\u0131s\u0131",
  "yasak",
  "risk",
  "kullanmamal\u0131d\u0131r",
  "a\u00e7\u0131lmamas\u0131 gereken",
  "uygun oldu\u011funu garanti etmez",
];

function hasAllowedExtension(filePath) {
  return [...allowedExtensions].some((extension) => filePath.endsWith(extension));
}

function collectFiles(entry) {
  const stats = statSync(entry);

  if (stats.isFile()) {
    return hasAllowedExtension(entry) ? [entry] : [];
  }

  return readdirSync(entry).flatMap((child) => collectFiles(join(entry, child)));
}

function isUnsafeLine(line, context) {
  const normalizedLine = line.toLocaleLowerCase("tr-TR");
  const normalizedContext = context.toLocaleLowerCase("tr-TR");
  const hasForbiddenClaim = forbiddenClaims.some((claim) => normalizedLine.includes(claim.toLocaleLowerCase("tr-TR")));

  if (!hasForbiddenClaim) return false;

  return !safeContextMarkers.some((marker) => normalizedContext.includes(marker.toLocaleLowerCase("tr-TR")));
}

const files = scanRoots.flatMap((root) => collectFiles(root));

for (const file of files) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);

  lines.forEach((line, index) => {
    const context = lines.slice(Math.max(0, index - 10), index + 1).join("\n");
    if (isUnsafeLine(line, context)) {
      console.error(`Safe claim check failed: ${relative(process.cwd(), file)}:${index + 1}: ${line.trim()}`);
      process.exitCode = 1;
    }
  });
}

if (!process.exitCode) {
  console.log("Safe claim check passed.");
}
