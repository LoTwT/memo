import type { Theme } from "vitepress"
// https://vitepress.dev/guide/custom-theme
import DefaultTheme from "vitepress/theme"
import Layout from "./Layout.vue"
import "./style.css"
import "uno.css"

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
