/**
 * Shared ESLint flat configuration for Veterans First monorepo
 * Compatible with ESLint 9+ flat config
 *
 * Note: React and React Hooks plugins are NOT included here since
 * framework-specific configs (Next.js, Expo) already include them.
 * This config provides base TypeScript rules only.
 */

const tseslint = require("@typescript-eslint/eslint-plugin");
const tsparser = require("@typescript-eslint/parser");

/** @type {import('eslint').Linter.Config[]} */
const baseConfig = [
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // TypeScript
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",

      // General
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "warn",
    },
  },
  {
    ignores: ["node_modules/", "dist/", ".next/", ".expo/", "build/"],
  },
];

module.exports = baseConfig;
module.exports.baseConfig = baseConfig;
