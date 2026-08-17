import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const source = join(process.cwd(), "public", "brand", "source", "eksperiq-app-icon-master-1024.png");
const output = join(process.cwd(), "public", "app-store-icon-1024.png");
const iosIcon = join(
  process.cwd(),
  "ios",
  "App",
  "App",
  "Assets.xcassets",
  "AppIcon.appiconset",
  "AppIcon-512@2x.png",
);

if (!existsSync(source)) {
  console.error(`Master ikon bulunamadi: ${source}`);
  console.error("public/app-store-icon-1024.png ve iOS AppIcon dogrudan guncel; bu adim atlandi.");
  process.exit(0);
}

copyFileSync(source, output);
copyFileSync(source, iosIcon);
console.log(`App Store 1024x1024 ikon guncellendi: ${output}`);
