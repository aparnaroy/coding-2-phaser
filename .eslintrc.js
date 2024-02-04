module.exports = {
    env: {
        es2022: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
    ],
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint'
    ],
    "overrides": [
        {
            "files": ["test/**/*"],
            "env": {
                "jest": true
            }
        }
    ]
};