# 工具概述 {#tool-overview}

让我们概述一下 `tree-sitter` 命令行工具的所有功能。

## Command: generate {#command-generate}

您将使用的最重要的命令是 `tree-sitter generate`。该命令读取当前工作目录中的 `grammar.js` 文件，并创建一个名为 `src/parser.c` 的文件，该文件实现了解析器。在对语法进行更改后，只需再次运行 `tree-sitter generate` 即可。

第一次运行 `tree-sitter generate` 时，它还会生成一些其他文件，用于以下语言的绑定：

**C/C++**

- `Makefile` - 该文件告诉 `make` 如何编译您的语言。
- `bindings/c/tree-sitter-language.h` - 该文件提供您语言的 C 接口。
- `bindings/c/tree-sitter-language.pc` - 该文件提供有关您语言的 C 库的 pkg-config 元数据。
- `src/tree_sitter/parser.h` - 该文件提供一些在生成的 parser.c 文件中使用的基本 C 定义。
- `src/tree_sitter/alloc.h` - 该文件提供一些内存分配宏，用于外部扫描器（如果有的话）。
- `src/tree_sitter/array.h` - 该文件提供一些数组宏，用于外部扫描器（如果有的话）。

**Go**

- `bindings/go/binding.go` - 该文件将您的语言封装在一个 Go 模块中。
- `bindings/go/binding_test.go` - 该文件包含 Go 包的测试。

**Node**

- `binding.gyp` - 该文件告诉 Node.js 如何编译您的语言。
- `bindings/node/index.js` - 这是 Node.js 在使用您的语言时最初加载的文件。
- `bindings/node/binding.cc` - 该文件将您的语言封装在一个 JavaScript 模块中，以供 Node.js 使用。

**Python**

- `pyproject.toml` - 该文件是 Python 包的清单。
- `setup.py` - 该文件告诉 Python 如何编译您的语言。
- `bindings/python/binding.c` - 该文件将您的语言封装在一个 Python 模块中。
- `bindings/python/tree_sitter_language/__init__.py` - 该文件告诉 Python 如何加载您的语言。
- `bindings/python/tree_sitter_language/__init__.pyi` - 该文件在 Python 中使用时为您的解析器提供类型提示。
- `bindings/python/tree_sitter_language/py.typed` - 该文件在 Python 中使用时为您的解析器提供类型提示。

**Rust**

- `Cargo.toml` - 该文件是 Rust 包的清单。
- `bindings/rust/lib.rs` - 该文件在 Rust 中使用时将您的语言封装在一个 Rust crate 中。
- `bindings/rust/build.rs` - 该文件封装了 Rust crate 的构建过程。

**Swift**

- `Package.swift` - 该文件告诉 Swift 如何编译您的语言。
- `bindings/swift/TreeSitterLanguage/language.h` - 该文件在 Swift 中使用时将您的语言封装在一个 Swift 模块中。

如果您的语法中存在歧义或局部歧义，Tree-sitter 会在解析器生成期间检测到，并会退出并显示 `Unresolved conflict` 错误消息。有关这些错误的更多信息，请参见下文。

## Command: build {#command-build}

`build` 命令将您的解析器编译成可动态加载的库，可以是共享对象文件（ `.so`、`.dylib` 或 `.dll` ）或 WASM 模块。

您可以通过 `CC` 环境变量更改编译器可执行文件，并通过 `CFLAGS` 添加额外的标志。对于 macOS 或 iOS，您可以分别设置 `MACOSX_DEPLOYMENT_TARGET` 或 `IPHONEOS_DEPLOYMENT_TARGET` 来定义最低支持的版本。

您可以使用 `--wasm/-w` 标志指定是否将其编译为 wasm 模块，并且可以选择使用 `--docker/-d` 标志通过 Docker 或 Podman 提供 emscripten。这消除了在本地机器上安装 emscripten 的需要。

您可以使用 `--output/-o` 标志指定共享对象文件（本地或 WASM）的输出位置，该标志接受绝对路径或相对路径。请注意，如果您不提供此标志，CLI 将尝试根据父目录确定语言名称（ 例如，在 `tree-sitter-javascript` 中构建将解析为 `javascript` ），以用于输出文件。如果无法确定，它将默认为 `parser`，从而在当前工作目录中生成` parser.so` 或 `parser.wasm`。

最后，您还可以指定实际语法目录的路径，以防您当前不在语法目录中。这可以通过提供一个路径作为第一个位置参数来完成。

示例：

```bash
tree-sitter build --wasm --output ./build/parser.wasm tree-sitter-javascript
```

请注意，`tree-sitter-javascript` 参数是第一个位置参数。

## Command: test {#command-test}

`tree-sitter test` 命令允许您轻松测试解析器是否正常工作。

对于添加到语法中的每条规则，您应该首先创建一个测试，描述解析该规则时语法树的外观。这些测试使用特殊格式的文本文件编写，位于解析器根文件夹中的 `test/corpus/` 目录内。

例如，您可能有一个名为 `test/corpus/statements.txt` 的文件，其中包含一系列类似这样的条目：

