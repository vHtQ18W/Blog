---
title: 'Learn SICP Day 1: The Elements of Programming 笔记'
date: '2018-05-04T00:00'
---

程序设计语言的三种基本机制：
* primitive expressions, 基本的表达式
* means of combination, 复合的方法
* means of abstraction, 抽象的方法

### Expressions, 表达式

多个表达式可以组成**组合式**，表示一个过程应用。列表最左侧的元素被称作**运算符**，剩下的元素被称作**运算对象**。运算的规则是将**实参**的值按照**运算符**所指的过程进行求值。
```scheme
(+ 137 349)
;Value: 486
(- 1000 334)
;Value: 666
(* 5 99)
;Value: 495
(/ 10 5)
;Value: 2
(+ 2.7 10)
;Value: 12.7
```

Scheme 采用了**前缀表示法**，即将运算符放置在列表的最左侧，类比 C/C++ 这样带来的显著好处就是可以处理任意个实参，而在使用后者往往需要进行更复杂的处理。**前缀表示法**的第二个好处就是易于扩充，允许出现组合式的**嵌套**。
```scheme
(+ (* 3
      (+ (* 2 4)
         (+ 3 5)))
   (+ (- 10 7)
      6))
;Value: 57
```

### Naming and the Environment, 命名与环境

在 Scheme 中，通过 **define** 关键字完成变量的命名，变量的值就是其所对应的变量。
```scheme
(define pi 3.14159)
(define radius 10)
(* pi (* radius radius))
;Value: 314.15
(define circumference (* 2 pi radius))
circumference
;Value: 62.8318
```

**define** 是最简单的抽象过程，而解释器需要存储这种名字与值相关联的关系，这种存储被称作**环境**。

### Evaluating Combinations, 组合式的求值

组合式的求值过程：
1. 求出组合式的每个子表达式的值
2. 将各子表达式的值作为运算对象(实参)代入运算符指向的过程进行运算

当反复执行步骤 1 的时候，总会遇到需要求值的不是组合式，而是基本表达式例如数、内嵌运算符或者其它变量的名字，处理这些情况有如下规定：

* 数的值就是它所表示的值
* 内嵌运算符的值是完成对应运算的机器指令的结果
* 其它变量的名字的值是环境中它所关联的对象

第二种规定可以视作第三种的特殊情形，内嵌运算符就是预先存储在环境中的命名。

需要注意的是 **define** 关键字的运算不是将它的运算对象应用于 define。
```scheme
(define x 3)
```

也就是说类似上式并不是组合式，是一种 **特殊形式**。

### Compound Procedures，复合过程 
Lisp 的一些要素是所有强大程序设计语言的共性：

* 数字和算术运算符是基本的数据和过程 
* 组合式的嵌套提供一种复合的方法
* 定义是一种有限的抽象，它将命名和值联系起来

过程定义是更强有力的一种抽象技巧，可以将复合过程命名而作为一个单元去调用。作为例子，这是平方运算的简单定义：

```scheme
(define (square x)
        (* x x))
;Value: square
```

过程定义的一般组成是：

**(define (<name\> <formal parameters\>) <body\>)**

调用 *square* 这个过程：

```scheme
(square 21)
;Value: 441
(square (+ 2 5))
;Value: 49
(square (square 3))
;Value: 81
```

同时也可以使用 *square* 去定义其它过程，例如，x^2 + y^2可以表示为：

```scheme
(define (sum-of-squares x y)
        (+ (square x)
           (square y)))
;Value: sum-of-squares
```

利用 *sum-of-squares* 进一步构建过程：

```scheme
(define (f a)
        (sum-of-squares (+ a 1)
                        (* a 2)))
;Value: f
(f 5)
;Value: 136
```

### The Substitution Model for Procedure Application, 过程应用的代换模型
解释器是如何对组合式求值的？解释器的工作方式是对组合式的每一个元素进行求值，将所得值代回实参。对于复合过程，过程应用的计算方式是：
* 对复合过程过程体中的每一个形参都用对应的实参进行代换，最终对所得的过程体进行求值

这就是过程应用的代换模型，需要注意的是代换只是便于理解过程应用的便宜手段，并不是解释器的真实工作方式。

#### Applicative order versus normal order, 应用序与正则序
正则序是将过程完全展开后进行归约，这样往往会存在重复求值的问题。而与之对应的，应用序则是对实参求值而后应用。Lisp 的解释器使用应用序，这样可以避免一些情景下的重复求值。

