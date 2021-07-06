
> 这段时间参考 nginx 源码，自己基于 C++ 实现了一套 网络服务器通信框架，适合用于客户端和服务器之间保持 TCP 长连接，并且两端之间数据收发不算太频繁的应用场景，比如**网络游戏服务器，视频会议，安防或者农业环境实时监控场景**等。**项目源码以及详细解析后期会计划开源，尽情期待....**

*关于项目：目前正在实习，还在准备校招，平时比较忙，写得比较仓促，所以暂时先不在这里公开。后期会整理出一套系统的文档，并对项目中各个函数以及模块进行详细解析*



本系列为自己 Nginx 源码学习总结：

> 白话+小白 模式分析，大佬勿喷，如有不对期待批评指正				
> 我都能看懂，你这么优秀肯定也看得懂啦 [逃~~~]


- [Nginx架构](https://zhuanlan.zhihu.com/p/386479295)
- [Nginx 连接和 http 请求](https://zhuanlan.zhihu.com/p/386587001)
- [Epoll是个怎样子的](https://zhuanlan.zhihu.com/p/386976758)



----


执行配置文件

```
./sbin/nginx - conf/nginx.conf
```

执行这条命令的时候是从 `nginx.`c 下的 main 函数开始

```c
if (ngx_process == NGX_PROCESS_SINGLE) {
	ngx_single_process_cycle(cycle);

} else {
	ngx_master_process_cycle(cycle);
}
````

```c
static void
ngx_start_worker_processes(ngx_cycle_t *cycle, ngx_int_t n, ngx_int_t type)
{
	...

    for (i = 0; i < n; i++) {

        ngx_spawn_process(cycle, ngx_worker_process_cycle,
                          (void *) (intptr_t) i, "worker process", type);

        ch.pid = ngx_processes[ngx_process_slot].pid;
        ch.slot = ngx_process_slot;
        ch.fd = ngx_processes[ngx_process_slot].channel[0];

        ngx_pass_open_channel(cycle, &ch);
    }
}

```
`void ngx_single_process_cycle(ngx_cycle_t *cycle)` 这个函数就开始可 work 进程,函数中 for  循环的 n 就是 worker 进程数。对应下面配置文件中的参数。

 `WorkerProcesses = 1` 

 那么源码是怎么关联到这个 WorkerProcesses 的呢？

读取配置文件

```c
    { ngx_string("worker_processes"),
      NGX_MAIN_CONF|NGX_DIRECT_CONF|NGX_CONF_TAKE1,
      ngx_set_worker_processes,
      0,
      0,
      NULL },
```

接着调用 ngx_set_worker_processes

```cpp
ccf->worker_processes = ngx_atoi(value[1].data, value[1].len);
```

将配置文件中的字符转成 int 类型，然后赋值给 worker_processes，


`ngx_master_process_cycle(ngx_cycle_t *cycle) `

中 

`ngx_start_worker_processes(cycle, ccf->worker_processes,
                               NGX_PROCESS_RESPAWN);`


创建进程




```c
//子进程执行的地方
ngx_spawn_process(cycle, ngx_worker_process_cycle,
                          (void *) (intptr_t) i, "worker process", type);

static void
ngx_worker_process_cycle(ngx_cycle_t *cycle, void *data)
//中
ngx_process_events_and_timers(cycle);
//是处理所有事件
ngx_process_events_and_timers(ngx_cycle_t *cycle)

(void) ngx_process_events(cycle, timer, flags);
#define ngx_process_events   ngx_event_actions.process_events
//找不到了，搜索ngx_event_actions
// ngx_epoll_module.c 中
ngx_event_actions = ngx_epoll_module_ctx.actions;

static ngx_event_module_t  ngx_epoll_module_ctx = {
    &epoll_name,
    ngx_epoll_create_conf,               /* create configuration */
    ngx_epoll_init_conf,                 /* init configuration */

    {
        ngx_epoll_add_event,             /* add an event */
        ngx_epoll_del_event,             /* delete an event */
        ngx_epoll_add_event,             /* enable an event */
        ngx_epoll_del_event,             /* disable an event */
        ngx_epoll_add_connection,        /* add an connection */
        ngx_epoll_del_connection,        /* delete an connection */
#if (NGX_HAVE_EVENTFD)
        ngx_epoll_notify,                /* trigger a notify */
#else
        NULL,                            /* trigger a notify */
#endif
        ngx_epoll_process_events,        /* process the events */
        ngx_epoll_init,                  /* init the events */
        ngx_epoll_done,                  /* done the events */
    }
};

上面这些就是一个 reactor，添加删除时间，添加删除连接
```

reactor 是将 io 管理 转化成 事件管理

实现一个 handler 模块

在 nginx 做一个统计，统计每个客户端的链接数





----------