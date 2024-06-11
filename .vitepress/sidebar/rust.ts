import { createSidebar } from "."

export const rustSidebar = createSidebar("/rust/", [
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
