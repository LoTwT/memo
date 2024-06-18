# 入门指南 {#getting-started}

## 依赖项 {#dependencies}

为了开发 Tree-sitter 解析器，您需要安装两个依赖项：

- **Node.js** - Tree-sitter 语法是用 JavaScript 编写的，Tree-sitter 使用 [Node.js](https://nodejs.org/) 来解释 JavaScript 文件。它需要 `node` 命令位于 [PATH](<https://en.wikipedia.org/wiki/PATH_(variable)>) 中的某个目录中。您需要 Node.js 版本 6.0 或更高版本。
- **C 编译器** - Tree-sitter 创建的解析器是用 C 编写的。为了使用 `tree-sitter parse` 或 `tree-sitter test` 命令运行和测试这些解析器，您必须安装 C/C++ 编译器。Tree-sitter 将尝试在每个平台的标准位置查找这些编译器。

## 安装 {#installation}

要创建 Tree-sitter 解析器，您需要使用 [Tree-sitter CLI](https://github.com/tree-sitter/tree-sitter/tree/master/cli)。您可以通过几种不同的方式安装 CLI：

- 使用 Rust 包管理器 [cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html) 从源码构建 `tree-sitter-cli` [Rust crate](https://crates.io/crates/tree-sitter-cli)。这适用于任何平台。有关更多信息，请参见[贡献文档](https://tree-sitter.github.io/tree-sitter/contributing#developing-tree-sitter)。
- 使用 Node 包管理器 [npm](https://docs.npmjs.com/) 安装 `tree-sitter-cli` [Node.js 模块](https://www.npmjs.com/package/tree-sitter-cli)。这种方法速度快，但仅适用于某些平台，因为它依赖于预构建的二进制文件。
- 从最新的 GitHub 发行版下载适用于您的平台的二进制文件，并将其放入 `PATH` 中的一个目录。

## 项目设置 {#project-setup}

推荐的命名约定是将解析器仓库命名为 `tree-sitter-` 后跟语言的名称。

```bash
mkdir tree-sitter-${YOUR_LANGUAGE_NAME}
cd tree-sitter-${YOUR_LANGUAGE_NAME}
```

您可以使用 `npm` 命令行工具创建一个 `package.json `文件，用于描述您的项目，并允许从 Node.js 使用您的解析器。

```bash
# 这将提示您输入一些信息
npm init

# 这将安装一个小模块，使您的解析器可以从 Node 使用
npm install --save nan

# 这将安装 Tree-sitter CLI 本身
npm install --save-dev tree-sitter-cli
```

最后一个命令会将 CLI 安装到您的工作目录中的 `node_modules` 文件夹中。一个名为 `tree-sitter` 的可执行程序将被创建在 `node_modules/.bin/` 文件夹中。您可能希望遵循 Node.js 的约定，将该文件夹添加到您的 `PATH` 中，以便在此目录中工作时可以轻松运行该程序。

```bash
# 在您的 shell 配置文件中添加以下行
export PATH=$PATH:./node_modules/.bin
```

一旦安装了 CLI，创建一个名为 `grammar.js` 的文件，并包含以下内容：

```javascript
module.exports = grammar({
  name: "YOUR_LANGUAGE_NAME",

  rules: {
    // TODO: 添加实际的语法规则
    source_file: ($) => "hello",
  },
})
```

然后运行以下命令：

```bash
tree-sitter generate
```

这将生成解析这种简单语言所需的 C 代码，以及将此本地解析器编译并作为 Node.js 模块加载所需的几个文件。

您可以通过创建一个包含“hello”内容的源文件并解析它来测试此解析器：

```bash
echo 'hello' > example-file
tree-sitter parse example-file
```

或者，在 Windows PowerShell 中运行以下命令：

```powershell
"hello" | Out-File example-file -Encoding utf8
tree-sitter parse example-file
```

这应该会打印以下内容：

```lisp
(source_file [0, 0] - [1, 0])
```

您现在有了一个可用的解析器。
