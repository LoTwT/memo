# 使用解析器 {#using-parsers}

> [Using Parsers](https://tree-sitter.github.io/tree-sitter/using-parsers)

Tree-sitter 的所有解析功能都是通过 C API 公开的。用高级语言编写的应用程序可以通过像 [node-tree-sitter](https://github.com/tree-sitter/node-tree-sitter) 或 [tree-sitter rust crate](https://github.com/tree-sitter/tree-sitter/tree/master/lib/binding_rust) 这样的绑定库来使用 Tree-sitter。这些库都有它们各自的文档。

本文档将描述如何使用 Tree-sitter 的一般概念，这些概念应该与您使用的语言无关。它还涉及一些 C 语言特有的细节，这些细节在您直接使用 C API 或构建与其他语言的新绑定时非常有用。

这里展示的所有 API 函数都在 [tree_sitter/api.h](https://github.com/tree-sitter/tree-sitter/blob/master/lib/include/tree_sitter/api.h) 头文件中声明和记录。您可能还需要查看[在线的 Rust API 文档](https://docs.rs/tree-sitter)，这些文档与 C API 密切对应。

## 入门指南 {#getting-started}

### 构建库 {#building-the-library}

要在 POSIX 系统上构建库，只需在 Tree-sitter 目录中运行 `make`。这将创建一个名为 `libtree-sitter.a` 的静态库以及动态库。

或者，您可以通过将一个源文件添加到构建中来将库合并到更大的项目的构建系统中。编译时，源文件需要将两个目录添加到包含路径中：

源文件：

- `tree-sitter/lib/src/lib.c`

包含目录：

- `tree-sitter/lib/src`
- `tree-sitter/lib/include`

### 基本对象 {#the-basic-objects}

使用 Tree-sitter 时涉及四种主要类型的对象：语言、解析器、语法树和语法节点。在 C 语言中，它们分别被称为 `TSLanguage`、`TSParser`、`TSTree` 和 `TSNode`。

- `TSLanguage` 是一个定义如何解析特定编程语言的不透明对象。每个 `TSLanguage` 的代码都是由 Tree-sitter 生成的。许多语言已经在 [Tree-sitter GitHub 组织](https://github.com/tree-sitter)的独立 Git 仓库中提供。有关如何创建新语言，请参见[下一篇](/tree-sitter/docs/creating-parsers)。
- `TSParser` 是一个有状态的对象，可以被分配一个 `TSLanguage`，并用于根据某些源代码生成一个 `TSTree`。
- `TSTree` 表示整个源代码文件的语法树。它包含表示源代码结构的 `TSNode` 实例。在源代码更改时，它也可以被编辑并用于生成新的 `TSTree`。
- `TSNode` 表示语法树中的单个节点。它跟踪在源代码中的起始和结束位置，以及与其他节点的关系，如父节点、兄弟节点和子节点。
