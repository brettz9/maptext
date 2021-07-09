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
      files: ['server/**'],
      env: {
        browser: false
      },
      extends: ['ash-nazg/sauron-node-script'],
      rules: {
      }
    }
  ],
  extends: ['ash-nazg/sauron-node-overrides', 'plugin:testcafe/recommended'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {
    'eslint-comments/require-description': 0
  }
};
