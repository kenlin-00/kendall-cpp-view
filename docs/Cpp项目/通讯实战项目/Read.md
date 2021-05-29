> 本项目是基于 C++ 开发的一套网络通信框架，适合用于客户端和服务器之间保持 TCP 长连接，并且两端之间数据收发不算太频繁的应用场景，比如网络游戏服务器等。

> 项目中大部分实现思路参考了 nginx 官网实现。由于本人也是学习者，因此源码中加了很多注释。

> 在 I/O 多路复用部分 以了一位网友【[王博靖](https://github.com/wangbojing/NtyTcp)】自己写的一套 Epoll 源码为入口，通过阅读源码学习了 Epoll 函数内部的实现原理，并参考其思想引入到本项目中。



### 配置文件处理

配置文件处理函数调用逻辑图如下：

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/通信框架-加载配置文件01.1p4vsvly55gg.png)

#### 设置进程名称

**进程名称实际上是保存在 argc[0] 所指向的内存中**。CMD 会把 argv 所指向的命令参数全部显示出来，因为 `./nginx`是保存在 `argv[0]`中，所以 `argv[0]`改变，进程名也就改变了。

> 通过将 环境变量信息 迁移至新的内存，来解决设置的进程名称的长度大于字符串 `./nginx`的长度，可能导致设置的进程名称覆盖其他参数 的问题

修改进程名称在 `ngx_setproctitle()` 函数实现。

**该函数的大致逻辑**

- 计算进程名称的长度

- 计算命令行参数所占内存与环境变量所占内存的总和

- 设置新的进程名称

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/通信框架-更改运行程序名.1npok0l7nujk.png)

### 日志打印实现

`void   ngx_log_stderr(int err, const char *fmt, ...);`

- 该函数支持把错误码转换成对应的错误字符串，追加到要显示的字符串末尾

- `ngx_cpymem`: 该函数的功能类似于 `memcpy`,但是 `memcpy` 返回的是指向目标 dst 的指针，而`ngx_cpymem`返回的是目标（复制后的数据）的终点位置，因为有了这个位置后，后续继续复制数据时就很方便了。

- `ngx_vslprintf`: 功能相当于系统的 `printf` 函数

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/通信框架-日志打印01.69qcjx2373c0.png)

### 信号功能实现

`ngx_init_signals` 函数：用于初始化信号，内部调用系统函数 `sigaction` 来设置信号处理函数。

#### 怎么创建 worker 子进程
 
 `ngx_process_cycle.cxx` 文件实现开启子进程，其中`ngx_master_process_cycle()`实现了如何创建 worker 子进程，该函数实现逻辑：

 - 设置 master 进程的进程名称
 - 从配置文件中读取要创建的 worker 进程的数量信息（4个）
 - 接着调用 `ngx_start_worker_processes` 函数创建子进程（4个）
  
> 利用 **for 循环创建多个子进程**，每循环一次就调用一次  `ngx_spawn_process` 函数，`ngx_spawn_process` 中调用 fork 创建子进程，每个子进程分子都会接着调用 `ngx_worker_process_cycle()` 函数。	
> 			
>  `ngx_start_worker_processes` 函数取消对所有信号的屏蔽，为子进程设置标题，利用一个 for 无限循环，保证子进程执行流程一直在这个无限循环中
> 
> 在正常状态下，master 进程会一直在`ngx_master_process_cycle()` 中的 for 无限循环中循环

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/通信框架-创建worker进程01.30vdiuqy0yk0.png)

在 master 进程和 worker 进程函数的 无限循环代码中增加一条日志输出，**解决日志混乱问题**

### 守护进程的实现

`ngx_deamon.cxx` 文件实现守护进程。`ngx_deamon()` 是核心函数，

> 其中解决了避免子进程编程僵尸进程的问题

### 关于 Epoll的实现部分

