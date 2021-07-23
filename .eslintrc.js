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
      'CustomEvent',
      'DataTransfer',
      'document.createElementNS',
      'document.querySelector',
      'document.querySelectorAll',
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
      files: ['cypress/**'],
      extends: ['ash-nazg/sauron-node', 'plugin:cypress/recommended'],
      rules: {
        'import/unambiguous': 0
      }
    },
    {
      files: ['cypress/plugins/index.js'],
      extends: ['ash-nazg/sauron-node-script', 'plugin:cypress/recommended'],
      parserOptions: {
        ecmaVersion: 2021
      }
    },
    {
      files: ['server/**', 'nogin.js'],
      env: {
        browser: false
      },
      extends: ['ash-nazg/sauron-node-script'],
      parserOptions: {
        ecmaVersion: 2021
      },
      rules: {
      }
    }
  ],
  extends: ['ash-nazg/sauron-node-overrides'],
  parserOptions: {
    ecmaVersion: 2021
  },
  rules: {
    'eslint-comments/require-description': 0
  }
};
