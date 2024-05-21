# 使用解析器

> [Using Parsers](https://tree-sitter.github.io/tree-sitter/using-parsers)

Tree-sitter 的所有解析功能都是通过 C API 公开的。用高级语言编写的应用程序可以通过像 [node-tree-sitter](https://github.com/tree-sitter/node-tree-sitter) 或 [tree-sitter rust crate](https://github.com/tree-sitter/tree-sitter/tree/master/lib/binding_rust) 这样的绑定库来使用 Tree-sitter。这些库都有它们各自的文档。

本文档将描述如何使用 Tree-sitter 的一般概念，这些概念应该与您使用的语言无关。它还涉及一些 C 语言特有的细节，这些细节在您直接使用 C API 或构建与其他语言的新绑定时非常有用。

这里展示的所有 API 函数都在 [tree_sitter/api.h](https://github.com/tree-sitter/tree-sitter/blob/master/lib/include/tree_sitter/api.h) 头文件中声明和记录。您可能还需要查看[在线的 Rust API 文档](https://docs.rs/tree-sitter)，这些文档与 C API 密切对应。

## 入门指南

### 构建库
