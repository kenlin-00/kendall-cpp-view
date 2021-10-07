> 参考：https://blog.csdn.net/yangyin007/article/details/82777086
> https://blog.csdn.net/apelife/category_9267226.html

------

## nginx的架构

Nginx 的源码主要分布在`src/`目录下，而`src/`目录下主要包含三部分比较重要的模块。

- core：包含了 Nginx 的最基础的库和框架。包括了内存池、链表、hashmap、String 等常用的数据结构。
- event：事件模块。Nginx 自己实现了事件模型。*而我们所熟悉的 Memcached 是使用了 Libevent 的事件库。自己实现 event 会性能和效率方便更加高效。*
- http：实现 HTTP 的模块。实现了HTTP的具体协议的各种模块，该部分内容量比较大。

<font color="orange" size=4>**Nginx的架构是这样**：</font>

1.**Nginx 是一款多进程的软件**。Nginx 启动后，会产生一个 Master 进程和 N 个工作 ( worker ) 进程。其中 `nginx.conf` 中可以配置工作进程的个数：多进程模块有一个非常大的好处，就是不需要太多考虑并发锁的问题

2.在客户端请求动态站点的过程中，Nginx服务器还涉及和后端服务器的通信。Nginx  将接收到的Web 请求通过代理转发到后端服务器，由后端服务器进行数据处理和组织；

3.Nginx 为了提高对请求的响应效率，降低网络压力，采用了缓存机制，将历史应答数据缓存到本地。保障对缓存文件的快速访问；

**工作进程**

工作进程的主要工作有以下几项：

- 接受客户端请求
- 将请求一次送入各个功能模块进行过滤处理
- 接着是 IO 调用，获取响应数据
- 与后端服务器通信，接受后端服务器处理返回的结果
- 然后进行数据缓存，再响应给客户端

**进程交互**

Nginx服务器在使用 Master-Worker 模型时，会涉及到主进程和工作进程的交互和工作进程之间的交互。这两类交互都依赖于**管道机制**。

1.Master-Worker交互

这条管道与普通的管道不同，它是由主进程指向工作进程的单向管道「master --> worker」，包含主进程向工作进程发出的指令，工作进程ID等；同时主进程与外界通过信号通信；

2.worker-worker交互

这种交互是和Master-Worker交互是基本一致的。但是会通过主进程「 Master 」。工作进程之间是相互隔离的，所以当工作进程 Worker1 需要向工作进程 Woker2 发指令时，首先找到 Woker2 的进程 ID，然后将正确的指令写入指向 Woker2 的通道。Woker2 收 到信号采取相应的措施。 


 ## 内存池 `ngx_palloc.c`

 ### 内存池的好处

- 提升内存分配效率。不需要每次分配内存都执行 `malloc/alloc` 等函数。
- 内存的管理变得更加简单。内存的分配都会在一块大的内存上，回收的时候只需要回收大块内存就能将所有的内存回收，防止了内存管理混乱和内存泄露问题。


一个内存池中分为两个部分：

内存分配逻辑:

分配一块内存，如果分配的内存 size 小于内存池的 `pool->max` 的限制，则属于小内存块分配，走小内存块分配逻辑；否则走大内存分配逻辑。

- 小内存分配逻辑：循环读取 `pool->d` 上的内存块，是否有足够的空间容纳需要分配的 size，如果可以容纳，则直接分配内存；否则内存池需要申请新的内存块，调用 `ngx_palloc_block` 。
- 大内存分配逻辑：当分配的内存 size 大于内存池的 ` pool->max`  的限制，则会直接调用 `ngx_palloc_large ` 方法申请一块独立的内存块，并且将内存块挂载到 `pool->large` 的链表上进行统一管理。

>  Nginx 的内存池会放在 ngx_pool_t 的数据结构上，当初始化分配的内存块大小不能满足需求的时候，Nginx 就会调用 ngx_palloc_block 函数来分配一个新的内存块，通过链表的形式连接起来。


