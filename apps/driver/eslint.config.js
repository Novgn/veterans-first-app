/* eslint-env node */
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const jsxA11yPlugin = require('eslint-plugin-jsx-a11y');
const sharedConfig = require('@veterans-first/config/eslint');
const { importRulesOnly, a11yRulesOnly } = require('@veterans-first/config/eslint');

module.exports = defineConfig([
  // Veterans First shared base config (TypeScript rules only)
  ...sharedConfig,
  // Expo specific config (includes React, import plugins)
  expoConfig,
  // Add our import sorting rules (plugin already in expo config)
  importRulesOnly,
  // Add jsx-a11y plugin and rules for accessibility (not included in expo config)
  {
    plugins: {
      'jsx-a11y': jsxA11yPlugin,
    },
    ...a11yRulesOnly,
  },
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      'react/display-name': 'off',
    },
  },
]);
