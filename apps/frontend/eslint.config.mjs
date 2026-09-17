import prettierConfig from "eslint-config-prettier/flat";
import nextConfig from "eslint-config-next";
import globals from "globals";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  ...nextConfig,
  {
    rules: {
      /* Base Rules */
      "no-undef": "error",
      "no-unused-vars": "off",
      "no-console": "warn",

      /* TypeScript Rules */
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/consistent-type-imports": "warn",

      /* Next.js Rules */
      "@next/next/no-img-element": "off",

      /* React Compiler-era hook rules (new in eslint-plugin-react-hooks 7,
       * pulled in by the Next 16 upgrade) — real, valuable checks, but they
       * fire across dozens of pre-existing call sites inherited from the
       * original codebase that predate these rules. Downgraded to warnings
       * so they stay visible as real follow-up work instead of either
       * blocking the build on a rushed mass-fix or being silently
       * disabled. Tighten back to "error" once addressed. */
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/incompatible-library": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
  {
    // Language options for ESLint
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        ecmaFeatures: { jsx: true },
      },
    },
  },
  {
    // Files and directories to ignore during linting
    ignores: [
      "node_modules",
      ".next/",
      "out/",
      "public/",
      "dist",
      "build",
      "**/*.config.js",
      "**/*.config.mjs",
      "**/*.config.cjs",
    ],
  },
  // Prettier configuration is now applied
  prettierConfig,
];
