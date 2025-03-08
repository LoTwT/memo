# 队列

队列是项的有序集合，其中，添加新项的一端成为队尾，移除项的另一端称为队首。一个元素在从队尾进入队列后，就会一直向队首移动，直到它成为下一个需要移除的元素为止。最近添加的元素必须在队尾等待，队列中存活时间最长的元素在队首，因为它经历了从队尾到队首的移动。这种排序方式被称为先进先出 ( First In First Out, FIFO )，与 LIFO 正好相反。

操作系统也使用队列这种数据结构，旨在使用多个不同的队列来控制进程。调度算法通常基于尽可能快地执行程序和尽可能多地服务用户的排队算法来决定下一步做什么。

用 Rust 实现队列，和栈类似，使用 Vec 就足够了，只要稍微限制一下对 Vec 加入和移除元素的用法，就能实现队列。选择 Vec 的左端作为队尾，并选择其右端作为队首，这样移除数据的复杂度是 O(1)，加入数据的复杂度是 O(n)。为了防止队列无限增长，可以添加 cap 参数用于控制队列长度。

```rust
// 定义队列
#[derive(Debug)]
struct Queue<T> {
    cap: usize,   // 容量
    data: Vec<T>, // 数据容器
}

impl<T> Queue<T> {
    fn new(size: usize) -> Self {
        Self {
            cap: size,
            data: Vec::with_capacity(size),
        }
    }

    fn is_empty(&self) -> bool {
        0 == Self::len(&self)
    }

    fn is_full(&self) -> bool {
        self.len() == self.cap
    }

    fn len(&self) -> usize {
        self.data.len()
    }

    fn clear(&mut self) {
        self.data = Vec::with_capacity(self.cap);
    }

    // 判断是否有剩余空间，如果有的话，就将数据添加到队列中
    fn enqueue(&mut self, val: T) -> Result<(), String> {
        if self.len() == self.cap {
            return Err("No space available".to_string());
        }
        self.data.insert(0, val);
        Ok(())
    }

    // 数据出队
    fn dequeue(&mut self) -> Option<T> {
        if self.len() > 0 {
            self.data.pop()
        } else {
            None
        }
    }

    //以下是为队列实现的迭代功能
    // into_iter: 队列改变，成为迭代器
    // iter: 队列不变，仅得到不可变迭代器
    // iter_mut: 队列不变，得到可变迭代器
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
struct IntoIter<T>(Queue<T>);
impl<T: Clone> Iterator for IntoIter<T> {
    type Item = T;
    fn next(&mut self) -> Option<Self::Item> {
        if !self.0.is_empty() {
            Some(self.0.data.remove(0))
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
        if 0 != self.stack.len() {
            Some(self.stack.remove(0))
        } else {
            None
        }
    }
}

struct IterMut<'a, T: 'a> {
    stack: Vec<&'a mut T>,
}
impl<'a, T> Iterator for IterMut<'a, T> {
    type Item = &'a mut T;
    fn next(&mut self) -> Option<Self::Item> {
        if 0 != self.stack.len() {
            Some(self.stack.remove(0))
        } else {
            None
        }
    }
}

fn main() {
    basic();
    iter();

    fn basic() {
        let mut q = Queue::new(4);
        let _r1 = q.enqueue(1);
        let _r2 = q.enqueue(2);
        let _r3 = q.enqueue(3);
        let _r4 = q.enqueue(4);

        if let Err(error) = q.enqueue(5) {
            println!("Enqueue error: {error}")
        }

        if let Some(data) = q.dequeue() {
            println!("dequeue data: {data}");
        } else {
            println!("empty queue");
        }

        println!("empty: {}, len: {}", q.is_empty(), q.len());
        println!("full: {}", q.is_full());
        println!("q: {:?}", q);
        q.clear();
        println!("q: {:?}", q);
    }

    fn iter() {
        let mut q = Queue::new(4);
        let _r1 = q.enqueue(1);
        let _r2 = q.enqueue(2);
        let _r3 = q.enqueue(3);
        let _r4 = q.enqueue(4);

        let sum1 = q.iter().sum::<i32>();
        let mut addend = 0;
        for item in q.iter_mut() {
            *item += 1;
            addend += 1;
        }
        let sum2 = q.iter().sum::<i32>();
        println!("{sum1} + {addend} = {sum2}");
        println!("sum = {}", q.into_iter().sum::<i32>());
    }
}
```

output:

```shell
Enqueue error: No space available
dequeue data: 1
empty: false, len: 3
full: false
q: Queue { cap: 4, data: [4, 3, 2] }
q: Queue { cap: 4, data: [] }
10 + 4 = 14
sum = 14
```
