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

## Command: test {#command-test}

## The Grammar DSL {#the-grammar-dsl}
