+++
title = "Rust 学习笔记"
author = ["Burgess Chang"]
date = 2019-09-05
lastmod = 2019-09-05T09:43:58+08:00
draft = false
+++

## The Rust Programming Language {#the-rust-programming-language}

太久没有任何 Rust 的代码实践，对于这门我最喜欢的语言有些陌生了。借由复习 \`The
Rust Program Language'，正好补上以前拖欠的学习笔记。

> 为什么选择 Rust？因为他安全、高性能、优雅！---我说的


### Hello World {#hello-world}

任何语言的编程都从 **Hello World** 开始。

```rust
// hello.rs
fn main() {
    println!("Hello World!");
}
```


#### Compiled & Run {#compiled-and-run}

-   `rustc hello.rs`
-   `./hello`


### 简单的猜数字游戏 {#简单的猜数字游戏}


#### 使用 cargo 构建项目 {#使用-cargo-构建项目}

cargo 可以便捷的管理项目，使用 cargo 创建猜数字游戏：

```bash
cargo new guessing_game
cd guessing_game
```

cargo 使用 `Cargo.toml` 来配置项目，它的作用就像 node.js 的 `package.json` 一样。它的定义就像这样：

```toml
[package]
name = "guessing_game"
version = "0.1.0"
authors = ["Burgess Chang <burgess@ngcrl.org>"]
edition = "2018"

[dependencies]

```


#### 处理猜测 {#处理猜测}

猜数字游戏有着必然的交互，需要处理输入的数字，可以使用 `std::io` 来进行输入数据的处理。

```rust
use std::io;

fn main() {
    println!("=== guess the number ===");
    println!("Please input a number you guess: ");
    let mut guess = String::new();
    io::stdin().read_line(&mut guess).expect("Failed to read line.");
    println!("You guessed: {}", guess);
}
```

Run result:

```bash
cargo build
cargo run
=== guess the number ===
Please input a number you guess:
520
You guessed: 520
```

-    在变量中存储值

    上面程序中使用 `let mut guess = String::new()` 完成了变量的初始化，值得注意的一点是，Rust 中变量默认是静态的，要声明一个可变的变量需要使用 `mut` (mutable) 去修饰。

-    使用 `Result` 类型处理抛出错误

    `Result` 类型是枚举类型，可以有多种变体。像 `Result` 可以有 `Ok` 和 `Err=。
    =Result` 有 expect 方法可以调用，就像其他现代语言中的 `try { throw.. } catch {..}`
    一样，可以使用它来匹配错误类型的处理。

-    `println!` 中的占位符

    `println!("You guessed: {}", guess);` 中的 `{}` 起到格式控制符一样的作用。可以打印一个匹配的变量。


#### 构造需要猜测的数字 {#构造需要猜测的数字}

接下来需要生成一个随机数用于猜测， `crate` 是一个 Rust 包的库，可以在这个上面找到许多别人完成的高质量库。这里可以使用 `rand` 这个库。

-    使用 `rand`

    `crate` 提供的是 Rust 源码，生成可执行的二进制文件需要将相应的包下载到本地进行构建。首先需要添加依赖，编辑 \`Cargo.toml' 添加相应依赖项。

    ```toml
    [dependencies]
    rand = "0.3.14"
    ```

    然后执行 `cargo build` 即可完成构建，执行 `cargo update` 可以更新 crate，更新之后的 `rand` 版本为 _0.4.6_ 。

-    生成一个随机数

    使用 `rand::thread_rng.range(1, 101)` 生成范围为 1 - 100 的随机数。


#### 比较猜测的数字和需要猜测的数字 {#比较猜测的数字和需要猜测的数字}

三种情况：小于、大于和等于。可以使用标准库中的 `std::cmp::Ordering` 类型来描述这三种情况，它也是一种枚举类型，有三个成员：Less、Greater 和 Equal。修改后的代码是：

```rust
use std::io;
use std::cmp::Ordering;
use rand::Rng;

