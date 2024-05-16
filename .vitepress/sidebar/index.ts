import { astGrepSidebar } from "./ast-grep"
import { treeSitterSidebar } from "./tree-sitter"
import type { DefaultTheme } from "vitepress"

export function createSidebar(
  path: string,
  sidebar: DefaultTheme.SidebarMulti[keyof DefaultTheme.SidebarMulti],
) {
  return {
    [path]: sidebar,
  }
}

export const sidebar: DefaultTheme.Sidebar = {
  ...astGrepSidebar,
  ...treeSitterSidebar,
}
