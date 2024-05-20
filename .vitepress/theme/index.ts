// https://vitepress.dev/guide/custom-theme
import DefaultTheme from "vitepress/theme"
import Layout from "./Layout.vue"
import type { Theme } from "vitepress"
import "./style.css"
import "uno.css"

// https://github.com/vue-macros/vue-macros/blob/main/docs/.vitepress/theme/index.ts
export default {
  extends: DefaultTheme,

  // https://vitepress.dev/guide/extending-default-theme#layout-slots
  Layout,

  // @ts-expect-error unused params
  // eslint-disable-next-line unused-imports/no-unused-vars
  enhanceApp({ app, router, siteData }) {
    // ...
  },
} satisfies Theme
