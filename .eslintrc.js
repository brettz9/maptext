module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "settings": {
        "polyfills": [
            "DOMParser",
            "JSON",
            "Object.entries", "Object.keys"
        ]
    },
    "extends": ["ash-nazg/sauron"],
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
