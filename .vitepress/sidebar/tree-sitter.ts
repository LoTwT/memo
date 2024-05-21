import { createSidebar } from "."

export const treeSitterSidebar = createSidebar("/tree-sitter/", [
  {
    text: "文档翻译",
    collapsed: false,
    items: [
      {
        text: "介绍",
        link: "/tree-sitter/docs/introduction",
      },
      {
        text: "使用解析器",
        link: "/tree-sitter/docs/using-parsers",
      },
      {
        text: "创建解析器",
        link: "/tree-sitter/docs/creating-parsers",
      },
    ],
  },
])
