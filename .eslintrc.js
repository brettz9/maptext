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
        "files": ["server/*"],
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
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        "indent": [2]
    }
};
