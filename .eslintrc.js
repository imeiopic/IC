require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
  },
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/eslint-config-typescript",
    // Prettier MUST be the last extension to properly override styling rules
    "@vue/eslint-config-prettier/skip-formatting",
  ],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    // Add any custom project rules here
    "vue/multi-word-component-names": "off", // Optional: prevents errors on single-word component names like "Homepage.vue"
  },
};
