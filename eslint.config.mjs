export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        confirm: "readonly",
        crypto: "readonly",
        File: "readonly",
        TextEncoder: "readonly",
        URLSearchParams: "readonly",
        btoa: "readonly",
        messenger: "readonly",
        browser: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
    },
  },
  {
    ignores: ["vendor/i18n.mjs", "api/**"],
  },
];
