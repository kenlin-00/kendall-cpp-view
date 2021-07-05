

- [nginx 架构](#nginx-架构)
  - [nginx工作流程](#nginx工作流程)
    - [worker 进程是如何处理请求的呢](#worker-进程是如何处理请求的呢)
    - [nginx 采用这种进程模型有什么好处](#nginx-采用这种进程模型有什么好处)
    - [nginx 是如何处理事件](#nginx-是如何处理事件)
    - [为什么 nginx 可以采用异步非阻塞的方式来处理](#为什么-nginx-可以采用异步非阻塞的方式来处理)
    - [nginx 能能为什么高效](#nginx-能能为什么高效)
    - [nginx 为什么设置 worker 的个数为 cpu 的核数](#nginx-为什么设置-worker-的个数为-cpu-的核数)
    - [nginx 中的定时器](#nginx-中的定时器)
  - [nginx 是如何处理一个连接](#nginx-是如何处理一个连接)
    - [nginx中的request](#nginx中的request)
    - [nginx 是如何处理一个完整的请求的](#nginx-是如何处理一个完整的请求的)
  - [Nginx 基本数据结构](#nginx-基本数据结构)
    - [ngx_str_t](#ngx_str_t)

----------------------


# nginx 架构

nginx 在启动后，在 unix 系统中会以 daemon 的方式在后台运行,后台进程包含一个 master 进程和多个 worker 进程。我们也可以手动关掉后台模式，让 nginx 可以在前台运行，并且通过配置让 nginx 取消 maser 进程，从而可以使 nginx 以单进程方式运行。但是在生产环境中我们肯定不会这么做，我们一般关闭后台模式是为了用来调试用的。

nginx 支持多进程和多线程的方式，但是我们主流的方式还是多进程方式，也就是 nginx 的默认方式。

**master 进程和 worker 进程**

- master 进程主要用来管理 worker 进程，包含接受来自外界的信号，向各个 worker 进程发送信号，监控 worker 进程的运行状态，当 worker 进程退出后（异常情况下），会自动重新启动新的 worker 进程。
- worker 进程主要用来处理基本的网络事件。多个 worker 进程之间是对等的，它们同等竞争来自客户端的请求，各进程之间独立的。一个请求，只可能在一个 worker 进程中处理，一个 worker 进程，不可能处理其他进程请求。另外，worker 进程的个数是可以设置的，一般我们都会设置与机器 CPU 核数一致。可以通过下面命令查看 cpu 核数以及修改 worker 进程数

```bash
# 查看 CPU 核数
$ rep -c processor /proc/cpuinfo

# 设置worker进程数
$ vim /usr/local/nginx/conf/nginx.conf
worker_processes 2;
```
> nginx 为什么设置 worker 的个数为 cpu 的核数?[下文会解释]

这里面的原因与 nginx 的进程模型以及事件处理模型是分不开的。

nginx 的进程模型，可以由下图来表示：

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/nginx模型.2ek0a7oy5onw.png)

## nginx工作流程

nginx 启动后，master 来管理 worker 进程，所以我们只需要与 master 进行通信就可以了，master 进程会接收到来自外界发来的信号，再根据信号做不同的事情。所以我们要控制 nginx，只需要通过 kill 向 master 进程发送信号就可以了。

比如 `kill -HUP pid`,这就是告诉 nginx，从容地重启 nginx，我们一般用这个信号来重启 nginx，或重新加载配置，因为是从容地重启，因此服务是不中断的。

> master 进程在接收到 HUP 信号后是怎么做的呢？

首先 master 进程在接到信号后，会先重新加载配置文件，然后再启动新的 worker 进程，并向所有老的 worker 进程发送信号，告诉他们可以光荣退休了。新的 worker 在启动后，就开始接收新的请求，而老的 worker 在收到来自 master 的信号后，就不再接收新的请求，并且在当前进程中的所有未处理完的请求处理完成后，再退出。

当然也可以直接给 master 进程发送信号，这是比较老的操作方式，nginx 在 0.8 版本之后，引入了一系列命令行参数，来方便我们管理。比如，

- `./nginx -s reload`，就是来重启 nginx，
- `./nginx -s stop`，就是来停止 nginx 的运行。

我们拿 reload 来说，我们看到，执行命令时，我们是启动一个新的 nginx 进程，而新的 nginx 进程在解析到 reload 参数后，就知道我们的目的是控制 nginx 来重新加载配置文件了，它会向 master 进程发送信号，然后接下来的动作，就和我们直接向 master 进程发送信号一样了。

### worker 进程是如何处理请求的呢

我们知道 worker 进程之间是平等的，每个进程，处理请求的机会也是一样的。当我们提供 80 端口的 http 服务时，一个连接请求过来，每个进程都有可能处理这个连接，怎么做到的呢？

首先，每个 worker 进程都是从 master 进程 fork 过来，在 master 进程里面，先建立好需要 listen 的 socket（listenfd）之后，然后再 fork 出多个 worker 进程。所有 worker 进程的 listenfd 会在新连接到来时变得可读，为保证只有一个进程处理该连接，所有 worker 进程在注册 listenfd 读事件前抢 accept_mutex，抢到互斥锁的那个进程注册 listenfd 读事件，在读事件里调用 accept 接受该连接。当一个 worker 进程在 accept 这个连接之后，就开始读取请求，解析请求，处理请求，产生数据后，再返回给客户端，最后才断开连接，这样一个完整的请求就是这样的了。我们可以看到，一个请求，完全由 worker 进程来处理，而且只在一个 worker 进程中处理。[这就是 nginx 的进程模型]

### nginx 采用这种进程模型有什么好处

先，对于每个 worker 进程来说，独立的进程，不需要加锁，所以省掉了锁带来的开销，同时在编程以及问题查找时，也会方便很多。其次，采用独立的进程，可以让互相之间不会影响，一个进程退出后，其它进程还在工作，服务不会中断，master 进程则很快启动新的 worker 进程。
当然，worker 进程的异常退出，肯定是程序有 bug 了，异常退出，会导致当前 worker 上的所有请求失败，不过不会影响到所有请求，所以降低了风险。当然，好处还有很多，大家可以慢慢体会。

###  nginx 是如何处理事件

nginx 采用了异步非阻塞的方式来处理请求，也就是说，nginx 是可以同时处理成千上万个请求的。想想 apache 的常用工作方式（apache 也有异步非阻塞版本，但因其与自带某些模块冲突，所以不常用），每个请求会独占一个工作线程，当并发数上到几千时，就同时有几千的线程在处理请求了。这对操作系统来说，是个不小的挑战，线程带来的内存占用非常大，线程的上下文切换带来的 cpu 开销很大，自然性能就上不去了，而这些开销完全是没有意义的。

### 为什么 nginx 可以采用异步非阻塞的方式来处理
### nginx 能能为什么高效

首先，请求过来，要建立连接，然后再收数据，接收数据后，再发送数据。

具体到系统底层，就是读写事件，而当读写事件没有准备好时，必然不可操作，如果不用非阻塞的方式来调用，那就得阻塞调用了，事件没有准备，那就只能等待时事件准备好再继续。

阻塞调用则会进入内核等待， cpu 就会让出去给别的进程使用，对于单线程的 worker 来说，是不合适的，因为当网络事件越多时，大家都在等待，cpu 可能闲下来没有进程使用，CPU 利用率就会上不去，如果加进程数那和 apache 的线程模型就没什么区别了。


Nginx 采用的是**异步非阻塞**的事件处理机制，也就是像`selelct/poll/epoll`这样的系统调用，可以同时监控多个事件，调用它们是阻塞的，但是可以设置超时时间，在超时时间之内，如果有事件准备好了，如果有事件准备好了，就返回。

拿 epoll 为例，当事件没准备好时，放到 epoll 里面，事件准备好了，我们就去读写，当读写返回 EAGAIN 时，我们将它再次加入到 epoll 里面。这样，只要有事件准备好了，我们就去处理它，只有当所有事件都没准备好时，才在 epoll 里面等着。这样，我们就可以并发处理大量的并发了。

当然，这里的并发请求，是指未处理完的请求，线程只有一个，所以同时能处理的请求当然只有一个了，只是在请求间进行不断地切换而已，切换也是因为异步事件未准备好，而主动让出的。这里的切换是没有任何代价，你可以理解为循环处理多个准备好的事件，事实上就是这样的。与多线程相比，这种事件处理方式是有很大的优势的，不需要创建线程，每个请求占用的内存也很少，没有上下文切换，事件处理非常的轻量级。并发数再多也不会导致无谓的资源浪费（上下文切换）。更多的并发数，只是会占用更多的内存而已。 我之前有对连接数进行过测试，在 24G 内存
的机器上，处理的并发请求数达到过 200 万。现在的网络服务器基本都采用这种方式，**这也是 nginx 性能高效的主要原因**

### nginx 为什么设置 worker 的个数为 cpu 的核数

更多的 worker 数，只会导致进程来竞争 cpu 资源了，从而带来不必要的上下文切换。而且，nginx 为了更好的利用多核特性，提供了 cpu 亲缘性的绑定选项，我们可以将某一个进程绑定在某一个核上，这样就不会因为进程的切换带来 cache 的失效。比如，nginx 在做 4 个字节的字符串比较时，会将 4 个字符转换成一个 int 型，再作比较，以减少 cpu 的指令数等等。

### nginx 中的定时器

由于 epoll_wait 等函数在调用的时候是可以设置一个超时时间的，所以 nginx 借助这个超时时间来实现定时器。nginx 里面的定时器事件是放在一颗维护定时器的**红黑树**里面，每次在进入 epoll_wait 前，先从该红黑树里面拿到所有定时器事件的最小时间，在计算出 epoll_wait 的超时时间后进入 epoll_wait。所以，当没有事件产生，也没有中断信号时，epoll_wait 会超时，也就是说，定时器事件到了。这时，nginx 会检查所有的超时事件，将他们的状态设置为超时，然后再去处理网络事件。

由此可以看出，当我们写 nginx 代码时，在处理网络事件的回调函数时，通常做的第一个事情就是判断超时，然后再去处理网络事件。

通过下面的伪代码来看看 nginx 的事件处理模型

```c
while (true) {
    for t in run_tasks:
        t.handler();
    update_time(&now);
    timeout = ETERNITY;
    for t in wait_tasks: /* sorted already */
    if (t.time <= now) {
        t.timeout_handler();
    } else {
        timeout = t.time - now;
        break;
    }
    nevents = poll_function(events, timeout);
    for i in nevents:
    task t;
    if (events[i].type == READ) {
        t.handler = read_handler;
    } else { /* events[i].type == WRITE */
        t.handler = write_handler;
    }
    run_tasks_add(t);
}
```

##  nginx 是如何处理一个连接

在 nginx 中 connection 就是对 tcp 连接的封装，其中包括连接的 socket，读事件，写事件。利用 nginx 封装的 connection，我们可以很方便的使用 nginx 来处理与连接相关的事情，比如，建立连接，发送与接受数据等。而 nginx 中的 http 请求的处理就是建立在 connection
之上的，所以 nginx 不仅可以作为一个 web 服务器，也可以作为邮件服务器。当然，利用nginx 提供的 connection，我们可以与任何后端服务打交道。

> 那么 nginx 是如何处理一个连接的呢？

首先，nginx 在启动时，会解析配置文件，得到需要监听的端口与 ip 地址，然后在 nginx 的 master 进程里面，先初始化好这个监控的 socket(创建 socket，设置 addrreuse 等选项，绑定到指定的 ip 地址端口，再 listen)，然后再 fork 出多个子进程出来，然后子进程会竞争 accept 新的连接。此时，客户端就可以向nginx发起连接了。当客户端与服务端通过三次握手建立好一个连接后，nginx 的某一个子进程会 accept 成功，得到这个建立好的连接的 socket，然后创建 nginx 对连接的封装，即 ngx_connection_t 结构体。接着，设置读写事件处理函数并添加读写事件来与客户端进行数据的交换。最后，nginx 或客户端来主动关掉连接。

当然，nginx 也是可以作为客户端来请求其它 server 的数据的（如 upstream 模块），此时，与其它 server 创建的连接，也封装在 ngx_connection_t 中。作为客户端，nginx 先获取一个 ngx_connection_t 结构体，然后创建 socket，并设置 socket 的属性（ 比如非阻塞）。然后再通过添加读写事件，调用 connect/read/write 来调用连接，最后关掉连接，并释放 ngx_connection_t。

在 nginx 中，每个进程会有一个连接数的最大上限，这个上限与系统对 fd 的限制不一样。在操作系统中，通过 ulimit -n，我们可以得到一个进程所能够打开的 fd 的最大数，即nofile，因为每个 socket 连接会占用掉一个 fd，所以这也会限制我们进程的最大连接数，当然也会直接影响到我们程序所能支持的最大并发数，当 fd 用完后，再创建 socket 时，就会失败。nginx 通过设置 worker_connectons 来设置每个进程支持的最大连接数。如果该值大于nofile，那么实际的最大连接数是 nofile，nginx 会有警告。nginx 在实现时，是通过一个连接池来管理的，每个worker进程都有一个独立的连接池，连接池的大小是worker_connections。
这里的连接池里面保存的其实不是真实的连接，它只是一个 worker_connections 大小的一个ngx_connection_t 结构的数组。并且，nginx 会通过一个链表 free_connections 来保存所有的空闲 ngx_connection_t，每次获取一个连接时，就从空闲连接链表中获取一个，用完后，再放回空闲连接链表里面。

在这里，很多人会误解 worker_connections 这个参数的意思，认为这个值就是 nginx 所能建立连接的最大值。其实不然，这个值是表示每个 worker 进程所能建立连接的最大值，所以，一个 nginx 能建立的最大连接数，应该是 worker_connections * worker_processes。当然，这里说的是最大连接数，对于 HTTP 请求本地资源来说，能够支持的最大并发数量是worker_connections * worker_processes，而如果是 HTTP 作为反向代理来说，最大并发数量应该是 worker_connections * worker_processes/2。因为作为反向代理服务器，每个并发会建立与客户端的连接和与后端服务的连接，会占用两个连接。

那么，我们前面有说过一个客户端连接过来后，多个空闲的进程，会竞争这个连接，很容易看到，这种竞争会导致不公平，如果某个进程得到 accept 的机会比较多，它的空闲连接很快就用完了，如果不提前做一些控制，当 accept 到一个新的 tcp 连接后，因为无法得到空闲连接，而且无法将此连接转交给其它进程，最终会导致此 tcp 连接得不到处理，就中止掉了。很显然，这是不公平的，有的进程有空余连接，却没有处理机会，有的进程因为没有空余连接，却人为地丢弃连接。那么，如何解决这个问题呢？首先，nginx 的处理得先打开accept_mutex 选项，此时，只有获得了 accept_mutex 的进程才会去添加 accept 事件，也就是说，nginx 会控制进程是否添加 accept 事件。nginx 使用一个叫 ngx_accept_disabled 的变量来控制是否去竞争 accept_mutex 锁。在第一段代码中，计算 ngx_accept_disabled 的值，这个值是 nginx 单进程的所有连接总数的八分之一，减去剩下的空闲连接数量，得到的这个ngx_accept_disabled 有一个规律，当剩余连接数小于总连接数的八分之一时，其值才大于 0，而且剩余的连接数越小，这个值越大。再看第二段代码，当 ngx_accept_disabled 大于 0 时，不会去尝试获取 accept_mutex 锁，并且将 ngx_accept_disabled 减 1，于是，每次执行到此处时，都会去减 1，直到小于 0。不去获取 accept_mutex 锁，就是等于让出获取连接的机会，
很显然可以看出，当空余连接越少时，ngx_accept_disable 越大，于是让出的机会就越多，这样其它进程获取锁的机会也就越大。不去 accept，自己的连接就控制下来了，其它进程的连接池就会得到利用，这样，nginx 就控制了多进程间连接的平衡了。

```c
ngx_accept_disabled = ngx_cycle->connection_n / 8
    - ngx_cycle->free_connection_n;
if (ngx_accept_disabled > 0) {
    ngx_accept_disabled--;
} else {
    if (ngx_trylock_accept_mutex(cycle) == NGX_ERROR) {
        return;
    }
    if (ngx_accept_mutex_held) {
        flags |= NGX_POST_EVENTS;
    } else {
        if (timer == NGX_TIMER_INFINITE
        || timer > ngx_accept_mutex_delay)
        {
            timer = ngx_accept_mutex_delay;
        }
    }
}
```

### nginx中的request

这里的 request，在 nginx 中我们指的是 http 请求，具体到 nginx 中的数据结构是 `ngx_http_request_t`。`ngx_http_request_t` 是对一个 http 请求的封装。 我们知道，一个 http 请求，包含请求行、请求头、请求体、响应行、响应头、响应体。

http 请求是典型的 请求-响应 类型的的网络协议，而 http 是文件协议，所以我们在分析请求行与请求头，以及输出响应行与响应头，往往是一行一行的进行处理。如果我们自己来写一个 http 服务器，通常在一个连接建立好后，客户端会发送请求过来。然后我们读取一行数据，分析出请求行中包含的 method、uri、http_version 信息。然后再一行一行处理请求头，并根据请求 method 与请求头的信息来决定是否有请求体以及请求体的长度，然后再去读取请求体。得到请求后，我们处理请求产生需要输出的数据，然后再生成响应行，响应头以及响应体。在将响应发送给客户端之后，一个完整的请求就处理完了。当然这是最简单的 ebserver 的处理方式，其实 nginx 也是这样做的，只是有一些小小的区别，比如，当请求头读取完成后，就开始进行请求的处理了。nginx 通过 ngx_http_request_t 来保存解析请求与输出响应相关的数据。

```c
typedef struct ngx_http_request_s     ngx_http_request_t;
```

###  nginx 是如何处理一个完整的请求的

对于 nginx 来说，一个请求是从 `ngx_http_init_request` 开始的，在这个函数中 ，会设置读事件为 `ngx_http_process_request_line` ，也就是说 ，接下来的网络事件，会由 `ngx_http_process_request_line` 来执行。从 `ngx_http_process_request_line` 的函数名，我们可以看到，**这就是来处理请求行的**，正如之前讲的，处理请求的第一件事就是处理请求行是一致的。通过 `ngx_http_read_request_header` 来读取请求数据。然后调用`ngx_http_parse_request_line` 函数来解析请求行。

nginx 为提高效率，采用**状态机**来解析请求行，而且在进行 method 的比较时，**没有直接使用字符串比较，而是将请求行的四个字符转换成一个整型，然后一次比较以减少 cpu 的指令数**。很多人可能很清楚一个请求行包含 **请求的方法、uri、版本**，却不知道其实在请求行中，也是可以包含有 **host** 的。

比如一个请求 GET `https://www.0voice.com/v1/website/linux/second/course` 这样一个请求行也是合法的，而且 host 是 `www.0voice.com`，这个时候，nginx 会忽略请求头中的 host 域，而以请求行中的这个为准来查找虚拟主机。另外，对于对于` http0.9` 版来说，是不支持请求头的，所以这里也是要特别的处理。所以，在后面解析请求头时，协议版本都是 1.0 或 1.1。整个请求行解析到的参数，会保存到 `ngx_http_request_t` 结构当中。

在解析完请求行后，nginx 会设置读事件的 handler 为 `ngx_http_process_request_headers` ，然后后续的请求就在`ngx_http_process_request_headers` 中进行读取与解析。`ngx_http_process_request_headers` 函数用来读取请求头，跟请求行一样，还是调用`ngx_http_read_request_header` 来读取请求头，调用 `ngx_http_parse_header_line` 来解析一行请求头，解析到的请求头会保存到`ngx_http_request_t`的域`headers_in`中，`headers_in` 是一个链表结构，保存所有的请求头。而 HTTP 中有些请求是需要特别处理的，这些请求头与请求处理函数存放在一个映射表里面，即 `ngx_http_headers_in`，在初始化时，会生成一个 hash 表，当每解析到一个请求头后，就会先在这个 hash 表中查找，如果有找到，则调用相应的处理函数来处理这个请求头。比如: Host 头的处理函数是`ngx_http_process_host`。

当 nginx 解析到两个回车换行符时，就表示请求头的结束，此时就会调用 `ngx_http_process_request` 来处理请求了。`ngx_http_process_request` 会设置当前的连接的读写事件处理函数为 `ngx_http_request_handler` ，然后再调用 `ngx_http_headler` 来真正开始处理一个完整的 HTTP 请求。

这里可能会比较奇怪，读写事件处理函数都是 ngx_http_request_handler ，其实在这个函数中，会根据当前事件时读事件还是写事件，分别调用 ngx_http_request_t 中的 read_event_handler 或者是 write_event_handler，由于此时，我们的请求头已经请求完成了，前面说过，nginx 的做法是先不读请求 body,所以这里我们设置 write_event_handler 为 ngx_http_block_reading,即不读数据了。

真正开始处理数据，是在 ngx_http_headler 这个函数里面，这个函数会设置 write_event_handler 为 ngx_http_core_run_phases ，并执行 ngx_http_core_run_phases 函数。ngx_http_core_run_phases 这个函数将执行多阶段请求处理，nginx 将一个 http 请求处理分成多个阶段，那么这个函数就是执行这些阶段来产生数据的，因为 ngx_http_core_run_phases 最后会产生数据，所以我们就很容易理解，为什么设置写事件的处理函数为 ngx_http_core_run_phases 了。

函数的调用逻辑

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/nginx-http1.ut44gc5rss0.png)
![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/nginx-http2.285loc43fonw.png)

我们需要明白最终是调用 ngx_http_core_run_phases 来处理请求，产生的响应头会放在 ngx_http_request_t 的 headers_out 中，这一部分内容，我会放在请求处理流程里面去讲。nginx 的各种阶段会对请求进行处理，最后会调用 filter 来过滤数据，对数据进行加工，如 truncked 传输、gzip 压缩等。这里的 filter 包括 header filter 与 body filter，即对响应头或响应体进行处理。filter 是一个链表结构，分别有 header filter 与 body filter，先执行 header filter 中的所有 filter，然后再执行 body filter 中的所有filter。在header filter中的最后一个filter，即 ngx_http_header_filter ，这个 filter 将会遍历所有的响应头，最后需要输出的响应头在一个连续的内存，然后调用 ngx_http_write_filter 进行输出。ngx_http_write_filter 是 body filter 中的最
后一个，所以 nginx 首先的 body 信息，在经过一系列的 body filter 之后，最后也会调用 ngx_http_write_filter 来进行输出

这里要注意的是，nginx 会将整个请求头都放在一个 buffer 里面，这个 buffer 的大小通过配置项 client_header_buffer_size 来设置，如果用户的请求头太大，这个 buffer 装不下，那 nginx 就会重新分配一个新的更大的 buffer 来装请求头，这个大 buffer 可以通过 large_client_header_buffers 来设置，这个 large_buffer 这一组 buffer，比如配置 48k，就是表示有四个 8k 大小的 buffer 可以用。

注意，为了保存请求行或请求头的完整性，一个完整的请求行或请求头，需要放在一个连续的内存里面，所以，一个完整的请求行或请求头，只会保存在一个 buffer 里面。这样，如果请求行大于一个 buffer 的大小，就会返回 414 错误，如果一个请求头大小大于一个 buffer 大小，就会返回 400 错误。在了解了这些参数的值，以及 nginx 实际的做法之后，在应用场景，我们就需要根据实际的需求来调整这些参数，来优化我们的程序了。

以上这些，就是 nginx 中一个 http 请求的生命周期了


## Nginx 基本数据结构

### ngx_str_t

在 nginx 源码目录的 `src/core` 下面的 `ngx_string.h|c` 里面，包含了字符串的封装以及字符串相关操作的 api 。nginx 提供了一个带长度的字符串结构 `ngx_str_t`，它的原型如下:

```c
typedef struct {
    size_t      len;
    u_char     *data;
} ngx_str_t;
```




