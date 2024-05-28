// @ts-check

import { defineConfig } from "@ayingott/eslint-config"

export default defineConfig({
  typescript: true,
  formatters: true,
  markdown: true,
  rules: {
    "vue/singleline-html-element-content-newline": "off",
    "style/operator-linebreak": "off",
  },
})
