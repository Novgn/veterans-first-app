/** @type {import('tailwindcss').Config} */
// Veteran Honor design system — tokens are the single source of truth, shared
// with apps/web via @veterans-first/design-tokens. Edit token values there, not here.
const tokens = require('@veterans-first/design-tokens');

module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './src/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: tokens.colors,
      fontFamily: tokens.fontFamily,
      fontSize: tokens.fontSize,
      spacing: tokens.spacing,
      borderRadius: tokens.borderRadius,
      boxShadow: tokens.boxShadow,
    },
  },
  plugins: [],
};
