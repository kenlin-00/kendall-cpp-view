> 参考：https://blog.csdn.net/yangyin007/article/details/82777086

------

## nginx的架构

Nginx 的源码主要分布在`src/`目录下，而`src/`目录下主要包含三部分比较重要的模块。

- core：包含了 Nginx 的最基础的库和框架。包括了内存池、链表、hashmap、String 等常用的数据结构。
- event：事件模块。Nginx 自己实现了事件模型。而我们所熟悉的 Memcached 是使用了 Libevent 的事件库。自己实现 event 会性能和效率方便更加高效。
- http：实现 HTTP 的模块。实现了HTTP的具体协议的各种模块，该部分内容量比较大。

### nginx 进程结构

Nginx 是一款多进程的软件。Nginx 启动后，会产生一个 master 进程和 N 个工作进程。其中 `nginx.conf` 中可以配置工作进程的个数：

```
worker_processes  1;
```

 多进程模块有一个非常大的好处，就是不需要太多考虑并发锁的问题

 ![](https://img-blog.csdn.net/20160127165343223?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

 ![](https://pic4.zhimg.com/80/v2-9f728a1841b9d7136755629122c504ff_1440w.jpg)


 Master进程是管理员直接控制的，也只有 Master 进行接受管理员信号，一个Master用户可以fork多个 Worker 进程，一个 Worker 进程可以响应多个用户请求。

- Master进程负责加载配置文件，启动worker进程和平滑升级。
- Worker进程处理并响应用户的请求。



 ## 内存池 `ngx_palloc.c`
 
 ### 内存池的好处

- 提升内存分配效率。不需要每次分配内存都执行 `malloc/alloc` 等函数。
- 内存的管理变得更加简单。内存的分配都会在一块大的内存上，回收的时候只需要回收大块内存就能将所有的内存回收，防止了内存管理混乱和内存泄露问题。


一个内存池中分为两个部分：

内存分配逻辑:

分配一块内存，如果分配的内存size小于内存池的pool->max的限制，则属于小内存块分配，走小内存块分配逻辑；否则走大内存分配逻辑。

- 小内存分配逻辑：循环读取 pool->d 上的内存块，是否有足够的空间容纳需要分配的size，如果可以容纳，则直接分配内存；否则内存池需要申请新的内存块，调用ngx_palloc_block。

- 大内存分配逻辑：当分配的内存size大于内存池的 pool->max 的限制，则会直接调用ngx_palloc_large 方法申请一块独立的内存块，并且将内存块挂载到pool->large的链表上进行统一管理。


### ngx_pool_data_t

> 可以讲 ngx_pool_data_t 有一个 failed 成员

每个 ngx_pool_t 结构体的 meta 元数据是存储在 `ngx_pool_data_t` 这个结构体中

```c
u_char *last：指向分配空间的可用空间。
u_char *end：指向分配空间的最后位置。
ngx_pool_t *next：指向下一个 ngx_pool_t 指针。
ngx_uint_t failed：存储本 ngx_pool_t 结构体分配失败次数。
```

![](https://cdn.jsdelivr.net/gh/lichuang/lichuang.github.io/media/imgs/20190214-nginx-memory-pool/ngx_pool_data_t.png)

failed 成员的引入是为了避免某个 pool 虽然还有可用的空间，但是由于空间很小了所以经常性的分配空间失败，当累计失败的次数达到某个阈值时，下一次再次查找内存就直接跳过这个pool，而去寻找内存池链表中的下一个 pool。


### ngx_pool_large_t

ngx_pool_large_t 结构体用于保存大内存块，这一块就比较简单粗暴了，直接分配一块大内存来使用。另外，多个大内存块之间也是以链表形式来组织数据。

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

cleanup机制 可以回调函数清理数据

Nginx的内存池cleanup机制，设计的非常巧妙。pool->cleanup本身是一个链表，每个ngx_pool_cleanup_t的数据结构上，保存着内存数据的本身cleanup->data和回调清理函数cleanup->handler。

通过cleanup的机制，我们就可以在内存池上保存例如文件句柄fd的资源。当我们调用ngx_destroy_pool方法销毁内存池的时候，首先会来清理pool->cleanup，并且都会执行c->handler(c->data)回调函数，用于清理资源。

Nginx的这个机制，最显著的就是让文件描述符和需要自定义清理的数据的管理变得更加简单。

## 双向链表结构

