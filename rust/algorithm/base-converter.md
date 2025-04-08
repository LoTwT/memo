# 进制转换

二进制是计算机世界里的`底座`，也是计算机世界底层真正通用的数据格式，因为计算机中的值都是以 0 和 1 的电压形式存储的。

## 除二法

将十进制数转换为二进制表示形式的最简单方法是`除二法`，可用栈来跟踪二进制结果。`除二法`假定从大于 0 的整数开始，不断迭代地将十进制数除以 2 并跟踪余数。第一个除以 2 的余数表明了这个整数是偶数还是奇数。偶数的余数为 0，奇数的余数为 1。在迭代除以 2 的过程中将这些余数记录下来，就得到了一个二进制数字序列，第一个余数实际上是该序列中的最后一个数字。

```rust
fn divide_by_two(mut dec_num: u32) -> String {
    // 用栈保存余数 rem
    let mut rem_stack = Stack::new();

    // 余数 rem 入栈
    while dec_num > 0 {
        let rem = dec_num % 2;
        rem_stack.push(rem);
        dec_num /= 2;
    }

    // 栈中元素出栈，组成字符串
    let mut bin_str = "".to_string();

    while !rem_stack.is_empty() {
        let rem = rem_stack.pop().unwrap().to_string();
        bin_str += &rem;
    }

    bin_str
}

fn main() {
    let num = 10;
    let bin_str = divide_by_two(num);
    println!("{num} = b{bin_str}");
}
```

output:

```shell
10 = b1010
```

## 进制转换

```rust
fn base_converter(mut dec_num: u32, base: u32) -> String {
    // digits 对应各种余数的字符形式，尤其是 10 ~ 15
    let digits = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F',
    ];
    let mut rem_stack = Stack::new();

    // 余数入栈
    while dec_num > 0 {
        let rem = dec_num % base;
        rem_stack.push(rem);
        dec_num /= base;
    }

    // 余数出栈并取对应字符以拼接成字符串
    let mut base_str = "".to_string();
    while !rem_stack.is_empty() {
        let rem = rem_stack.pop().unwrap() as usize;
        base_str += &digits[rem].to_string();
    }

    base_str
}

fn main() {
    let num1 = 10;
    let num2 = 43;
    let bin_str = base_converter(num1, 2);
    let hex_str = base_converter(num2, 16);
    println!("{num1} = b{bin_str}, {num2} = x{hex_str}");
}
```

output:

```shell
10 = b1010, 43 = x2B
```
