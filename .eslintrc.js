'use strict';
module.exports = {
  env: {
    browser: true,
    es6: true
  },
  settings: {
    polyfills: [
      'Array.isArray',
      'console',
      'DataTransfer',
      'document.createElementNS',
      'DOMParser',
      'Error',
      'Event',
      'fetch',
      'JSON',
      'location.href',
      'Map',
      'navigator.clipboard',
      'Notification',
      'Notification.permission',
      'Notification.requestPermission',
      'Number.isNaN',
      'Number.parseFloat',
      'Number.parseInt',
      'Object.assign',
      'Object.entries',
      'Object.keys',
      'Promise'
    ]
  },
  overrides: [
    {
      files: 'test/**',
      globals: {
        expect: true
      }
    },
    {
      files: '.eslintrc.js',
      extends: ['plugin:node/recommended-script'],
      rules: {
        'import/no-commonjs': 0
      }
    },
    {
      files: ['server/**'],
      extends: ['plugin:node/recommended-script'],
      rules: {
        strict: 'off',
        'import/unambiguous': 'off',
        'import/no-commonjs': 'off'
      }
    }
  ],
  extends: ['ash-nazg/sauron-node', 'plugin:testcafe/recommended'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    'eslint-comments/require-description': 0
  }
};
