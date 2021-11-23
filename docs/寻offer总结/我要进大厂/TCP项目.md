
- [内存池设计](#内存池设计)
  - [单块内存 io_buf](#单块内存-io_buf)
  - [内存池提供的接口](#内存池提供的接口)
  - [单例模式的连接池](#单例模式的连接池)
  - [从内存池中申请一块内存](#从内存池中申请一块内存)
  - [将一个 io_buf 放回到内存池中](#将一个-io_buf-放回到内存池中)
  - [读写 buffer 机制](#读写-buffer-机制)
- [日志混乱掉电问题解决](#日志混乱掉电问题解决)
  - [日志混乱问题](#日志混乱问题)
  - [解决日志丢失问题](#解决日志丢失问题)
    - [fwrite 和 write 有什么区别](#fwrite-和-write-有什么区别)
    - [fwrite 实现原理](#fwrite-实现原理)
- [I/O 多路复用技术](#io-多路复用技术)
  - [select/poll](#selectpoll)
  - [epoll](#epoll)
  - [epoll_create 函数](#epoll_create-函数)
  - [epoll_ctl 函数](#epoll_ctl-函数)
  - [epoll_wait 函数](#epoll_wait-函数)
- [向内核双链表增加节点](#向内核双链表增加节点)
  - [边缘触发和水平触发](#边缘触发和水平触发)
- [压力测试](#压力测试)
  - [Webbench实现的核心原理](#webbench实现的核心原理)
- [压力测试 Bug 排查](#压力测试-bug-排查)
  - [排查过程](#排查过程)
  - [listen](#listen)
    - [connect](#connect)
    - [accept](#accept)
    - [定位 accept](#定位-accept)
    - [Epoll的ET、LT](#epoll的etlt)
    - [代码分析解决](#代码分析解决)
    - [Bug原因](#bug原因)
- [说一下项目为什么这么设计](#说一下项目为什么这么设计)
- [TCP粘包问题](#tcp粘包问题)
- [服务器安全专题](#服务器安全专题)
  - [心跳包机制](#心跳包机制)
  - [如何处理不发送心跳包的客户端](#如何处理不发送心跳包的客户端)

-----------

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


### 单例模式的连接池

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

## 日志混乱掉电问题解决

实验室 --> 日志混乱 -->  实验室断电了 --> 日志丢失


### 日志混乱问题

**设置缓冲同步**

这是最推荐的方法，项目中也是使用这种方法

这里涉及到 3 个函数：`sync`,`fsync`,`fdatasync`

(1) `sync(void)`: 将所有修改过的块缓冲区排入写队列，然后立即返回，不等待实际写磁盘操作。但是数据是否写入磁盘并没有保障

(2) `fsync(int fd)`: 将 fd 对应文件的缓冲区立即写入磁盘，并将等待实际写磁盘操作结束后返回。可用于数据库这样的应用程序，因为这种应用程序需要确保修改过的数据理解写到磁盘上。

(3) `fdatasync(int fd)`: 类似于 fsync，但只影响文件的数据部分。除数据外，fsync 还会同步更新文件属性（如文件大小，文件访问时间等。文件属性和文件内容是分开存储的，写磁盘会涉及 2 次寻道）。所以 `fdatasync`比 `fsync` 速度更快。

### 解决日志丢失问题

我们采取的方法是：

调用多次 write 函数，再调用 1 次 fsync 函数，因为频繁调用 fsync 函数效率会很低。

如果文件很大，就都写完，然后再调用 1 次 fsync 函数

比如：还有如果整个文件需要调用 write 函数 10 次才能写完，那么每写 1 次，就调用 fsync 函数 1 次意义就不大， 所以应该写 10 次后，再调用 fsync 函数 1 次。

> 本项目中写日志使用 write 系统调用，工作没有问题，当时还尝试了使用 fwrite 来写日志，就会出现日志混乱问题。

#### fwrite 和 write 有什么区别

read write 这类函数时属于 **系统调用**，

而 fwrite printf 属于标准 IO 库里面的函数，**内部实现有缓冲区的，此时写日志可能就要用到锁机制**。

#### fwrite 实现原理

当调用 fwrite 函数的时候，写入的内容会被放入一个系统的 CLib 缓冲区中（可以理解成 stdio 这个库里面提供的缓冲区）。当 CLib 缓冲区满之后，会将内容移至内核缓冲区。所以这里相当于在应用程序和内核之间加了一层。所以 IO 库函数相当于一层用于缓存，最终还是调用底层 IO，也就是系统调用来实现相关功能。

所谓的缓存就是内存，用于在输入输出设备和 CPU 之间临时保存数据，使低速输入输出设备和高速输入输出设备能够协调工作，避免低速的输入输出设备占用 CPU，解放出 CPU，使其能够高效工作。

> [参考](https://zhuanlan.zhihu.com/p/269247362)



## I/O 多路复用技术

 `I/O` 多路复用技术就是用一个进程来维护多个 `Socket`。

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/IO复用01.4ns3czhz0sk0.png)


一个进程虽然任一时刻只能处理一个请求，但是处理每个请求的事件时，耗时控制在 1 毫秒以内，这样 1 秒内就可以处理上千个请求，把时间拉长来看，多个请求复用了一个进程，这就是多路复用。

比较常见的多路复用技术有 `select/poll/epoll`


### select/poll

`select` 将已连接的 `Socket` 都放到一个文件描述符集合，然后调用 `select` 函数将文件描述符集合拷贝到内核里，让内核来检查是否有网络事件产生，检查的方式很粗暴，就是通过遍历文件描述符集合的方式，当检查到有事件产生后，将此 `Socket` 标记为可读或可写， 接着再把整个文件描述符集合拷贝回用户态里，然后用户态还需要再通过遍历的方法找到可读或可写的 `Socket`，然后再对其处理。

所以，对于 `select` 这种方式，需要进行 **2 次「遍历」文件描述符集合**，一次是在内核态里，一个次是在用户态里 ，而且还会发生 **2 次「拷贝」文件描述符**集合，先从用户空间传入内核空间，由内核修改后，再传出到用户空间中。

`select` 所支持的文件描述符的个数是有限制的，在 Linux 系统中，由内核中的 `FD_SETSIZE` 限制， 默认最大值为 `1024`。

`poll` 以链表形式来组织文件描述符，解决了 `select` 的文件描述符个数限制的问题，当然还会受到系统文件描述符限制。

但是 `poll` 和 `select` 并没有太大的本质区别，都是使用「线性结构」存储进程关注的 `Socket` 集合，因此都需要遍历文件描述符集合来找到 可读 或 可写 的 `Socket`，时间复杂度为 `O(n)`，而且也需要在 用户态 与 内核态 之间拷贝文件描述符集合，这种方式随着并发数上来，性能的损耗会呈指数级增长。

### epoll

**Epoll 就是一种在 Linux 上使用的 IO 多路复用并支持高并发的典型技术**。

比如说有 10 万个并发连接（也就是同一时刻有 10 万个客户端保持和服务器的连接），这 10 万个连接通常也不可能同一时刻都在收发数据，一般在**同一时刻通常只有其中几十个或者几百个连接在收发数据，其他连接可能处于只连接而没有收发数据的状态**。

如果以 100ms 为间隔判断一次，可能这 100ms 内只有 100 个活跃连接（就是有数据收发的连接），把这 100 个活跃连接的数据放在一个专门的地方，后续到这个专门的地方来，只需要处理 100 条数据，处理起来的压力就没那么大了。

这也就是 Epoll 的处理方式。而 select 和 poll 是依次判断这 10w 个连接有没有收发数据（可能实际上有数据的只有 100 个连接），有数据就处理。所以不难看出每次检查 10w 个连接与每次检查 100 个连接相比，浪费了巨大的资源和时间。

> 实际上，`epoll` 在内核里使用红黑树来跟踪进程所有待检测的文件描述符，把需要监控的 `socket` 通过 `epoll_ctl()` 函数加入内核中的红黑树里，红黑树是个高效的数据结构，增删查一般时间复杂度是 `O(logn)`，通过对这棵黑红树进行操作，这样就不需要像 `select/poll` 每次操作时都传入整个 `socket` 集合，只需要传入一个待检测的 `socket` 就可以了，减少了内核和用户空间大量的数据拷贝和内存分配。


此外 Epoll 采用了 **事件驱动机制**，只在单独的进程或者线程里收集和处理各种事件，没有进程或线程之间上下文切换的开销。

> 也就是说，在内核中维护了一个「链表」来记录就绪事件，当某个 `socket` 有事件发生时候，通过回调函数，内核会将这个 事件 加入到 就绪事件 列表中，当用户调用 `epoll_wait()` 函数时，只会返回有事件的 socket 文件描述符，不需要像 `select/poll` 那样轮询扫描整个` socket` 集合，大大提高了检测的效率。

`epoll` 通过两个方面，很好解决了 `select/poll` 的问题。

从下图你可以看到 `epoll` 相关的接口作用：

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/epoll01.58ud4l3nxm00.png)

### epoll_create 函数

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

### epoll_ctl 函数

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

### epoll_wait 函数

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


## 向内核双链表增加节点

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

一般来说，边缘触发的效率比水平触发的效率要高，因为边缘触发可以减少 `epoll_wait` 的系统调用次数，系统调用也是有一定的开销的的，毕竟也存在上下文的切换。

`select/poll` 只有水平触发模式，`epoll` **默认的触发模式是水平触发**，但是可以根据应用场景设置为边缘触发模式。


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

#### Epoll的ET、LT

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

将 listenfd 设置成LT阻塞，或者 ET 非阻塞模式下 while 包裹 accept 即可解决问题。

-----

 ## 说一下项目为什么这么设计

 长连接，视频监控，满足多个客户端同时访问服务器。

 ## TCP粘包问题

 本项目是一个通用的服务器框架，重点在于 通用 二字，使用与各种 TCP 长连接的场景

 我认为有一个亮点是能够解决收发数据包的粘包和缺包问题

 我举个例子吧，就以网络游戏为例，游戏中两人对打，我给你一拳，这是一条命令，要从客户端发送到服务器；

 然后我给你加一些技能，这也是一条命令，也是要从客户端发送到服务器，

 服务器收到这些命令之后，要正确区分出是哪条命令出的拳，哪条命令是加血，这两条命令肯定要以某种手段进行分割，这样服务器才能够正确识别。

 比如 labc2 表示 1 打了 2 一拳，而 `ldef2 | 30` 表示 1 给 2 加了 30 点血，这两个命令从客户端发送到服务器，

 服务器收到后很可能是这样的数据 `labc2ldef2 | 30` 

 也就是很可能服务器 read 一下，直接收到的就是 `labc2ldef2 | 30`，这 2 个数据包粘连到一起了，而不是我们想象的 read 一下，就读到了 labc2 ，处理到的内容；在 read 一下，又堵到了 `ldef2 | 30` ，然后再处理读到的内容。

 这里就涉及到了 TCP 的粘包 问题。

> 见 C++ 经典 P266


本项目中提供了一种解决 TCP 粘包的解决方案，这种解决方案即便是客户端伪造发送各种恶意数据包，服务器也不会被畸形数据包搞垮崩溃。

首先需要给数据包定义一个同一的格式，然后服务器和客户端就按照这个格式来收发数据

就是一个 包头 + 包体，其中包头是固定长度的，包头里面有一个成员专门记录整个包的长度，因为数据包的包头是固定的，而且包头中有整个数据包的长度，所以用整个数据包的长度-包头=包体

这样就能完整收到包体。

这个收包的过程简单的说

- 先固长度的包头
- 根据包头中的内容，计算出包体的长度
- 再收包体长度这么多的数据

这样粘包问题就解决了

项目中设定了数据包的总长度不超过 30 000 字节，也就是 30KB，这个规定主要是为防止 恶意伪造数据包 或者 通信双方无意中写错数据包长度信息而将服务器置于危险中

这个数据包是 **消息头+包头+包体**

然后当服务器收到 包头+包体 后，还在包头前面增加一个新结构，也就是消息头，这个消息头的目的就是**处理过期包**问题。

就比如收到客户端发送过来的一个数据包，服务器处理这个数据包需要 3 秒，处理完成并且向客户端返回结果时客户端已经断线了。这个时候就需要用到消息头，

消息头会记录一个序号，从连接池中获取一个连接时，这个需要值就会 +1，释放掉连接池中的连接时这个序号值会再次 +1。

所以当一个客户端发送来的数据包时，就把这个序号记录在所收到包的消息头中，处理完数据包并向客户端回应时，再比较消息头中的序号与这个连接池中该连接的序号，如果两个序号不相同，表示这个客户端已经掉线了，（因为断线的客户端会调用释放连接函数使得对应的连接池中的序号 +1），就不需要向客户端回应数据包了。

然后收到完整的包体之后就开始处理数据包，在处理数据包之前先把数据包（消息头+包头+包体）放进一个消息队列中，用的是一个 list 容器。

为了防止不断想消息队列中放数据导致内存耗费严重，还要进行清理数据，我当时设置的是如果消息队列中的数量超过 1000 条就开始清理，如果整个进程退出之前，在消息队列中还要未处理的消息，，也要释放内存。

**到目前为止就是整个收包的流程了**

## 服务器安全专题

### 心跳包机制

因为 TCP 是可靠的，面向连接的协议，客户端和服务端建立起 TCP 连接后，有一种情况是服务端和客户端都感知不到连接断开。

所以这里就引入了心跳包机制，客户端每隔一定时间就会向服务端发送一个心跳包，当然服务端也要向客户端回应一个心跳包，

比如说，如果超过一定时间没收到心跳包，那么服务器就会认为客户端已经断开了 TCP 连接

### 如何处理不发送心跳包的客户端

TCP 建立连接之后，客户端根据服务器的约定，每隔一定时间（20s）就发送一次心跳包，如果超过这个时间的 3 倍害我收到，就会断开 TCP 连接

内部通过一个 定时器队列 来实现，使用 multimap (装键值对的容器，内部用的是红黑树) 做定时器，因为这个 定时器队列 内部是红黑树，所以按照键值从小到大自动排序，最新到的时间排在最前面。

每连入一个客户端，m_timerQueuemap 这个时间队列中就增加一项，这一项实际是用来监视这个用户是否到达一定时间迟迟不向客户端发心跳包。如果这一项过期了，就从时间队列中删除。













