# 括号匹配

括号匹配可以用栈来解决。从空栈开始，从左到右处理括号字符串。如果一个符号是开始符号，将其入栈；如果是结束符号，则弹出栈顶元素并开始匹配这两个符号。如果它们恰好是左右匹配的，就继续处理下一个括号，知道字符串处理完为止。最后，当所有符号都被处理后，栈应该是空的。只要栈不为空，就说明有括号不匹配。

以下是仅匹配 `()` 的括号匹配程序：

```rust
// par_checker1.rs
pub mod stack;
use stack::Stack;

fn par_checker1(par: &str) -> bool {
    // 将字符添加到 Vec 中
    let mut char_list = Vec::new();
    for c in par.chars() {
        char_list.push(c);
    }

    let mut index = 0;
    let mut balance = true; // 括号是否匹配 ( 平衡 ) 标识
    let mut stack = Stack::new();

    while index < char_list.len() && balance {
        let c = char_list[index];

        if '(' == c {
            // 如果为开始符号，入栈
            stack.push(c);
        } else {
            // 如果为结束符号，判断栈是否为空
            if stack.is_empty() {
                // 栈为空，所以括号不匹配
                balance = false;
            } else {
                let _r = stack.pop();
            }
        }
        index += 1;
    }

    // 仅当平衡且栈为空时，括号才是匹配的
    balance && stack.is_empty()
}

fn main() {
    let sa = "()(())";
    let sb = "()((()";
    let res1 = par_checker1(sa);
    let res2 = par_checker1(sb);
    println!("{sa} balanced: {res1}, {sb} balanced: {res2}");
}
```

output:

```shell
()(()) balanced: true, ()((() balanced: false
```

以下是可以同时匹配 `()`、`[]`、`{}` 三种括号的示例：

```rust
// par_checker2.rs
pub mod stack;
use stack::Stack;

// 同时检测多种开始符号和结束符号是否匹配
fn par_match(open: char, close: char) -> bool {
    let opens = "([{";
    let closers = ")]}";
    opens.find(open) == closers.find(close)
}

fn par_checker2(par: &str) -> bool {
    let mut char_list = Vec::new();
    for c in par.chars() {
        char_list.push(c);
    }

    let mut index = 0;
    let mut balance = true;
    let mut stack = Stack::new();

    while index < char_list.len() && balance {
        let c = char_list[index];
        // 同时判断三种开始符号
        if '(' == c || '[' == c || '{' == c {
            stack.push(c);
        } else {
            if stack.is_empty() {
                balance = false
            } else {
                // 比较当前括号和栈顶括号是否匹配
                let top = stack.pop().unwrap();
                if !par_match(top, c) {
                    balance = false;
                }
            }
        }
        index += 1;
    }

    balance && stack.is_empty()
}

fn main() {
    let sa = "(){}[]";
    let sb = "(){)[}";
    let res1 = par_checker2(sa);
    let res2 = par_checker2(sb);
    println!("{sa} balanced: {res1}, {sb} balanced: {res2}");
}
```

output:

```shell
(){}[] balanced: true, (){)[} balanced: false
```

以上示例遇到类似 `(a+b)(c*d)func()` 的表达式会报错，所以需要跳过非括号字符的处理，示例如下：

```rust
// par_checker3.rs
pub mod stack;
use stack::Stack;

// 同时检测多种开始符号和结束符号是否匹配
fn par_match(open: char, close: char) -> bool {
    let opens = "([{";
    let closers = ")]}";
    opens.find(open) == closers.find(close)
}

fn par_checker3(par: &str) -> bool {
    let mut char_list = Vec::new();
    for c in par.chars() {
        char_list.push(c);
    }

    let mut index = 0;
    let mut balance = true;
    let mut stack = Stack::new();
    while index < char_list.len() && balance {
        let c = char_list[index];

        // 将开始符号入栈
        if '(' == c || '[' == c || '{' == c {
            stack.push(c);
        }

        // 如果是结束符号，则判断是否平衡
        if ')' == c || ']' == c || '}' == c {
            if stack.is_empty() {
                balance = false;
            } else {
                let top = stack.pop().unwrap();
                if !par_match(top, c) {
                    balance = false;
                }
            }
        }

        index += 1;
    }

    balance && stack.is_empty()
}

fn main() {
    let sa = "(2+3){func}[abc]";
    let sb = "(2+3)*(3-1";
    let res1 = par_checker3(sa);
    let res2 = par_checker3(sb);
    println!("{sa} balanced: {res1}, {sb} balanced: {res2}");
}
```

output:

```shell
(2+3){func}[abc] balanced: true, (2+3)*(3-1 balanced: false
```
