import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", ".wave*.cjs", ".wave*.sh", "**/__evals_DISABLED__/**"]),
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "perfectionist/sort-objects": "off",
      "perfectionist/mutable-variant": "off",
      "spellcheck/spell-checker": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);

export default eslintConfig;