# 编写语法 {#writing-the-grammar}

编写语法需要创造力。可以用无数个上下文无关语法（CFG）来描述任何给定的语言。为了生成一个好的 Tree-sitter 解析器，您需要创建一个具有两个重要特性的语法：

1. `直观的结构` - Tree-sitter 的输出是一个[具体的语法树](https://en.wikipedia.org/wiki/Parse_tree)；树中的每个节点直接对应于语法中的一个[终结符或非终结符](https://en.wikipedia.org/wiki/Terminal_and_nonterminal_symbols)。因此，为了生成一个易于分析的树，语法中的符号与语言中可识别的结构之间应该有直接的对应关系。这可能看起来很明显，但与在[语言规范](https://en.wikipedia.org/wiki/Programming_language_specification)或 [Yacc](https://en.wikipedia.org/wiki/Yacc) / [Bison](https://en.wikipedia.org/wiki/GNU_bison) 解析器等上下文中编写的上下文无关语法的方式非常不同。
1. `严格遵循 LR(1)` - Tree-sitter 基于 [GLR 解析](https://en.wikipedia.org/wiki/GLR_parser)算法。这意味着虽然它可以处理任何上下文无关语法，但它在处理一类称为 [LR(1) 语法](https://en.wikipedia.org/wiki/LR_parser)的上下文无关语法时效率最高。在这方面，Tree-sitter 的语法类似于（但比）[Yacc](https://en.wikipedia.org/wiki/Yacc) 和 [Bison](https://en.wikipedia.org/wiki/GNU_bison) 语法限制较少，但与 [ANTLR 语法](https://www.antlr.org/)、[解析表达式语法](https://en.wikipedia.org/wiki/Parsing_expression_grammar)或语言规范中常用的[模糊语法](https://en.wikipedia.org/wiki/Ambiguous_grammar)不同。

仅通过将现有的上下文无关语法直接翻译为 Tree-sitter 的语法格式，您不太可能满足这两个特性。通常需要进行一些调整。以下部分将更详细地解释这些调整。

## Using Fields {#using-fields}

## Hiding Rules {#hiding-rules}