fn main() {
    println!("=== guess the number ===");
    let _secret_number = rand::thread_rng().gen_range(1, 101);
    println!("The secret number is {}", _secret_number);
    println!("Please input a number you guess: ");
    let mut guess = String::new();
    io::stdin().read_line(&mut guess).expect("Failed to read line.");
    let guess: u32 = guess.trim().parse().expect("Please type a number!");
    println!("You guessed: {}", guess);
    match guess.cmp(&_secret_number) {
        Ordering::Less => println!("Too small!"),
        Ordering::Greater => println!("Too big!"),
        Ordering::Equal => println!("You win!"),
    }
}
```

`match` 很像 c/c++ 中的 switch，但更为强大和灵敏， `match` 的结构是
`match SomeJudge { arms => pattern }` 。


#### 使用循环来多次猜测 {#使用循环来多次猜测}

通过使用 `loop` 来让猜测可以一直循环，同时需要在 Ordering::Equal 情况时添加
`break;` 来让循环结束。

```rust
// import lib

fn main() {
    // define and print
    loop {
        // input operate
        match guess.cmp(&_secret_number) {
            Ordering::Less => println!("Too small!"),
            Ordering::Greater => println!("Too big!"),
            Ordering::Equal => {
                println!("You win!");
                break;
            },
        }
    }
}
```


#### 处理无效化输入 {#处理无效化输入}

现在程序的状态是当输入非数字时，程序会自动崩溃，可以修改 guess input 的 except 为
match 来实现忽略非数字的情况。就像这样：

```rust
let guess: u32 = match guess.trim().parse() {
            Ok(num) => num,
            Err(_) => {
                println!("Please input a number!");
                continue;
            }
        };
```


#### 最终结果 {#最终结果}

这样一个猜数字游戏就完成了，最终代码如下：

```rust
use std::io;
use std::cmp::Ordering;
use rand::Rng;

