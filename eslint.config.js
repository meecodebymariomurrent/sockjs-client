'use strict';

const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      'tests/html/lib/sockjs.js',
      'tests/html/static/**'
    ]
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: Object.assign({}, globals.node, globals.browser, { Uint8Array: 'readonly' })
    },
    rules: {
      'consistent-this': ['error', 'self'],
      quotes: ['warn', 'single', { avoidEscape: true }],
      // lib/ is shipped as ES5 to old browsers, so optional catch bindings
      // (`catch {}`) are not an option; keep unused catch parameters allowed.
      'no-unused-vars': ['error', { caughtErrors: 'none' }]
    }
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: globals.mocha
    }
  }
];