### ngx_pool_data_t


> 可以讲 ngx_pool_data_t 有一个 failed 成员

每个 ngx_pool_t 结构体的 meta 元数据是存储在 `ngx_pool_data_t` 这个结构体中

```c
u_char *last：指向分配空间的可用空间。
u_char *end：指向分配空间的最后位置。
ngx_pool_t *next：指向下一个 ngx_pool_t 指针。
ngx_uint_t failed：存储本 ngx_pool_t 结构体分配失败次数。
```

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/nginx_内存池数据结构01.2639fd9q4t8g.png)

failed 成员的引入是为了避免某个 pool 虽然还有可用的空间，但是由于空间很小了所以经常性的分配空间失败，当累计失败的次数达到某个阈值时，下一次再次查找内存就直接跳过这个 pool，而去寻找内存池链表中的下一个 pool。


### ngx_pool_large_t

ngx_pool_large_t 结构体用于保存大内存块，这一块就比较简单粗暴了，直接分配一块大内存来使用。另外，多个大内存块之间也是以**链表形式**来组织数据。

```c
// 管理超大空间的结构体
struct ngx_pool_large_s {
  // 指向下一个指针
  ngx_pool_large_t     *next;
  // 直接指向内存区域的指针
  void                 *alloc;
};
```

### 大内存块的释放 ngx_pfree

内存池释放需要走 ngx_destroy_pool，但是独立大内存块的单独释放，可以走ngx_pfree 方法

```cpp
/**
 * 大内存块释放  pool->large
 */
ngx_int_t ngx_pfree(ngx_pool_t *pool, void *p) {
	ngx_pool_large_t *l;
 
	/* 在pool->large链上循环搜索，并且只释放内容区域，不释放ngx_pool_large_t数据结构*/
	for (l = pool->large; l; l = l->next) {
		if (p == l->alloc) {
			ngx_log_debug1(NGX_LOG_DEBUG_ALLOC, pool->log, 0,
					"free: %p", l->alloc);
			ngx_free(l->alloc);
			l->alloc = NULL;
 
			return NGX_OK;
		}
	}
 
	return NGX_DECLINED;
}
```

**cleanup机制 可以回调函数清理数据**

Nginx 的内存池 cleanup 机制，设计的非常巧妙。`pool->cleanup` 本身是一个链表，每个 `ngx_pool_cleanup_t` 的数据结构上，保存着内存数据的本身`cleanup->data` 和回调清理函数 `cleanup->handler` 。

通过`cleanup`  的机制，我们就可以在内存池上保存例如文件句柄 fd 的资源。当我们调用 `ngx_destroy_pool` 方法销毁内存池的时候，首先会来清理 `pool->cleanup` ，并且都会执行 `c->handler(c->data)` 回调函数，用于清理资源。

Nginx 的这个机制，**最显著的就是让文件描述符和需要自定义清理的数据的管理变得更加简单**。

## 双向链表结构

### 为什么设计 ngx_queue_t 双向链表

可以高效地执行插入、删除、合并等操作，在移动链表中的元素时只需要修改指针的指向，因此，它很适合频繁修改容器的场合。在 Nginx 中，链表是必不可少的，而 ngx_queue_t 双向链表就被设计用于达成以上目的。

相对于Nginx其他顺序容器，ngx_queue_t容器的优势在于：

- 实现了排序功能。
- 它非常轻量级，是一个纯粹的双向链表。它不负责链表元素所占内存的分配，与 Nginx 封装的 ngx_pool_t 内存池完全无关。
- 支持两个链表间的合并。
- 还有整个链表实现的是双向链表。

这个双向链表的具体实现是通过**宏定义**的方式来实现常用的方法

- 链表和业务数据结构之间进行了解耦，使用更加灵活和方便。

## 多进程实现

