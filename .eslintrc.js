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
            "location.href",
            "Object.assign",
            "Object.entries",
            "Object.keys",
            "Promise"
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
