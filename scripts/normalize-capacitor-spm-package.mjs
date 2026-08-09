import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const packagePath = join(process.cwd(), "ios", "App", "CapApp-SPM", "Package.swift");

if (!existsSync(packagePath)) {
  process.exit(0);
}

const source = readFileSync(packagePath, "utf8");
const normalized = source.replace(/path: "([^"]+)"/g, (match, packagePath) => {
  return `path: "${packagePath.replaceAll("\\", "/")}"`;
});

if (normalized !== source) {
  writeFileSync(packagePath, normalized);
  process.stdout.write("Normalized Capacitor SPM package paths for cross-platform builds.\n");
}
