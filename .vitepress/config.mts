import { defineConfig } from "vitepress"
import VueDevTools from "vite-plugin-vue-devtools"
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
    plugins: [VueDevTools()],
  },
})
