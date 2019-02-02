---
title: 'GNU Emacs 的力量根源 - Emacs Lisp'
date: '2019-01-29T00:00:00'
---

[Emacs](https://www.gnu.org/software/emacs/index.html) 是最强大的编辑器，而其拓
展性远超 Vim 的力量来源就是 Emacs Lisp。Emacs Lisp 既是 Emacs 的配置语言，也是强
大的 Lisp 方言，它可以做到你使用其他编程语言也做到的事。
  
最近在使用 Emacs 的时候，遇到了许多困惑，打算翻看下官方的手册与文档, 进行深入的
理解。我最早是使用 [spacemacs](http://spacemacs.org) 的配置，后来难以忍受其在
package 配置多了之后缓慢的启动时间，而我又尚未习惯常驻在 Emacs 中工作，便切换到
了 [doom-emacs](https://github.com/hlissner/doom-emacs)，加载速度确实快了许多，
但是有许多的 emacs-lisp 宏和 autoload 都不是很明白，所以决定重新学习 Emacs Lisp
手册。 

Emacs / Emacs Lisp 文档的参考链接： 
* [GNU Emacs
  manual](https://www.gnu.org/software/emacs/manual/html_node/emacs/index.html)
* [An Introduction to Programming in Emacs
  Lisp](https://www.gnu.org/software/emacs/manual/html_node/eintr/index.html)
* [Emacs Lisp Reference
  Manual](https://www.gnu.org/software/emacs/manual/html_node/elisp/index.html)

# Lisp 程序的基本构造

计算机的所有功能都源自逐级的抽象，而 Emacs Lisp 作为一门简明的语言，也由一些基础
的原则构成。

## Lisp 中的 list 和 atom

Lisp 程序都由表达式（expression）构成，而表达式由表（list）或原子（atom）组成。
一个表由零或多个原子或表（inner list）组成，用空格分开，使用括号包围，表也可以是
空的。例如：

```lisp
'(rose violet daisy buttercup)
'(this list has (a inner list))
'()
```

值得注意的是，表中嵌入的表的求值规则是自里向外，自左向右。

原子正如其名字一样，是表最小的组成单位，不可再分割。原子表现形式有很多，比如下列
几种：
* 单个字符，比如：+、-、*、/。
* 多个字符构成的符号，比如： **forward-paragraph**。
* 有双引号包围的字符串，比如： **"hello"**。
* 数字

对于数字和字符串，事实上是对它们自身的求值。所以对于自身进行求值的表达式，它的返
回值就是其本身。

### list 的求值

当你对一个表进行求值时，Lisp 解释器会寻找表中的第一个符号，然后根据那个符号的函
数定义去展开。但是有时我们会需要解释器不要对表进行求值，仅仅对表进行原样返回，这
时你需要在表的开头加上单引号 **'**，这告诉解释器不要对表进行求值。而对上面的表，
如果去除单引号，你将会获取到一些错误。

```lisp
(this list has (a inner list))

---------- Buffer: *Backtrace* ----------
Debugger entered--Lisp error: (void-function this)
  (this list has (a inner list))
  eval((this list has (a inner list)) nil)
  elisp--eval-last-sexp(nil)
  #f(compiled-function (eval-last-sexp-arg-internal) "Evaluate sexp before point; print value in the echo area.\nInteractively, with a non `-' prefix argument, print output into\ncurrent buffer.\n\nNormally, this function truncates long output according to the\nvalue of the variables `eval-expression-print-length' and\n`eval-expression-print-level'.  With a prefix argument of zero,\nhowever, there is no such truncation.  Such a prefix argument\nalso causes integers to be printed in several additional formats\n(octal, hexadecimal, and character when the prefix argument is\n-1 or the integer is `eval-expression-print-maximum-character' or\nless).\n\nIf `eval-expression-debug-on-error' is non-nil, which is the default,\nthis command arranges for all errors to enter the debugger." (interactive "P") #<bytecode 0x27415f>)(nil)
  apply(#f(compiled-function (eval-last-sexp-arg-internal) "Evaluate sexp before point; print value in the echo area.\nInteractively, with a non `-' prefix argument, print output into\ncurrent buffer.\n\nNormally, this function truncates long output according to the\nvalue of the variables `eval-expression-print-length' and\n`eval-expression-print-level'.  With a prefix argument of zero,\nhowever, there is no such truncation.  Such a prefix argument\nalso causes integers to be printed in several additional formats\n(octal, hexadecimal, and character when the prefix argument is\n-1 or the integer is `eval-expression-print-maximum-character' or\nless).\n\nIf `eval-expression-debug-on-error' is non-nil, which is the default,\nthis command arranges for all errors to enter the debugger." (interactive "P") #<bytecode 0x27415f>) nil)
  eval-last-sexp(nil)
  funcall-interactively(eval-last-sexp nil)
  call-interactively(eval-last-sexp nil nil)
  command-execute(eval-last-sexp)
---------- Buffer: *Backtrace* ----------
```

这表示解释器在对表进行求值时，将 this 视为函数，而事实上并无法获取到其定义，所以
释出了错误。

## 变量，函数与参数

在 Emacs Lisp 中，表更像是其他语言中的函数。而一个符号可以有一个附加的值，也就是
变量。函数与之很相似，不过函数是附加一个指示去指导解释器进行完成计算。你可以使用
**set**、**setq** 去绑定符号和值，两者事实上是等价的，只是用法上有些许不同。在使
用 **set** 时，你总是需要引用第一个参数，而 **setq** 是替你简化了这一步。

```lisp
(set 'flowers '(rose violet daisy buttercup))
(setq flowers '(rose violet daisy buttercup))
```

这两种用法事实上是等价的。

参数则是传递给函数的信息，它可以是数字、字符串、变量。表现为表中第一个元素作为函
数定义接受其他元素传递的信息进行求值。另一方面，除非函数计算产生了错误，函数总是
返回一个返回值。函数的求值同时会产生一些对外部状态也进行修改的行为，这被称作为副
作用（side effect）。事实上，函数使用的大多数情况都是为了产生这些副作用。

以上这些是 _《An Introduction to Programming in Emacs Lisp》_ 一书中第一章内容的
梳理和总结。未完待续~