| 实现函数  | 功能 |
| :------------------------------- | :--------------------------------------------------: |
| 1.ngx_master_process_cycle | 启动 Nginx 的进程模式，主进程信号监听和启动工作进程 |
| 2.ngx_start_worker_processes | 创建和启动工作进程，工作进程一般是 CPU 个数的 1-2 倍，`ccf->worker_processes`配置 |
| 3. ngx_spawn_process | fork() 出工作进程的子进程，启动成功后，调用 ngx_worker_process_cycle方法 |
| 4. ngx_worker_process_cycle | 各个进程的处理逻辑都在这个方法实现 |
| 5. ngx_worker_process_init | 工作进程初始化 |
| 6. Ngx_process_events_end_timer | 进入时间驱动循环 |

- **ngx_master_process_cycle 进入多进程模式**

ngx_master_process_cycle方法主要做了两个工作：

1.主进程进行信号的监听和处理

2.开启子进程

- **ngx_start_worker_processes 创建工作进程**

1.通过循环创建N个子进程。每个子进程都有独立的内存空间

2.子进程的个数由Nginx的配置：ccf->worker_processes 


- **ngx_spawn_process fork工作进程**

主要用于fork出各个工作进程

```cpp
    /* fork 一个子进程 */
    pid = fork();
 
    switch (pid) {
 
    case -1:
        ngx_log_error(NGX_LOG_ALERT, cycle->log, ngx_errno,
                      "fork() failed while spawning \"%s\"", name);
        ngx_close_channel(ngx_processes[s].channel, cycle->log);
        return NGX_INVALID_PID;
 
    case 0:
    	/* 如果pid fork成功，则调用 ngx_worker_process_cycle方法 */
        ngx_pid = ngx_getpid();
        proc(cycle, data);
        break;
 
    default:
        break;
    }
```

- **ngx_worker_process_cycle 子进程的回调函数**

1.ngx_worker_process_cycle为子进程的回调函数，一切子进程的工作从这个方法开始。

2.Nginx的进程最终也是有事件驱动的，所有这个方法中，最终会调用 `ngx_process_events_and_timers` 事件驱动的核心函数。

## 多进程的惊群和进程负载均衡处理

对于 Nginx 的惊群问题，我们首先需要理解的是，在 Nginx 启动过程中，master 进程会监听配置文件中指定的各个端口，然后 master 进程就会调用 fork() 方法创建各个子进程，根据进程的工作原理，子进程是会继承父进程的全部内存数据以及监听的端口的，也就是说 worker 进程在启动之后也是会监听各个端口的。

关于惊群，指的就是**当客户端有新建连接的请求到来时，就会触发各个 worker 进程的连接建立事件，但是只有一个 worker 进程能够正常处理该事件，而其他的 worker 进程会发现事件已经失效，从而重新循环进入等待状态**。这种由于一个事件而 “惊” 起了所有 worker 进程的现象就是惊群问题。很明显，如果所有的 worker 进程都被触发了，那么这将消耗大量的资源。

<font color="orange" size=4>**惊群解决方式**：</font>

在 Nginx 中，每个 worker 进程被创建的时候，都会调用 ngx_worker_process_init() 方法初始化当前 worker 进程，这个过程中有一个非常重要的步骤，即每个 worker 进程都会调用 epoll_create() 方法为自己创建一个独有的 epoll 句柄。

对于每一个需要监听的端口，都有一个文件描述符与之对应，而 worker 进程只有将该文件描述符通过 epoll_ctl() 方法添加到当前进程的 epoll 句柄中，并且监听 accept 事件，此时才会被客户端的连接建立事件触发，从而处理该事件。从这里也可以看出，worker 进程如果没有将所需要监听的端口对应的文件描述符添加到该进程的 epoll 句柄中，那么其是无法被触发对应的事件的。

基于这个原理，nginx 就使用了一个共享锁来控制当前进程是否有权限将需要监听的端口添加到当前进程的 epoll 句柄中，也就是说，只有获取锁的进程才会监听目标端口。通过这种方式，就保证了每次事件发生时，只有一个 worker 进程会被触发。如下图所示为 worker 进程工作循环的一个示意图：

