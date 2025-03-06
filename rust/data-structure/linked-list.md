# 链表

```rust
// 节点链接使用了 Box 指针 ( 大小是确定的 )，因为确定大小后才能分配内存
type Link<T> = Option<Box<Node<T>>>;

// 定义链表
struct List<T> {
    size: usize,   // 链表中的节点数
    head: Link<T>, // 头节点
}

// 链表节点
struct Node<T> {
    elem: T,       // 数据
    next: Link<T>, // 下一个节点链接
}

impl<T> List<T> {
    fn new() -> Self {
        Self {
            size: 0,
            head: None,
        }
    }

    fn is_empty(&self) -> bool {
        0 == self.size
    }

    fn len(&self) -> usize {
        self.size
    }

    fn clear(&mut self) {
        self.size = 0;
        self.head = None;
    }

    // 新节点总是被添加到头部
    fn push(&mut self, elem: T) {
        let node = Box::new(Node {
            elem,
            next: self.head.take(),
        });
        self.head = Some(node);
        self.size += 1;
    }

    // take() 会取出数据，留下空位
    fn pop(&mut self) -> Option<T> {
        self.head.take().map(|node| {
            self.head = node.next;
            self.size -= 1;
            node.elem
        })
    }

    // peek() 不改变值，只能是引用
    fn peek(&self) -> Option<&T> {
        self.head.as_ref().map(|node| &node.elem)
    }

    // peek_mut() 可改变值，是可变引用
    fn peek_mut(&mut self) -> Option<&mut T> {
        self.head.as_mut().map(|node| &mut node.elem)
    }

    // 以下是为链表实现的迭代功能
    // into_iter: 链表改变，成为迭代器
    // iter: 链表不变，只得到不可变迭代器
    // iter_mut: 链表不变，得到可变迭代器
    fn into_iter(self) -> IntoIter<T> {
        IntoIter(self)
    }

    fn iter(&self) -> Iter<T> {
        Iter {
            next: self.head.as_deref(),
        }
    }

    fn iter_mut(&mut self) -> IterMut<T> {
        IterMut {
            next: self.head.as_deref_mut(),
        }
    }
}

// 实现三种迭代功能
struct IntoIter<T>(List<T>);
impl<T> Iterator for IntoIter<T> {
    type Item = T;
    fn next(&mut self) -> Option<Self::Item> {
        // (List<T>) 元组的第 0 项
        self.0.pop()
    }
}

struct Iter<'a, T: 'a> {
    next: Option<&'a Node<T>>,
}
impl<'a, T> Iterator for Iter<'a, T> {
    type Item = &'a T;
    fn next(&mut self) -> Option<Self::Item> {
        self.next.map(|node| {
            self.next = node.next.as_deref();
            &node.elem
        })
    }
}

struct IterMut<'a, T: 'a> {
    next: Option<&'a mut Node<T>>,
}
impl<'a, T> Iterator for IterMut<'a, T> {
    type Item = &'a mut T;
    fn next(&mut self) -> Option<Self::Item> {
        self.next.take().map(|node| {
            self.next = node.next.as_deref_mut();
            &mut node.elem
        })
    }
}

// 为链表实现自定义 Drop
impl<T> Drop for List<T> {
    fn drop(&mut self) {
        let mut link = self.head.take();
        while let Some(mut node) = link {
            link = node.next.take();
        }
    }
}

fn main() {
    basic_test();
    into_iter_test();
    iter_test();
    iter_mut_test();

    fn basic_test() {
        let mut list = List::new();
        list.push(1);
        list.push(2);
        list.push(3);

        assert_eq!(list.len(), 3);
        assert_eq!(list.is_empty(), false);
        assert_eq!(list.pop(), Some(3));
        assert_eq!(list.peek(), Some(&2));
        assert_eq!(list.peek_mut(), Some(&mut 2));

        list.peek_mut().map(|val| *val = 4);

        assert_eq!(list.peek(), Some(&4));
        list.clear();
        println!("basics test OK!");
    }

    fn into_iter_test() {
        let mut list = List::new();
        list.push(1);
        list.push(2);
        list.push(3);

        let mut iter = list.into_iter();
        assert_eq!(iter.next(), Some(3));
        assert_eq!(iter.next(), Some(2));
        assert_eq!(iter.next(), Some(1));
        assert_eq!(iter.next(), None);

        println!("into_iter test OK!");
    }

    fn iter_test() {
        let mut list = List::new();
        list.push(1);
        list.push(2);
        list.push(3);

        let mut iter = list.iter();
        assert_eq!(iter.next(), Some(&3));
        assert_eq!(iter.next(), Some(&2));
        assert_eq!(iter.next(), Some(&1));
        assert_eq!(iter.next(), None);

        println!("iter test OK!");
    }

    fn iter_mut_test() {
        let mut list = List::new();
        list.push(1);
        list.push(2);
        list.push(3);

        let mut iter = list.iter_mut();
        assert_eq!(iter.next(), Some(&mut 3));
        assert_eq!(iter.next(), Some(&mut 2));
        assert_eq!(iter.next(), Some(&mut 1));
        assert_eq!(iter.next(), None);

        println!("iter_mut test OK!");
    }
}

```

output:

```shell
basics test OK!
into_iter test OK!
iter test OK!
iter_mut test OK!
```
