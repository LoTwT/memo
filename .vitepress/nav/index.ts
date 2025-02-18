import type { DefaultTheme } from "vitepress"

export const nav: DefaultTheme.NavItem[] = [
  { text: "rust", link: "/rust/index", activeMatch: "/rust/" },
  {
    text: "tree-sitter",
    link: "/tree-sitter/index",
    activeMatch: "/tree-sitter/",
  },
]
