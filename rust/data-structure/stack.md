# 栈

栈 ( Stack ) 是一种线性数据结构，是数据项的有序集合。其中，新项的添加和移除总是发生在同一端，这一端称为顶部，与之相对的另一端称为底部。栈的特性，是后进先出 ( Last In First Out, LIFO ) 或先进后出 ( First In Last Out, FILO )。

## Rust 实现栈

```rust
#[derive(Debug)]
struct Stack<T> {
  size: usize,  // 栈大小
  data: Vec<T>, // 栈数据
}

impl<T> Stack<T> {
  // 初始化空栈
  fn new() -> Self {
    Self {
      size: 0,
      data: Vec::new(),
    }
  }

  fn is_empty(&self) -> bool {
    self.size == 0
  }

  fn len(&self) -> usize {
    self.size
  }

  // 清空栈
  fn clear(&mut self) {
    self.size = 0;
    self.data.clear();
  }

  // 将数据保存在 Vec 的末尾
  fn push(&mut self, val: T) {
    self.data.push(val);
    self.size += 1;
  }

  // 在将栈顶减 1 后，弹出数据
  fn pop(&mut self) -> Option<T> {
    if self.size == 0 {
      return None;
    }

    self.size -= 1;
    self.data.pop()
  }

  // 返回栈顶数据引用和可变引用
  fn peek(&self) -> Option<&T> {
    if self.size == 0 {
      return None;
    }

    self.data.get(self.size - 1)
  }

  fn peek_mut(&mut self) -> Option<&mut T> {
    if self.size == 0 {
      return None;
    }

    self.data.get_mut(self.size - 1)
  }

  // 以下是为栈实现的迭代功能
  // into_iter: 栈改变，成为迭代器
  // iter: 栈不变，得到不可变迭代器
  // iter_mut: 栈不变，得到可变迭代器
  fn into_iter(self) -> IntoIter<T> {
    IntoIter(self)
  }

  fn iter(&self) -> Iter<T> {
    let mut iterator = Iter { stack: Vec::new() };
    for item in self.data.iter() {
      iterator.stack.push(item);
    }
    iterator
  }

  fn iter_mut(&mut self) -> IterMut<T> {
    let mut iterator = IterMut { stack: Vec::new() };
    for item in self.data.iter_mut() {
      iterator.stack.push(item);
    }
    iterator
  }
}

// 实现三种迭代功能
struct IntoIter<T>(Stack<T>);
impl<T: Clone> Iterator for IntoIter<T> {
  type Item = T;
  fn next(&mut self) -> Option<Self::Item> {
    if !self.0.is_empty() {
      self.0.size -= 1;
      self.0.data.pop()
    } else {
      None
    }
  }
}

struct Iter<'a, T: 'a> {
  stack: Vec<&'a T>,
}
impl<'a, T> Iterator for Iter<'a, T> {
  type Item = &'a T;
  fn next(&mut self) -> Option<Self::Item> {
    self.stack.pop()
  }
}

struct IterMut<'a, T: 'a> {
  stack: Vec<&'a mut T>,
}
impl<'a, T> Iterator for IterMut<'a, T> {
  type Item = &'a mut T;
  fn next(&mut self) -> Option<Self::Item> {
    self.stack.pop()
  }
}

fn main() {
  basic();
  peek();
  iter();

  fn basic() {
    let mut s = Stack::new();
    s.push(1);
    s.push(2);
    s.push(3);

    println!("size: {}, {:?}", s.len(), s);
    println!("pop: {:?}, size {}", s.pop().unwrap(), s.len());
    println!("empty: {}, {:?}", s.is_empty(), s);

    s.clear();
    println!("{:?}", s);
  }

  fn peek() {
    let mut s = Stack::new();
    s.push(1);
    s.push(2);
    s.push(3);

    println!("{:?}", s);
    let peek_mut = s.peek_mut();
    if let Some(top) = peek_mut {
      *top = 4;
    }

    println!("top {:?}", s.peek().unwrap());
    println!("{:?}", s);
  }

  fn iter() {
    let mut s = Stack::new();
    s.push(1);
    s.push(2);
    s.push(3);

    let sum1 = s.iter().sum::<i32>();
    let mut addend = 0;
    for item in s.iter_mut() {
      *item += 1;
      addend += 1;
    }

    let sum2 = s.iter().sum::<i32>();
    println!("{sum1} + {addend} = {sum2}");
    assert_eq!(9, s.into_iter().sum::<i32>());
  }
}
```

output:

```shell
size: 3, Stack { size: 3, data: [1, 2, 3] }
pop: 3, size 2
empty: false, Stack { size: 2, data: [1, 2] }
Stack { size: 0, data: [] }
Stack { size: 3, data: [1, 2, 3] }
top 4
Stack { size: 3, data: [1, 2, 4] }
6 + 3 = 9
```
