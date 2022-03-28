
- [项目的架构设计](#项目的架构设计)
  - [服务器处理请求是怎样的呢](#服务器处理请求是怎样的呢)
  - [为什么要使用 IO 多路复用](#为什么要使用-io-多路复用)
  - [select/poll](#selectpoll)
  - [epoll](#epoll)
    - [epoll_create 函数](#epoll_create-函数)
    - [epoll_ctl 函数](#epoll_ctl-函数)
    - [epoll_wait 函数](#epoll_wait-函数)
    - [向内核双链表增加节点](#向内核双链表增加节点)
  - [边缘触发和水平触发](#边缘触发和水平触发)
    - [什么时候使用 LT 和 ET](#什么时候使用-lt-和-et)
- [心跳包机制](#心跳包机制)
  - [为什么要使用心跳包](#为什么要使用心跳包)
    - [如何处理不发心跳包的客户端](#如何处理不发心跳包的客户端)
    - [怎么实现时间轮](#怎么实现时间轮)
    - [连接超时被踢掉的过程](#连接超时被踢掉的过程)
- [内存池设计](#内存池设计)
  - [单块内存 io_buf](#单块内存-io_buf)
  - [内存池提供的接口](#内存池提供的接口)
  - [单例模式的内存池](#单例模式的内存池)
  - [从内存池中申请一块内存](#从内存池中申请一块内存)
  - [将一个 io_buf 放回到内存池中](#将一个-io_buf-放回到内存池中)
  - [读写 buffer 机制](#读写-buffer-机制)
- [内存池的设计](#内存池的设计)
  - [为什么要设计内存池](#为什么要设计内存池)
  - [内存池的结构](#内存池的结构)
    - [第一层 ThreadCache](#第一层-threadcache)
      - [设计ThreadCache类](#设计threadcache类)
      - [Thread Cache申请内存](#thread-cache申请内存)
      - [Thread Cache释放内存](#thread-cache释放内存)
    - [CentralCache](#centralcache)
      - [Central Cache申请内存](#central-cache申请内存)
      - [Central Cache 释放内存](#central-cache-释放内存)
    - [PageCache](#pagecache)
      - [申请内存](#申请内存)
      - [PageCache释放内存](#pagecache释放内存)
- [压力测试](#压力测试)
  - [Webbench实现的核心原理](#webbench实现的核心原理)
- [压力测试 Bug 排查](#压力测试-bug-排查)
  - [排查过程](#排查过程)
  - [listen](#listen)
    - [connect](#connect)
    - [accept](#accept)
    - [定位 accept](#定位-accept)
    - [Epoll 的 ET、LT](#epoll-的-etlt)
    - [代码分析解决](#代码分析解决)
    - [Bug原因](#bug原因)

-----------


## 项目的架构设计

> - 使用非阻塞 socket + epoll 的 IO 多路复用 的并发模型来处理客户端的请求，也就是 master - worker 形式。   
> - 设计心跳包机制来监听客户端和服务端的状态，在这部分主要是定时器的设计
> - 在内存管理方面，也实现了一个内存池，对内存进行管理

[参考](https://www.cnblogs.com/dormant/p/5218266.html)

本项目主要对与客户端请求的处理机制上进行设计，考虑到服务器和客户端是「一对多」的关系，所以服务器必须有能力同时为多个客户端提供服务

一般来说完成并行处理请求工作的有三种方式：
- 1.多进程方式
- 2.多线程方式
- 3.异步方式

### 服务器处理请求是怎样的呢

这个服务器项目可以同时处理大量的并发请求，结合多进程和异步机制，异步机制使用的是异步非阻塞方式，也就是 master -worker.

每个工作进程使用异步非阻塞方式，可以处理多个客户端请求，当某个工作进程收到客户端的请求后，调用 IO 进行处理，如果不能立即得到结果，就去处理其他的请求；客户端在这个期间也不需要等待响应，可以去处理其他的事情；当 IO 返回的时候，就会通知这个工作的进程，这个进程得到通知，暂时挂起当前处理的事务，去响应客户端请求。

因为处理请求具体到系统底层就是读写事件（所谓阻塞调用方式也就是请求事件还没准备好，线程只能一直去等，等事件准备好了再处理；而非阻塞即事件没准备好，马上返回 ENGAIN,告诉你事件还没准准备好，而在这期间可以先去做其他事，再回头看看事件准备好了吗，时不时会看，需要的开销也是不小的）

所以，异步可以理解为循环处理多个准备好的事件，不会导致无谓的资源浪费，当有更多的并发数只会占用更多的内存而已;

服务器的工作进程调用IO后，就取进行其他工作了；当IO调用返回后，会通知工作进程。

> 那么 IO 调用时如何把自己的状态通知给工作进程的呢？？

一般解决这个问题有两种方法：
- （1）让工作进程在进行其他工作的过程中间隔一段时间就去检查一下 IO 的状态，如果完成就响应客户端，如果未完成，继续工作。
                                        
- （2）IO 调用在完成后能主动通知工作进程。

当然最好的就是用第二种方法了；像 `select/poll/epoll` 等这样的系统调用就是用来支持第二种解决方案的。这些系统调用也常被称为**事件驱动模型**。他们提供了一种机制就只让进程同时处理多个并发请求，不用关心 IO 调用的具体状态。IO 调用完全由事件驱动模型来管理。

> 本项目中使用的时间驱动模型是什么 ?

事件驱动处理库（多路IO复用）,最常用的就是select模型，poll模型，epoll模型。[可参考](https://segmentfault.com/a/1190000003063859)


 `I/O` 多路复用技术就是用一个进程来维护多个 `Socket`。

 ### 为什么要使用 IO 多路复用

 要想客户端和服务器能在网络中通信，那必须得使用 Socket 编程，它是进程间通信里比较特别的方式，特别之处在于它是可以跨主机间通信。

 一般基本 TCP Socket 只能一对一通信，因为使用的是同步阻塞的方式，当服务端在还没处理完一个客户端的网络 I/O 时，或者读写操作发生阻塞时，其他客户端是无法与服务端连接的。

可如果我们服务器只能服务一个客户，那这样就太浪费资源了，于是我们要改进这个网络 I/O 模型，以支持更多的客户端。

服务器作为服务方，通常会在本地固定监听一个端口，等待客户端的连接。因此服务器的本地 IP 和端口是固定的，于是对于服务端 TCP 连接的四元组只有对端 IP 和端口是会变化的，所以最大 **TCP 连接数 = 客户端 IP 数×客户端端口数。**

对于 IPv4，客户端的 IP 数最多为 2 的 32 次方，客户端的端口数最多为 2 的 16 次方，也就是服务端单机最大 TCP 连接数约为 2 的 48 次方。

但是服务器肯定承载不了那么大的连接数，主要会受到 文件描述符数目 和 系统内存 的限制。

> 那如果服务器的内存只有 2 GB，网卡是千兆的，我们想要同时并发 1 万请求的话。

从硬件资源角度看，对于 2GB 内存千兆网卡的服务器，如果每个请求处理占用不到 200KB 的内存和 100Kbit 的网络带宽就可以满足并发 1 万个请求。

不过，要想真正实现 单机同时处理 1 万个请求的问题 「C10K」 的服务器，要考虑的地方在于服务器的网络 I/O 模型，效率低的模型，会加重系统开销。

> **所以这时候就需要 I/O 多路复用技术，也就是只使用一个进程来维护多个 Socket**

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/IO复用01.4ns3czhz0sk0.png)

一个进程虽然任一时刻只能处理一个请求，但是处理每个请求的事件时，耗时控制在 1 毫秒以内，这样 1 秒内就可以处理上千个请求，把时间拉长来看，多个请求复用了一个进程，这就是多路复用.

比如 `select/poll/epoll` 就是内核提供给用户态的多路复用系统调用，进程可以通过一个系统调用函数从内核中获取多个事件。然后本项目中使用的主要是 epoll 技术。

### select/poll

`select` 将已连接的 `Socket` 都放到一个文件描述符集合，然后调用 `select` 函数将文件描述符集合拷贝到内核里，让内核来检查是否有网络事件产生，检查的方式很粗暴，就是通过遍历文件描述符集合的方式，当检查到有事件产生后，将此 `Socket` 标记为可读或可写， 接着再把整个文件描述符集合拷贝回用户态里，然后用户态还需要再通过遍历的方法找到可读或可写的 `Socket`，然后再对其处理。

所以，对于 `select` 这种方式，需要进行 **2 次「遍历」文件描述符集合**，一次是在内核态里，一个次是在用户态里 ，而且还会发生 **2 次「拷贝」文件描述符**集合，先从用户空间传入内核空间，由内核修改后，再传出到用户空间中。

`select` 所支持的文件描述符的个数是有限制的，在 Linux 系统中，由内核中的 默认最大值为 `1024`。（由 `FD_SETSIZE` 限制）

`poll` 以链表形式来组织文件描述符，解决了 `select` 的文件描述符个数限制的问题，当然还会受到系统文件描述符限制。

但是 `poll` 和 `select` 并没有太大的本质区别，都是使用「线性结构」存储进程关注的 `Socket` 集合，因此都需要遍历文件描述符集合来找到 可读 或 可写 的 `Socket`，时间复杂度为 `O(n)`，而且也需要在 用户态 与 内核态 之间拷贝文件描述符集合，这种方式随着并发数上来，性能的损耗会呈指数级增长。

### epoll

epoll 通过两个方面，很好解决了 `select/poll` 的问题。

第一点，epoll 在内核里使用红黑树来跟踪进程所有待检测的文件描述字，把需要监控的 socket 通过 `epoll_ctl()` 函数加入内核中的红黑树里，红黑树是个高效的数据结构，增删查一般时间复杂度是 `O(logn)`，通过对这棵黑红树进行操作，这样就不需要像 `select/poll` 每次操作时都传入整个 socket 集合，只需要传入一个待检测的 socket，减少了内核和用户空间大量的数据拷贝和内存分配。

第二点， epoll 使用事件驱动的机制，内核里维护了一个链表来记录就绪事件，当某个 socket 有事件发生时，通过回调函数内核会将其加入到这个就绪事件列表中，当用户调用 `epoll_wait()` 函数时，只会返回有事件发生的文件描述符的个数，不需要像 `select/poll` 那样轮询扫描整个 socket 集合，大大提高了检测的效率。

epoll 的方式即使监听的 Socket 数量越多的时候，效率不会大幅度降低，能够同时监听的 Socket 的数目也非常的多了，上限就为系统定义的进程打开的最大文件描述符个数.

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/epoll01.58ud4l3nxm00.png)

#### epoll_create 函数

- **格式**

```c
int epoll_create(int size);  // size 必须 > 0
```

- **功能**：创建一个 Epoll 对象，返回一个对象文件描述符来表示这个 Epoll 对象，后续通过操作这个描述符来进行数据的收发。

这个对象最终要用 close 关闭，因为它是个描述符，或者说是个句柄，总是要关闭的，

- **原理**

执行 `struct eventpoll *ep` 生成一个 `eventpoll` 对象

```c
struct eventpoll *ep = (struct eventpoll*)calloc(1, sizeof(struct eventpoll)); 
```

`eventpoll` 的结构如下。

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/epol_create01.ik3e4xapf3k.png)

`eventpoll` 的结构中有两个比较重要的成员

(1) `rbr`,可以理解成代表一颗红黑树的根节点（的指针）。

红黑树是一种高效的数据结构，用于保存数据，一般都是存“键值对（`key-value`）”，红黑树的特点是能够快速地根据给的 key 找到并取出 value ，这里的 key 一般是一个数字，而 value 代表的可能是一批数据。**红黑树查找的时间复杂度**是：`O(logn)`

一开始的时候红黑树还是空的，也就是 rbr 指向 NULL，还没有节点。

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/epol_create02.5zdre53dgpo0.png)

(2) `rdlist`，可以理解成代表一个双向链表的表头指针

双向链表能快速顺序地访问里面的节点。

一开始的时候双向链表也是空的，`rdlist` 指向 NULL，还没有节点。

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/epol_create03.5zueg4dj5yg0.png)

- **总结**：
  - 创建一个 eventpoll 结构的对象，被系统保存起来
  - 对象中的 rbr 成员被初始化成指向一颗红黑树的根节点，
  - 对象中的 rdlist 成员被初始化成指向一个双向链表的头结点。

#### epoll_ctl 函数

- **格式**：

```c
int epoll_ctl (int efpd,int op,int sockid,struct epoll_event *event);
```

- **功能**：

把一个 socket 以及 socket 相关的事件添加到 epoll 对象描述符中，以通过这个 epoll 对象监视该 socket（也就是这个 tcp 连接）上数据的来往情况，当有数据来往时，系统会通知程序。

我们可以通过 `epoll_ctl` 函数吧程序中需要关注的事件添加到 epoll 对象描述符中，当有数据来往时，系统会通知程序。

**epoll_ctl 函数中参数的介绍**：

- `efpd`：`epoll_create()`返回的`epoll`对象描述符
- `op`：一个操作类型，添加/删除/修改 ，对应数字是`1,2,3`. 分别对应： `EPOLL_CTL_ADD`（添加事件）, `EPOLL_CTL_DEL`（删除事件）， `,EPOLL_CTL_MOD`（修改事件）
- `sockid`：表示一个 TCP 连接，添加事件（也就是往红黑树中添加节点）时，就是用 sockid 作为 key 往红黑树中增加节点的。
- `event`: 向 `epoll_ctl` 函数传递信息，比如要增加一些书剑，就可以通过 `event` 参数将具体事件传递进 `epoll_ctl` 函数。

- **原理**：

假如传递进来的是一个 `EPOLL_CTL_MOD` ,首先使用 `RB_FIND` 来查找红黑树上是否已经有了这个节点，如果有了，程序就直接返回，如果没有，程序流程就继续往下走。

>  **EPOLL_CTL_ADD 怎么往红黑树你增加节点**

**确定红黑树没有该节点**的情况下，会生成一个 epitem 对象。

通过执行下面代码创建 `epitem` 对象

```cpp
epi = (struct epitem*)calloc(1, sizeof(struct epitem));
```

这个对象就是后续增加到红黑树中的一个节点，该节点的 key 保存在 sockfd 中，要增加的事件保存在 event 中，然后使用 `RB_INSERT` 宏将该节点插入红黑树中，对于红黑树来说,每个节点都要记录自己的左子树、右子树和父节点，这里是通过 rbn 成员，指向父节点和子节点的。如果将来多个用户连入服务器，需要向这颗红黑树加入很多节点，这些节点彼此也要连接起来。

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/epol_ctl01.7d2r4etg4d40.png)

> EPOLL_CTL_ADD：等价于往红黑树中增加节点

> EPOLL_CTL_DEL：等价于从红黑树中删除节点

> EPOLL_CTL_MOD：等价于修改已有的红黑树的节点

**每一个连入客户端都应该调用 `epoll_ctl` 向红黑树增加一个红黑树节点**，如果有 100w 个并发连接，红黑树上就会有个 100w 个节点

#### epoll_wait 函数

- **格式**：

```c
int epoll_wait(int epfd,struct epoll_event *events,int maxevents,int timeout);
```

- **功能**：

阻塞一小段时间并等待事件发生，返回事件集合，也就是获取内核的事件通知；

其实就是遍历这个双向链表，把这个双向链表里边的节点数据拷贝出去，拷贝完毕的就从双向链表里移除；因为所有数据的 socket（ TCP 连接）都在双链表里记着。

- 参数`epfd`：是`epoll_create()`返回的`epoll`对象描述符

- 参数`events`：是内存，也是数组，长度 是`maxevents`，表示此次`epoll_wait`调用可以收集到的`maxevents`个已经就绪【已经准备好的】的读写事件；换句话说返回的是有事件发生的 TCP 连接数目

- 参数`timeout`：阻塞等待的时长；

> 总的来说，epoll_wait 函数就是到双链表中去，把此刻同时连入的连接中有事件发生的连接拿出来，后续 read，write，或者 send，secv 之类的函数调用收到数据，某个 socket 只要在双链表中，这个 socket 上一定发生了 某个/某些 事件，也就是说，只有发生了某个/某些 事件的 socket 才会在双向链表中实现。

> 这也就是 epoll 高效的原因，因为 epoll 每次值遍历发生事件的一小部分 socket 连接（这些 socket 都在这个双向链表中），而不用到全部 socket 连接中逐个遍历以判断事件是否到来。


#### 向内核双链表增加节点

epoll_wait 函数实际上就是去双向链表，那么，**操作系统什么时候向双向链表中插入节点呢**？

- 客户端完成三次握手时，操作系统会向双向链表插入节点，这时服务器往往要调用 accept 函数把该连接从已完成连接队列中取走

- 当客户端发送来数据时，操作系统会向双向链表插入节点，这时服务器也要调用 close 关闭对应的 socket

- 当客户端发送数据时，操作系统会向双向链表插入节点，这时服务器要调用 read 或者 recv 来收数据

- 当可以发送数据时，操作系统会向双向链表插入节点，这时服务器可以调用 send 或者 write 向客户端发送数据。可以这样理解：如果客户端接收话剧慢，服务器发送数据快，那么服务器就得等客户端收完一批数据后才能再发下一批。

### 边缘触发和水平触发

`epoll` 支持两种事件触发模式，分别是**边缘触发**（edge-triggered，**ET**）和**水平触发**（level-triggered，**LT**）。


- 使用**边缘触发模式**时，当被监控的 `Socket` 描述符上有可读事件发生时，服务器端只会从 `epoll_wait` 中苏醒一次，即使进程没有调用 `read` 函数从内核读取数据，也依然只苏醒一次，因此我们程序要保证一次性将内核缓冲区的数据读取完；

- 使用**水平触发模式**时，当被监控的 `Socket` 上有可读事件发生时，服务器端不断地从 `epoll_wait` 中苏醒，直到内核缓冲区数据被 `read` 函数读完才结束，目的是告诉我们有数据需要读取；


> 边缘触发：从不可读变为可读，从可读变为不可读，从不可写变为可写，从可写变为不可写，都只触发一次    
> 水平触发：只要可读，就一直触发读事件，只要可写，就一直触发写事件

这就是两者的区别，水平触发的意思是只要满足事件的条件，比如内核中有数据需要读，就一直不断地把这个事件传递给用户；而边缘触发的意思是只有第一次满足条件的时候才触发，之后就不会再传递同样的事件了。

如果使用水平触发模式，当内核通知文件描述符可读写时，接下来还可以继续去检测它的状态，看它是否依然可读或可写。所以在收到通知后，没必要一次执行尽可能多的读写操作。

如果使用边缘触发模式，I/O 事件发生时只会通知一次，而且我们不知道到底能读写多少数据，所以在收到通知后应尽可能地读写数据，以免错失读写的机会。因此，我们会循环从文件描述符读写数据，那么如果文件描述符是阻塞的，没有数据可读写时，进程会阻塞在读写函数那里，程序就没办法继续往下执行。所以，边缘触发模式一般和非阻塞 I/O 搭配使用，程序会一直执行 I/O 操作，直到系统调用（如 `read` 和 `write`）返回错误，错误类型为 `EAGAIN` 或 `EWOULDBLOCK`。

#### 什么时候使用 LT 和 ET

一般来说，边缘触发的效率比水平触发的效率要高，因为边缘触发可以减少 `epoll_wait` 的系统调用次数，系统调用也是有一定的开销的的，毕竟也存在上下文的切换。

`select/poll` 只有水平触发模式，`epoll` **默认的触发模式是水平触发**，但是可以根据应用场景设置为边缘触发模式。

-----

## 心跳包机制

心跳包其实就是一个数据包，一般每隔几十秒，由客户端主动发送给服务器，服务器收到之后，一般会给服务器返回一个心跳包。这样反复来回。

tcp 建立好连接之后，如果客户端不给服务端发送心跳包，比如说约定好，30 秒客户端需要给服务器发送一个心跳包，如果不发送，服务器在 30*3 时间之后就会主动关闭 socket 连接。

### 为什么要使用心跳包

想一下，比如说一种场景。

场景一：keep alive 保活机制

成千上万个客户端去连接一台聊天服务器，那么就会存在成千上万个 tcp 连接。但是这些 tcp 连接是每时每刻都保持发包收包的活跃状态吗？不是！

某些 tcp 连接上，可能建立之后，在一天之内就没再 发包/收包 过，为了把有限的系统资源分配给更活跃的用户使用，我们应该设计一种方案来踢掉空闲连接。

#### 如何处理不发心跳包的客户端

[参考1](https://blog.csdn.net/haolipengzhanshen/article/details/80502994)

使用 **定时器**，主要通过 **时间轮** 的方式实现

> 为什么要用定时器？
> 
> 处理定时任务，或者非活跃连接，节省系统资源；

当时设计的时候考虑到了三种情况

1） 如果一个客户端连接在连续 8 秒钟（也可自定义时间间隔）内没有收到数据，那么可以在一定程度上认为这是个无效连接，应该将其断开。

2）如果一个客户端连接在连续7秒钟内没有收到数据，但是在第8秒（马上触发超时）连接上有数据收发，那么此时要更新此连接对应定时器剩余时间为8秒，而不是1秒。

3） 服务端管理着多达数万到数十万不等的连接数，因此我们没法为每个连接使用一个 Timer，那样太消耗资源，不现实。

> 因为在读研的时候要经常看论文嘛，所以也就试着去从论文中去找也没有好的实现方案。

于是我搜集了下牛人前辈的论文，发现《Hashed and hierarchical timing wheels: efficient data structures for implementing a timer facility》这篇论文详细比较了实现定时器的各种数据结构，并提出了层次化的 timing wheel 与 hash timing wheel 等新结构。针对本文要解决的问题的特点，我们实现了一个简单的「时间轮」。

#### 怎么实现时间轮

使用 「智能指针 + 环形队列」 的方式实现时间轮

智能指针采用的是 shared_ptr 和 weak_ptr

shared_ptr 是基于引用计数的智能指针，用于共享对象的所有权，即多个指针指向同一个对象。

这个事件轮的基本结构是 [一个循环队列 + 一个指向队尾的指针 (tail)] ，这个指针每秒钟移动一格,就像钟表上的时针，，格子里的数字是倒计时，表示这个格子（桶子）中的连接的剩余寿命。一秒钟以后，tail 指针移动一格，原来四点钟方向的格子被清空，其中的连接已被断开。

![](https://img-blog.csdnimg.cn/20201205092636692.JPG?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2JhaWR1XzE1OTUyMTAz,size_16,color_FFFFFF,t_70)


#### 连接超时被踢掉的过程

假设在某个时刻，conn 1 到达，把它放到当前格子中，它的剩余寿命是 7 秒。此后 conn 1 上没有收到数据。1 秒钟之后，tail 指向下一个格子，conn 1 的剩余寿命是 6 秒。又过了几秒钟，tail 指向 conn 1 之前的那个格子，conn 1 即将被断开。下一秒，tail 重新指向 conn 1 原来所在的格子，清空其中的数据，断开 conn 1 连接。

![](https://img-blog.csdnimg.cn/2020120509335293.JPG?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2JhaWR1XzE1OTUyMTAz,size_16,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20201205093359329.JPG?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2JhaWR1XzE1OTUyMTAz,size_16,color_FFFFFF,t_70)

> 当然需要对里面的连接进行刷新

如果在断开 conn 1 之前收到数据，就把它移到当前的格子里。conn1的剩余寿命是3秒，此时 conn1 收到数据，conn 1 的寿命延长为 7 秒。时间继续前进，conn 1 寿命递减，不过它已经比第一种情况长寿了。

![](https://img-blog.csdnimg.cn/20201205093642972.JPG?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2JhaWR1XzE1OTUyMTAz,size_16,color_FFFFFF,t_70)

![](https://img-blog.csdnimg.cn/20201205093720407.JPG?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2JhaWR1XzE1OTUyMTAz,size_16,color_FFFFFF,t_70)

> 我们还需要考虑多个连接的情况

时间轮 中的每个格子是个 hash set，可以容纳不止一个连接。比如一开始，conn 1 到达。随后，conn 2 到达，这时候 tail 还没有移动，两个连接位于同一个格子中，具有相同的剩余寿命。（下图中画成链表，代码中是哈希表。）几秒钟之后，conn 1 收到数据，而 conn 2 一直没有收到数据，那么 conn 1 被移到当前的格子中。这时 conn 1 的寿命比 conn 2 长。

![](https://img-blog.csdnimg.cn/20201205093859165.JPG?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2JhaWR1XzE1OTUyMTAz,size_16,color_FFFFFF,t_70)

[参考2](https://blog.csdn.net/baidu_15952103/article/details/110676878)


## 内存池设计

> 减少使用 malloc  的频率，防止内存泄露和内存碎片，     
> 是一个 map 结构，key -- 内存刻度  value -- 链表 - 内存块      
> io_buf 分成三部分：已处理数据，未处理数据，未使用内存，data->开始，head->数据开始     
> 使用锁（互斥量）保证 pool map 的增删改查，使用单例保证初始化一次


在项目开发过程中，为了避免大量使用 malloc 或者 new 来申请内存，还有为了防止内存泄漏，减少内存碎片的产生，我们设计了一个内存管理机制，也就是内存池。


这个内存是整体是一个 map 数据结构。

- key 对应的是内存的层级，比如：4K,16K,64K
- value 对应的是一个个内存块，这些内存块是通过**链表**来连接起来。

这些内存块中层级越小的会相对多一些，越大的就少一些，整个内存池的大小就是这些内存块大小的总和。

比如说需要分配 3K 的内存，我们就在内存池中找到比 3K 大，并且最接近 3k 的内存块。当一个内存块使用完之后会进行 free 调用，我们实现了一个 free 接口，当使用完这个内存块之后，会将这块内存放回到内存池中。

当 4k 的内存全部用完了，这时候用户还是需要用 4k 内存的时候，内存池就会尝试动态去调用 malloc 进行动态申请。这样可大大较少 malloc 的使用频率。


### 单块内存 io_buf

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/内存块01.3g761puxqfk0.png)

整个内存块分成三部分，一部分是已经处理的数据部分，一部分是未处理的数据，也就是有效数据部分，还有一部分是为使用的内存部分（因为，比如用户要使用 3k 的内存，我们分给他的是 4k 的内存块，所以会有一部分内存未被使用）

然后每个内存块都设有两个指针，一个是 data ,指向内存块的首地址，还有一个是 head，指向数据的头部。当开始处理数据时，就移动 head 指针。

### 内存池提供的接口

```cpp
#pragma once

//定义一个 buffer 一块内存的数据结构体

class io_buf{
public:
	//构造函数，创建一个 size 大小的buf
	io_buf(int size);

	//清空数据
	void clear();

	//处理长度为 len 的数据，移动head
	void pop(int len);

	//将已经处理的数据清空(内存抹去), 将未处理的数据 移至 buf的首地址, length会减小
	void adjust();

	//将其他 io_buf 对象拷贝到自己中
	void copy(const io_buf *other);

	~io_buf();
private:
	int capacity;
	int head;
	int length; //当前有效数据长度
	char *data;  // 当前buf内存的首地址
	
	io_buf *next;//存在多个 io_buf 采用链表的形式进行管理

};
```

- 其中 adjust() 函数的作用是：当内存块中所有的数据都处理完了，就将 io_buf 还原。

- copy() 是将另一个 io_buf 的对象拷贝到当前的 io_buf 中。

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/内存块02.11qfbct3j7bk.png)


### 单例模式的内存池

> 使用 pthread_once_t 保证初始化只执行一次

从内存池中申请一块内存的时候，会根据申请的内存大小去找到大于或者等于所申请的内存刻度，从链表中摘除出来，如果某个刻度的内存块已经用完了，这时候才真正去使用 malloc 开辟新的内存。

这里为了保证在开辟内存的时候使用 锁[互斥量] 来保护 pool map 的增删改

### 从内存池中申请一块内存

```cpp
io_buf* buf_pool::alloc_buf(int N) {
	//1.找到 N 最近的刻度链表，返回一个 io_buf
	int index;
	if(N <= m4K){
		index = m4K;
	}
	else if(N < m16K) {
		index = m16K;
    }
    else if ( N <= m64K) {
        index = m64K;
    }
    else if ( N <= m256K) {
        index = m256K;
    }
    else if ( N <= m1M) {
        index = m1M;
    }
    else if ( N <= m4M) {
        index = m4M;
    }
    else if ( N <= m8M) {
        index = m8M;
    }
    else {
        return NULL;
    }
	//2.如果该index已经没有内存了，需要额外的申请内存
	//需要加锁保证 pool map 的增删改
	pthread_mutex_lock(&_mutex);
	if(_pool[index] == NULL) {
		if(_total_num + index / 1024 >= MEM_LIMIT ) {
			fprintf(stderr,"already use too many memory\n");
			exit(1);
		}
		//没有了就要重新申请内存
		io_buf *new_buf = new io_buf(index);
		if(new_buf == NULL) {
			fprintf(stderr,"new io_buf error\n");
			exit(1);
		}
		_total_num += index / 1024;
		pthread_mutex_unlock(&_mutex);
		return new_buf;  //返回性开辟的内存块
	}
	//如果有内存块，就从内存池的链表中取出内存块
	io_buf *target = _pool[index];
	//移动内存链表的头地址
	_pool[index] = target->next;

	pthread_mutex_unlock(&_mutex);

	target->next = NULL;
	return target;
	
}
io_buf* buf_pool::alloc_buf() {
	// 不传递就默认 m4K
	return alloc_buf(m4K);
}
```

- 先找到最接近要取出内存大小的内存刻度链表
- 如果内存池中这个内存刻度的内存块已经用完了，就重新开辟新的内存块并返回
- 如果这个刻度的内存块还有，就将第一个内存块取出来并返回

> 注意需要加锁保证内存池的增删改

### 将一个 io_buf 放回到内存池中

```cpp
void buf_pool::revert(io_buf* buffer) {
	//将buffer放回到 pool 中
	//index 属于 pool 中的哪个刻度链表
	int index = buffer->capacity;
	//1.内存块恢复默认值,没有有效数据，即 length  = 0
	buffer->head = 0;
	buffer->length = 0;

	//断言，一定要找到 index，也就是 map 的 key
	assert(_pool.find(index) != _pool.end() );

	pthread_mutex_lock(&_mutex);
	//2.将 buffer 放到对应刻度链表的头部
	buffer->next = _pool[index];
	_pool[index] = buffer;

	pthread_mutex_unlock(&_mutex);
}
```

- 首先找到对应的刻度链表
- 然后这这个内存块恢复默认值（`head = 0,lenght = 0`)
- 将这个内存块使用头插法插入到对应的刻度链表中

> 注意这里也要加锁保证内存池的增删改

### 读写 buffer 机制

```cpp

//从一个fd中读取数据到reactor_buf中
int input_buf::read_data(int fd)
{
    int need_read; //硬件中更有多少数据是可以都的

    //一次性将io中的缓存数据全部都出来
    //需要给fd设置一个属性
    //传出一个参数,目前缓冲中一共有多少数据是可读
    if (ioctl(fd, FIONREAD, &need_read) == -1) {
        fprintf(stderr, "ioctl FIONREAD\n");
        return -1;
    }


    if (_buf == NULL) {
        //如果当前的input_buf里的_buf是空，需要从buf_pool拿一个新的
        _buf = buf_pool::instance()->alloc_buf(need_read);
        if (_buf == NULL) {
            fprintf(stderr, "no buf for alloc!\n");
            return -1;
        }
    }
    else {
        //如果当前buf可用,判断一下当前buf是否够存
        assert(_buf->head == 0);
        if (_buf->capacity - _buf->length < need_read) {
            //不够存
            io_buf *new_buf = buf_pool::instance()->alloc_buf(need_read+_buf->length);
            if (new_buf == NULL) {
                fprintf(stderr, "no buf for alloc\n");
                return -1;
            }

            //将之前的_buf数据拷贝到新的buf中
            new_buf->copy(_buf);
            //将之前的_buf 放回内存池中
            buf_pool::instance()->revert(_buf);
            //新申请的buf称为当前的io_buf
            _buf = new_buf;
        }
    }

    int already_read = 0;

    //当前的buf是可以容纳  读取数据
    do {
        if (need_read == 0) {
            already_read = read(fd, _buf->data + _buf->length, m4K);//阻塞直到有数据
        }
        else {
            already_read = read(fd, _buf->data + _buf->length, need_read);
        }
    } while(already_read == -1 && errno == EINTR);//systemcall一个终端，良性，需要继续读取


    if (already_read > 0) {
        if (need_read != 0) {
            assert(already_read == need_read);
        }

        //读数据已经成功
        _buf->length += already_read;
    }

    return already_read;
}

//获取当前的数据的方法
const char *input_buf::data()
{
    return _buf != NULL ? _buf->data + _buf->head : NULL;
}

//重置缓冲区
void input_buf::adjust()
{
    if (_buf != NULL) {
        _buf->adjust();
    }
}

// =========================================== 
    //将一段数据 写到 自身的_buf中
int output_buf::send_data(const char *data, int datalen)
{
    if (_buf == NULL) {
        //如果当前的output_buf里的_buf是空，需要从buf_pool拿一个新的
        _buf = buf_pool::instance()->alloc_buf(datalen);
        if (_buf == NULL) {
            fprintf(stderr, "no buf for alloc!\n");
            return -1;
        }
    }
    else {
        //如果当前buf可用,判断一下当前buf是否够存
        assert(_buf->head == 0);

        if (_buf->capacity - _buf->length < datalen) {
            //不够存
            io_buf *new_buf = buf_pool::instance()->alloc_buf(datalen+_buf->length);
            if (new_buf == NULL) {
                fprintf(stderr, "no buf for alloc\n");
                return -1;
            }

            //将之前的_buf数据拷贝到新的buf中
            new_buf->copy(_buf);
            //将之前的_buf 放回内存池中
            buf_pool::instance()->revert(_buf);
            //新申请的buf称为当前的io_buf
            _buf = new_buf;
        }
    }

    //将data 数据写到io_buf中 拼接到后面    
    memcpy(_buf->data + _buf->length, data, datalen);
    _buf->length += datalen;

    return 0;
}

//将_buf中的数据写到一个fd中
int output_buf::write2fd(int fd) //取代 io层 write方法
{
    assert(_buf != NULL && _buf->head == 0);

    int already_write = 0;

    do {
        already_write = write(fd, _buf->data, _buf->length);
    } while (already_write == -1 && errno == EINTR);//系统调用中断产生，不是一个错误


    if (already_write > 0) {
        //已经写成功
        _buf->pop(already_write);
        _buf->adjust();
    }


    //如果fd是非阻塞的,会报already_write==-1 errno==EAGAIN
    if (already_write == -1 && errno == EAGAIN) {
        already_write = 0;//表示非阻塞导致的-1 不是一个错误,表示是正确的只是写0个字节
    }

    return already_write;
}
```

----

> - 使用非阻塞 socket + epoll 的 IO 多路复用 的并发模型来处理客户端的请求，也就是 master - worker 形式。   
> - 设计心跳包机制来监听客户端和服务端的状态，在这部分主要是定时器的设计
> - 在内存管理方面，也实现了一个内存池，对内存进行管理

## 内存池的设计

> https://blog.csdn.net/M_jianjianjiao/article/details/88071878

> https://blog.csdn.net/hansionz/article/details/87885229

> [参考](https://blog.csdn.net/qq_37299596/article/details/108083749?spm=1001.2101.3001.6650.7&utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7ERate-7.pc_relevant_default&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7ERate-7.pc_relevant_default&utm_relevant_index=14)

### 为什么要设计内存池

- 减少内存碎片
- 提高效率，使得在特定的情况下平均运行效率该高于malloc
- 解决在内存申请过程中的竞争问题

**设计思路**

- 以定长哈希映射的空闲内存池为基础
- 使用三层缓存分配结构

### 内存池的结构

- thread cache：**线程缓存**是每个线程独有的，用于小于64k的内存的分配，线程从这里申请内存不需要加锁，每个线程独享一个cache，这样可以提高并发的效率。
- Central cache：**中心缓存**是所有线程所共享，thread cache是按需要从Central cache中获取的对象。 Central cache周期性的回收thread cache中的对象，避免一个线程占用了太多的内存，而其他线程的内存比较紧张的情况。达到内存分配在多个线程中更均衡的按需调度的目的。Central cache是存在竞争的，所以从这里取内存对象是需要加锁。
- Page cache：**页缓存**是在Central cache缓存上面的一层缓存，存储的内存是以页为单位存储及分配 的，Central cache没有内存对象(Span)时，从Page cache分配出一定数量的page，并切割成定长大小的小块内存，分配给Central cache。Page cache会回收Central cache满足条件的Span(使用计数为0)对象，并且合并相邻的页，组成更大的页，缓解内存碎片的问题。

#### 第一层 ThreadCache

![](https://img-blog.csdnimg.cn/20190302090146379.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L01famlhbmppYW5qaWFv,size_16,color_FFFFFF,t_70)


- 使用哈希映射一个存储不同大小数据块的内存块池，通过根据不同大小的对象，构建不同大小的内存的分配器，进行内存的高效分配。

- 当然，在内存分配的过程中会产生内存碎片，而内存碎片分为两种
  - 内碎片：是指因为在内存中会因为内存对齐的原因，在内存分配过程中，为了要对齐到响应的对齐位置，会在造成一定空间的浪费
  - 外碎片：是指在内存分配过程中会，当需要一块内存时，该内存，可能是从一个大块的内存上切割下来的，不断的切割，就会使大内存块变成小的内存块，等到需要大块内存时就会发现找不到。

>使用哈希表和链表来实现

- 根据定长的结构对齐进行改进，将哈希映射的池分为 4 部分，他们的对齐数分别是 8 、16 、128 、512，将这几部分的内碎片的产生进行一定的控制，从而达到减少内碎片的目的，而外碎片通过后面的合并进行解决。

> 怎么实现每个线程都拥有自己唯一的线程缓存呢？

为了避免加锁带来的效率，在 Thread Cache 中保存每个线程本地的 ThreadCache 的指针，这样 Thread Cache 在申请释放内存是不需要锁的。因为每一个线程都拥有了自己唯一的一个全局变量。

##### 设计ThreadCache类

```cpp
class ThreadCache
{
public:
	//分配内存
	void* Allocate(size_t size);
	//释放内存
	void Deallocate(void* ptr, size_t size);
	//从中心缓存中获取内存对象
	void* FetchFromCentralCache(size_t index, size_t size);
	//当自由链表中的对象超过一次分配给threadcache的数量，则开始回收
	void ListTooLong(FreeList* freelist, size_t byte);

private:
	FreeList _freelist[NLISTS];// 创建了一个自由链表数组
};
```

##### Thread Cache申请内存

- 只能申请在64k范围以内的大小的内存，如果大于64k，则直接向系统申请内存。

- 当内存申请 `size<=64k` 时在 thread cache 中申请内存，先计算 size 在自由链表中的位置，如果自由链表中有内存对象时，直接从 `FistList[i]` 中 Pop 然后返回对象，时间复杂度是 O(1)，并且没有锁竞争，效率极高。 当 `FreeList[i]` 中没有对象时，则批量从 Central cache 中获取一定数量的对象。

##### Thread Cache释放内存

- 当释放内存小于 64k 时将内存释放回 thread cache，先计算 size 在自由链表中的位置，然后将对象 Push 到 `FreeList[i]`

- 当自由链表的长度超过一次向中心缓存分配的内存块数目时，回收一部分内存对象到 Central cache


#### CentralCache

> 中心缓存要实现为单例模式，保证全局只有一份实例

- Central cache 本质是由一个哈希映射的 span 对象自由双向链表构成

> 什么是span? 一个 span 是由多个页组成的一个 span 对象。一页大小是恒定的 4k ((32位下4K 64位下8K)。 span **是为了对 thread cache 还回来的内存进行管理**

![](https://img-blog.csdnimg.cn/20200818203042292.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM3Mjk5NTk2,size_16,color_FFFFFF,t_70#pic_center0)

##### Central Cache申请内存

- 当 thread cache 中没有内存时，就会批量向 Central cache 申请一定数量的内存对象，Central cache 也是一个哈希映射的 Spanlist，Spanlist 中挂着span，从 span 中取出对象给 thread cache，这个过程是需要加锁的，可能会存在多个线程同时取对象，会导致线程安全的问题。

- 当 Central cache 中没有非空的 span 时，则将空的 span 链在一起，然后向 Page cache 申请一个 span 对象，span 对象中是一些以页为单位的内存，将这个 span 对象切成需要的内存大小并链接起来，最后挂到 Central Cache 中。

- Central cache 的中的每一个 span 都有一个 use_count (引用计数)，分配一个对象给thread cache，就 `++use_count`，当这个 span 的使用计数为 0，说明这个 span 所有的内存对象都是空闲的，然后将它交给 Page Cache 合并成更大的页，减少内存碎片。

**简言之**：当 thread cache 中没有内存时，就会批量向 Central cache 申请一定数量的内存对象，Central cache 也是一个哈希映射的 Spanlist，Spanlist 中挂着 span，从 span 中取出对象给 thread cache。比如线程申请一个 16bytes 的内存，但是此时thread cache 中16bytes往上的都没了 ,这个时候向 cantral 申请，central cache 就到 16bytes 的地方拿下一个span 给 thread cache。

但是，当向 Central Cache 中申请发现 16bytes 往后的 span 节点全空了时，则将空的 span 链在一起，然后向 Page Cache 申请若干以页为单位的span对象，比如一个 3 页的 span 对象，然后把这个 3 页的 span 对象切成3 个一页的 span 对象，放在 central cache 中 16bytes 位置， 再将这三个一页的 span 对象切成需要的内存块大小，这里就是 16bytes，并链接起来，挂到 span 中


##### Central Cache 释放内存

- 当 thread cache 过长或者线程销毁，则会将内存释放回 Central cache 中，没释放一个内存对象，检查该内存所在的 span 使用计数是否为空，释放回来一个时 `--use_count`。

- 当 use_count 减到 0 时则表示所有对象都回到了 span，则将 span 释放回 Page cache，在 Page cache 中会对前后相邻的空闲页进行合并。


> **怎么才能将 Thread Cache 中的内存对象还给他原来的 span 呢**？

可以在 Page Cache 中维护一个页号到 span 的映射。当 Page Cache 给 Central Cache 分配一个span时，将这个映射更新到 unordered_map 中去，这样的话在 central cache 中的 span 对象下的内存块都是属于某个页的 也就有他的页号,，同一个span切出来的内存块 PageID 都和 span 的 PageID 相同，这样就能很好的找出某个内存块属于哪一个 span 了

#### PageCache

![](https://img-blog.csdnimg.cn/20200818205901217.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM3Mjk5NTk2,size_16,color_FFFFFF,t_70#pic_center)

- PageCache 处于 CentralCache 的上一层缓存结构，当中心缓存中的内存数据块不够的话，就会从页缓存中进行申请，从而获得内存资源

- 页缓存是以页为单位进行存储的，通过哈希的映射建立一个缓存池，每个下标对应该位置所挂的是几页的内存块，也就是 span

##### 申请内存

- 1.当 CentralCache 向 PageCache 申请内存时，PageCache 先检查对应位置有没有 span，如果没有则向更大页寻找一个 span，如果找到则分裂成两个。比如：申请的是 4page，4page 后面没有挂 span，则向后面寻找更大的 span，假设在 10page 位置找到一个span，则将 10page span分裂为一个 4 page span 和 一个 6 page span。
  
- 2.如果找到 128 page 都没有合适的 span，则向系统使用 mmap、brk(Linux)或者是 VirtualAlloc(windows) 等方式申请 128 page span 挂在自由链表中，再重复 1 中的过程。

##### PageCache释放内存

- 如果 CentralCache 释放回一个span，则依次寻找 span 的前后 page id 的 span，看是否可以合并，如果能够合并继续向前寻找。这样就可以将切小的内存合并收缩成大的 span，减少内存碎片。但是合并的最大页数超过 128 页，则不能合并。

- 如果 ThreadCache 想直接申请大于 64k 的内存，直接去 PageCache 去申请，当在 PageCache 申请时，如果申请的内存大于 128 页，则直接向系统申请这块内存，如果小于 128 页，则去 SpanList 去查找。

> 简单的说就是      
> 如果 申请大于64k 且小于 128页的空间

- 因为此时申请的空间大于第二层所能分配的空间，但小于第三层所能分配的最大的空间。所以此时申请时绕过第一层从第三层直接申请

- 释放时也直接将内存释放给第三层

> 如果 申请大于128页的空间
- 直接从系统是申请， 绕过三层的缓存结构
- 释放时直接将该块空间进行释放

----

## 压力测试

阅读 Webbench 源码，对 进程 加深理解

通过 Webbench 创建多个进程，每个进程通过 HTTP 连接访问服务器，完成压力测试。

可以实现 上万 并发连接
- 每秒钟相应请求数：552852 /min
- 每秒钟传输数据量：1031990 bytes/sec 
- 所有连接访问均成功

### Webbench实现的核心原理

- 进程fork若干个子进程，每个子进程在用户要求时间或默认的时间内对目标web循环发出实际访问请求;
- 父子进程通过管道进行通信，子进程通过管道写端向父进程传递在若干次请求访问完毕后记录到的总信息；
- 父进程通过管道读端读取子进程发来的相关信息，子进程在时间到后结束，父进程在所有子进程退出后统计并给用户显示最后的测试结果，然后退出。

  - 1.命令行解析，`getopt()`

  - 2.构造http请求报文 `build_request`

  - 3.压力测试：`bench` 函数

- 每个 `fork` 的子进程都调用 `benchcore` 函数，在要求时间内发送请求报文，该函数可记录请求的成功次数、失败次数、以及服务器回复的字节数。

## 压力测试 Bug 排查

使用 Webbench 对服务器进行压力测试，创建 1000 个客户端，并发访问服务器 10s ，正常情况下接近 8w 个请求访问服务器

结果显示请求 7w+ 个请求被成功处理，0 个请求失败，服务器也没有返回错误，这时候尝试从浏览器访问服务器，发现这个请求也不能被处理和响应，必须将服务器重启，浏览器才能正常访问。

### 排查过程

通过查询服务器运行日志，通过日志观察猜想是 接受请求连接 部分发生了错误。

其中，服务器接收请求的连接步骤为：`socket --> bind --> listen --> accept`      
客户端请求连接的步骤为：`socket --> connect`


### listen 

```cpp
#include<sys/socket.h>
int listen(int sockfd, int backlog)
```

- 函数功能，把一个未连接的套接字转换成一个被动套接字，指示内核应接受指向该套接字的连接请求。根据 TCP 状态转换图，调用 listen 导致套接字从 CLOSED 状态转换成 LISTEN 状态。

- backlog 是队列的长度，内核为任何一个给定的监听套接口维护两个队列：
  - **未完成连接队列**（incomplete connection queue），每个这样的 SYN 分节对应其中一项：已由某个客户发出并到达服务器，而服务器正在等待完成相应的 TCP 三次握手过程。这些套接口处于 SYN_RCVD 状态。
  - **已完成连接队列**（completed connection queue），每个已完成 TCP 三次握手过程的客户对应其中一项。这些套接口处于 ESTABLISHED `[ɪˈstæblɪʃt]` 状态。

#### connect

当有客户端主动连接（connect）服务器，Linux 内核就自动完成 TCP 三次握手，该项就从未完成连接队列移到已完成连接队列的队尾，将建立好的连接自动存储到队列中，如此重复。

#### accept

- 函数功能，从处于 ESTABLISHED 状态的连接队列头部取出一个已经完成的连接(三次握手之后)。

- 如果这个队列没有已经完成的连接，accept 函数就会阻塞，直到取出队列中已完成的用户连接为止。

- 如果，服务器不能及时调用 accept 取走队列中已完成的连接，队列满掉后，TCP 就绪队列中剩下的连接都得不到处理，同时新的连接也不会到来。

从上面的分析中可以看出，accept 如果没有将队列中的连接取完，就绪队列中剩下的连接都得不到处理，也不能接收新请求，这个特性与压力测试的 Bug 十分类似。


#### 定位 accept

分析代码发现，web端和服务器端建立连接，采用 Epoll 的 **边缘触发模式** 同时监听多个文件描述符。

#### Epoll 的 ET、LT

- LT水平触发模式

`epoll_wait` 检测到文件描述符有事件发生，则将其通知给应用程序，应用程序可以不立即处理该事件。

当下一次调用 `epoll_wait` 时，`epoll_wait` 还会再次向应用程序报告此事件，直至被处理。

- ET边缘触发模式

  - `epoll_wait` 检测到文件描述符有事件发生，则将其通知给应用程序，应用程序必须立即处理该事件。

  - 必须要一次性将数据读取完，使用非阻塞 I/O，读取到出现 eagain。

从上面的定位分析，问题可能是错误使用 epoll 的 ET 模式。

#### 代码分析解决

尝试将 listenfd 设置为 LT 阻塞

```cpp
for(int i=0;i<number;i++)
{
    int sockfd=events[i].data.fd;

    //处理新到的客户连接
    if(sockfd==listenfd)
    {
        struct sockaddr_in client_address;
        socklen_t client_addrlength=sizeof(client_address);

        //从listenfd中接收数据
        //这里的代码出现使用错误
        while ((connfd = accept (listenfd, (struct sockaddr *) &remote, &addrlen)) > 0){
            if(connfd<0)
            {
                printf("errno is:%d\n",errno);
                continue;
            }
            //TODO,逻辑处理
        }
    }
}
```

将代码修改后，重新进行压力测试，问题得到解决，服务器成功完成 75617 个访问请求，且没有出现任何失败的情况。

#### Bug原因

established 状态的连接队列 backlog 参数，历史上被定义为已连接队列和未连接队列两个的大小之和，大多数实现默认值为5。当连接较少时，队列不会变满，即使 listenfd 设置成 ET 非阻塞，不使用 while 一次性读取完，也不会出现 Bug。

若此时 1000个 客户端同时对服务器发起连接请求，连接过多会造成 established 状态的连接队列变满。但 accept 并没有使用 while 一次性读取完，只读取一个。因此，连接过多导致 TCP 就绪队列中剩下的连接都得不到处理，同时新的连接也不会到来。

解决方案

将 listenfd 设置成 LT 阻塞，或者 ET 非阻塞模式下 while 包裹 accept 即可解决问题。

> [其他面试题](https://zhuanlan.zhihu.com/p/368154495)