fn main() {
    println!("=== guess the number ===");
    let _secret_number = rand::thread_rng().gen_range(1, 101);
    // println!("The secret number is {}", _secret_number);
    loop {
        println!("Please input a number you guess: ");
        let mut guess = String::new();
        io::stdin().read_line(&mut guess).expect("Failed to read line.");
        let guess: u32 = match guess.trim().parse() {
            Ok(num) => num,
            Err(_) => {
                println!("Please input a number!");
                continue;
            }
        };
        println!("You guessed: {}", guess);
        match guess.cmp(&_secret_number) {
            Ordering::Less => println!("Too small!"),
            Ordering::Greater => println!("Too big!"),
            Ordering::Equal => {
                println!("You win!");
                break;
            },
        }
    }
}
```


### 通用编程概念 {#通用编程概念}

编程语言经历这半个世纪的发展，编程概念几乎是通用的了，无非来自 C 和 Lisp 两个鼻祖。


#### 基础概念 {#基础概念}

-    关键字

    关键字也就是保留字，为了避免语法在环境中的冲突，所有语言都有一组保留的关键字，任何方法和变量都不被允许使用它们。

-    标识符

    标识符也是就是环境中自定义结构的名字，在 Rust 中有如下限制：

    -   字母或 \_ 开头
    -   多于一个字符，不能为单独的 \_
    -   其他字符必须是字母、数字、\_


#### 变量与可变性 {#变量与可变性}

初接触 Rust 最有意思的一点就是变量默认不可变(XD。

```rust
let mut x; // mutable
let x;     // immutable
```

-    常量与变量

    不允许改变的变量和常量有什么区别？

    -   常量声明时 **必须** 注明类型
    -   常量不能声明为 `mut`
    -   常量只能被设置为常量表达式

    `const _constants: u8 = 1`

-    变量的隐藏

    Rust 变量还有一个有意思的点就是隐藏，像这样：

    ```rust
    let x = "some";
    let x = 1;
    ```

    当你用 let 重复声明时，会将旧的变量隐藏，这与 mut 类型的赋值并不相同，正如能看到的，类型是可以改变的，因为隐藏实际上是创建了一个新变量。


#### 数据类型 {#数据类型}

Rust 是一种静态类型语言，正如任何静态类型语言一样，需要在编译时就推导出所有变量的类型。

-    标量类型

    `Rust` 有四种标量类型：

    -    整型

        -    符号类型与长度

            | 长度（bit） | 有符号 | 无符号 |
            |---------|-----|-----|
            | 8       | i8    | u8    |
            | 16      | i16   | u16   |
            | 32      | i32   | u32   |
            | 64      | i64   | u64   |
            | arch    | isize | usize |

        -    字面值

            | 10 进制   | 99\_999      |
            |---------|--------------|
            | 16 进制   | 0xffff       |
            | 8 进制    | 0o7777       |
            | 2 进制    | 0b1111\_0000 |
            | 字符（ASCII） | b'A'         |

            **NOTE**:
            可以使用 \_ 作为分隔符便于读数。

        -    溢出

            Rust 在不同的模式编译时，对溢出采取不同的处理策略。

            -   debug 模式溢出会导致编译器 **panic** 。
            -   release 模式编译器不会检测溢出，会进行 \`two’s complement wrapping' 处理。在 `u8` 时，
                `256` -> `0` ， `257` -> `1` 。如果需要真实的溢出行为，需要使用标准库中的类型
                `Wrapping` 显式处理。

    -    浮点型

        -    长度

            | 长度/精度 |     |
            |-------|-----|
            | 32    | f32 |
            | 64    | f64 |

            **NOTE**: 默认类型为 `f64` 。

        -    数值运算

            `Rust` 像其他语言一样，支持基本的数学运算：加法、减法、乘法、除法、取余。

            ```rust
            fn main() {
                let sum: f32 = 5 + 10;
                let difference: f64 = 9.9 - 3.3;
                let product = 3 * 20;
                let quotient = 11.1 / 2.1;
                let remainder = 210 % 5;
            }
            ```

    -    布尔型

        | 类型  | 值 |
        |-----|---|
        | true  | 真 |
        | false | 假 |

    -    字符类型

        `Rust` 中的 `char` 代表了一个 **Unicode** 标量值。
        **NOTE**: { U+0000 - U+D7FF } + { U+E000 - U+10FFFF }

-    复合类型

    -    元组

        元组可以将其他类型的值组合进一个复合类型，很像 `Lisp` 中的 `list` 。访问元组中的元素可以通过模式匹配来结构或者使用下标的索引。

        ```rust
        fn main() {
            let tup = (1, 2, 3);
            // pattern match
            let (x, y, z) = tup;
            // subscript index
            let some = tup.0;
        }
        ```

    -    数组

        `Rust` 的数组与 `C/CC` 一样，声明时就需要确定数组的长度。访问数组的元素也是通过下标的索引。

        ```rust
        fn main() {
            let array: [i32; 5] = [1, 2, 3, 4, 5];
            let some = array[0];
        }
        ```

        -    访问无效数组元素

            我们已经知道， `C/CC` 中访问边界外的数组元素会访问一段越界的内存。 `Rust` 中又是如何处理的？ `Rust` 在你想访问越界的数组元素时，会返回运行时错误，立即中断程序的运行，而不允许内存访问并继续执行。


#### 函数 {#函数}

函数是用来产生 side effect 的重要工具，程序的 `main` 入口便是一个函数。

-    函数参数

    函数被定义为可以拥有 **参数** ，参数是特殊的变量，是函数签名的一部分。传入函数的数据便是 `形参 -> 实参` 这样一个过程。形如：

    ```rust
    fn example_function(arguments1: i32, arguments2: i32) {
        // statements
    }
    ```

-    函数体

    函数体就是在函数内部的一些语句和表达式。

-    返回值

    `Rust` 使用 `->` 来声明函数的返回值类型。返回值等同与函数体最后一个表达式的值，也可以使用 `return` 关键字指定返回值。

    ```rust
    fn example_function(arguments: i32) -> i32 {
        arguments + 1
    }
    fn example_function_use_return() -> i32 {
        let x = 2;
        return x;
    }
    ```


#### 注释 {#注释}

注释是维护代码可读性不可或缺的一部分，Rust 提供了多种注释风格。

-   `// 行内注释`
-   `/* 块注释 */`


#### 控制流 {#控制流}

`Rust` 代码中最常见的用来控制执行流的结构是 `if` 表达式和循环。

-    if 表达式

    `Rust` 的 `if` 语句结构和其他语言相似。

    ```rust
    fn main() {
        if condition {
            // some statements
        } else if new_condition {
            // some statements
        } else {
            // some statements
        }
        let example: i32 = if true {
            1
        } else {
            0
        }
    }
    ```

    **NOTE**:

    1.  判断的条件表达式必须为 `bool` 类型， `Rust` 并不像 `=C/CC` 或者
        `ECMAScript` 那样自动转变非 `bool` 值。否则编译器会抛出一段错误。
    2.  因为 `if` 是一个表达式，所以可以作为 `let` 语句的右值。

