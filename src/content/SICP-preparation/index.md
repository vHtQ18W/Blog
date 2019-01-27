---
title: 'Learn SICP Day 0:  学习 SICP 的一些准备工作'
date: '2018-02-20T00:00'
---
去年凑单购入一本《计算机程序的构造与解释》，也就是大名鼎鼎的 SICP 一书，一直没有抽出心思去翻看。最近萌生了学习 Scheme 念头 ，正好对照着 SICP 的英文版方便学习。在学习之前需要做一些准备工作，正所谓“功欲善其事，必先利其器”。我已经习惯在 emacs 中进行工作，所以决定使用 eww 配合 MIT/GNU Scheme。

## MIT/GNU Scheme 的获取与配置

[MIT/GNU Scheme](https://www.gnu.org/software/mit-scheme/) 作为 MIT 钦定的解释器，或许是最适合配合 SICP 食用的了吧。

安装和运行 MIT/Scheme 相当简单，对于Ubuntu 用户只需要简单的执行
```sh
$ sudo apt-get install mit-scheme
$ mit-scheme
```

我是 Fedora 的用户，所以选择从 Unix binary 进行安装，同时需要配置 mit-scheme lib 的路径。
```sh
$ curl -O URL/mit-scheme-VERSION.tar.gz
$ tar -xzf mit-scheme-VERSION-x86-64.tar.gz
$ cd mit-scheme-VERSION/src
$ ./configure
$ make compile-microcode
$ make install
$ echo "export MITSCHEME_LIBRARY_PATH=/usr/local/lib/mit-scheme-x86-64" >> ~/.bash_profile
```

## emacs 的相关配置

直接运行 mit-scheme 的编程体验并不好，所以我选择在 emacs 中运行 mit-scheme。只需要在你的 emacs 配置文件中加入
```emacs-lisp
(setq scheme-program-name "/usr/local/bin/mit-scheme")
```

打开 mit-scheme 只需要执行 M-X run-scheme RET

或许也可以指定 mit-scheme 以 emacs 的子进程运行，由于我使用 emacsclient，所以采取上面的方法。
```sh
$ mit-scheme --emacs 
```

## eww&#58; 更舒服的阅读体验

eww 提供更纯净的阅读体验，通过分割窗口也可以同时对照书进行测试。
