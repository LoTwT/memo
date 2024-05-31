# 静态节点类型 {#static-node-types}

在具有静态类型的语言中，语法树提供关于各个语法节点的具体类型信息是很有帮助的。Tree-sitter 通过一个名为 `node-types.json` 的生成文件提供这些信息。这个节点类型文件提供了关于语法中每个可能的语法节点的结构化数据。

您可以使用这些数据在静态类型的编程语言中生成类型声明。例如，GitHub 的 [Semantic](https://github.com/github/semantic) 使用这些节点类型文件为每个可能的语法节点[生成 Haskell 数据类型](https://github.com/github/semantic/tree/master/semantic-ast)，从而允许代码分析算法通过 Haskell 类型系统进行结构验证。

节点类型文件包含一个对象数组，每个对象描述了一种特定类型的语法节点，使用以下条目：

## 基本信息 {#basic-info}

这个数组中的每个对象都有以下两个条目：

- `"type"` - 一个字符串，指示节点代表的语法规则。这与[上述](/tree-sitter/docs/using-parsers/basic-parsing#syntax-nodes)的 `ts_node_type` 函数相对应。
- `"named"` - 一个布尔值，指示这种节点是对应语法中的规则名称还是只是一个字符串字面量。更多信息请参见[上文](/tree-sitter/docs/using-parsers/basic-parsing#named-vs-anonymous-nodes)。

示例：

```json
{
  "type": "string_literal",
  "named": true
}
```

```json
{
  "type": "+",
  "named": false
}
```

这两个字段共同构成了节点类型的唯一标识符；在 `node-types.json` 中，没有两个顶级对象会同时具有相同的 `"type"` 和 `"named"` 值。

## 内部节点 {#internal-nodes}

许多语法节点可以有子节点。节点类型对象使用以下条目描述节点可能具有的子节点：

- `"fields"` - 一个描述节点可能具有的[字段](/tree-sitter/docs/using-parsers/basic-parsing#node-field-names)的对象。该对象的键是字段名称，值是子类型对象，具体描述如下。
- `"children"` - 另一个子类型对象，描述节点所有可能的无字段命名子节点。

子类型对象使用以下条目描述一组子节点：

- `"required"` - 一个布尔值，指示是否在此集合中总是至少有一个节点。
- `"multiple"` - 一个布尔值，指示此集合中是否可以有多个节点。
- `"types"` - 一个对象数组，表示此集合中节点的可能类型。每个对象都有两个键：`"type"` 和 `"named"`，其含义如上所述。

带有字段的示例：

```json
{
  "type": "method_definition",
  "named": true,
  "fields": {
    "body": {
      "multiple": false,
      "required": true,
      "types": [{ "type": "statement_block", "named": true }]
    },
    "decorator": {
      "multiple": true,
      "required": false,
      "types": [{ "type": "decorator", "named": true }]
    },
    "name": {
      "multiple": false,
      "required": true,
      "types": [
        { "type": "computed_property_name", "named": true },
        { "type": "property_identifier", "named": true }
      ]
    },
    "parameters": {
      "multiple": false,
      "required": true,
      "types": [{ "type": "formal_parameters", "named": true }]
    }
  }
}
```

带有子节点的示例：

```json
{
  "type": "array",
  "named": true,
  "fields": {},
  "children": {
    "multiple": true,
    "required": false,
    "types": [
      { "type": "_expression", "named": true },
      { "type": "spread_element", "named": true }
    ]
  }
}
```

## 超类型节点 {#supertype-nodes}

在 Tree-sitter 语法中，通常有一些规则表示语法节点的抽象类别（例如“表达式”、“类型”、“声明”）。在 `grammar.js` 文件中，这些通常写作[隐藏规则](/tree-sitter/docs/creating-parsers/writing-the-grammar#hiding-rules)，其定义是一个简单的[选择](/tree-sitter/docs/creating-parsers/tool-overview#the-grammar-dsl)，其中每个成员只是一个单一符号。

通常，隐藏规则不会在节点类型文件中提到，因为它们不会出现在语法树中。但如果您将隐藏规则添加到语法的 [`supertypes` 列表](/tree-sitter/docs/creating-parsers/tool-overview#the-grammar-dsl)中，它们将出现在节点类型文件中，并具有以下特殊条目：

- `"subtypes"` - 一个对象数组，指定此`超类型`节点可以包含的节点类型。

```json
{
  "type": "_declaration",
  "named": true,
  "subtypes": [
    { "type": "class_declaration", "named": true },
    { "type": "function_declaration", "named": true },
    { "type": "generator_function_declaration", "named": true },
    { "type": "lexical_declaration", "named": true },
    { "type": "variable_declaration", "named": true }
  ]
}
```

超类型节点也会出现在节点类型文件的其他地方，作为其他节点类型的子节点，与语法中使用超类型规则的方式相对应。这使得节点类型更简短且易于阅读，因为单个超类型将取代多个子类型。

示例：

```json
{
  "type": "export_statement",
  "named": true,
  "fields": {
    "declaration": {
      "multiple": false,
      "required": false,
      "types": [{ "type": "_declaration", "named": true }]
    },
    "source": {
      "multiple": false,
      "required": false,
      "types": [{ "type": "string", "named": true }]
    }
  }
}
```
