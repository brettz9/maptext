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
      'document.title',
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
    },
    {
      files: ['src/components/**', 'src/view-components/**'],
      rules: {
        // Define a snippet to add this until may fully automate with
        //   name of file
        'no-restricted-syntax': ['error', {
          selector: 'Literal[value="my-element"]:matches(' +
            'CallExpression > Literal)',
          message: 'Replace this placeholder with your own element name'
        }],
        'jsdoc/require-jsdoc': ['error', {
          require: {
            // ArrowFunctionExpression: true,
            ClassDeclaration: true,
            ClassExpression: true,
            FunctionDeclaration: true, // Default is true
            // FunctionExpression: true,
            MethodDefinition: false
          },
          contexts: [
            'MethodDefinition:not([' +
              // hyperHTML-Element lifecycle
              'key.name=/created|render|observedAttributes/' +
            ']) > FunctionExpression'
          ]
        }],
        // Generally want to grab from instance method
        'class-methods-use-this': 0
      }
    }
  ],
  extends: ['ash-nazg/sauron-node-overrides'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2021
  },
  rules: {
  }
};
