import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['eslint/**/*.js', 'prettier/**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      ecmaVersion: 2023,
      globals: {
        ...globals.node,
      },
    },
    rules: {},
  },
  { ignores: ['node_modules/**', 'typescript/**'] },
];