```txt
==================
Return statements
==================

func x() int {
  return 1;
}

---

(source_file
  (function_definition
    (identifier)
    (parameter_list)
    (primitive_type)
    (block
      (return_statement (number)))))
```

- 每个测试的名称写在两个只包含 `=`（等号）字符的行之间。
- 然后编写输入源代码，接着是一行包含三个或更多 `-`（破折号）字符的行。
- 然后，预期输出语法树以 [S 表达式](https://en.wikipedia.org/wiki/S-expression)的形式编写。S 表达式中空白的确切位置无关紧要，但理想情况下，语法树应该易于阅读。请注意，S 表达式不显示像 `func`、`(` 和 `;` 这样的语法节点，这些节点在语法中表示为字符串和正则表达式。它只显示命名节点，如本页面解析器使用[部分](/tree-sitter/docs/using-parsers/basic-parsing#named-vs-anonymous-nodes)所述。

  预期输出部分还可以选择性地显示与每个子节点关联的[字段名称](/tree-sitter/docs/using-parsers/basic-parsing#node-field-names)。要在测试中包含字段名称，可以在 S 表达式中在节点本身之前编写节点的字段名称，后跟一个冒号：

  ```txt
  (source_file
  (function_definition
    name: (identifier)
    parameters: (parameter_list)
    result: (primitive_type)
    body: (block
      (return_statement (number)))))
  ```

- 如果您的语言语法与 `===` 和 `---` 测试分隔符冲突，您可以选择添加一个任意相同的后缀（在下面的示例中为 `|||`）来消除歧义：

  ```txt
  ==================|||
  Basic module
  ==================|||

  ---- MODULE Test ----
  increment(n) == n + 1
  ====

  ---|||

  (source_file
    (module (identifier)
      (operator (identifier)
        (parameter_list (identifier))
        (plus (identifier_ref) (number)))))
  ```

这些测试非常重要。它们作为解析器的 API 文档，并且每次更改语法时都可以运行这些测试，以验证一切仍然能够正确解析。

默认情况下，`tree-sitter test` 命令会运行 `test/corpus/` 文件夹中的所有测试。要运行特定测试，可以使用 `-f` 标志：

```bash
tree-sitter test -f 'Return statements'
```

建议全面添加测试。如果它是一个可见节点，请将其添加到 `test/corpus` 目录中的测试文件中。通常，测试每个语言结构的所有排列组合是个好主意。这不仅增加了测试覆盖率，还可以让读者熟悉检查预期输出的方法，并了解语言的“边界”。

### 属性

测试可以使用一些属性进行注释。属性必须放在标题中，位于测试名称下方，并以 `:` 开头。一些属性还需要参数，这时需要使用括号。

**注意**：如果您想提供多个参数，例如在多个平台上运行测试或测试多种语言，可以在新行上重复该属性。

可用的属性如下：

- `:skip` — 此属性将在运行 `tree-sitter test` 时跳过测试。这在您想暂时禁用测试而不删除它时很有用。
- `:error` — 此属性将断言解析树包含错误。这在验证某个输入无效时很有用，无需显示整个解析树，因此您应省略 `---` 行下方的解析树。
- `:fail-fast` — 如果标记有此属性的测试失败，此属性将停止测试其他附加测试。
- `:language(LANG)` — 此属性将使用指定语言的解析器运行测试。这对多解析器仓库（如 XML 和 DTD，或 TypeScript 和 TSX）很有用。默认解析器将是根 `package.json` 中 `tree-sitter` 字段的第一个条目，因此选择第二个甚至第三个解析器的方式很有用。
- `:platform(PLATFORM)` — 此属性指定测试应运行的平台。这在测试特定于平台的行为时很有用（例如，Windows 的换行符与 Unix 不同）。此属性必须与 Rust 的 [std::env::consts::OS](https://doc.rust-lang.org/std/env/consts/constant.OS.html) 匹配。

使用属性的示例：

```txt
=========================
Test that will be skipped
:skip
=========================

int main() {}

-------------------------

====================================
Test that will run on Linux or macOS

:platform(linux)
:platform(macos)
====================================

int main() {}

------------------------------------

========================================================================
Test that expects an error, and will fail fast if there's no parse error
:fail-fast
:error
========================================================================

int main ( {}

------------------------------------------------------------------------

=================================================
Test that will parse with both Typescript and TSX
:language(typescript)
:language(tsx)
=================================================

console.log('Hello, world!');

-------------------------------------------------
```

### 自动编译

您可能会注意到，在重新生成解析器后第一次运行 `tree-sitter test` 时，会花费一些额外的时间。这是因为 Tree-sitter 会自动将您的 C 代码编译成可动态加载的库。每当您通过重新运行 `tree-sitter generate` 更新解析器时，它都会根据需要重新编译解析器。

### 语法高亮测试

`tree-sitter test` 命令还会运行 `test/highlight` 文件夹中的任何语法高亮测试（如果该文件夹存在）。有关语法高亮测试的更多信息，请参见[语法高亮页面](/tree-sitter/docs/syntax-highlighting/unit-testing#unit-testing)。

## The Grammar DSL {#the-grammar-dsl}
