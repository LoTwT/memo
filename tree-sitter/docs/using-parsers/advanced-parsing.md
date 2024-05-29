# 高级解析 {#advanced-parsing}

## 编辑 {#editing}

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

## 多语言文档 {#multi-language-documents}

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

## 并发 {#concurrency}

Tree-sitter 通过非常低成本的语法树复制来支持多线程的用例。

```c
TSTree *ts_tree_copy(const TSTree *);
```

在内部，复制语法树仅涉及增加一个原子引用计数。从概念上讲，它为您提供了一个新的树，您可以在一个新线程上自由查询、编辑、重新解析或删除它，同时在不同的线程上继续使用原始树。请注意，单个 `TSTree` 实例不是线程安全的；如果您想在多个线程上同时使用它，必须复制该树。
