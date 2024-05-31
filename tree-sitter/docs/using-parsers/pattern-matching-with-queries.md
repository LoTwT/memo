# 使用查询进行模式匹配 {#pattern-matching-with-queries}

许多代码分析任务涉及在语法树中搜索模式。Tree-sitter 提供了一种用于表达这些模式和搜索匹配项的小型声明性语言。该语言类似于 Tree-sitter [单元测试系统](/tree-sitter/docs/creating-parsers#command-test)的格式。

## 查询语法 {#query-syntax}

一个查询由一个或多个模式组成，每个模式都是一个 [S 表达式](https://en.wikipedia.org/wiki/S-expression)，用于匹配语法树中一组特定的节点。要匹配给定节点的表达式由一对括号组成，其中包含两个部分：节点的类型，以及（可选）匹配节点子节点的一系列其他 S 表达式。例如，这个模式将匹配任何子节点都是 `number_literal` 节点的 `binary_expression` 节点：

```lisp
(binary_expression (number_literal) (number_literal))
```

子节点也可以省略。例如，这将匹配至少有一个子节点为 `string_literal` 节点的任何 `binary_expression`：

```lisp
(binary_expression (string_literal))
```

### 字段 {#fields}

通常，通过指定与子节点关联的[字段名称](/tree-sitter/docs/using-parsers/basic-parsing#node-field-names)来使模式更具体是个好主意。您可以通过在子模式前加上字段名称和冒号来实现。例如，这个模式将匹配一个 `assignment_expression` 节点，其中`左子节点`是一个 `member_expression`，该 `member_expression` 的`对象`是一个 `call_expression`。

```lisp
(assignment_expression
  left: (member_expression
    object: (call_expression)))
```

```js
func().prop = 1
```

### 否定字段 {#negated-fields}

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

### 匿名节点 {#anonymous-nodes}

带括号的语法仅适用于[命名节点](/tree-sitter/docs/using-parsers/basic-parsing#named-vs-anonymous-nodes)。要匹配特定的匿名节点，需要将它们的名称写在双引号之间。例如，以下模式将匹配运算符为 `!=` 且右侧为 `null` 的任何 `binary_expression`：

```lisp
(binary_expression
  operator: "!="
  right: (null))
```

```js
a != null
```

### 捕获节点 {#capturing-nodes}

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

### 量化运算符 {#quantification-operators}

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

```ts
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

### 分组兄弟节点 {#grouping-sibling-nodes}

您还可以使用括号对兄弟节点序列进行分组。例如，以下模式将匹配一个注释后跟一个函数声明：

```lisp
(
  (comment)
  (function_declaration)
)
```

```js
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
const arr = [1, 2, 3]
```

### 选择运算符 {#alternations}

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
function foo() {}
```

### 通配符节点 {#wildcard-node}

通配符节点用下划线（`_`）表示，它可以匹配任何节点。这类似于正则表达式中的 `.`。有两种类型，`(_)` 将匹配任何命名节点，而 `_` 将匹配任何命名或匿名节点。

例如，以下模式将匹配调用中的任何节点：

```lisp
(call (_) @call.inner)
```

### 锚点 {#anchors}

锚点运算符 `.` 用于约束子模式的匹配方式。根据其在查询中的位置不同，它有不同的行为。

当 `.` 放置在父模式内的第一个子节点之前时，子节点仅在它是父节点中的第一个命名节点时才会匹配。例如，下面的模式最多匹配一次给定的 `array` 节点，将 `@the-element` 捕获分配给父 `array` 中的第一个 `identifier` 节点：

```lisp
(array . (identifier) @the-element)
```

```js
const arr = [a, 1]
```

没有这个锚点，模式将对数组中的每个 `identifier` 匹配一次，并且 `@the-element` 会绑定到每个匹配的 `identifier`。

类似地，将锚点放置在模式的最后一个子节点之后，将使该子节点模式仅匹配作为其父节点最后一个命名子节点的节点。下面的模式仅匹配在 `block` 中作为最后一个命名子节点的节点。

```lisp
(block (_) @last-expression .)
```

```c#
{
  int a = 1
}
```

最后，锚点放置在两个子模式之间将使模式仅匹配紧邻的兄弟节点。下面的模式，在给定 `a.b.c.d` 这样的长点分隔名称时，只会匹配连续标识符对：`a` 和 `b`，`b` 和 `c`，以及 `c` 和 `d`。

```lisp
(dotted_name
  (identifier) @prev-id
  .
  (identifier) @next-id)
```

没有锚点，非连续对（如 `a, c` 和 `b, d`）也会被匹配。

锚点运算符对模式施加的限制会忽略匿名节点。

### 谓词 {#predicates}

您还可以通过在模式中的任意位置添加谓词 S 表达式来指定与模式关联的任意元数据和条件。谓词 S 表达式以以 `#` 字符开头的谓词名称开头。之后，它们可以包含任意数量的带 `@` 前缀的捕获名称或字符串。

Tree-Sitter 的 CLI 默认支持以下谓词：

#### eq?, not-eq?, any-eq?, any-not-eq?

这一系列谓词允许您匹配单个捕获或字符串值。

第一个参数必须是一个捕获，但第二个参数可以是一个捕获以比较两个捕获的文本，或者是一个字符串以与第一个捕获的文本进行比较。

基本谓词是 `#eq?`，但其补充谓词 `#not-eq?` 可用于不匹配某个值。

考虑以下针对 C 语言的示例：

```lisp
((identifier) @variable.builtin
  (#eq? @variable.builtin "self"))
```

这个模式将匹配任何标识符为 `self` 的情况。

这个模式将匹配值与键同名的标识符的键值对：

```lisp
(
  (pair
    key: (property_identifier) @key-name
    value: (identifier) @value-name)
  (#eq? @key-name @value-name)
)
```

```js
{
  a: a
}
```

前缀 "any-" 用于量化捕获。以下是一个找到一段空注释的示例：

```lisp
((comment)+ @comment.empty
  (#any-eq? @comment.empty "//"))
```

请注意，`#any-eq?` 将在任意节点匹配谓词时匹配量化捕获，而默认情况下，量化捕获仅在所有节点都匹配谓词时才会匹配。

#### match?, not-match?, any-match?, any-not-match?

这些谓词类似于 `#eq?` 谓词，但它们使用正则表达式来匹配捕获的文本。

例如，这个模式可以匹配名称是 `SCREAMING_SNAKE_CASE` 的标识符：

```lisp
(identifier) @id
(#match? @id "^[A-Z_]+$")
```

```js
const SCREAMING_SNAKE_CASE = 1
```

以下是一个查找 C 语言中潜在文档注释的示例：

```lisp
((comment)+ @comment.documentation
  (#match? @comment.documentation "^///\\s+.*"))
```

这是另一个查找 Cgo 注释以可能注入 C 代码的示例：

```lisp
((comment)+ @injection.content
  .
  (import_declaration
    (import_spec path: (interpreted_string_literal) @_import_c))
  (#eq? @_import_c "\"C\"")
  (#match? @injection.content "^//"))
```

#### any-of?, not-any-of?

谓词 `any-of?` 允许您将捕获与多个字符串进行匹配，并且当捕获的文本等于任意一个字符串时将匹配。

考虑以下针对 JavaScript 的示例：

```lisp
((identifier) @variable.builtin
  (#any-of? @variable.builtin
        "arguments"
        "module"
        "console"
        "window"
        "document"))
```

这将匹配 JavaScript 中的任意内置变量。

注意 —— 谓词并不是由 Tree-sitter 的 C 库直接处理的。它们只是以结构化的形式暴露出来，以便更高级别的代码可以执行过滤。然而，Tree-sitter 的更高级别绑定（如 [Rust Crate](https://github.com/tree-sitter/tree-sitter/tree/master/lib/binding_rust) 或 [WebAssembly 绑定](https://github.com/tree-sitter/tree-sitter/tree/master/lib/binding_web)）确实实现了一些常见的谓词，如上面解释的 `#eq?`、`#match?` 和 `#any-of?` 谓词。

总结一下 Tree-Sitter 的绑定支持的谓词：

- **#eq?** 检查捕获或字符串的直接匹配。
- **#match?** 检查正则表达式的匹配。
- **#any-of?** 检查是否与字符串列表中的任意一个匹配。
- 在任意这些谓词的开头添加 `not-` 将否定匹配。
- 默认情况下，量化捕获只有在所有节点都匹配谓词时才会匹配。
- 在 `eq` 或 `match` 谓词前添加 `any-` 将使其在任意节点匹配谓词时匹配。

## 查询 API {#the-query-api}

通过指定包含一个或多个模式的字符串来创建查询：

```c
TSQuery *ts_query_new(
  const TSLanguage *language,
  const char *source,
  uint32_t source_len,
  uint32_t *error_offset,
  TSQueryError *error_type
);
```

如果查询中存在错误，则 `error_offset` 参数将被设置为错误的字节偏移量，`error_type` 参数将被设置为指示错误类型的值：

```c
typedef enum {
  TSQueryErrorNone = 0,
  TSQueryErrorSyntax,
  TSQueryErrorNodeType,
  TSQueryErrorField,
  TSQueryErrorCapture,
} TSQueryError;
```

`TSQuery` 值是不可变的，可以在线程之间安全地共享。要执行查询，需要创建一个 `TSQueryCursor`，它携带处理查询所需的状态。查询光标不应在线程之间共享，但可以在多次查询执行中重用。

```c
TSQueryCursor *ts_query_cursor_new(void);
```

然后，您可以在给定的语法节点上执行查询：

```c
void ts_query_cursor_exec(TSQueryCursor *, const TSQuery *, TSNode);

```

然后，您可以遍历匹配结果：

```c
typedef struct {
  TSNode node;
  uint32_t index;
} TSQueryCapture;

typedef struct {
  uint32_t id;
  uint16_t pattern_index;
  uint16_t capture_count;
  const TSQueryCapture *captures;
} TSQueryMatch;

bool ts_query_cursor_next_match(TSQueryCursor *, TSQueryMatch *match);
```

当没有更多匹配项时，此函数将返回 false。否则，它将用匹配的模式和捕获的节点数据填充匹配项。
