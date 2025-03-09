# Vec

Vec 是一种强大但简单的数据容器，它提供了数据收集机制和各种各样的操作，这也是我们反复将其作为实现其他底层数据结构的原因。Vec 类似于 Python 中的 List，使用起来非常方便。然而，不是所有的编程语言都包括 Vec，或者说不是所有的数据类型都适合使用 Vec。

Vec 是用一组链表节点来构建的，其中的每个节点可以通过显式引用链接到下一个节点。只要知道在哪里找到第一个节点，之后的每一个节点就可以通过连续获取下一个链接来找到。

考虑到引用在 Vec 中的作用，Vec 必须保持对第一个节点的引用，None 表示链表不引用任何内容。链表的头节点表示链表中的第一个节点，其中保存了下一个节点的地址。注意，Vec 本身不包含任何节点对象，而是仅包含对链表结构中第一个节点的引用。

链表结构只提供了一个入口，即链表头部。所有其他节点只能通过访问第一个节点，然后跟随下一个链接到达。这意味着添加新节点的最高效方式就是在链表的头部添加，换句话说，将新项作为链表的第一项，并将现有项链接到新项的后面。

此处实现的 Vec 是无序的，若要实现有序 ( 包括全序和偏序 ) 的 Vec，请添加数据比较函数。下面的 LVec 只实现了 Vec 标准库中的部分功能，`print_lvec()` 用于输出 LVec 中的数据项。

```rust
use std::fmt::Debug;

// 节点
#[derive(Debug)]
struct Node<T> {
    elem: T,
    next: Link<T>,
}

type Link<T> = Option<Box<Node<T>>>;

impl<T> Node<T> {
    fn new(elem: T) -> Self {
        Self { elem, next: None }
    }
}

// 链表 Vec
#[derive(Debug)]
struct LVec<T> {
    size: usize,
    head: Link<T>,
}

impl<T: Copy + Debug> LVec<T> {
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

    fn push(&mut self, elem: T) {
        let node = Node::new(elem);

        if self.is_empty() {
            self.head = Some(Box::new(node));
        } else {
            let mut curr = self.head.as_mut().unwrap();

            // 找到链表中的最后一节节点
            for _i in 0..self.size - 1 {
                curr = curr.next.as_mut().unwrap();
            }

            // 在最后一个节点的后面插入新的数据
            curr.next = Some(Box::new(node));
        }

        self.size += 1;
    }

    // 在栈尾添加新的 LVec
    fn append(&mut self, other: &mut Self) {
        while let Some(node) = other.head.as_mut().take() {
            self.push(node.elem);
            other.head = node.next.take();
        }

        other.clear();
    }

    fn insert(&mut self, mut index: usize, elem: T) {
        if index >= self.size {
            index = self.size;
        }

        // 分三种情况插入新节点
        let mut node = Node::new(elem);
        if self.is_empty() {
            // LVec 为空
            self.head = Some(Box::new(node));
        } else if index == 0 {
            // 在链表的头部插入
            node.next = self.head.take();
            self.head = Some(Box::new(node));
        } else {
            // 在链表的中间插入
            let mut curr = self.head.as_mut().unwrap();
            for _i in 0..index - 1 {
                // 找到插入位置
                curr = curr.next.as_mut().unwrap();
            }
            node.next = curr.next.take();
            curr.next = Some(Box::new(node));
        }

        self.size += 1;
    }

    fn pop(&mut self) -> Option<T> {
        if self.size < 1 {
            None
        } else {
            self.remove(self.size - 1)
        }
    }

    fn remove(&mut self, index: usize) -> Option<T> {
        if index >= self.size {
            return None;
        }

        // 分两种情况删除节点，头节点的删除最好处理
        let mut node;
        if 0 == index {
            node = self.head.take().unwrap();
            self.head = node.next.take();
        } else {
            // 对于其他节点，找到待删除节点并处理前后链接
            let mut curr = self.head.as_mut().unwrap();
            for _i in 0..index - 1 {
                curr = curr.next.as_mut().unwrap();
            }
            node = curr.next.take().unwrap();
            curr.next = node.next.take();
        }

        self.size -= 1;

        Some(node.elem)
    }

    // 以下是为栈实现的迭代功能
    // into_iter: 栈改变，成为迭代器
    // iter: 栈不变，只得到不可变迭代器
    // iter_mut: 栈不变，得到可变迭代器
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

    // 输出 LVec 中的数据项
    fn print_lvec(&self) {
        if 0 == self.size {
            println!("Empty lvec");
        }

        for item in self.iter() {
            println!("{:?}", item)
        }
    }
}

// 实现三种迭代功能
struct IntoIter<T: Copy + Debug>(LVec<T>);
impl<T: Copy + Debug> Iterator for IntoIter<T> {
    type Item = T;
    fn next(&mut self) -> Option<Self::Item> {
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

fn main() {
    basic();
    iter();

    fn basic() {
        let mut lvec1: LVec<i32> = LVec::new();
        lvec1.push(10);
        lvec1.push(11);
        lvec1.push(12);
        lvec1.push(13);
        lvec1.insert(0, 9);

        lvec1.print_lvec();

        let mut lvec2: LVec<i32> = LVec::new();
        lvec2.insert(0, 8);
        lvec2.append(&mut lvec1);

        println!("len: {}", lvec2.len());
        println!("pop: {:?}", lvec2.pop().unwrap());
        println!("remove: {:?}", lvec2.remove(0).unwrap());

        lvec2.print_lvec();
        lvec2.clear();
        lvec2.print_lvec();
    }

    fn iter() {
        let mut lvec: LVec<i32> = LVec::new();
        lvec.push(10);
        lvec.push(11);
        lvec.push(12);
        lvec.push(13);

        let sum1 = lvec.iter().sum::<i32>();
        let mut addend = 0;
        for item in lvec.iter_mut() {
            *item += 1;
            addend += 1;
        }

        let sum2 = lvec.iter().sum::<i32>();
        println!("{sum1} + {addend} = {sum2}");

        assert_eq!(50, lvec.into_iter().sum::<i32>());
    }
}
```

output:

```shell
9
10
11
12
13
len: 6
pop: 13
remove: 8
9
10
11
12
Empty lvec
46 + 4 = 50
```
