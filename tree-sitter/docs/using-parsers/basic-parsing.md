# 基本解析 {#basic-parsing}

## 提供代码 {#providing-the-code}

在上面的示例中，我们使用 ts_parser_parse_string 函数解析存储在一个简单字符串中的源代码：

```c
TSTree *ts_parser_parse_string(
  TSParser *self,
  const TSTree *old_tree,
  const char *string,
  uint32_t length
);
```

您可能想要解析存储在自定义数据结构中的源代码，例如 [piece table](https://en.wikipedia.org/wiki/Piece_table) 或 [rope](<https://en.wikipedia.org/wiki/Rope_(data_structure)>)。在这种情况下，您可以使用更通用的 ts_parser_parse 函数：

```c
TSTree *ts_parser_parse(
  TSParser *self,
  const TSTree *old_tree,
  TSInput input
);
```

`TSInput` 结构允许您提供自己的函数，以在给定的字节偏移量和行/列位置读取一段文本。该函数可以返回以 UTF8 或 UTF16 编码的文本。该接口使您能够高效地解析存储在您自己的数据结构中的文本。

```c
typedef struct {
  void *payload;
  const char *(*read)(
    void *payload,
    uint32_t byte_offset,
    TSPoint position,
    uint32_t *bytes_read
  );
  TSInputEncoding encoding;
} TSInput;
```

## 语法节点 {#syntax-nodes}

Tree-sitter 提供了一种 DOM 风格的接口，用于检查语法树。语法节点的类型是一个字符串，表示该节点代表的语法规则。

```c
const char *ts_node_type(TSNode);
```

语法节点同时以原始字节和行/列坐标的形式存储它们在源代码中的位置：

```c
uint32_t ts_node_start_byte(TSNode);
uint32_t ts_node_end_byte(TSNode);

typedef struct {
  uint32_t row;
  uint32_t column;
} TSPoint;

TSPoint ts_node_start_point(TSNode);
TSPoint ts_node_end_point(TSNode);
```

## 检索节点 {#retrieving-nodes}

每棵树都有一个根节点：

```c
TSNode ts_tree_root_node(const TSTree *);
```

一旦有了一个节点，您就可以访问该节点的子节点：

```c
uint32_t ts_node_child_count(TSNode);
TSNode ts_node_child(TSNode, uint32_t);
```

您还可以访问它的兄弟节点和父节点：

```c
TSNode ts_node_next_sibling(TSNode);
TSNode ts_node_prev_sibling(TSNode);
TSNode ts_node_parent(TSNode);
```

这些方法都可能返回一个空节点，以表示例如某个节点没有下一个兄弟节点。您可以检查一个节点是否为空：

```c
bool ts_node_is_null(TSNode);
```

## 命名节点与匿名节点 {#named-vs-anonymous-nodes}

Tree-sitter 生成[具体语法树](https://en.wikipedia.org/wiki/Parse_tree) —— 这些树包含源代码中每个单独标记的节点，包括逗号和括号等。这对于处理单个标记的用例非常重要，如[语法高亮](https://en.wikipedia.org/wiki/Syntax_highlighting)。但某些类型的代码分析更容易使用[抽象语法树](https://en.wikipedia.org/wiki/Abstract_syntax_tree) —— 在这种树中，不太重要的细节被移除了。Tree-sitter 的树通过区分命名节点和匿名节点来支持这些用例。

考虑这样的语法规则：

```js
if_statement: ($) => seq("if", "(", $._expression, ")", $._statement)
```

这种语言中表示 `if_statement` 的语法节点将有 5 个子节点：`the condition expression`、`the body statement`，以及 `if`、`(` 和 `)` 标记。表达式和语句将被标记为命名节点，因为它们在语法中被赋予了明确的名称。但 `if`、`(` 和 `)` 节点不会是命名节点，因为它们在语法中表示为简单字符串。

您可以检查任意给定节点是否为命名节点：

```c
bool ts_node_is_named(TSNode);
```

在遍历树时，您也可以选择通过使用上述所有方法的 `_named_` 变体跳过匿名节点：

```c
TSNode ts_node_named_child(TSNode, uint32_t);
uint32_t ts_node_named_child_count(TSNode);
TSNode ts_node_next_named_sibling(TSNode);
TSNode ts_node_prev_named_sibling(TSNode);
```

如果您使用这一组方法，语法树的功能将类似于抽象语法树。

## 节点字段名称 {#node-field-names}

为了使语法节点更易于分析，许多语法为特定的子节点分配了唯一的字段名称。下一页将[解释](/tree-sitter/docs/creating-parsers/writing-the-grammar#using-fields)如何在您自己的语法中执行此操作。如果语法节点有字段，您可以使用字段名称访问其子节点：

```c
TSNode ts_node_child_by_field_name(
  TSNode self,
  const char *field_name,
  uint32_t field_name_length
);
```

字段也有数值 id，如果您想避免重复的字符串比较，可以使用这些 id。您可以使用 `TSLanguage` 在字符串和 id 之间进行转换：

```c
uint32_t ts_language_field_count(const TSLanguage *);
const char *ts_language_field_name_for_id(const TSLanguage *, TSFieldId);
TSFieldId ts_language_field_id_for_name(const TSLanguage *, const char *, uint32_t);
```

字段 id 可以用来代替字段名称使用：

```c
TSNode ts_node_child_by_field_id(TSNode, TSFieldId);
```
