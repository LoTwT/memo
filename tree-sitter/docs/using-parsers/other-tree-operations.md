# 其他树操作 {#other-tree-operations}

## 使用树光标遍历树 {#walking-trees-with-tree-cursors}

您可以使用[上述](/tree-sitter/docs/using-parsers/basic-parsing#retrieving-nodes)的 `TSNode` API 访问语法树中的每个节点，但如果您需要访问大量节点，最快的方法是使用树光标。光标是一个有状态的对象，允许您以最大效率遍历语法树。

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

您始终可以检索光标的当前节点，以及与当前节点关联的[字段名称](/tree-sitter/docs/using-parsers/basic-parsing#node-field-names)。

```c
TSNode ts_tree_cursor_current_node(const TSTreeCursor *);
const char *ts_tree_cursor_current_field_name(const TSTreeCursor *);
TSFieldId ts_tree_cursor_current_field_id(const TSTreeCursor *);
```