-    循环

    -    loop

        `loop` 会循环执行代码直到你声明停止。

        ```rust
        fn main() {
            let mut counter = 0;
            let cycle_counter = loop {
                counter += 1;
                if counter == 10 {
                    break counter;
                }
            }
        }
        ```

    -    while

        `while` 就是按条件执行的 `loop` 。

        ```rust
        fn main() {
            while condition {
                // some statements
            }
        }
        ```

    -    for

        `for` 语句用来一个集合的每个元素执行一些代码。

        ```rust
        fn main() {
            for element in aggredate.iter {
                // some statements
            }
        }
        ```


### 所有权 {#所有权}

`所有权` 是 Rust 最独特的功能，它让 Rust 无需 gc 就能保障内存的安全。理解所有权的前提是必须明白程序的数据在堆和栈会产生哪些行为上的差异。而所有权系统所做的是就是跟踪哪部分代码正在使用堆上的哪些数据，最大限度的减少堆上的重复数据的数量，以及清理堆上不再使用的数据确保不会耗尽空间。


#### 什么是所有权 {#什么是所有权}

-    所有权规则

    1.  Rust 的每一个值都有一个被成为 `所有者` 的变量。
    2.  值有且只有一个所有者。
    3.  所有者离开作用域时，值将被丢弃。

