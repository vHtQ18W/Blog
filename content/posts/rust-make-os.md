+++
title = "使用 Rust 构建简单操作系统内核（一）"
author = ["Burgess Chang"]
date = 2019-12-16
lastmod = 2019-12-17T00:11:22+08:00
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
