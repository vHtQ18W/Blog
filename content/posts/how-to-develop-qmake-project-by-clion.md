+++
title = "使用 Clion 构建 qmake-base 工程"
author = ["Burgess Chang"]
date = 2020-01-01
lastmod = 2020-01-01T05:09:32+08:00
draft = false
+++

新年好! ^^

最近在参与开发 peony 文件管理器时，遇到了一个很鸡肋的问题：不会 debug 了。我以前开发的工程基本上都是 CMake build，同时习惯于使用 Emacs + ccls 编写代码，然后 CLion 构建、调试、版本管理。而 peony 是使用 qmake 完成构建的，虽然说用 qt creator 就完事了，但不得不说 qt creator 我实在是用不习惯。我所习惯的开发环境基本上都是基于 compilation database 的，所以看了下 CLion 的文档，折腾了一番。事实上文档写的挺全，只是利用搜索引擎无法检索到类似的教程，索性有了此文。

显而易见的，本文只在 Linux 下适用，别的平台需要自行灵活改变。


## 准备与依赖 {#准备与依赖}

-   qt 环境
-   CLion
-   Build EAR (bear)


## Compilation database {#compilation-database}

Compilation database 是一个 clang 提供的指导补全的文档格式，感兴趣的话可以看 [JSON Compilation database](https://clang.llvm.org/docs/JSONCompilationDatabase.html) ，此处不作赘述。CLion 支持从 CMake 与 Compilation database 导入工程，所以构建配置就是需要指导生成更新 compile\_commands.json 和生成 target 程序。而生成更新 compile\_commands.json 可以利用 bear 办到，其余则和正常的 build 、make 差不多。


## 我已经有了什么 {#我已经有了什么}

在导入项目之前，我的项目目录大概是这样的：

```nil
drwxr-xr-x build/
lrwxrwxrwx compile_commands.json -> build/compile_commands.json
drwxr-xr-x src
```

我已经有了利用 bear make 生成的 compilation database，和 make 后的缓存。简单的点击 `File` -> `Open..` -> _path/to/project/compile\_commands.json_ -> `Open as project` 就可以完成项目的导入。


## 构建与调试配置 {#构建与调试配置}

对于使用 qmake 构建的项目， CLion 并没有提供配置模板。所以我从 Custom build application 模板复制一个副本进行修改。
![](https://blog.ngcrl.org/media/how-to-develop-qmake-project-by-clion-1.png)


### 配置 Custom Build Targets {#配置-custom-build-targets}

配置自定义的 build targets 需要指定 make 和 clean 如何执行。
![](https://blog.ngcrl.org/media/how-to-develop-qmake-project-by-clion-2.png)


#### make {#make}

通过使用 bear 包裹 make，在 make 时完成 compilation database 的更新。
![](https://blog.ngcrl.org/media/how-to-develop-qmake-project-by-clion-3.png)


#### clean {#clean}

这与 make clean 无异。
![](https://blog.ngcrl.org/media/how-to-develop-qmake-project-by-clion-4.png)


### 配置 before 行为 {#配置-before-行为}

在完成上述配置后，当 qmake 的 _.pro_ file 发生改变时，Makefile 并不会同步刷新，所以还需要在 before launch 的规则里添加 qmake 的执行。
![](https://blog.ngcrl.org/media/how-to-develop-qmake-project-by-clion-5.png)


## 指定二进制程序 {#指定二进制程序}

最后在指定项选择生成的二进制目标程序就可以使用 CLion 构建与调试了。

这是从已有项目导入 qmake 工程，如果新建工程的话应该是大同小异的。
