// https://vitepress.dev/guide/custom-theme
import { h } from "vue"
import DefaultTheme from "vitepress/theme"
import type { Theme } from "vitepress"
import "./style.css"

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  // eslint-disable-next-line unused-imports/no-unused-vars
  enhanceApp({ app, router, siteData }) {
    // ...
  },
} satisfies Theme
