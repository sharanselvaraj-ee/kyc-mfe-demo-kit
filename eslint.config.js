// SLIDE: "The flag that was off, but still on" (the ESLint rule CLAUDE.md requires — FLG-002)
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  {
    ignores: ["**/node_modules/**", "**/dist/**", "packages/gen/**", "**/*.generated.*", "tests/test-results/**", "tests/playwright-report/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.cjs", "**/*.mjs"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "no-restricted-syntax": [
        "error",
        {
          // [FLG-002] the only place `.flags` is read is packages/core/src/flags.ts.
          selector: "MemberExpression[property.name='flags']",
          message: "Flags are read only in packages/core/src/flags.ts (FLG-002) — add or use a named accessor there instead of indexing .flags directly.",
        },
        {
          // CLAUDE.md §2: no executable content crosses the agent boundary.
          selector: "CallExpression[callee.name='eval']",
          message: "No eval — CLAUDE.md §2 (no executable content crosses the agent boundary).",
        },
        {
          selector: "NewExpression[callee.name='Function']",
          message: "No `new Function(...)` — CLAUDE.md §2 (no executable content crosses the agent boundary).",
        },
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: "No dangerouslySetInnerHTML — CLAUDE.md §2 (no executable content crosses the agent boundary).",
        },
      ],
    },
  },
  {
    // The one file allowed to read .flags directly (plus tests, which legitimately
    // probe raw fixture/flag data to verify it — see FLG-003's contract tests).
    files: ["packages/core/src/flags.ts", "tests/**"],
    rules: { "no-restricted-syntax": "off" },
  },
);
