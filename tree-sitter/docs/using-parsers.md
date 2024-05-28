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

### 示例程序 {#an-example-program}

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

## 基本解析 {#basic-parsing}

### 提供代码 {#providing-the-code}

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

### 语法节点 {#syntax-nodes}

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

### 检索节点 {#retrieving-nodes}

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

### 命名节点与匿名节点 {#named-vs-anonymous-nodes}

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

### 节点字段名称 {#node-field-names}

为了使语法节点更易于分析，许多语法为特定的子节点分配了唯一的字段名称。下一页将[解释](/tree-sitter//docs/creating-parsers#using-fields)如何在您自己的语法中执行此操作。如果语法节点有字段，您可以使用字段名称访问其子节点：

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

## 高级解析 {#advanced-parsing}

### 编辑 {#editing}

在诸如文本编辑器之类的应用程序中，您经常需要在源代码更改后重新解析文件。Tree-sitter 设计为高效地支持此用例。有两个必要步骤。

首先，您必须编辑语法树，调整其节点的范围，使它们与代码保持同步。

```c
typedef struct {
  uint32_t start_byte;
  uint32_t old_end_byte;
  uint32_t new_end_byte;
  TSPoint start_point;
  TSPoint old_end_point;
  TSPoint new_end_point;
} TSInputEdit;

void ts_tree_edit(TSTree *, const TSInputEdit *);
```

然后，您可以再次调用 `ts_parser_parse`，传入旧的树。这将创建一个新的树，该树在内部与旧的树共享结构。

当您编辑语法树时，其节点的位置会发生变化。如果您在 `TSTree` 之外存储了任何 `TSNode` 实例，则必须使用相同的 `TSInput` 值单独更新它们的位置，以更新它们的缓存位置。

```c
void ts_node_edit(TSNode *, const TSInputEdit *);
```

`ts_node_edit` 函数仅在您在编辑树之前检索了 `TSNode` 实例，并且在编辑树之后仍想继续使用这些特定节点实例的情况下需要。通常，您只需从编辑后的树中重新获取节点，在这种情况下，不需要使用 `ts_node_edit`。

### 多语言文档 {#multi-language-documents}

有时，一个文件的不同部分可能用不同的语言编写。例如，像 [EJS](https://ejs.co/) 和 [ERB](https://ruby-doc.org/stdlib-2.5.1/libdoc/erb/rdoc/ERB.html) 这样的模板语言允许您通过混合编写 HTML 和其他语言（如 JavaScript 或 Ruby）来生成 HTML。

Tree-sitter 通过允许您基于文件中某些范围的文本创建语法树来处理这些类型的文档。

```c
typedef struct {
  TSPoint start_point;
  TSPoint end_point;
  uint32_t start_byte;
  uint32_t end_byte;
} TSRange;

void ts_parser_set_included_ranges(
  TSParser *self,
  const TSRange *ranges,
  uint32_t range_count
);
```

例如，考虑以下 ERB 文档：

```erb
<ul>
  <% people.each do |person| %>
    <li><%= person.name %></li>
  <% end %>
</ul>
```

从概念上讲，它可以用三个范围重叠的语法树表示：一个 ERB 语法树、一个 Ruby 语法树和一个 HTML 语法树。您可以使用以下代码生成这些语法树：

```c
#include <string.h>
#include <tree_sitter/api.h>

// 这些函数分别在它们各自的仓库中实现。
const TSLanguage *tree_sitter_embedded_template(void);
const TSLanguage *tree_sitter_html(void);
const TSLanguage *tree_sitter_ruby(void);

int main(int argc, const char **argv) {
  const char *text = argv[1];
  unsigned len = strlen(text);

  // 将整个文本解析为 ERB。
  TSParser *parser = ts_parser_new();
  ts_parser_set_language(parser, tree_sitter_embedded_template());
  TSTree *erb_tree = ts_parser_parse_string(parser, NULL, text, len);
  TSNode erb_root_node = ts_tree_root_node(erb_tree);

  // 在 ERB 语法树中，找到表示基础 HTML 的 `content` 节点范围和表示插值 Ruby 的 `code` 节点范围。
  TSRange html_ranges[10];
  TSRange ruby_ranges[10];
  unsigned html_range_count = 0;
  unsigned ruby_range_count = 0;
  unsigned child_count = ts_node_child_count(erb_root_node);

  for (unsigned i = 0; i < child_count; i++) {
    TSNode node = ts_node_child(erb_root_node, i);
    if (strcmp(ts_node_type(node), "content") == 0) {
      html_ranges[html_range_count++] = (TSRange) {
        ts_node_start_point(node),
        ts_node_end_point(node),
        ts_node_start_byte(node),
        ts_node_end_byte(node),
      };
    } else {
      TSNode code_node = ts_node_named_child(node, 0);
      ruby_ranges[ruby_range_count++] = (TSRange) {
        ts_node_start_point(code_node),
        ts_node_end_point(code_node),
        ts_node_start_byte(code_node),
        ts_node_end_byte(code_node),
      };
    }
  }

  // 使用 HTML 范围来解析 HTML。
  ts_parser_set_language(parser, tree_sitter_html());
  ts_parser_set_included_ranges(parser, html_ranges, html_range_count);
  TSTree *html_tree = ts_parser_parse_string(parser, NULL, text, len);
  TSNode html_root_node = ts_tree_root_node(html_tree);

  // 使用 Ruby 范围来解析 Ruby。
  ts_parser_set_language(parser, tree_sitter_ruby());
  ts_parser_set_included_ranges(parser, ruby_ranges, ruby_range_count);
  TSTree *ruby_tree = ts_parser_parse_string(parser, NULL, text, len);
  TSNode ruby_root_node = ts_tree_root_node(ruby_tree);

  // 打印所有三棵语法树。
  char *erb_sexp = ts_node_string(erb_root_node);
  char *html_sexp = ts_node_string(html_root_node);
  char *ruby_sexp = ts_node_string(ruby_root_node);
  printf("ERB: %s\n", erb_sexp);
  printf("HTML: %s\n", html_sexp);
  printf("Ruby: %s\n", ruby_sexp);
  return 0;
}
```

这种 API 允许在语言组合方面具有很大的灵活性。Tree-sitter 并不负责协调语言之间的交互。相反，您可以使用任意的特定应用逻辑自由地处理这些交互。

### 并发 {#concurrency}

Tree-sitter 通过非常低成本的语法树复制来支持多线程的用例。

```c
TSTree *ts_tree_copy(const TSTree *);
```

在内部，复制语法树仅涉及增加一个原子引用计数。从概念上讲，它为您提供了一个新的树，您可以在一个新线程上自由查询、编辑、重新解析或删除它，同时在不同的线程上继续使用原始树。请注意，单个 `TSTree` 实例不是线程安全的；如果您想在多个线程上同时使用它，必须复制该树。

## 其他树操作 {#other-tree-operations}

### 使用树光标遍历树 {#walking-trees-with-tree-cursors}

您可以使用[上述](#retrieving-nodes)的 `TSNode` API 访问语法树中的每个节点，但如果您需要访问大量节点，最快的方法是使用树光标。光标是一个有状态的对象，允许您以最大效率遍历语法树。

请注意，给定的输入节点被视为光标的根，光标不能在该节点之外移动，因此移动到根节点的父节点或任何兄弟节点将返回 `false`。如果给定的输入节点是树的`实际根节点`，这不会产生意外效果，但在使用`非根节点`时需要注意这一点。

您可以从任何节点初始化一个光标：

```c
TSTreeCursor ts_tree_cursor_new(TSNode);
```

您可以在树中移动光标：

```c
bool ts_tree_cursor_goto_first_child(TSTreeCursor *);
bool ts_tree_cursor_goto_next_sibling(TSTreeCursor *);
bool ts_tree_cursor_goto_parent(TSTreeCursor *);
```

如果光标成功移动，这些方法将返回 `true`；如果没有节点可以移动，则返回 `false`。

您始终可以检索光标的当前节点，以及与当前节点关联的[字段名称](#node-field-names)。

```c
TSNode ts_tree_cursor_current_node(const TSTreeCursor *);
const char *ts_tree_cursor_current_field_name(const TSTreeCursor *);
TSFieldId ts_tree_cursor_current_field_id(const TSTreeCursor *);
```

## 使用查询进行模式匹配 {#pattern-matching-with-queries}

许多代码分析任务涉及在语法树中搜索模式。Tree-sitter 提供了一种用于表达这些模式和搜索匹配项的小型声明性语言。该语言类似于 Tree-sitter [单元测试系统](/tree-sitter/docs/creating-parsers#command-test)的格式。

### 查询语法 {#query-syntax}

一个查询由一个或多个模式组成，每个模式都是一个 [S 表达式](https://en.wikipedia.org/wiki/S-expression)，用于匹配语法树中一组特定的节点。要匹配给定节点的表达式由一对括号组成，其中包含两个部分：节点的类型，以及（可选）匹配节点子节点的一系列其他 S 表达式。例如，这个模式将匹配任何子节点都是 `number_literal` 节点的 `binary_expression` 节点：

```lisp
(binary_expression (number_literal) (number_literal))
```

子节点也可以省略。例如，这将匹配至少有一个子节点为 `string_literal` 节点的任何 `binary_expression`：

```lisp
(binary_expression (string_literal))
```

#### 字段 {#fields}

通常，通过指定与子节点关联的[字段名称](#node-field-names)来使模式更具体是个好主意。您可以通过在子模式前加上字段名称和冒号来实现。例如，这个模式将匹配一个 `assignment_expression` 节点，其中`左子节点`是一个 `member_expression`，该 `member_expression` 的`对象`是一个 `call_expression`。

```lisp
(assignment_expression
  left: (member_expression
    object: (call_expression)))
```

```js
func().prop = 1
```

#### 否定字段 {#negated-fields}

您还可以限制一个模式，使其仅匹配缺少特定字段的节点。为此，可以在父模式内添加一个带有前缀 `!` 的字段名称。例如，以下模式将匹配没有类型参数的类声明：

```lisp
(class_declaration
  name: (identifier) @class_name
  !type_parameters)
```

```c#
// type_parameters is the generic parameter
class MyClass {}
```

#### 匿名节点 {#anonymous-nodes}

带括号的语法仅适用于[命名节点](#named-vs-anonymous-nodes)。要匹配特定的匿名节点，需要将它们的名称写在双引号之间。例如，以下模式将匹配运算符为 `!=` 且右侧为 `null` 的任何 `binary_expression`：

```lisp
(binary_expression
  operator: "!="
  right: (null))
```

```js
a != null
```

#### 捕获节点 {#capturing-nodes}

匹配模式时，您可能希望处理模式中的特定节点。捕获允许您将名称与模式中的特定节点关联，以便您稍后可以通过这些名称引用这些节点。捕获名称写在它们所指节点之后，并以 `@` 字符开头。

例如，这个模式将匹配任何将函数赋值给标识符的情况，并将名称 `the-function-name` 与该标识符关联：

```lisp
(assignment_expression
  left: (identifier) @the-function-name
  right: (function))
```

这个模式将匹配所有方法定义，并将名称 `the-method-name` 与方法名称关联，将名称 `the-class-name` 与包含该方法的类名关联：

```lisp
(class_declaration
  name: (identifier) @the-class-name
  body: (class_body
    (method_definition
      name: (property_identifier) @the-method-name)))
```

```js
class MyClass {
  myMethod() {}
}
```

#### 量化运算符 {#quantification-operators}

您可以使用后缀 `+` 和 `*` 重复运算符匹配重复的兄弟节点序列，这些运算符类似于[正则表达式](https://en.wikipedia.org/wiki/Regular_expression#Basic_concepts)中的 `+` 和 `*` 运算符。`+` 运算符匹配一个或多个模式的重复，`*` 运算符匹配零个或多个模式的重复。

例如，以下模式将匹配一个或多个注释的序列：

```lisp
(comment)+
```

以下模式将匹配一个类声明，并捕获所有存在的装饰器：

```lisp
(class_declaration
  (decorator)* @the-decorator
  name: (identifier) @the-name)
```

```js
@MyDecorator
class MyClass {}
```

您还可以使用 `?` 运算符将节点标记为可选。例如，以下模式将匹配所有函数调用，并在存在字符串参数时进行捕获：

```lisp
(call_expression
  function: (identifier) @the-function
  arguments: (arguments (string)? @the-string-arg))
```

```js
func("s")
```

#### 分组兄弟节点 {#grouping-sibling-nodes}

您还可以使用括号对兄弟节点序列进行分组。例如，以下模式将匹配一个注释后跟一个函数声明：

```lisp
(
  (comment)
  (function_declaration)
)
```

```js
// comment
function foo() {}
```

上述的任意量化运算符（`+`、`*` 和 `?`）也可以应用于分组。例如，以下模式将匹配以逗号分隔的一系列数字：

```lisp
(
  (number)
  ("," (number))*
)
```

```js
1, 2, 3
```

#### 选择运算符 {#alternations}

选择运算符写作一对方括号 `[]`，其中包含一系列可选模式。这类似于正则表达式中的字符类（例如 `[abc]` 匹配 a、b 或 c）。

例如，以下模式将匹配对变量或对象属性的调用。在变量的情况下，将其捕获为 `@function`，在属性的情况下，将其捕获为 `@method`：

```lisp
(call_expression
  function: [
    (identifier) @function
    (member_expression
      property: (property_identifier) @method)
  ])
```

```js
func()
obj.func()
```

以下模式将匹配一组可能的关键字标记，并将它们捕获为 `@keyword`：

```lisp
[
  "break"
  "delete"
  "else"
  "for"
  "function"
  "if"
  "return"
  "try"
  "while"
] @keyword
```

```js
function() {}
try {}
```
