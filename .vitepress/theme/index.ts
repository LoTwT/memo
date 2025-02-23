import type { Options as EnhancedReadabilitiesOptions } from "@nolebase/vitepress-plugin-enhanced-readabilities/client"
import type { Theme } from "vitepress"
import {
  InjectionKey as EnhancedReadabilitiesInjectionKey,
  SpotlightStyle,
} from "@nolebase/vitepress-plugin-enhanced-readabilities/client"
// https://vitepress.dev/guide/custom-theme
import DefaultTheme from "vitepress/theme"
import Layout from "./Layout.vue"
import "@nolebase/vitepress-plugin-enhanced-readabilities/client/style.css"
import "./nolebase.css"

import "./style.css"
import "uno.css"

export default {
  extends: DefaultTheme,

  // https://vitepress.dev/guide/extending-default-theme#layout-slots
  Layout,

  enhanceApp({ app }) {
    app.provide(EnhancedReadabilitiesInjectionKey, {
      spotlight: {
        defaultToggle: true,
        defaultStyle: SpotlightStyle.Aside,
      },
    } satisfies EnhancedReadabilitiesOptions)

    const components = import.meta.glob("../../components/**/*.vue")
    Object.keys(components).forEach((p) => {
      components[p]().then((mod: any) => {
        const comp = mod.default
        app.component(comp.name, comp)
      })
    })
  },
} satisfies Theme
