import { createSidebar } from "."

export const rustSidebar = createSidebar("/rust/", [
  {
    text: "数据结构",
    collapsed: false,
    items: [
      {
        text: "栈",
        link: "/rust/data-structure/stack",
      },
    ],
  },
  {
    text: "算法",
    collapsed: false,
    items: [],
  },
  {
    text: "游戏开发",
    collapsed: false,
    items: [
      {
        text: "简短的游戏设计文档",
        link: "/rust/game/document",
      },
    ],
  },
])
