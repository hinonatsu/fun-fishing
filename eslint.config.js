import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**", "test-results/**", "playwright-report/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}", "FishingHero.tsx"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  { files: ["*.config.*"], languageOptions: { globals: { process: "readonly" } } },
  { files: ["scripts/*.mjs"], languageOptions: { globals: { process: "readonly", console: "readonly", URL: "readonly", document: "readonly", getComputedStyle: "readonly" } } },
);
