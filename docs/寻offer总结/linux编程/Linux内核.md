
- [进程管理](#进程管理)
  - [linux是如何存放和表示进程](#linux是如何存放和表示进程)
  - [Linux 是如何分配进程描述符](#linux-是如何分配进程描述符)
- [内核中 fork 是怎么实现的](#内核中-fork-是怎么实现的)
- [linux是如何创建进程](#linux是如何创建进程)
  - [vfork 和 fork 的区别](#vfork-和-fork-的区别)
- [linux是如何实现线程的](#linux是如何实现线程的)
  - [删除进程描述符](#删除进程描述符)
  - [孤儿进程](#孤儿进程)
- [linux 内核中的链表](#linux-内核中的链表)
  - [队列](#队列)
  - [红黑树](#红黑树)


----------

## 进程管理

### linux是如何存放和表示进程

内核把进程的列表存放在**任务队列的双向循环链表**中，链表中的每一项的类型都是 task_struct，也就是进**程描述符**的结构，这个结构定义在`<linux/sched.h>`文件中。进程描述符中包含一个进程运行的所有信息。

task_struct 在 32 为机器上，它大约有 1.7KB。进程描述符中包含的数据能完整地描述一个正在执行的程序。

> 关键词：双向循环链表，sched.h 「`[ʃed, sked]`」,32 ==> 1.7kb 描述进程运行信息

### Linux 是如何分配进程描述符

Linux 通过 slab 分配器分配 task_stuct 结构，通过预先分配和重复使用 task_struct，可以避免动态分配和释放所带来的资源消耗。在 2.6以前的内核中，各个进程的 task_stuct 存放在它们内核栈的尾部，这样做是为了让那些像 X86 那样寄存器较少的硬件体系结构只要通过**栈指针**就能计算出它的位置，而避免使用额外的寄存器专门记录。由于现在用 slab 分配器动态生成 task_struct，所以只需在**栈底**或者**栈顶**创建一个新的结构 struct thread_info，这个结构使在汇编代码中计算其偏移很容易。

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/进程描述符.71jq70jv3cw0.png)

每个任务的 thread_info 结构在它的内核栈的尾端分配，结构中的 task 域存放的是指向这个任务实际 task_struct 的指针。

> slab 分配器分配 --> 预先分配 和 重复使用可以避免 动态分配 和 释放带来的消耗    
> 2.6前，task_stuct 在栈尾部，栈指针就能计算位置      
> 现在，栈底或者栈顶，建一个新的结构 thread_info，汇编中容易计算偏移

## 内核中 fork 是怎么实现的
## linux是如何创建进程

Linux 通过 clone() 系统调用实现 fork()，vfork(),__clone() 这些库函数也都根据参数标志去调用 clone() ,然后由 clone() 去调用 do_fork()

大部分创建工作都是由 do_fork() 完成的，这个函数是调用 copy_process() 函数实现的。

- 调用时调用 dup_task_struct() 为新进程创建一个内核栈、thread_info 结构和 task_struct「进程描述符」，这些值与当前的进程的值相同，也就是说，这时候，子进程和父进程的进程描述符是完全相同的。
- 然后检查并确保当前用户拥有的进程数没有超过操作系统给它分配的资源。
- 接着对进程描述符内部的许多成员初始化，把子进程和父进程区别开来。还有一些不是继承而来的进程描述符成员就不做修改
- 这时候先将子进程设置为不可中断的阻塞状态，以保证它不会被运行
- 接着调用 alloc_pid() 函数为新进程分配一个有效的 PID
- 然后根据 clone() 函数的参数标志，让线程共享进程的资源
- 最后返回一个指向子进程的指针

再返回 do_fork() 函数，内核一般会优先执行子进程，因为一般子进程都会马上调用 exec() 函数，这样就可以避免写时复制的额外开销。如果父进程先执行的话，有可能会开始向地址空间写入。

> clone() --> do_fork() --> copy_process() --> 具体是实现：  
>  dup_task_struct()，创建各种成员，子父进程 PID 相同     
> 检查进程数不超过系统分配的资源
> 没超过分配的资源，子进程初始化，分离子进程，父进程      
> 设置子进程不可中断    
> alloc_pid() --> 分配 PID    
> clone 参数共享资源    
> 返回子进程指针  

> 最后返回 do_fork，优先执行子进程，避免写时复制额外开销

### vfork 和 fork 的区别

除了不拷贝父进程的页表项外，vfork() 系统调用和 fork() 功能相同。

vfork 的实现是通过 clone() 系统调用传递一个特殊标志来进行的

- 在调用 copy_process() 时，task_struct 的 vfor_done 成员被设置为 NULL
- 在执行 do_fork() 时，如果给定特别标志，vfork_done 就会指定一个特定的地址
- 子进程先开始执行后，父进程不是马上恢复执行，而是一直等待，直到子进程通过 cfork_clone 指针向它发送信号
- 然后调用 mm_release() 函数，退出进程内存地址空间，并且检查 vfork_done 是否为空，如果不为空，则会向父进程发送信号
- 最后回到 do_fork() 函数，父进程醒来并返回

如果这些过程顺利的话，子进程在新的地址空间里运行而父进程也恢复了在原地址空间运行。

> vfork() 不爱拷贝父进程的也表项    


## linux是如何实现线程的

linux 把所有线程当做进程来实现，每个线程有自己唯一的 task_struct.

- **首先是创建线程**

线程的创建和普通进程的创建类似，只不过在调用 clone() 的时候需要传递一些参数标志来指明需要共享的资源

```c
clone(CLONE_VM | CLONE_FS | CLONE_FILES | CLONE_SIGHAND,0);
```

这个调用和 fork() 差不多，只是新建的进程和它的父进程就是所谓的线程

传递给 clone() 的参数标志决定了新创建进程的行为方式 和 父子进程之间共享的资源种类。

> 线程的创建和 fork() 差不多，只是在 clone 里面需要传递参数设置共享资源

- **接着是内核线程**

因为内核经常需要在后台执行一些操作，这种任务可以通过**内核线程**完成。内核线程就是独立运行在内核空间的标准进程。内核线程 和 普通的进程的区别在于 **内核线程没有独立的地址空间**。内核进程 和 普通进程一样，可以被调度，也可以被抢占。

实际上，**内核线程也只能由其他内核线程创建**，内核是通过从 kthread 内核进程中衍生出所有新的内核线程来自动处理这一点。

新的任务是由 kthread 内核进程通过 clone() 系统调用而创建的。新的进程将运行 threadfn 函数，给它传递的参数为 data，进程会被命名为 namefmt。

新创建的进程处于不可运行状态，如果不通过 wake_up_process() 明确唤醒它，它不会主动运行。不过如果想创建一个进程直接进入运行状态，可以通过调用 kthread_run() 来实现。

内核系统线程后就一直到调用 do_exit() 退出，或者内核的其他部分调用 kthread_stop() 退出。

> 内核线程有独立的地址空间    
> 内核线程是通过 kthread 衍生的线程处理   
> kthread --> clone --> threadfn( data ,namefmt)

- **最后是进程终止**

一般来说，进程的析构是自身引起的，它发生在进程调用 exit() 系统调用时，可能显示调用，也可能隐式从某个程序的主函数返回（比如，C 语言编译器会在 main() 函数的返回点后面放置调用 exit() 的代码），但是如果进程接受到它不能处理也不能忽略的信号或者异常时，它可能就会被动终结。这里是通过 do_exit() 函数来完成。

- 首先将 task_struct 中的标志成员设置为 PF_EXITING
- 调用 del_timeer_syns() 删除任一内核定时器。根据返回的结果，它确保没有定时器在排队，也没有定时器处理程序在运行
- 如果操作系统的进程记账功能是开启的，do_exit() 调用 acct_update_integrals() 来输出记账信息
- 然后调用 exit_mm() 函数释放进程占用的 mm_stuct，如果没有别的进程使用它们（也就是说，这个地址空间没有被共享）,就彻底释放它们
- 接下来调用 sem_exit() 函数，如果进程排队等候 IPC 信号，它就离开队列
- 调用 exit_files() 和 exit_fs() 分别减少文件描述符、文件系统数据的引用计数。如果某个引用计数为零，那么就代表没有进程在使用相应的资源，此时可以释放
- 接着把放在 task_struct 的 exit_code 成员中的任务退出代码设置为 exit() 提供的退出代码。退出代码存放在这里供父进程随时检索。
- 调用 exit_notify() 向父进程发送信号，给子进程重新找养父，养父为线程组中的其他线程或者为 init 进程，并把进程状态（存放在 task_struct 结构的 exit_state 中）设置成 EXIT_ZOMBIE
- do_exit() 调用 schedule() 切换到新的进程。处于 EXIT_ZOMBIE 状态的进程不会再被调度。所以这是进程所执行的最后一段代码，do_exit() 永不返回

到目前为止，所有的进程关联的资源都被释放掉了。进程不可运行并处于退出状态。这个状态的进程存在的唯一目的就是为它的父进程提供信息，让父进程检索到信息后，释放掉剩余的内存，归还给操作系统。

> 自身调用 exit() 终止，异常终止时通过 do_exit() 完成   
> task_struct = PF_EXITING --> 删除计时器 --> 判断记账功能是否开启并输出记账信息 --> 释放地址空间 --> 减少文件描述符  和 文件系统数据的引用计数 ，为零时，就可以释放资源 --> 通过 exit() 退出  --> exit_notify() 为子进程找养父，没有就给 init

### 删除进程描述符

在调用了 do_exit() 之后，尽管线程已经僵死不能再运行了，但是系统还保留了它的进程描述符。这样做的目的就是让子进程终结后还能获得它的信息。所以进程终止时所需要的清理工作和进程描述符的删除是分开执行的，父进程获得已经终结的子进程信息后，子进程的 task_struct 结构才被释放。

**父进程通过调用 wait() 系统调用族收集后代的信息**。

当最终需要释放进程描述符时，是通过调用 release_task() 函数实现的，这个函数的具体实现：

- 它首先调用 __exit_signal()，这个函数调用 _unhash_process(),接着又调用 detach_pid() 从 pidhash 上删除这个进程，同时也要从任务列表中删除这个进程
  
- _exit_signal() 释放目前僵死僵死的进程所使用的所有剩余资源，并将进行最终统计和记录

- 如果这个进程是线程组最后一个进程，并且领头进程已经被杀死了，那么release_task() 就通知僵死的领头进程的父进程。

- release_task() 调用 put_task_struct() 释放进程内核和 thread_info 结构所占的页，并释放 task_struct 所占的 slab 高速缓存。

到目前为止进程描述符和所有独享的资源就全部释放掉了

### 孤儿进程

如果父进程在子进程之前退出，就必要要保证子进程能够找到一个新的父亲，不然这些孤儿就会在退出时永远处于僵死状态，白白耗费资源。所以就需要在当前线程组内找一个线程作为父亲，如果不行就让 init 作为他们的父亲。

在 do_exit() 中会调用 exit_notify() ,这个函数会调用 forget_orginal_parent() ,然后再这个函数里面调用 find_new_reaper 来寻找父进程。

这里需要涉及两个链表：子进程链表 和 ptrace 子进程链表，给每个子进程设置新的父进程。这是 2.6 内核的一个新特性，当一个进程被跟踪时，它的临时父亲设定为调式进程，这个时候如果它的父进程推出了，系统会为它和它的所有兄弟重新找一个父亲。在以前的内核中，这就需要遍历系统所有的进程来找这些子进程。现在的解决方法是一个单独的被 ptrace 跟踪的子进程链表中搜搜相关的兄弟进程，就是说用两个较小的链表减轻了遍历带来的消耗。


## linux 内核中的链表

linux内核中的链表使用方法和一般数据结构中定义的链表是有所不同的。


一般的双向链表一般是如下的结构，

- 有个单独的头结点(head)
- 每个节点(node)除了包含必要的数据之外，还有2个指针(pre,next)
- pre指针指向前一个节点(node)，next指针指向后一个节点(node)
- 头结点(head)的pre指针指向链表的最后一个节点
- 最后一个节点的next指针指向头结点(head)

![](https://img-blog.csdnimg.cn/20190319093610301.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2JpbmdmZWlsb25neGlu,size_16,color_FFFFFF,t_70)

传统的链表有个最大的缺点就是不好共通化，因为每个node中的data1，data2等等都是不确定的(无论是个数还是类型)。

linux中的链表巧妙的解决了这个问题，linux的链表不是将用户数据保存在链表节点中，而是将链表节点保存在用户数据中。

linux的链表节点只有2个指针(pre和next)，这样的话，链表的节点将独立于用户数据之外，便于实现链表的共同操作。

```c
struct list_head {
	struct list_head *next;
	struct list_head *prev;
}
```

![](https://img-blog.csdnimg.cn/20190319093908862.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2JpbmdmZWlsb25neGlu,size_16,color_FFFFFF,t_70)

内核中使用 container_of() 让我们能够从链表指针找到父结构中的变量

```c
#define container_of(ptr, type, member) ({          \
    const typeof(((type *)0)->member)*__mptr = (ptr);    \
             (type *)((char *)__mptr - offsetof(type, member)); })
```

这里面的 type 一般是个结构体，也就是包含用户数据和链表节点的结构体。

ptr 是指向 type 中链表节点的指针

member 则是 type 中定义链表节点是用的名字

比如：

```c
struct student
{
    int id;
    char* name;
    struct list_head list;
};
```

- type 是 struct student ptr 是指向 stuct
- list 的指针，也就是指向 member 类型的指针
- member 就是 list

分析一下 container_of 宏:

```c
// 步骤1：将数字0强制转型为type*，然后取得其中的member元素
((type *)0)->member  // 相当于((struct student *)0)->list

// 步骤2：定义一个临时变量__mptr，并将其也指向ptr所指向的链表节点
const typeof(((type *)0)->member)*__mptr = (ptr);

// 步骤3：计算member字段距离type中第一个字段的距离，也就是type地址和member地址之间的差
// offset(type, member)也是一个宏，定义如下：
#define offsetof(TYPE, MEMBER) ((size_t) &((TYPE *)0)->MEMBER)

// 步骤4：将__mptr的地址 - type地址和member地址之间的差
// 其实也就是获取type的地址
```

步骤1，2，4比较容易理解，下面的图以sturct student为例进行说明步骤3：

首先需要知道 ((TYPE *)0) 表示将地址0转换为 TYPE 类型的地址

由于TYPE的地址是0，所以((TYPE *)0)->MEMBER 也就是 MEMBER的地址和TYPE地址的差，如下图所示：

![](https://img-blog.csdnimg.cn/20190319094233864.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2JpbmdmZWlsb25neGlu,size_16,color_FFFFFF,t_70)

### 队列

内核中的队列是以字节形式保存数据的，所以获取数据的时候，需要知道数据的大小。

如果从队列中取得数据时指定的大小不对的话，取得数据会不完整或过大。

### 红黑树

红黑树由于节点颜色的特性，保证其是一种自平衡的二叉搜索树。


红黑树必须满足的规则：

- 所有节点都有颜色，要么红色，要么黑色
- 根节点是黑色，所有叶子节点也是黑色
- 叶子节点中不包含数据
- 非叶子节点都有2个子节点
- 如果一个节点是红色，那么它的父节点和子节点都是黑色的
- 从任何一个节点开始，到其下叶子节点的路径中都包含相同数目的黑节点
- 红黑树中最长的路径就是红黑交替的路径，最短的路径是全黑节点的路径，再加上根节点和叶子节点都是黑色，从而可以保证红黑树中最长路径的长度不会超过最短路径的2倍。
