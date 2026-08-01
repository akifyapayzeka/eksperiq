import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "test-results/**",
    "playwright-report/**",
    "ios/App/App/public/**",
    "ios/App/App/capacitor.config.json",
    "ios/App/App/config.xml",
    "ios/capacitor-cordova-ios-plugins/**",
    "ios/App/CapApp-SPM/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
