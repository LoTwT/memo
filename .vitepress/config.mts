import type { Plugin } from "vitepress"
import UnoCSS from "unocss/vite"
import VueDevTools from "vite-plugin-vue-devtools"
import { defineConfig } from "vitepress"
import { nav } from "./nav"
import { sidebar } from "./sidebar"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Ayingott's Memo",
  description: "Ayingott's Memo",

  cleanUrls: true,
  lastUpdated: true,

  head: [["link", { rel: "icon", href: "/mea.jpg" }]],
  sitemap: {
    hostname: "https://memo.ayingott.me",
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/mea.jpg",
    nav,
    sidebar,
    socialLinks: [{ icon: "github", link: "https://github.com/lotwt" }],
    outline: "deep",
  },

  vite: {
    plugins: [SourceRedirectPlugin(), UnoCSS(), VueDevTools()],
    optimizeDeps: {
      exclude: ["@nolebase/vitepress-plugin-enhanced-readabilities/client"],
    },
    ssr: {
      noExternal: ["@nolebase/vitepress-plugin-enhanced-readabilities"],
    },
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
