const globals = require("globals");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const _import = require("eslint-plugin-import");

const tsParser = require("@typescript-eslint/parser");
const js = require("@eslint/js");

const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

module.exports = [
    {
        ignores: ["dist/*", "**/*.js", "!**/get-dex.js"],
    },
    ...compat.extends("eslint:recommended"),
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.commonjs,
                fs: false,
                path: false,
                config: false,
                pendingVerification: false,
                discord: false,
                PS: false,
                lodash: false,
            },

            ecmaVersion: "latest",
            sourceType: "commonjs",
        },

        rules: {
            "no-unused-vars": "error",
            semi: ["error", "always"],
            "comma-spacing": "error",
            "no-extra-semi": "error",

            quotes: [
                "error",
                "double",
                {
                    avoidEscape: true,
                },
            ],

            "no-var": "error",
        },
    },
    ...compat
        .extends(
            "eslint:recommended",
            "plugin:@typescript-eslint/recommended",
            "plugin:@typescript-eslint/recommended-requiring-type-checking"
        )
        .map((config) => ({
            ...config,
            files: ["**/**/*.ts", "**/*.ts"],
        })),
    {
        files: ["**/**/*.ts", "**/*.ts"],

        plugins: {
            "@typescript-eslint": typescriptEslint,
            import: _import,
        },

        languageOptions: {
            parser: tsParser,
            ecmaVersion: 5,
            sourceType: "script",

            parserOptions: {
                project: ["./tsconfig.json"],
            },
        },

        rules: {
            "no-var": "off",
            "no-unused-vars": "off",
            "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
            "@typescript-eslint/consistent-type-imports": "error",
            "@typescript-eslint/no-inferrable-types": "off",
            "@typescript-eslint/no-this-alias": "off",
            "@typescript-eslint/no-non-null-assertion": "error",
            "@typescript-eslint/no-unused-vars": "error",
            "@typescript-eslint/prefer-ts-expect-error": "error",
            "@typescript-eslint/restrict-plus-operands": "off",
            "@typescript-eslint/triple-slash-reference": "off",
            "import/consistent-type-specifier-style": ["error", "prefer-top-level"],

            "import/order": [
                "error",
                {
                    groups: ["builtin", "external", "internal", "object", ["parent", "sibling"], "index", "type"],

                    pathGroups: [
                        {
                            pattern: "../src/*",
                            group: "type",
                            position: "before",
                        },
                        {
                            pattern: "../types/*",
                            group: "type",
                            position: "after",
                        },
                        {
                            pattern: "[!/]",
                            group: "type",
                            position: "before",
                        },
                    ],

                    distinctGroup: false,

                    alphabetize: {
                        order: "asc",
                    },

                    "newlines-between": "always-and-inside-groups",
                },
            ],
        },
    },
    {
        files: ["**/build.ts", "**/tsc.ts"],

        languageOptions: {
            ecmaVersion: 5,
            sourceType: "script",

            parserOptions: {
                project: ["./tsconfig.build.json"],
            },
        },
    },
];
