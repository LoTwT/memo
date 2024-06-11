import type { DefaultTheme } from "vitepress"
import { astGrepSidebar } from "./ast-grep"
import { treeSitterSidebar } from "./tree-sitter"
import { rustSidebar } from "./rust"

export function createSidebar(
  path: string,
  sidebar: DefaultTheme.SidebarMulti[keyof DefaultTheme.SidebarMulti],
) {
  return {
    [path]: sidebar,
  }
}

export const sidebar: DefaultTheme.Sidebar = {
  ...rustSidebar,
  ...treeSitterSidebar,
  ...astGrepSidebar,
}
