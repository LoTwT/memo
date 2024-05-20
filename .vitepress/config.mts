import { type Plugin, defineConfig } from "vitepress"
import VueDevTools from "vite-plugin-vue-devtools"
import UnoCSS from "unocss/vite"
import VueMacros from "unplugin-vue-macros/vite"
import { nav } from "./nav"
import { sidebar } from "./sidebar"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Ayingott's Memo",
  description: "Ayingott's Memo",

  head: [["link", { rel: "icon", href: "/mea.jpg" }]],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/mea.jpg",

    nav,

    sidebar,

    socialLinks: [{ icon: "github", link: "https://github.com/lotwt" }],
  },

  cleanUrls: true,

  vite: {
    plugins: [VueMacros(), SourceRedirectPlugin(), UnoCSS(), VueDevTools()],
  },
})

function SourceRedirectPlugin(): Plugin {
  return {
    name: "vitepress:source-redirect",
    transform: (code, id) => {
      if (id.endsWith("md")) {
        const res = code.replaceAll("/public", "")
        return {
          code: res,
          map: null,
        }
      }
    },
  }
}
