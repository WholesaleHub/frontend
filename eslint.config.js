import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),

  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },

  {
    files: ["src/pages/**/*.{ts,tsx}"],
    rules: {
      // WholesaleHub currently loads API data from page-level effects.
      // Refactoring these pages to router loaders or a server-state library
      // belongs in a separate architectural issue.
      "react-hooks/set-state-in-effect": "off",
    },
  },

  {
    files: ["src/context/**/*.{ts,tsx}"],
    rules: {
      // The existing context modules export both providers and consumer hooks.
      // This is valid application code but prevents component-only Fast Refresh.
      "react-refresh/only-export-components": "off",
    },
  },
]);
