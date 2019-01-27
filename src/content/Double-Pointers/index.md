---
title: 链表中的双指针使用技巧
date: '2018-08-16T00:00'
---
在刷 leetcode 时，遇到了几道使用了双指针技巧的题目，感觉双指针很有意思也很有用途。双指针，顾名思义，就是使用两个指针遍历链表或者数组，这里包含了几个链表中使用双指针的场景。

<!--more-->

# 介绍

一个经典的问题：

<blockquote class="blockquote-center"> 给定一个链表，链表中有环吗？</blockquote>

我们可以使用两个速度不同的指针来处理。想象一下，有两个速度不同的跑步者。如果他们在直路上行驶，快跑者将首先到达目的地。但是，如果它们在圆形跑道上跑步，那么快跑者如果继续跑步就会追上慢跑者。而链表中的环就像圆形跑道一样。

## Linked List Cycle

>Given a linked list, determine if it has a cycle in it.
>
>Follow up:
>
>Can you solve it without using extra space?
>
>[question link](https://leetcode.com/problems/linked-list-cycle/description/)

使用两个指针 *fast* 和 *slow*，*fast* 每次前进两步，*slow* 每次前进一步，如果两个指针相遇了，那么证明了链表存在环。

```cpp
bool hasCycle(ListNode *head) {
  if (head == nullptr)
    return false;
  ListNode *fast = head;
  ListNode *slow = head;
  while (fast->next != nullptr && fast->next->next != nullptr) {
    fast = fast->next->next;
    slow = slow->next;
    if (fast == slow)
      return true;
  }
  return false;
}
```

## Linked List Cycle II

>Given a linked list, return the node where the cycle begins. If there is no cycle, return null.
>
>Note: Do not modify the linked list.
>
>Follow up:
>
>Can you solve it without using extra space?
>[question link](https://leetcode.com/problems/linked-list-cycle-ii/description/)

这道题不仅需要判断是否有环，还要求出环开始的节点。假设有一如下的链表：

![](https://raw.githubusercontent.com/vHtQ18W/vHtQ18W.github.io/master/assets/images/uploads/20180816/cycle.png)

使用两个指针 *fast* 和 *slow*，*fast* 最终会追上 *slow*，所以 *fast* 的移动距离要多出一倍，假设在链表的结尾 n 相遇。假设 1到  x  距离为a，x到 n 距离为 b，n 到 x距离为 c，*fast* 走动距离为 a + b + c + b，而 *slow* 为 a + b，有方程 a + b + c + b = 2 x (a + b)，可以知道 a = c，所以只需要在重合之后，一个指针从 1，而另一个指针从 n，都每次走一步，那么就可以在 x 重合了。

```cpp
ListNode *detectCycle(ListNode *head) {
  if (head == nullptr)
    return nullptr;
  ListNode *fast = head;
  ListNode *slow = head;
  while (fast->next != nullptr && fast->next->next != nullptr) {
    fast = fast->next->next;
    slow = slow->next;
    if (fast == slow) {
      slow = head;
      while (slow != fast) {
        fast = fast->next;
        slow = slow->next;
      }
      return slow;
    }
  }
  return nullptr;
}
```

## Intersection of Two Linked Lists

>Write a program to find the node at which the intersection of two singly linked lists begins.
>
>
>For example, the following two linked lists:
>
>```
>A:         a1 → a2
>                    ↘
>                     c1 → c2 → c3
>                    ↗
>B:    b1 → b2 → b3
>```
>
>begin to intersect at node c1.
>
>[question link](https://leetcode.com/problems/intersection-of-two-linked-lists/description/)

这道题可以利用上一题的方法，先将 c3 和 b1 连接，构造成环，然后找到交点即可求解。

```cpp
ListNode *getIntersectionNode(ListNode *headA, ListNode *headB) {
  if (headA == nullptr || headB == nullptr)
    return nullptr;
  // traversal headA
  ListNode *cur = headA;
  while (cur->next != nullptr)
    cur = cur->next;
  //construct cycle
  cur->next = headB;
  ListNode *node = detectCycle(headA);
  //deconstruct cycle
  cur->next = nullptr;
  return node;
}
```

## Remove Nth Node From End of List

>Given a linked list, remove the n-th node from the end of list and return its head.
>
>Example:
>
>Given linked list: 1->2->3->4->5, and n = 2.
>
>After removing the second node from the end, the linked list becomes 1->2->3->5.
>
>Note:
>
>Given n will always be valid.
>
>Follow up:
>
>Could you do this in one pass?
>
>[quetion link](https://leetcode.com/problems/remove-nth-node-from-end-of-list/description/)

很简单，只需要让 *fast* 先走 n 步，然后当其遍历至链表结尾，*slow* 恰好就是倒数第 n 个节点。

```cpp
ListNode *removeNthFromEnd(ListNode *head, int n) {
  ListNode *fast = head;
  ListNode *slow = head;
  ListNode *prev = nullptr;
  if(head == nullptr || n <= 0)
    return nullptr;
  int i = 0;
  while(fast->next) {
    fast = fast->next;
    prev  = slow;
    if (i++ >= n - 1)
      slow  = slow->next;
  }
  if(slow == head)
    head = head->next;
  else
    prev->next = prev->next->next;
  return head;
}
```


