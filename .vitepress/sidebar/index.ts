import { treeSitterSidebar } from "./tree-sitter"
import type { DefaultTheme } from "vitepress"

export const sidebar: DefaultTheme.Sidebar = {
  ...treeSitterSidebar,
}
