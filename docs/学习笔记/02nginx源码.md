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

 ## 内存池 `ngx_palloc.c`
 
 