---
title: 'GNU Emacs 的力量根源 - Emacs Lisp'
date: '2019-02-06T00:00:00'
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

## Lisp 程序的基本构造

计算机的所有功能都源自逐级的抽象，而 Emacs Lisp 作为一门简明的语言，也由一些基础
的原则构成。

### Lisp 中的 list 和 atom

Lisp 程序都由表达式（expression）构成，而表达式由结构表（list，后文简称为表）或原子（atom）组成。
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

#### list 的求值

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

### 变量，函数与参数

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

## Buffer 的操作

Emacs 中是以 **Buffer** 的形式对文件进行组织与管理，对此有一个基础的概念需
要知道。Emacs 在终端中会占用整个屏幕，在图形界面下会占用整个应用窗口，将 Emacs
的这些占用称之为 **frame**。而在图形界面下使用 Emacs，界面会有这几个部分：最顶部
的 _menu bar_、在其下的 _tool bar_、最底部的 _echo area_，而中间的部分则是
_window_。_buffer_、_scroll bar_、_mode line_ 都在 _window_ 中。

### buffer 的名字

有两个函数可以获取到当前 buffer 的名字，_buffer-name_ 与 _buffer-file-name_，由名字
可以知道前者是为了获取 buffer 的名字，而后者则是获取 buffer 所打开文件的名字。

```lisp
(buffer-name)
;; "index.md"
(buffer-file-name)
;; "/home/burgess/Projects/Blog/src/content/Emacs-Lisp-Note/index.md"
```

上面注释中的内容是 Emacs 中 **echo area** 的输出。 同时需要注意，正如前面所述，这
两个函数如果不加括号，解释器会把它们作为变量求值。

### 获取 buffer

_buffer-name_/_buffer-file-name_ 获取到了 buffer 的名字，而名字只是 buffer 的一
个属性。如何获取 buffer 本身？Emacs 提供了 _current buffer_ 来获取当前 buffer，
它的返回值是当前 buffer 自身。

```lisp
(current-buffer)
;; #<buffer index.md>
```

**#\<buffer index.md\>** 出现在了 echo area 中，这种特殊的形式表
明，_current-buffer_ 的返回值是本文 index.md 这个 buffer 本身。

还有一个相关的函数是 _other-buffer_，它将扫描所有的 buffer 返回当前最常打开的
buffer。如果没有其他打开的 buffer，它会返回 _\*scratch\*_ 这个 buffer。 

```lisp
(other-buffer)
;; #<buffer *scratch*>
```

### 切换 buffer

_other-buffer_ 返回了另一个 buffer，那么如何去切换到另一个 buffer？emacs lisp 提
供了 _switch-to-buffer_ 这个函数切换至另一个 buffer。利用 _other-buffer_ 和
_switch-to-buffer_ 可以切换至一个不同的 buffer。

```lisp
(switch-to-buffer (other-buffer))
```

### buffer 的另一些属性

buffer 还有一些别的属性，例如：大小、光标位置等。这些属性可以通过一些简单的函数
获得。

```lisp
(buffer-size)
;; 5719
(point)
;; 5591
(point-max)
;; 5720
(point-min)
;; 1
```

## 函数声明

当解释器对结构表进行求值时，会寻找第一个符号的函数定义，而在 emacs-lisp 又改如何
声明函数？所有函数都是由另一些原始函数定义的，而这些原始函数是使用 C 编写的。如
果对这一部分感兴趣，可以自行查找相关的资料，这里我只关心如何使用 emacs-lisp。

### defun 宏

_defun_ 是 "define function" 的缩写，你可以使用这个宏定义自定义的函数。使用
_defun_ 定义的函数通常由这五部分组成：
1. 函数名
2. 参数列表。如果没有参数，则是一个空表，**()**。
3. 描述函数功能的文档。可以没有，但是规范的文档可读性更强。
4. 是否可以互动，这意味这你是否可以使用 **M-x** 或者特定的快捷键调用这个函数。
5. 实现函数功能的主体主体。

这五个部分通常是这样子：
```lisp
(defun function-name (arguments...)
  "Optional documentation..."
  (interactive argument-passing-info) ;; optional
  body...
  )
```

### 安装函数

当你声明了一个函数时，这时并不能直接调用它。需要对它进行安装，而最简便的做法是对
他进行求值，在执行 _eval-last-sexp_(C-x C-e) 后，函数也就添加到了环境之中。但这
只是临时的，当你销毁了 emacs 会话之后，需要重新安装。

而有时你需要持久的使用你声明的函数，常见的做法有：
* 将声明的函数添加至 *".emacs"* 或者 *".emacs.d/init.el"* 文件，这样 emacs 在每
  次启动时，就会自动加载你的函数。
* 将声明的函数添加至单独的 *.el* 文件，并在 *".emacs" / ".emacs.d/init.el"* 中加
  载该文件。
* 将声明的函数添加至 *site-init.el*，这样这台机器的所有的用户都可以使用你的函数。

### interactive 的参数

当你需要所声明的函数可以在 emacs 中进行互动时，你需要在函数中加上相关的
interactive 段。例如：

```lisp
(defun multiply-by-seven (number)
  "Multiply NUMBER by seven."
  (interactive "p")
  (message "The result is %d" (* 7 number)))
```

这里的 _"p"_ 代表你可以通过 C-u NUMBER M-x multiply-by-seven 传递 NUMBER 给函数
进行运算，并显示在 echo area 中。以下不同的参数表明以不同的格式进行互动。

* "b"，已存在的 buffer 名字。
* "f"，已存在文件的名字。
* "p"，前缀参数。
* "r"，标记的区块。

### let

emacs lisp 中的 let 和 ECMAScript 2015 中的 let 作用很像，都是用来声明作用于局部
的变量。在 emacs lisp 中，let用来声明一或多个作用于函数内部变量，例如：

```lisp
(defun type-of-tree ()
  "Some tree."
  (let ((brich 3)
         pine
         fir
         (oak 'some))
    (message 
      "Here are %d variable with %s, %s, and %s  value."
      birch pine fir oak)
  )
```

### 条件选择语句

作为最基础的结构，条件选择语句是每个程序设计语言中都不可缺少的。emacs lisp 中的
条件语句如以下格式书写:

```lisp
(if true-or-false-test                          ;; if-part
    action-to-carry-out-if-the-test-return-true ;; then-part
  action-to-carry-out-if-the-test-return-false) ;; else-part
```

下面是一个简单的例子：

```lisp
(defun type-of-animal (characteristic)
  "Print message in echo area depending on CHARACTERISTIC.
If the CHARACTERISTIC is the string \"fierce\",
then warn of a tiger; else say it is not fierce."
  (if (equal characteristic "fierce")
      (message "It is a tiger!")
    (message "It is not fierce!")))
    
(type-of-animal "fierce")
;; It is a tiger!
(type-of-animal "striped")
;; It is not fierce!
```

## TODO
以上这些是 _《An Introduction to Programming in Emacs Lisp》_ 一书中前三章内容的
梳理和总结。未完待续~
