+++
title = "使用 Rust 构建简单操作系统内核（二）"
author = ["Burgess Chang"]
date = 2019-12-17
lastmod = 2019-12-19T07:58:16+08:00
draft = false
+++

在上一篇博客中，我跟着原博的 post 1-3 完成了一个简单的 Hello World 内核，它会打
印指定字符至 VGA Buffer，并且可以使用 cargo 完成构建与运行。今天我尝试了不使用标
准库时如何创建单元与集成测试。


## Why {#why}

rust 是很提倡以测试驱动开发的，标准库甚至内建了测试框架。由于前一篇博客中描述的
原因，我无法使用内建的测试框架，所以需要实现一个单独的测试框架（简单的）。这在后
面内核逐渐完善时会起到很好的正面作用。
在接下来，我们要完成这几件事：

-   实现自定义的 test\_runner
-   使用串行端口获取 qemu 的返回信息。
-   集成测试


## 前置知识 {#前置知识}

-   [Writing Automated Tests](https://doc.rust-lang.org/book/ch11-00-testing.html)


## 实现自定义的 test\_runner {#实现自定义的-test-runner}

```rust
#![feature(custom_test_frameworks)]
#![test_runner(crate::test_runner)]
#![reexport_test_harness_main = "test_main"]

#[cfg(test)]
fn test_runner(tests: &[&dyn Fn()]) {
    println!("Running {} tests", tests.len());
    for test in tests {
        test();
    }
}

#[no_mangle]
pub extern "C" fn _start() -> ! {
    println!("Hello World{}", "!");

    #[cfg(test)]
    test_main();

    loop {}
}
```

正如上述代码展示的一样，实现自定义的 test\_runner 很简单，获取到测试用例的函数列
表，遍历执行它们即可。
值得注意的是，由于利用了 `#[no_std]` 和 自定义的 _\_start_ 入口，test\_runner 生成
的 main 函数被屏蔽了，我们需要重新导出它并在入口处调用。


## 使用串行端口获取 qemu 的返回信息 {#使用串行端口获取-qemu-的返回信息}

在之前的程序中，由于入口函数不能有返回值，我们将之写成了死循环，而在测试执行完成
后需要退出 qemu 并将信息打印到标准输出。所以我们利用 `x86_64` crate 模拟
isa-debug-exit 设备退出 qemu，通过 `uart_16550` crate 模拟串行端口获取测试结果信
息。


### isa-debug-exit {#isa-debug-exit}

```toml
[package.metadata.bootimage]
test-args = [
    "-device", "isa-debug-exit,iobase=0xf4,iosize=0x04",  "-serial", "stdio",
    "-display", "none"
]
test-success-exit-code = 33
test-timeout = 300
```

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u32)]
pub enum QemuExitCode {
    Success = 0x10,
    Failed = 0x11,
}

pub fn exit_qemu(exit_code: QemuExitCode) {
    use x86_64::instructions::port::Port;

    unsafe {
        let mut port = Port::new(0xf4);
        port.write(exit_code as u32);
    }
}
```

关于退出状态码，它返回时执行了一定的位操作，我描述的可能不那么准确（懒），原文讲
的很精准：

> The functionality of the isa-debug-exit device is very simple. When a value is
> written to the I/O port specified by iobase, it causes QEMU to exit with exit
> status (value << 1) | 1. So when we write 0 to the port QEMU will exit with exit
> status (0 << 1) | 1 = 1 and when we write 1 to the port it will exit with exit
> status (1 << 1) | 1 = 3.

利用枚举类型即可定义 qemu 的退出状态。值得注意的是，向模拟的 io 端口写入数据也是
不安全的行为。
事实上， cargo test 会将 0 之外的返回值都认为是失败的，所以我们需要单独指定测试
成功的状态码。

```toml
[package.metadata.bootimage]
test-args = […]
test-success-exit-code = 33
```

这个 `33` 也是通过左移与 1 或（ `(0x10 << 1) | 1` ）得出的。这是已经使用 `cargo
xtest` 可以执行所有的单元测试，并将结果打印至 VGA Buffer。


### 串行端口接受虚拟设备数据 {#串行端口接受虚拟设备数据}

当执行测试时，所有结果打印到设备本身不是好的选择，可以利用串行端口传输数据，将结
果打印至开发环境的标准输出，同时可以实现串行端口到标准输出的 print 宏。

```rust
use uart_16550::SerialPort;
use spin::Mutex;
use lazy_static::lazy_static;

lazy_static! {
    pub static ref SERIAL1: Mutex<SerialPort> = {
        let mut serial_port = unsafe { SerialPort::new(0x3F8) };
        serial_port.init();
        Mutex::new(serial_port)
    };
}

#[doc(hidden)]
pub fn _print(args: ::core::fmt::Arguments) {
    use core::fmt::Write;
    SERIAL1.lock().write_fmt(args).expect("Printing to serial failed");
}

#[macro_export]
macro_rules! serial_print {
    ($($arg:tt)*) => {
        $crate::serial::_print(format_args!($($arg)*));
    };
}

#[macro_export]
macro_rules! serial_println {
    () => ($crate::serial_print!("\n"));
    ($fmt:expr) => ($crate::serial_print!(concat!($fmt, "\n")));
    ($fmt:expr, $($arg:tt)*) => ($crate::serial_print!(
        concat!($fmt, "\n"), $($arg)*));
}
```

同时需要重定向 qemu 的输出到标准输出，关闭 qemu 的显示。由于入口利用了死循环，而
测试会在目标程序结束后返回，所以还需指定一个超时时间。

```toml
[package.metadata.bootimage]
test-args = [
    "-device", "isa-debug-exit,iobase=0xf4,iosize=0x04", "-serial", "stdio",
    "-display", "none"
]
test-timeout = 300
```


## 集成测试 {#集成测试}

将测试框架相关的代码整理到 lib ，并将所有的测试用例分类移动到 _tests_ 目录，这样
可以通过 `cargo xtest --test test_type` 来指定运行的单元测试。


## 总结 {#总结}

原博的 post3-4 将 rust 标准库的测试框架介绍的很明了，也指导了如何实现更简易的测
试框架，对于理解实现测试驱动开发有较大的帮助。