-    变量作用域

    与其他现代语言一样， Rust 中的变量也有这类似全局作用域和局部作用域这样的区别。形如：

    ```rust
    { // scope start, `example' is invalid: undefined.
        let example: i32 = 0; // `example' is valid.
    } // scope close, `example' is invalid: destory.
    ```

-    内存与分配

    上例中基础数据类型存放在栈中，一个存放在堆上的复杂数据类型能更好的探索 Rust 是如何处理 gc 的。可以使用 `String` 类型，为了支持一个可变、可增长的文本片段，需要在堆上分配一块在编译时未知大小的内存来存放内容，这表示：

    -   必须在运行时向操作系统请求数据。
    -   需要一个处理完数据返回给操作系统的方法。

    在有 gc(garbage collector) 的语言中，gc 会记录清除不再使用的内存。没有 gc 的话，就需要我们手动去释放内存了，就像你在 `C/CC` 所做的一样，需要对每一个 allocate 或者 malloc 配对一个 free 。而 Rust 采取了完全不同的策略，内存在拥有它的变量离开他的变量作用域时自动释放，熟悉 `C++` 的可能知道，这就是 **资源获取即初始化(RAII)**
    方式。

    ```rust
    { // scope start, `example' is invalid: undefined.
        let example: String = String::from("example"); // `example' is valid.
    } // scope close, `example' is invalid: destory.
    ```

    在变量离开变量作用域的时候， Rust 会自动调用 `drop` 函数。这听起来很简单，但是在不同的场景下，产生的行为可能是不同的。

    -    移动

        对于这样的情况：

        ```rust
        let example = String::from("example");
        let temp = example;
        ```

        看起来在对 temp 进行赋值的时候，产生了一次复制，单对于 String 这类存储在堆上的复杂类型，每一次赋值都执行复制操作，会产生巨大的性能问题。不难想到，如果这种赋值传递的只是一个内存的指针不就好了，事实上，当 \`example' 和 \`temp' 离开变量作用域，两次 drop 会释放同一段内存，从而造成 **二次释放** 的错误，会导致内存污染。而 Rust
        的做法是，在尝试拷贝复制的时候，认为左值不在有效，从而在离开变量作用域的时候，无需清理左值的任何东西。复制内存的指针和长度信息称为 **浅拷贝** ，复制整个变量的内存则被称为 **深拷贝** ，而 Rust 的这种做法并没有产生任何的拷贝行为，所以被称作 **移动** 。

    -    克隆

        Rust 中的深拷贝使用一个叫 **clone** 的通用方法。

        ```rust
        let example = String::from("example");
        let temp = example.clone();
        ```

        而对于栈上的变量执行 clone 方法，编译器并不会做什么。这是通过 `Copy` trait 的特殊注解实现的。

-    所有权与函数

    -    传递参数

        传递函数参数发生的所有权变化与变量赋值相似，也依据变量在堆或栈上的情况发生拷贝和移动两种行为。

        ```rust
        fn copy_argument(example: isize) {
            // some statements
        }
        fn move_argument(example: String) {
            // some statements
        }
        fn main() {
            let copy_type: isize = 0;
            let move_type: String = String::from("example");
            copy_argument(copy_type);
            move_argument(move_type);
        }
        ```

    -    返回值

        返回值也会发生像参数一样的所有权转移。


#### 引用与借用 {#引用与借用}

在一些情况下，获取值的所有权会导致它本身的不可用

```rust
fn main() {
    let s1 = String::from("hello");
    let (s2, len) = calculate_length(s1);
    // s1's ownership -> funcation calculate_length argument
    // s1 destory, unvalid
    println!("The length of '{}' is {}.", s2, len);
}
fn calculate_length(s: String) -> (String, usize) {
    let length = s.len();
    (s, length)
}
```

正像 `c/cc` 采取的处理一样， Rust 引入了 **引用** 这个概念，传递一个引用而不是所有权的转移，允许使用值但不获取所有权

```rust
fn main() {
    let s1 = String::from("hello");
    let len = calculate_length(&s1);
    println!("The length of '{}' is {}.", s1, len);
}
fn calculate_length(s: &String) -> usize {
    s.len()
}
```

这种获取引用的函数参数被称为 \*借用\*。

-    可变引用

    像变量一样，引用默认也是不可变的，通过 **mut** 前缀，可以声明一个可变引用。形如
    `let mut s: String = String::from("example"); let r = &mut s;`

    -    数据竞争

        当多个可变引用指向同一数据时，就会发生 **数据竞争** 。 它可以由三个行为造成：

        1.  两个或更多指针同时访问同一数据。
        2.  至少有一个指针被用来写入数据。
        3.  没有同步数据访问的机制。

        数据竞争会导致未定义行为，难以诊断和修复。Rust 允许拥有多个可变引用，但不能同时拥有。这个限制代表 Rust 在编译时就避免了数据竞争。

        ```rust
        let mut s: String = String::from("example");
        {
            let r1 = &mut s;
        }
        let r2 = &mut s;
        ```

        NOTE: Rust 也不允许在拥有不可变引用的同时拥有可变引用。

    -    悬垂引用

        在 C/CC 中，通过释放指针指向内存而不释放指针可以错误的生成一个 **悬垂指针** ，在
        Rust 中，编译器会确保引用永远也不会变成悬垂状态。当写出这样的代码会释出生命周期的错误。


#### Slice 类型 {#slice-类型}

在处理集合时，可以使用 **Slice** 类型，它允许你引用集合中一段连续的元素序列，而不是引用整个集合。Slice 正如名字一样，是集合的一个切片，它并不具有所有权。

```rust
let s = String::from("hello");
let len = s.len();
let slice = &s[0..len];
let slice = &s[..len];
let slice = &s[3..];
let slice = &s[..];
```

NOTE: 字符串字面值就是 Slice 类型。


### 使用结构体组织相关联的数据 {#使用结构体组织相关联的数据}

在处理复杂的数据结构时，会自然而然的有抽象数据结构的需要，而 Rust 提供了
`struct` 来抽象自定义数据类型，允许命名和包装多个相关的值。


#### 定义与实例化 {#定义与实例化}

和 C/CC 类似， Rust 中的结构体声明时需要指定字段的类型。为了使用自定义类型，创建一个指定类型的实例需要提供字段的具体值。访问具体的字段则可以通过 \`.' 来实现。

```rust
struct User {
    username: String,
    email: String,
    sing_in_count: u64,
    active: bool,
}
let burgess = User {
    active: true,
    email: String::from("brs@sdf.org"),
    sing_in_count: 1,
    username: String::from("Burgess Chang"),
};
let burgess_username = burgess.username;
```

-    元组结构体

    当为元组类型取名时，尽管元素的类型相同，但实际上则是不同的类型，不能赋值。

    ```rust
    struct Color(i32, i32, i32);
    struct Point(i32, i32, i32);
    let black = Color(0, 0, 0);
    let origin = Point(0, 0, 0);
    ```

-    类单元结构体

    Rust 允许定义一个没有任何字段的结构体，它们被称为 \*类单元结构体\*，类似 `()` ，即
    unit 类型。


#### 方法 {#方法}

**方法** 和函数类似，使用 fn 关键字声明，可以拥有参数和返回值，但它实在结构体的上下文中定义，且第一个参数总是 self ， 和其他语言中的 this 指针类似，指向调用该方法的结构体实例。

-    定义

    ```rust
    struct Rectangle {
        width: u32,
        height: u32,
    }
    impl Rectangle {
        fn area(&self) -> u32 {
            self.width * self.height
        }
    }
    let rect = Rectangle { width: 10, height: 10 };
    let area = rect.area();
    ```

-    -> 运算符

    在 C/CC 中，使用 \`.' 来访问对象上的方法，使用 \`->' 来访问指针上的方法。 Rust 并没有类似的运算符，相反， Rust 拥有一个自动引用和解引用的功能，在使用
    `object.implement()` 调用方法时， Rust 会自动的为 `object` 添加 &、&mut 或 \* 来使 `object` 与方法签名匹配。

-    关联函数

    `impl` 块的另一个功能就是允许定义不以 self 作为参数的函数，这被称为 \*关联函数\*。通过 `::` 来调用。

    ```rust
    struct Rectangle { width: u32, height: u32, };
    impl Rectangle {
        fn square(size: u32) -> Rectangle {
            Rectangle { width: size, height: size }
        }
    }
    let square = Rectangle::square(3);
    NOTE: 每个结构体都被允许有多个 impl 块。
    ```


### 枚举和模式匹配 {#枚举和模式匹配}

枚举是很常用的类型，允许通过列举可能的值来定义一个类型。


#### 枚举与实例化 {#枚举与实例化}

枚举类型定义时需要声明成员。

```rust
enum IpAddKind {
    V4,
    V6,
};
let four = IpAddKind::V4;
let six = IpAddKind::V6;
```

枚举的成员位于其标识符的命名空间里。


#### Option 枚举 {#option-枚举}

Rust 并没有 **Null** 值，但拥有一个可以编码存在或不存在的概念枚举 `Option<T>` .


## rust-by-example {#rust-by-example}

[RBE](https://doc.rust-lang.org/stable/rust-by-example/index.html) 收集了一系列体现 Rust 思想和标准库特点的实例，作为入门学习的切入点不错。


### Hello World {#hello-world}

```rust
fn main() {
    println!("Hello World!");
}
```

这是最简单的 HelloWorld 程序，使用 println! **宏** 打印 \`HelloWorld' 到标准输出。


### 注释 {#注释}

注释是维护代码可读性不可或缺的一部分，Rust 提供了多种注释风格。

-   编译器会忽略的常规注释
    -   `// 行内注释`
    -   `/* 块注释 */`
