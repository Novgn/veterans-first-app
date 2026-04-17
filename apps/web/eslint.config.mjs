import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import sharedConfig, { importRulesOnly, a11yRulesOnly } from "@veterans-first/config/eslint";

const eslintConfig = defineConfig([
  // Veterans First shared base config (TypeScript rules only)
  ...sharedConfig,
  // Next.js specific configs (includes React, import, a11y plugins)
  ...nextVitals,
  ...nextTs,
  // Add our import sorting rules (plugin already in next config)
  importRulesOnly,
  // Add our accessibility rules (plugin already in next config)
  a11yRulesOnly,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
