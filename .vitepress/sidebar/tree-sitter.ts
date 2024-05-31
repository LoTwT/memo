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
        link: "/tree-sitter/docs/using-parsers/intro",
        items: [
          { text: "使用解析器", link: "/tree-sitter/docs/using-parsers/intro" },
          {
            text: "入门指南",
            link: "/tree-sitter/docs/using-parsers/getting-started",
          },
          {
            text: "基本解析",
            link: "/tree-sitter/docs/using-parsers/basic-parsing",
          },
          {
            text: "高级解析",
            link: "/tree-sitter/docs/using-parsers/advanced-parsing",
          },
          {
            text: "其他树操作",
            link: "/tree-sitter/docs/using-parsers/other-tree-operations",
          },
          {
            text: "使用查询进行模式匹配",
            link: "/tree-sitter/docs/using-parsers/pattern-matching-with-queries",
          },
          {
            text: "静态节点类型",
            link: "/tree-sitter/docs/using-parsers/static-node-types",
          },
        ],
      },
      {
        text: "创建解析器",
        link: "/tree-sitter/docs/creating-parsers/intro",
        items: [
          {
            text: "创建解析器",
            link: "/tree-sitter/docs/creating-parsers/intro",
          },
          {
            text: "入门指南",
            link: "/tree-sitter/docs/creating-parsers/getting-started",
          },
          {
            text: "工具概述",
            link: "/tree-sitter/docs/creating-parsers/tool-overview",
          },
          {
            text: "编写语法",
            link: "/tree-sitter/docs/creating-parsers/writing-the-grammar",
          },
          {
            text: "词法分析",
            link: "/tree-sitter/docs/creating-parsers/lexical-analysis",
          },
        ],
      },
    ],
  },
])