### Conditional Expressions and Predicates, 条件表达式与谓词
如何定义一个使用检测手段的过程类，例如定义一个求取绝对值的过程：

![](https://mitpress.mit.edu/sites/default/files/sicp/full-text/book/ch1-Z-G-2.gif)

这种构造是分类分析，Lisp 提供了 *cond (conditional)* 语句处理此种情形。例如：

```scheme
(define (abs x)
        (cond ((< x 0) 
               (- x))
              (else x)))
;Value: abs
```

*cond* 的一般形式是：

**(cond (<p1\> <e1\>)
      (<p2\> <e2\>)
      ...
      (<pn\> <en\>))**
      
另一种形式是：
```scheme
(define (abs x)
        (if (< x 0)
            (- x)
            x))
;Value: abs
```

这是使用了 *if* 形式，它的一般形式是：

**(if <predicate\> <consequent\> <alternative\>)**

正如其它语言一样，*scheme* 提供了逻辑算术符：
* (and <e1\> ... <en\>)
* (or <e1\> ... <en\>)
* (not <e\>)

### Example: Square Roots by Newton's Method, 实例: 牛顿法求算术平方根
作为一个实例，使用牛顿法进行平方根的求解，我们将平方根定义为：
![](https://mitpress.mit.edu/sites/default/files/sicp/full-text/book/ch1-Z-G-4.gif)

```scheme
(define (abs x)
        (if (< x 0)
            (- x)
            x))
;Value: abs
(define (square x)
        (* x x))
(define (average x y)
  (/ (+ x y) 2))
(define (sqrt-iter guess x)
  (if (good-enough? guess x)
      guess
      (sqrt-iter (improve guess x)
                 x)))
(define (improve guess x)
  (average guess (/ x guess)))
(define (good-enough? guess x)
  (< (abs (- (square guess) x)) 0.001))
(define (sqrt x)
  (sqrt-iter 1.0 x))
```

运行结果：
```scheme
(sqrt 9)
;Value: 3.00009155413138
(sqrt (+ 100 37))
;Value: 11.704699917758145
(sqrt (+ (sqrt 2) (sqrt 3)))
;Value: 1.7739279023207892
(square (sqrt 1000))
;Value: 1000.000369924366
```

### Procedures as Black-Box Abstractions, 过程黑箱抽象
*sqrt* 是一个使用多个手动定义过程实现的计算过程，可以视作一族过程，它分解为：
![](https://mitpress.mit.edu/sites/default/files/sicp/full-text/book/ch1-Z-G-6.gif)

在使用这一系列过程的时候，并不需要关注实现细节，可以将它们视为黑箱，这就是过程抽象。

#### Local names, 局部名
局部名指定义是局部作用的，例如 *good-enough?* 和  *sqrt* 这个过程中使用的 *x*。 尽管命名相同，后者缺不会干扰前者。这说明了过程的形参必须局部于有关的过程体。在这里，形式参数的名字对过程没有任何影响，这种命名被称作 **约束变量**。

#### Internal definitions and block structure, 内部定义与块结构
观察上面的 *sqrt*， 它使用多个过程，然而用户却只需要使用 *sqrt* 这一个过程，它的子过程似乎会产生极大的干扰。如果可以将这些子过程像命名一样局部化，成为内部定义从而局部于此过程，那自然是极好的。可以改写成：

```scheme
(define (sqrt x)
  (define (good-enough? guess x)
    (< (abs (- (square guess) x)) 0.001))
  (define (improve guess x)
    (average guess (/ x guess)))
  (define (sqrt-iter guess x)
    (if (good-enough? guess x)
        guess
        (sqrt-iter (improve guess x) x)))
  (sqrt-iter 1.0 x))
```

这种嵌套被称作块定义，更好的写法是将约束变量改为由实参获取值，让其作为自由变量，这种方式被称作**词法定义域**：
```scheme
(define (sqrt x)
  (define (good-enough? guess)
    (< (abs (- (square guess) x)) 0.001))
  (define (improve guess)
    (average guess (/ x guess)))
  (define (sqrt-iter guess)
    (if (good-enough? guess)
        guess
        (sqrt-iter (improve guess))))
  (sqrt-iter 1.0))
```
