# 介绍 {#introduction}

> [Introduction](https://tree-sitter.github.io/tree-sitter/)

Tree-sitter 是一个解析器生成工具，也是一个增量解析库。它可以为源文件构建一个具体的语法树，并在编辑源文件时高效地更新语法树。Tree-sitter 的目标是：

- 足够通用，可以解析任何编程语言
- 足够快速，可以在文本编辑器中每次按键时解析
- 足够健壮，即使存在语法错误也能提供有用的结果
- 无依赖性，因此运行时库（纯 C 语言编写）可以嵌入到任何应用程序中
