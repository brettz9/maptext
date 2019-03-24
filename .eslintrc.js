module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": ["ash-nazg/sauron-node"],
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
