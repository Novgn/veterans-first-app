/* eslint-env node */
const sharedConfig = require('@veterans-first/config/eslint');
const { importRulesOnly, a11yRulesOnly } = require('@veterans-first/config/eslint');
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const jsxA11yPlugin = require('eslint-plugin-jsx-a11y');

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
  // Jest environment for test files and mocks
  {
    files: ['**/*.test.{js,ts,tsx}', 'jest.setup*.js', '__mocks__/**/*.js'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
  },
  {
    rules: {
      'react/display-name': 'off',
    },
  },
]);
