/* eslint-env node */
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const sharedConfig = require('@veterans-first/config/eslint');

module.exports = defineConfig([
  // Veterans First shared config
  ...sharedConfig,
  // Expo specific config
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      'react/display-name': 'off',
    },
  },
]);
