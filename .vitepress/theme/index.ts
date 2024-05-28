// https://vitepress.dev/guide/custom-theme
import DefaultTheme from "vitepress/theme"
import type { Theme } from "vitepress"
import Layout from "./Layout.vue"
import "./style.css"
import "uno.css"

// https://github.com/vue-macros/vue-macros/blob/main/docs/.vitepress/theme/index.ts
export default {
  extends: DefaultTheme,

  // https://vitepress.dev/guide/extending-default-theme#layout-slots
  Layout,

  enhanceApp({ app }) {
    const components = import.meta.glob("../../components/**/*.vue")
    Object.keys(components).forEach((p) => {
      components[p]().then((mod: any) => {
        const comp = mod.default
        app.component(comp.name, comp)
      })
    })
  },
} satisfies Theme
