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
