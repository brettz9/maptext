module.exports = {
    "env": {
      "browser": true,
      "es6": true
    },
    "settings": {
      "polyfills": [
        "Array.isArray",
        "console",
        "DataTransfer",
        "DOMParser",
        "Error",
        "fetch",
        "JSON",
        "location.href",
        "Map",
        "navigator.clipboard",
        "Notification",
        "Notification.permission",
        "Notification.requestPermission",
        "Object.assign",
        "Object.entries",
        "Object.keys",
        "Promise"
      ]
    },
    "overrides": [
      {
        "files": ["server/**"],
        "rules": {
          "strict": "off",
          "import/unambiguous": "off",
          "import/no-commonjs": "off"
        }
      }
    ],
    "extends": ["ash-nazg/sauron", "plugin:testcafe/recommended"],
    "globals": {
      "Atomics": "readonly",
      "SharedArrayBuffer": "readonly"
    },
    "parser": "babel-eslint",
    "parserOptions": {
      "ecmaVersion": 2018,
      "sourceType": "module"
    },
    "rules": {
      // Todo: Making explicit here for Atom `eslint-tab-length`, though
      //  still not working; test
      "indent": ["error", 2]
    }
};
