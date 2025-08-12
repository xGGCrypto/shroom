// eslint.config.mjs
import tseslint from "typescript-eslint";

export default tseslint.config(
  ...tseslint.configs.recommendedTypeChecked, // add recommended type-aware rules
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 12,
      sourceType: "module",
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json", // required for type-aware linting
        tsconfigRootDir: import.meta.dirname, // important when using flat config
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      semi: "error",
      "comma-dangle": "off",
      "no-undef": "off",
      "prefer-const": "error",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/member-ordering": ["off"],
      "@typescript-eslint/no-deprecated": "error", // Requires parser services
      "require-await": "off",
      "@typescript-eslint/require-await": "warn",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "classProperty",
          format: ["UPPER_CASE"],
          modifiers: ["private", "static", "readonly"],
        },
        {
          selector: ["classMethod", "classProperty"],
          format: ["camelCase"],
          modifiers: ["private"],
          leadingUnderscore: "require",
        },
      ],
    },
  }
);
