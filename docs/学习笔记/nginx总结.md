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

惊群是指多个「进程/线程」在等待同一资源时，每当资源可用，所有的进程/线程都来竞争资源的现象。

Nginx 采用的是多进程的模式。假设Linux系统是2.6版本以前，当有一个客户端要连到Nginx服务器上，Nginx的N个进程都会去监听socket的accept的，如果全部的N个进程都对这个客户端的socket连接进行了监听，就会造成资源的竞争甚至数据的错乱。我们要保证的是，一个链接在Nginx的一个进程上处理，包括 accept 和 `read/write` 事件。


- Nginx的N个进程会争抢文件锁，当只有拿到文件锁的进程，才能处理accept的事件。
- 没有拿到文件锁的进程，只能处理当前连接对象的read事件
- 当单个进程总的connection连接数达到总数的7/8的时候，就不会再接收新的accpet事件。
- 如果拿到锁的进程能很快处理完accpet，而没拿到锁的一直在等待（等待时延：ngx_accept_mutex_delay），容易造成进程忙的很忙，空的很空

![](https://img-blog.csdn.net/20160821144404775?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)


### 具体的实现

**1. ngx_process_events_and_timers 进程事件分发器**

这个方法的主要作用：事件分发；惊群处理；简单的负载均衡。

负载均衡


- 当`ngx_accept_disabled`为正数的时候 (即当 `connection` 达到连接总数的 `7/8` 的时候)，`connection` 达到连接总数的 `7/8` 的时候，就不再处理新的连接`accept`事件，只处理当前连接的 `read` 事件。

惊群处理：

- 通过 ngx_trylock_accept_mutex 争抢文件锁，拿到文件锁的，才可以处理accept事件。
- ngx_accept_mutex_held是拿到锁的一个标志，当拿到锁了，flags会被设置成NGX_POST_EVENTS，这个标志会在事件处理函数 ngx_process_events 中将所有事件（accept和read）放入对应的ngx_posted_accept_events和ngx_posted_events队列中进行延后处理。
- 当没有拿到锁，调用事件处理函数 ngx_process_events 的时候，可以明确都是read的事件，所以可以直接调用事件 ev->handler 方法回调处理。
- 拿到锁的进程，接下来会优先处理ngx_posted_accept_events队列上的accept事件，处理函数：ngx_event_process_posted
- 处理完accept事件后，就将文件锁释放
- 接下来处理 ngx_posted_events 队列上的 read 事件，处理函数：ngx_event_process_posted

**ngx_process_events 事件的核心处理函数**

主要看epoll模型下的ngx_epoll_process_events方法 

- 如果抢到了锁，则会将accpet/read事件放到队列上延后处理。
- 没有抢到锁的进程都是处理当前连接的read事件，所以直接进行处理。

## Nginx的Event事件模块

### 重要数据结构

- ngx_listening_s：主要是监听套接字结构，存放socket的信息
- ngx_connection_s：存储连接有关的信息和读写事件。
- ngx_event_s：主要存放事件的数据结构。


### Nginx整个 TCP 连接的过程

- 在Nginx main函数的ngx_init_cycle()方法中，调用了ngx_open_listening_sockets函数，这个函数负责将创建的监听套接字进行套接字选项的设置（比如非阻塞、接受发送的缓冲区、绑定、监听处理）
- HTTP模块初始化优先于Event模块，HTTP模块通过ngx_http_block()方法进行初始化，然后调用ngx_http_optimize_servers()进行套接字的创建和初始化（ngx_http_init_listening、ngx_http_add_listening、ngx_create_listening）。根据每一个IP地址:port这种配置创建监听套接字。
- ngx_http_add_listening函数，还会将ls->handler监听套接字的回调函数设置为ngx_http_init_connection。ngx_http_init_connection此函数主要初始化一个客户端连接connection。
- Event模块的初始化主要调用ngx_event_process_init()函数。该函数每个worker工作进程都会初始化调用。然后设置read/write的回调函数。
- ngx_event_process_init函数中，会将接收客户端连接的事件，设置为rev->handler=ngx_event_accept方法，ngx_event_accept方法，只有在第一次客户端和Nginx服务端创建连接关系的时候调用。
- 当客户端有连接上来，Nginx工作进程就会进入事件循环（epoll事件循环函数：ngx_epoll_process_events），发现有read读取的事件，则会调用ngx_event_accept函数。
- 调用ngx_event_accept函数，会调用ngx_get_connection方法，得到一个客户端连接结构：ngx_connection_t结构。ngx_event_accept函数最终会调用监听套接字的handler回调函数，ls->handler(c);  。
- 从流程3中，我们知道ls->handler的函数对应ngx_http_init_connection方法。此方法主要初始化客户端的连接ngx_connection_t，并将客户端连接read读取事件的回调函数修改成rev->handler = ngx_http_wait_request_handler
- 也就是说，当客户端连接上来，第一次事件循环的read事件会调用回调函数：ngx_event_accept函数；而后续的read事件的handler已经被ngx_http_init_connection方法修改掉，改成了ngx_http_wait_request_handler函数了。所以客户端的读取事件都会走ngx_http_wait_request_handler函数。
- ngx_http_wait_request_handler函数也是整个HTTP模块的数据处理的入口函数了

![](https://img-blog.csdn.net/20161219100758401?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvaW5pdHBocA==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

## 常见面试题

> https://blog.csdn.net/a303549861/article/details/88672901

> https://blog.csdn.net/ningyuxuan123/article/details/86705631?utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromMachineLearnPai2%7Edefault-2.no_search_link&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromMachineLearnPai2%7Edefault-2.no_search_link

## nginx缓存机制

> https://blog.csdn.net/qq_38796548/article/details/102782352?utm_medium=distribute.pc_relevant.none-task-blog-2~default~baidujs_title~default-0.no_search_link&spm=1001.2101.3001.4242

## 如何处理一个 HTTP 请求的

> https://blog.51cto.com/quietmadman/1121348
>
> https://blog.csdn.net/initphp/article/details/54097919


## ngx_list_t数据结构

https://blog.51cto.com/sofar/1316475

https://segmentfault.com/a/1190000002764763

## 获取HTTP包体

HTTP包体的长度有可能非常大，如果试图一次性调用并读取完所有的包体，那么多半会阻塞Nginx进程。HTTP框架提供了一种方法来异步地接收包体

```
ngx_int_t ngx_http_read_client_request_body(ngx_http_request_t *r, ngx_http_client_body_handler_pt post_handler
```

