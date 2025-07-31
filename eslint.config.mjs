import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores(["dist", "dev"]), {
    extends: compat.extends("eslint:recommended", "plugin:react/recommended"),

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.node,
            ...globals.jasmine,
            ...globals.protractor,
            CMS: true,
        },

        parser: tsParser,
        ecmaVersion: 2017,
        sourceType: "module",
    },

    settings: {
        react: {
            version: "19",
        },
    },

    rules: {
        eqeqeq: "warn",
        "no-fallthrough": "off",
        "no-shadow": "warn",
        "arrow-body-style": ["warn", "as-needed"],
        "arrow-parens": ["warn", "as-needed"],
        "no-var": "error",
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": ["error"],
    },
}]);