+++
title = "使用 Rust 构建简单操作系统内核（一）"
author = ["Burgess Chang"]
date = 2019-12-16
lastmod = 2019-12-17T00:37:18+08:00
draft = false
+++

今天在 google 一下的时候，发现了一篇有意思的博客 [Writing an OS in Rust](https://os.phil-opp.com/) ，简单的
翻看了一下，写的很有实践性。遂跟着博客尝试了一番，有一定的收获。原博为英文，将我
的过程及收获记录如下。


## 准备工作 {#准备工作}

-   qemu
-   nightly toolchain
-   llvm-tools-preview


## 目标 {#目标}

从头构建一个操作系统内核不能依赖任何已有的操作系统代码，例如堆内存、线程、标准输
入输出等，这也意味着不能使用 rust 的标准库。最后生成的目标程序将是一个不依赖于操
作系统的可执行程序，也就是 _bare-metal_ 的。


## 如果是 HelloWorld 的话，一定可以的吧 {#如果是-helloworld-的话-一定可以的吧}

正如所有的 starter 一样，我也跟寻作者的教导从打印 `Hello World` 开始。


### 关闭标准库、堆栈展开、 main 入口 {#关闭标准库-堆栈展开-main-入口}

堆栈展开依赖于特定的库，是一个复杂的过程，在这个简易的内核中，我们将其关闭。Rust
将 C 运行时库的 crt0 作为程序的入口，进而调用主函数，由于无法使用 Rust 运行时和
crt0 ，我们同样需要关闭 main 入口。

```toml
[profile.dev]
panic = "abort"

[profile.release]
panic = "abort"
```

```rust
#![no_std]
#![no_main]

use core::panic::PanicInfo;

#[panic_handler]
fn panic(_info: &PanicInfo) -> ! {
    loop {}
}

#[no_mangle]
pub extern "C" fn _start() -> ! {
    loop {}
}
```


### 创建一个 x86\_64 的裸机 target {#创建一个-x86-64-的裸机-target}

一般情况下， rust 构建程序时会使用当前操作系统的 C 运行时库，而我们的目标程序没
有底层操作系统，所以我们自己创建并指定一个 target: x86\_64-simple.json 。它指定了
浮点位长度、跨平台链接器、关闭了堆栈展开和堆栈指针优化。

```json
{
  "llvm-target": "x86_64-unknown-none",
  "data-layout": "e-m:e-i64:64-f80:128-n8:16:32:64-S128",
  "arch": "x86_64",
  "target-endian": "little",
  "target-pointer-width": "64",
  "target-c-int-width": "32",
  "os": "none",
  "executables": true,
  "linker-flavor": "ld.lld",
  "linker": "rust-lld",
  "panic-strategy": "abort",
  "disable-redzone": true,
  "features": "-mmx,-sse,+soft-float"
}
```


### 使用 cargo-xbuild {#使用-cargo-xbuild}

rust core 库对于自定义的 target 无法生效，可以利用 cargo-xbuild 完成 core 库的自
动交叉编译，安装（ `cargo install cargo-xbuild` ）后指定 target 即可完成
build： `cargo xbuild --target=x86_64-simple.json` ，或者在 cargo 配置中指定默认
target。

```toml
[build]
target = "x86_64-simple"
```


### 创建可引导镜像 {#创建可引导镜像}

利用 bootloader 与 bootimage 使得物理硬件可以加载目标程序，这一步实际上暂时替代
了 BIOS 与 GRUB 的工作。

```toml
[dependencies]
bootloader = "0.8.0"
```

```sh
cargo install bootimage --version "^0.7.7"
```


### 输出 Hello World 至 VGA 文本缓冲区 {#输出-hello-world-至-vga-文本缓冲区}

```rust
#![no_std]
#![no_main]

use core::panic::PanicInfo;

#[panic_handler]
fn panic(_info: &PanicInfo) -> ! {
    loop {}
}

static HELLO: &[u8] = b"Hello World!";

#[no_mangle]
pub extern "C" fn _start() -> ! {
    let vga_buffer = 0xb8000 as *mut u8;

    for (i, &byte) in HELLO.iter().enumerate() {
        unsafe {
            *vga_buffer.offset(i as isize * 2) = byte;
            *vga_buffer.offset(i as isize * 2 + 1) = 0xb;
        }
    }

    loop {}
}
```


### 利用 qemu 引导目标程序 {#利用-qemu-引导目标程序}

在执行 `cargo xbuild` 在 _target/x86\_64-simple/debug/bootimage-simple.bin_ 生成
了目标程序，可以使用 qemu 简单的引导它。

```sh
qemu-system-x86_64 -drive format=raw,file=target/x86_64-simple/debug/bootimage-simple.bin
```

也可以配置 cargo 使得执行 `cargo xrun` 时快速的使用 qemu 引导它。

```toml
[target.'cfg(target_os = "none")']
runner = "bootimage runner"
```


### 呐，Hello World！ {#呐-hello-world}

{{< figure src="https://blog.ngcrl.org/media/hello-world.png" >}}


## 实现更安全的 VGA buffer 接口和 println! 宏 {#实现更安全的-vga-buffer-接口和-println-宏}

在上面的代码中，直接使用了 unsafe。并且由于关闭了标准库，所以标准库中的宏便无法
再使用。接下的部分，我们需要实现一个更加安全的 VGA buffer 接口与 println! 宏。


### 使用 vloatile 库 {#使用-vloatile-库}

由于代码只对 VGA 缓冲区进行了写操作，编译器无法确认程序是否真正访问了 VGA 缓冲存
储器，会发生一些预期外的优化。所以我们利用 vloatile 库告诉编译器写操作有副作用，
关闭这部分优化。


### 最后的代码 {#最后的代码}

Cargo.toml

```toml
[dependencies]
bootloader = "0.8.0"
spin = "0.5.2"
volatile = "0.2.6"

[dependencies.lazy_static]
version = "1.0"
features = ["spin_no_std"]

[package]
name = "simple"
version = "0.1.0"
authors = ["Burgess Chang <brs@sdf.org>"]
edition = "2018"

[profile.dev]
panic = "abort"

[profile.release]
panic = "abort"
```

.cargo/config

```toml
[build]
target = "x86_64-simple.json"

[target.'cfg(target_os = "none")']
runner = "bootimage runner"
```

vga\_buffer.rs

```rust
use core::fmt;
use volatile::Volatile;

#[allow(dead_code)]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u8)]
pub enum Color {
    Black = 0,
    Blue = 1,
    Green = 2,
    Cyan = 3,
    Red = 4,
    Magenta = 5,
    Brown = 6,
    LightGray = 7,
    DarkGray = 8,
    LightBlue = 9,
    LightGreen = 10,
    LightCyan = 11,
    LightRed = 12,
    Pink = 13,
    Yellow = 14,
    White = 15,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(transparent)]
struct ColorCode(u8);

impl ColorCode {
    fn new(foreground: Color, background: Color) -> ColorCode {
        ColorCode((background as u8) << 4 | (foreground as u8))
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(C)]
struct ScreenChar {
    ascii_character: u8,
    color_code: ColorCode,
}

const BUFFER_HEIGHT: usize = 25;
const BUFFER_WIDTH: usize = 80;

#[repr(transparent)]
struct Buffer {
    chars: [[Volatile<ScreenChar>; BUFFER_WIDTH]; BUFFER_HEIGHT],
}

pub struct Writer {
    column_position: usize,
    color_code: ColorCode,
    buffer: &'static mut Buffer,
}

impl Writer {
    pub fn write_byte(&mut self, byte: u8) {
        match byte {
            b'\n' => self.new_line(),
            byte => {
                if self.column_position >= BUFFER_WIDTH {
                    self.new_line();
                }

                let row = BUFFER_HEIGHT - 1;
                let col = self.column_position;
                let color_code = self.color_code;
                self.buffer.chars[row][col].write(ScreenChar {
                    ascii_character: byte,
                    color_code: color_code,
                });
                self.column_position += 1;
            }
        }
    }

    pub fn write_string(&mut self, s: &str) {
        for byte in s.bytes() {
            match byte {
                0x20..=0x7e | b'\n' => self.write_byte(byte),
                _ => self.write_byte(0xfe),
            }
        }
    }

    fn new_line(&mut self) {
        for row in 1..BUFFER_HEIGHT {
            for col in 0..BUFFER_WIDTH {
                let character = self.buffer.chars[row][col].read();
                self.buffer.chars[row - 1][col].write(character);
            }
        }
        self.clear_row(BUFFER_HEIGHT - 1);
        self.column_position = 0;
    }

    fn clear_row(&mut self, row: usize) {
        let blank = ScreenChar {
            ascii_character: b' ',
            color_code: self.color_code,
        };
        for col in 0..BUFFER_WIDTH {
            self.buffer.chars[row][col].write(blank);
        }
    }
}

impl fmt::Write for Writer {
    fn write_str(&mut self, s: &str) -> fmt::Result {
        self.write_string(s);
        Ok(())
    }
}

#[allow(dead_code)]
pub fn print_something() {
    use core::fmt::Write;
    let mut writer = Writer {
        column_position: 0,
        color_code: ColorCode::new(Color::Yellow, Color::Black),
        buffer: unsafe { &mut *(0xb8000 as *mut Buffer) },
    };

    writer.write_byte(b'H');
    writer.write_string("ello ");
    writer.write_string("Wörld!");
    write!(writer, "The number are {} and {}", 42, 1.0 / 3.0).unwrap();
}

use lazy_static::lazy_static;
use spin::Mutex;

lazy_static! {
    pub static ref WRITER: Mutex<Writer> = Mutex::new(Writer {
        column_position: 0,
        color_code: ColorCode::new(Color::Yellow, Color::Black),
        buffer: unsafe { &mut *(0xb8000 as *mut Buffer) },
    });
}

#[macro_export]
macro_rules! print {
    ($($arg:tt)*) => ($crate::vga_buffer::_print(format_args!($($arg)*)));
}

#[macro_export]
macro_rules! println {
    () => ($crate::print!("\n"));
    ($($arg:tt)*) => ($crate::print!("{}\n", format_args!($($arg)*)));
}

#[doc(hidden)]
pub fn _print(args: fmt::Arguments) {
    use core::fmt::Write;
    WRITER.lock().write_fmt(args).unwrap();
}

```

main.rs

```rust
#![no_std]
#![no_main]

use core::panic::PanicInfo;

#[panic_handler]
fn panic(_info: &PanicInfo) -> ! {
    println!("{}", _info);
    loop {}
}

mod vga_buffer;

#[no_mangle]
pub extern "C" fn _start() -> ! {
    println!("Hello World{}", "!");

    loop {}
}

```


### 静态非常量函数初始化 {#静态非常量函数初始化}

由于我们使用了非静态函数初始化静态量，所以利用 lazy\_static! 宏。它不会在编译时计
算其值，而是在首次访问时会初始化自身。


### 自旋锁 {#自旋锁}

为了获得同步的内部可变性，我们使用 Mutex。 当资源已锁定时，它通过阻塞线程来提供互
斥锁。


### 结果 {#结果}

{{< figure src="https://blog.ngcrl.org/media/hello-world-2.png" >}}


## 总结 {#总结}

这是一个循序渐进的系列博客，对于一些基础处理讲的十分细致，推荐看下原博。我睡觉前
完成了这么多，所以也就就记录到这里。
