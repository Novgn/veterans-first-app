/**
 * Shared ESLint flat configuration for Veterans First monorepo
 * Compatible with ESLint 9+ flat config
 *
 * Exports:
 * - baseConfig: Core TypeScript rules only (for use with framework configs like Expo)
 * - withImport: Base + import sorting rules (use when import plugin not already present)
 * - withA11y: Base + accessibility rules
 * - fullConfig: All rules including import and a11y (for standalone use)
 */

const tseslint = require("@typescript-eslint/eslint-plugin");
const tsparser = require("@typescript-eslint/parser");
const importPlugin = require("eslint-plugin-import");
const jsxA11yPlugin = require("eslint-plugin-jsx-a11y");

/**
 * Base TypeScript configuration - safe to use with any framework
 * Does NOT include import or jsx-a11y plugins to avoid conflicts
 */
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
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
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

/**
 * Import sorting rules only - for configs that need import ordering
 * but already have the import plugin (like expo-config)
 */
const importRulesOnly = {
  rules: {
    // Import sorting and organization
    "import/order": [
      "warn",
      {
        groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
    "import/no-duplicates": "error",
  },
};

/**
 * Accessibility rules only - for configs that need a11y
 * but already have the jsx-a11y plugin
 */
const a11yRulesOnly = {
  rules: {
    // Accessibility (jsx-a11y)
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/anchor-has-content": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/aria-role": "error",
    "jsx-a11y/role-has-required-aria-props": "error",
  },
};

/**
 * Import plugin configuration - includes plugin and rules
 * Use this when import plugin is NOT already present
 */
const withImport = [
  ...baseConfig.slice(0, -1), // Remove ignores, we'll add at end
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
    ...importRulesOnly,
  },
  baseConfig[baseConfig.length - 1], // Add ignores back
];

/**
 * Accessibility plugin configuration - includes plugin and rules
 * Use this when jsx-a11y plugin is NOT already present
 */
const withA11y = [
  ...baseConfig.slice(0, -1),
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: {
      "jsx-a11y": jsxA11yPlugin,
    },
    ...a11yRulesOnly,
  },
  baseConfig[baseConfig.length - 1],
];

/**
 * Full configuration with all plugins
 * Use this for standalone packages that don't use framework configs
 */
const fullConfig = [
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
      import: importPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
    rules: {
      // TypeScript
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",

      // General
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "warn",

      // Import sorting and organization
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/no-duplicates": "error",

      // Accessibility (jsx-a11y)
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-has-content": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
    },
  },
  {
    ignores: ["node_modules/", "dist/", ".next/", ".expo/", "build/"],
  },
];

// Default export is baseConfig for backwards compatibility
module.exports = baseConfig;
module.exports.baseConfig = baseConfig;
module.exports.withImport = withImport;
module.exports.withA11y = withA11y;
module.exports.fullConfig = fullConfig;
module.exports.importRulesOnly = importRulesOnly;
module.exports.a11yRulesOnly = a11yRulesOnly;
