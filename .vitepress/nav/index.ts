import type { DefaultTheme } from "vitepress"

export const nav: DefaultTheme.NavItem[] = [
  { text: "Rust", link: "/rust/index", activeMatch: "/rust/" },
  {
    text: "tree-sitter",
    link: "/tree-sitter/index",
    activeMatch: "/tree-sitter/",
  },
]
