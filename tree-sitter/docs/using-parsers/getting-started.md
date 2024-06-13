# 入门指南 {#getting-started}

## 构建库 {#building-the-library}

要在 POSIX 系统上构建库，只需在 Tree-sitter 目录中运行 `make`。这将创建一个名为 `libtree-sitter.a` 的静态库以及动态库。

或者，您可以通过将一个源文件添加到构建中来将库合并到更大的项目的构建系统中。编译时，源文件需要将两个目录添加到包含路径中：

源文件：

- `tree-sitter/lib/src/lib.c`

包含目录：

- `tree-sitter/lib/src`
- `tree-sitter/lib/include`

## 基本对象 {#the-basic-objects}

使用 Tree-sitter 时涉及四种主要类型的对象：语言、解析器、语法树和语法节点。在 C 语言中，它们分别被称为 `TSLanguage`、`TSParser`、`TSTree` 和 `TSNode`。

- `TSLanguage` 是一个定义如何解析特定编程语言的不透明对象。每个 `TSLanguage` 的代码都是由 Tree-sitter 生成的。许多语言已经在 [Tree-sitter GitHub 组织](https://github.com/tree-sitter)的独立 Git 仓库中提供。有关如何创建新语言，请参见[下一篇](/tree-sitter/docs/creating-parsers/intro)。
- `TSParser` 是一个有状态的对象，可以被分配一个 `TSLanguage`，并用于根据某些源代码生成一个 `TSTree`。
- `TSTree` 表示整个源代码文件的语法树。它包含表示源代码结构的 `TSNode` 实例。在源代码更改时，它也可以被编辑并用于生成新的 `TSTree`。
- `TSNode` 表示语法树中的单个节点。它跟踪在源代码中的起始和结束位置，以及与其他节点的关系，如父节点、兄弟节点和子节点。

## 示例程序 {#an-example-program}

下面是一个使用 Tree-sitter [JSON 解析器](https://github.com/tree-sitter/tree-sitter-json)的简单 C 程序示例。

```c
// 文件名 - test-json-parser.c
#include <assert.h>
#include <string.h>
#include <stdio.h>
#include <tree_sitter/api.h>

// 声明 tree_sitter_json 函数，该函数由 tree-sitter-json 库实现。
const TSLanguage *tree_sitter_json(void);

int main() {
  // 创建一个解析器。
  TSParser *parser = ts_parser_new();

  // 设置解析器的语言（在本例中为 JSON）。
  ts_parser_set_language(parser, tree_sitter_json());

  // 基于存储在字符串中的源代码构建语法树。
  const char *source_code = "[1, null]";
  TSTree *tree = ts_parser_parse_string(
    parser,
    NULL,
    source_code,
    strlen(source_code)
  );

  // 获取语法树的根节点。
  TSNode root_node = ts_tree_root_node(tree);

  // 获取一些子节点。
  TSNode array_node = ts_node_named_child(root_node, 0);
  TSNode number_node = ts_node_named_child(array_node, 0);

  // 检查这些节点是否具有预期的类型。
  assert(strcmp(ts_node_type(root_node), "document") == 0);
  assert(strcmp(ts_node_type(array_node), "array") == 0);
  assert(strcmp(ts_node_type(number_node), "number") == 0);

  // 检查这些节点是否具有预期的子节点数量。
  assert(ts_node_child_count(root_node) == 1);
  assert(ts_node_child_count(array_node) == 5);
  assert(ts_node_named_child_count(array_node) == 2);
  assert(ts_node_child_count(number_node) == 0);

  // 将语法树打印为 S-表达式。
  char *string = ts_node_string(root_node);
  printf("Syntax tree: %s\n", string);

  // 释放所有堆分配的内存。
  free(string);
  ts_tree_delete(tree);
  ts_parser_delete(parser);
  return 0;
}
```

这个程序使用了在 `tree-sitter/api.h` 头文件中声明的 Tree-sitter 的 C API，所以我们需要将 `tree-sitter/lib/include` 目录添加到包含路径中。我们还需要将 `libtree-sitter.a` 链接到二进制文件中。我们也将 JSON 语言的源代码直接编译到二进制文件中。

```bash
clang                                   \
  -I tree-sitter/lib/include            \
  test-json-parser.c                    \
  tree-sitter-json/src/parser.c         \
  tree-sitter/libtree-sitter.a          \
  -o test-json-parser

./test-json-parser
```
