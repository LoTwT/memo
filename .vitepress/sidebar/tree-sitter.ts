import type { DefaultTheme } from "vitepress"

export const treeSitterSidebar: DefaultTheme.SidebarMulti = {
  "/tree-sitter/": [
    {
      text: "ast-grep",
      items: [
        {
          text: "Try Custom Language Support",
          link: "/tree-sitter/ast-grep/custom-language-support",
        },
      ],
    },
  ],
}
