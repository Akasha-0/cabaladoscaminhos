import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  {
    plugins: {
      "react-hooks": {},
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": "off",
      "no-undef": "off",
      "no-empty": "off",
      "no-unreachable": "off",
      "no-useless-escape": "off",
      "no-prototype-builtins": "off",
      "no-redeclare": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
  {
    files: [
      "packages/**/*.ts",
      "packages/**/*.tsx",
      "apps/akasha-portal/src/**/*.ts",
      "apps/akasha-portal/src/**/*.tsx",
      "apps/akasha-portal/src/**/*.js",
      "tests/**/*.ts",
      "tests/**/*.tsx",
    ],
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/coverage/**",
      "**/dist/**",
      "**/build/**",
    ],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        console: "readonly",
        process: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        fetch: "readonly",
        Response: "readonly",
        Request: "readonly",
        Headers: "readonly",
        self: "readonly",
        caches: "readonly",
        module: "readonly",
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        vi: "readonly",
        jest: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-unused-vars": "off",
      "no-undef": "off",
      "no-empty": "off",
      "no-unreachable": "off",
      "no-useless-escape": "off",
      "no-prototype-builtins": "off",
      "no-redeclare": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
];