![](https://haicoder.net/uploads/pic/notes/nginx-interview/05_Nginx%E6%83%8A%E7%BE%A4.png)

> 这里关于图中的流程，需要说明的一点是，每个 worker 进程在进入循环之后就会尝试获取共享锁，如果没有获取到，就会将所监听的端口的文件描述符从当前进程的 epoll 句柄中移除（即使并不存在也会移除），这么做的主要目的是防止丢失客户端连接事件，即使这可能造成少量的惊群问题，但是并不严重。
> 
> 试想一下，如果按照理论，在当前进程释放锁的时候就将监听的端口的文件描述符从 epoll 句柄中移除，那么在下一个 worker 进程获取锁之前，这段时间各个端口对应的文件描述符是没有任何 epoll 句柄进行监听的，此时就会造成事件的丢失。如果反过来，按照图中的在获取锁失败的时候才移除监听的文件描述符，由于获取锁失败，则说明当前一定有一个进程已经监听了这些文件描述符，因而此时移除是安全的。

> [参考](https://haicoder.net/note/nginx-interview/nginx-interview-nginx-group.html)

## Nginx的Event事件模块

### 重要数据结构

- ngx_listening_s：主要是监听套接字结构，存放socket的信息
- ngx_connection_s：存储连接有关的信息和读写事件。
- ngx_event_s：主要存放事件的数据结构。



## 如何处理一个 HTTP 请求的

- 首先，Nginx 在启动时，会解析配置文件，得到需要监听的端口与 IP 地址，然后在 Nginx 的 Master 进程里面先初始化好这个监控的Socket(创建 S ocket，设置 addr、reuse 等选项，绑定到指定的 ip 地址端口，再 listen 监听)。
- 然后，再 fork(一个现有进程可以调用 fork 函数创建一个新进程。由 fork 创建的新进程被称为子进程 )出多个子进程出来。
- 之后，子进程会竞争 accept 新的连接。此时，客户端就可以向 nginx 发起连接了。当客户端与nginx进行三次握手，与 nginx 建立好一个连接后。此时，某一个子进程会 accept 成功，得到这个建立好的连接的 Socket ，然后创建 nginx 对连接的封装，即 ngx_connection_t 结构体。
- 接着，设置读写事件处理函数，并添加读写事件来与客户端进行数据的交换。
- 最后，Nginx 或客户端来主动关掉连接，到此，一个连接就寿终正寝了。

## Nginx 是如何实现高并发的

- 如果一个 server 采用一个进程(或者线程)负责一个request的方式，那么进程数就是并发数。那么显而易见的，就是会有很多进程在等待中。
- 而 Nginx 的异步非阻塞工作方式正是利用了这点等待的时间。在需要等待的时候，这些进程就空闲出来待命了。因此表现为少数几个进程就解决了大量的并发问题。
- 简单来说：每进来一个 request ，会有一个 worker 进程去处理。但不是全程的处理，处理到什么程度呢？处理到可能发生阻塞的地方，比如向上游（后端）服务器转发 request ，并等待请求返回。那么，这个处理的 worker 不会这么傻等着，他会在发送完请求后，注册一个事件：“如果 upstream 返回了，告诉我一声，我再接着干”。于是他就休息去了。此时，如果再有 request 进来，他就可以很快再按这种方式处理。而一旦上游服务器返回了，就会触发这个事件，worker 才会来接手，这个 request 才会接着往下走。
- 由于 web server 的工作性质决定了每个 request 的大部份生命都是在网络传输中，实际上花费在 server 机器上的时间片不多。这是几个进程就解决高并发的秘密所在

## 为什么 Nginx 不使用多线程

- Apache: 创建多个进程或线程，而每个进程或线程都会为其分配 cpu 和内存（线程要比进程小的多，所以 worker 支持比 perfork 高的并发），并发过大会榨干服务器资源。

- Nginx: 采用单线程来异步非阻塞处理请求（管理员可以配置 Nginx 主进程的工作进程的数量）(epoll)，不会为每个请求分配 cpu 和内存资源，节省了大量资源，同时也减少了大量的 CPU 的上下文切换。所以才使得 Nginx 支持更高的并发。

## Nginx 有哪些负载均衡策略

负载均衡，即是代理服务器将接收的请求均衡的分发到各服务器中

Nginx 默认提供了 3 种负载均衡策略

- 轮询（默认）round_robin

每个请求按时间顺序逐一分配到不同的后端服务器，如果后端服务器 down 掉，能自动剔除。

- IP 哈希 ip_hash

每个请求按访问 ip 的 hash 结果分配，这样每个访客固定访问一个后端服务器，可以解决 session 共享的问题。

当然，实际场景下，一般不考虑使用 ip_hash 解决 session 共享。

- 最少连接 least_conn

下一个请求将被分派到活动连接数量最少的服务器



## nginx缓存机制

> [参考](https://blog.csdn.net/qq_38796548/article/details/102782352?utm_medium=distribute.pc_relevant.none-task-blog-2~default~baidujs_title~default-0.no_search_link&spm=1001.2101.3001.4242)

> 什么是Web缓存技术

客户端第一次把请求发送给Nginx服务器，然后Nginx服务器代理请求发送给后端服务器进行处理，产生的数据直接返回给客户端，另外生成的数据副本存储在本地缓存中，等到下次客户端再次进行相同的请求时，Nginx服务器直接访问本地缓存数据副本并返回数据。

![](https://img-blog.csdnimg.cn/20191028155109264.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM4Nzk2NTQ4,size_16,color_FFFFFF,t_70)

> web缓存方案主要有哪些

-  404错误驱动Web缓存

当Nginx服务器在处理客户端请求时，发现请求的资源数据不存在，就会产生404错误，把404错误响应进行重定向，然后使用location块捕获重定向请求，向后端服务器发起请求获取响应数据传回给客户端，并同时缓存到本地上。

![](https://img-blog.csdnimg.cn/20191201210625236.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM4Nzk2NTQ4,size_16,color_FFFFFF,t_70)

-  资源不存在驱动web缓存

这种方式类似404错误驱动缓存，使用location 块if条件判断请求的资源在Nginx服务器上是否存在，如果不存在就访问后端服务器获取数据，回传给客户端，并使用proxy store进行缓存

-  memcached分布式缓存技术

memcached的分布式缓存系统，用于动态web应用，独立任一程序可以作为后台程序独立运行。 memcached是一个使用内存来为访问页面加速的模块

> memcached怎么工作

1.memcached服务器包括服务端和客户端，开辟一块内存建立Hash表，将缓存数据通过键/值存储在Hash表

2.当客户端请求到达nginx服务器时，nginx会先通过键值(比如说uri)，去访问memcached服务器,当能从memcached服务器Hash表获取到数据时，会直接将数据封装，返回给客户端 。

3.如不能从memcached服务器返回数据给客户端，则继续通过重定向访问后端服务器，获取响应数据返回给客户端，同时也缓存在memcached的Hash表。

![](https://img-blog.csdnimg.cn/20191201210929819.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM4Nzk2NTQ4,size_16,color_FFFFFF,t_70)

- Proxy Cache 缓存机制

1.Nginx接收到被代理服务器返回的响应数据时，一方面Proxy Buffer缓冲机制将数据发送给客户端，另一方面Proxy Cache缓存机制将数据缓存到本地磁盘上

2.下次客户端访问相同的数据时，Nginx服务器直接从硬盘上检索到响应的数据返回给用户，从而减少与被代理服务器交互的时间

![](https://img-blog.csdnimg.cn/20191201213027179.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM4Nzk2NTQ4,size_16,color_FFFFFF,t_70)




