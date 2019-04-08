module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "settings": {
        "polyfills": [
            "console",
            "DOMParser",
            "JSON",
            "Object.assign",
            "Object.entries",
            "Object.keys"
        ]
    },
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
