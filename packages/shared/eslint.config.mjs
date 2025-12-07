import js from "@eslint/js";
import { fullConfig } from "@veterans-first/config/eslint";

export default [
  js.configs.recommended,
  ...fullConfig,
  {
    languageOptions: {
      globals: {
        console: "readonly",
        fetch: "readonly",
        RequestInit: "readonly",
        process: "readonly",
      },
    },
    rules: {
      // Disable base no-unused-vars in favor of @typescript-eslint version
      // which already handles argsIgnorePattern: "^_"
      "no-unused-vars": "off",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];