-   文档注释
    -   `/// 对接下来的内容构造文档`
    -   `//! 对包裹的内容构造文档`


### 格式化输出 {#格式化输出}

输出是一系列 `std::fmt` 定义的的 **宏** 来提供处理。

-   `format!`: 将文本格式化为 `String` 类型。
-   `print!`: 将文本格式化为 `String` 类型打印到标准输出。
-   `println!`: 将文本格式化为 `String` 类型打印到标准输出并刷新缓冲区。
-   `eprint!`: 将文本格式化为 `String` 类型打印到标准错误。
-   `eprintln!`: 将文本格式化为 `String` 类型打印到标准错误并刷新缓冲区。


#### Debug {#debug}

所有想使用 `std::fmt` 格式化特征的类型都需要一个可输出的实现。只有标准库提供的类型提供了自动实现，其余的都需要手动完成实现。
`fmt::Debug` 十分直观的定义了它的特征，所有的类型都可以从 `fmt::Debug` 进行派生，但这对必须手动实现的 `fmt::Display` 是不正确的。

```rust
struct UnPrintable(i32);

#[derive(Debug)]
struct DebugPrintable(i32);
```

所有的标准库类型都可以自动匹配 `{:?}` 打印，但这并不优雅，Rust 也提供了更优雅的做法——使用 `{:#?}` 。也可以手动实现 `fmt::Dispaly` 来控制显示。

```rust
#[derive(Debug)]
struct Structure(i32)

#[derive(Debug)]
struct Deep(Structure)

#[derive(Debug)]
struct Person<'a> {
    name: &'a str,
    age: u8
}

fn main() {
    println!("`Stucture': {:?} is printable.", Structure(3));
    println!("`Deep(Structure)': {:?} is printable.", Deep(Structure(7)));
    let name = "Burgess";
    let age = 21;
    let burgess = Person { name, age};
    println!("pretty printing: {:#?}", burgess);
}
```


#### Dispaly {#dispaly}

通过手动实现 `fmt::Display` ，可以使用 `{}` 打印标记。

```rust
use std::fmt;
struct Structure(i32);
impl fmt::Display for Structure {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}
```

值得注意的是， `fmt::Dispaly` 并不适用于 `Vec<T>` 或其他任何通用的容器，
`fmt::Debug` 只能用于他们通用的情形（Note：这里 `fmt::Debug` 适用的范围并不明白）。
