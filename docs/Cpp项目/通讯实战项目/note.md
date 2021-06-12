
- [配置文件处理](#配置文件处理)
  - [代码中一些要点笔记](#代码中一些要点笔记)
    - [单例模式自动释放，使用嵌套内部类来实现](#单例模式自动释放使用嵌套内部类来实现)
    - [关于 fgets 函数](#关于-fgets-函数)
    - [strlen 与 sizeof 的区别](#strlen-与-sizeof-的区别)
    - [关于 strchr](#关于-strchr)
    - [关于memset](#关于memset)
    - [strcpy 函数和 strncpy 函数的区别](#strcpy-函数和-strncpy-函数的区别)
    - [strcasecmp 函数](#strcasecmp-函数)
- [内存泄漏检测工具](#内存泄漏检测工具)
- [设置进程名称](#设置进程名称)
    - [环境变量信息搬家](#环境变量信息搬家)
    - [怎么修改进程名称](#怎么修改进程名称)
  - [代码中一些要点笔记](#代码中一些要点笔记-1)
    - [extern 关键字](#extern-关键字)
    - [`delete`和`delete[]`的区别](#delete和delete的区别)
- [日志打印实现](#日志打印实现)
  - [代码中一些要点笔记](#代码中一些要点笔记-2)
    - [va_list用法](#va_list用法)
    - [日志等级划分](#日志等级划分)
    - [日志初始化](#日志初始化)
  - [信号相关函数](#信号相关函数)
    - [日志输出时遇到了问题](#日志输出时遇到了问题)
  - [write 思考](#write-思考)
    - [怎么读数据](#怎么读数据)
    - [write 每次都写入磁盘么](#write-每次都写入磁盘么)
    - [怎么解决掉电导致 write 写入的数据丢失](#怎么解决掉电导致-write-写入的数据丢失)
    - [fwrite 和 write 有什么区别](#fwrite-和-write-有什么区别)
    - [fwrite 实现原理](#fwrite-实现原理)
  - [怎么创建 worker 子进程](#怎么创建-worker-子进程)
  - [守护进程以及信号处理](#守护进程以及信号处理)
    - [守护进程的实现](#守护进程的实现)
  - [避免子进程变成僵尸进程](#避免子进程变成僵尸进程)
- [网络通信](#网络通信)
  - [客户端和服务端通信 demo](#客户端和服务端通信-demo)
  - [TCP 三次握手](#tcp-三次握手)
    - [最大传输单元 MTU](#最大传输单元-mtu)
    - [Telnet 工具](#telnet-工具)
    - [Wireshark监视数据包软件](#wireshark监视数据包软件)
  - [TCP状态转换](#tcp状态转换)
  - [SO_REUSEADDR](#so_reuseaddr)
  - [listen队列](#listen队列)
    - [`accept()`函数](#accept函数)
    - [几个思考题](#几个思考题)
  - [SYN 攻击](#syn-攻击)
  - [阻塞与非阻塞](#阻塞与非阻塞)
  - [异步和同步](#异步和同步)
  - [监听端口](#监听端口)
    - [怎么实现非阻塞 socket](#怎么实现非阻塞-socket)
  - [Epoll技术简介](#epoll技术简介)
  - [Epoll源码](#epoll源码)
    - [epoll_create 函数](#epoll_create-函数)
    - [epoll_ctl 函数](#epoll_ctl-函数)
    - [epoll_wait 函数](#epoll_wait-函数)
  - [向内核双链表增加节点](#向内核双链表增加节点)
- [使用 epoll 函数来实现数据的收发](#使用-epoll-函数来实现数据的收发)
  - [创建连接池的目的](#创建连接池的目的)
  - [当一个客户端连入服务器之后，操作系统如何通知程序有新用户连入](#当一个客户端连入服务器之后操作系统如何通知程序有新用户连入)
  - [如何快速从该连接池中找到一个空闲连接分配给套接字](#如何快速从该连接池中找到一个空闲连接分配给套接字)
  - [如何获取用户的连入事件并将用户接进来](#如何获取用户的连入事件并将用户接进来)
    - [accept4 和 accept 的区别](#accept4-和-accept-的区别)
  - [ET 和 LT 模式](#et-和-lt-模式)
    - [LT 模式-水平触发](#lt-模式-水平触发)
    - [ET 模式-边缘触发](#et-模式-边缘触发)
  - [事件驱动](#事件驱动)
  - [腾讯面试题](#腾讯面试题)
  - [深入理解ET LT](#深入理解et-lt)
  - [Epoll 中 ET 和 LT 模式的处理编码不同](#epoll-中-et-和-lt-模式的处理编码不同)
  - [TCP 粘包和缺包](#tcp-粘包和缺包)
    - [客户端粘包](#客户端粘包)
    - [服务器粘包](#服务器粘包)
    - [缺包](#缺包)
    - [粘包和缺包问题解决](#粘包和缺包问题解决)
  - [收包分析](#收包分析)
    - [字节对齐问题](#字节对齐问题)
    - [怎么处理数据包过期问题](#怎么处理数据包过期问题)
    - [服务端怎么识别客户端断线问题](#服务端怎么识别客户端断线问题)
  - [收包流程](#收包流程)
- [服务器业务逻辑处理框架](#服务器业务逻辑处理框架)
  - [使用多线程解析和处理数据包](#使用多线程解析和处理数据包)
  - [代码实现笔记](#代码实现笔记)
    - [消息队列临界问题](#消息队列临界问题)
  - [互斥锁 pthread_mutex_init 函数](#互斥锁-pthread_mutex_init-函数)
  - [线程相关](#线程相关)
    - [线程标识](#线程标识)
    - [单个线程的终止](#单个线程的终止)
      - [pthread_join 函数](#pthread_join-函数)
  - [什么是线程池](#什么是线程池)
  - [项目中怎么使用线程池](#项目中怎么使用线程池)
  - [线程池功能的实现](#线程池功能的实现)
  - [使用 crc32 算法解决数据包收发过程中内容被篡改的问题](#使用-crc32-算法解决数据包收发过程中内容被篡改的问题)
- [连接池中连接资源的回收](#连接池中连接资源的回收)

-------

## 配置文件处理

读取配置文件各个函数之间的关系图

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/通信框架-加载配置文件01.1p4vsvly55gg.png)

### 代码中一些要点笔记

####  单例模式自动释放，使用嵌套内部类来实现

```cpp
class CConfig
{
private:
	CConfig();
	static CConfig *m_instance;

public:
	~CConfig();
	static CConfig* GetInstance() {
		if(m_instance == NULL) {
			m_instance = new CConfig();
			//定义一个内部类用于自动释放对象
			static CGarhuishou cl; 
		}
		return m_instance;
	}
	//定义一个嵌套列，专门为CConfig服务，用于释放 m_instance
	class CGarhuishou {
	public:
		~CGarhuishou() {
			if( CConfig::m_instance ) {
				delete m_instance;
				CConfig:m_instance = NULL;
			}
		}
	};

};
```

可以通过打印地址发现两个对象打印的地址是一样的

```cpp
nt main(int argc,char *const *argv) {

    //创建一个读取配置文件的类
    CConfig *p_config = CConfig::GetInstance();
    //  CConfig *p_config1 = CConfig::GetInstance();

    //使用C++的方式打印对象的地址
    cout << "p_config的地址是："  << static_cast<void *>(p_config) << endl;
    cout << "p_config1的地址是："  << static_cast<void *>(p_config1) << endl;
    //使用C语言的方式打印对象的地址
    printf("p_config的地址是：%p\n",p_config);
    printf("p_config1的地址是：%p\n",p_config1);
    //上面输出的地址都是一样的，说明单例模式没问题

    return 0;
}
```

#### 关于 fgets 函数

C 库函数 `char *fgets(char *str, int n, FILE *stream)` 从指定的流 `stream `读取一行，并把它存储在 `str` 所指向的字符串内。当读取` (n-1)` 个字符时，或者读取到换行符时，或者到达文件末尾时，它会停止，具体视情况而定。

> - 虽然用 `gets()` 时有空格也可以直接输入，但是 `gets()` 有一个非常大的缺陷，即它不检查预留存储区是否能够容纳实际输入的数据，换句话说，如果输入的字符数目大于数组的长度，`gets` 无法检测到这个问题，就**会发生内存越界**，所以编程时建议使用 `fgets()`。   
> - `fgets()` 虽然比 `gets()` 安全，但安全是要付出代价的，代价就是它的使用比 `gets()` 要麻烦一点，有三个参数。它的功能是从 `stream` 流中读取 `size` 个字符存储到字符指针变量 `s` 所指向的内存空间。它的返回值是一个指针，指向字符串中**第一个字符的地址**。

#### strlen 与 sizeof 的区别

-  sizeof 是一个单目运算符，strlen是 函数。用 sizeof 时，会在测量的长度后加 `\0` ,而且分别在 int 和 char 的两种情况下得到的结果不同；用 strlen 则是精确算出其长度（不会加`\0`），但是 strlen 读到 `\0` 就会停止。

- 对 sizeof 而言，因为缓冲区已经用已知字符串进行了初始化，其长度是固定的，所以 sizeof 在**编译时**计算缓冲区的长度。也正是由于在编译时计算，因此 sizeof 不能用来返回动态分配的内存空间的大小。

#### 关于 strchr

```c
char * strchr(char * str, char/int c);
```
在字符串 str 中寻找字符`C`第一次出现的位置，并返回其位置（地址指针），若失败则返回NULL；

#### 关于memset

```c
void *memset(void *str, int c, size_t n) 
```
复制字符 c（一个无符号字符）到参数 str 所指向的字符串的前 n 个字符。n 一般都是 c 的长度

#### strcpy 函数和 strncpy 函数的区别

```cpp
char* strcpy(char* strDest, const char* strSrc)
char* strncpy(char* strDest, const char* strSrc, int pos)
```

 `strcpy`函数: 如果参数 `dest` 所指的内存空间不够大，可能会造成缓冲溢出(`buffer Overflow`)的错误情况，在编写程序时请特别留意，或者用`strncpy()`来取代。    
 `strncpy`函数：用来复制源字符串的前`n`个字符，`src` 和 `dest` 所指的内存区域不能重叠，且 `dest` 必须有足够的空间放置`n`个字符。 


#### strcasecmp 函数

```c
int strcasecmp (const char *s1, const char *s2);
```

判断字符串是否相等(忽略大小写),若参数s1 和s2 字符串相同则返回 0。s1 长度大于s2 长度则返回大于 0 的值，s1 长度若小于s2 长度则返回小于 0 的值。

---------

> 以上代码见 tongxin-nginx-01.tar.gz

---------------------

## 内存泄漏检测工具

- Valgrind --> 检查内存管理问题
  - memchaeck --> 用于检查程序运行的时候的内存泄漏

> 需要在 config.mk 中把 DEBUG 开关打开，（可以显示更多信息） `export DEBUG = true`

- memchaeck 的使用

`valgrind --tool=memcheck ./nginx`

可以使用下面命令完全检查内存泄漏

`valgrind --tool=memcheck --leak-check=full ./nginx`

详细显示，可以看到那些发生内存泄漏

`valgrind --tool=memcheck --leak-check=full --show-reachable=yes --trace-children=yes ./nginx`

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/内存检测工具.42jf6tm2fto0.png)

## 设置进程名称

更改在使用 ps 命令查看进程的时候 CMD 显示的名称，

**最后结果**

` ps -eo pid,ppid,sid,tty,pgrp,comm,stat,cmd | grep -E 'bash|PID|nginx' `

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/更改进程名称01.2kx4t4wec5m0.png)

**进程名称实际上是保存在 argc[0] 所指向的内存中**。CMD 会把 argv 所指向的命令参数全部显示出来，因为 `./nginx`是保存在 `argv[0]`中，所以 `argv[0]`改变，进程名也就改变了。

> 在这里遇到了个问题，一旦设置的进程名称的长度大雨字符串 `./nginx`的长度，就可能导致设置的进程名称覆盖其他参数。

#### 环境变量信息搬家

由于环境变量信息也是保存在内存中的，并且**保存的位置紧紧邻 argv 所指向的内存**。所以若果设置的进程名称太长，不但会覆盖掉命令行参数，而且很可能覆盖掉环境变量所指向的内容。

为此，借助了 nginx 的源码，想到了一个解决方案，大致思路是：

- **重新分配一块内存**：足够容纳新的 environ 所指向的内容，把 environ 内容搬到这块内存中来。

- 将以往 `argv[0]` 指向的内容替换成实际要修改的新进程名称

> 在参考 nginx 中的一些代码的时候，发现一个问题，有点困惑，就是在 `ngx_init_setproctitle` 函数中有一段` ngx_alloc` 的代码来分配内存，但是没有对应的释放代码

自己写了一个 `ngx_init_setproctitle` 函数，实现了重新分配一块内存，保存 environ 所指向的内存中的内容。大致逻辑如下：

- 统计环境变量的长度（也就是所需要的内存的大小）
  
- 使用 new 来分配所需要大小的内存
  
- 逐个把环境变量的内容复制到这块内存，并让 `environ[i]` （环境变量指针）指向新的内存位置

#### 怎么修改进程名称

编写一个 `ngx_setproctitle()` 函数，但是要注意：

- 要使用命令行参数必须在`ngx_setproctitle` 函数调用之前使用，否则参数会被覆盖

- 设置新的进程的名称的长度不会超过 `原始的命令行参数所占内存 + 环境变量所占内存`

**该函数的大致逻辑**

- 计算进程名称的长度

- 计算命令行参数所占内存与环境变量所占内存的总和

- 设置新的进程名称

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/通信框架-更改运行程序名.1npok0l7nujk.png)

### 代码中一些要点笔记

#### extern 关键字

如果全局变量不在忘了件的开头定义，作用范围就只是从定义的地方到文件结束，如果在定义这个位置之前的函数引用这个全局变量，那么就应该在引用之前用关键字 extren 对这个变量作“外部变量声明”，表示这个变量是一个已经定义的外部变量。有了这个声明，变量的作用于就可以扩展到 从声明开始到本文件结束。

#### `delete`和`delete[]`的区别

* `delete`只会调用一次析构函数，而`delete[]`会调用每个成员的析构函数

* 用`new`分配的内存用`delete`释放，用`new[]`分配的内存用`delete[]`释放

假如说使用`new int[10]`来开辟一个内存空间，针对这种简单类型，使用`new`分配后不管是数组还是非数组形式释放都是可以的。他们的效果是一样的，**因为分配简单类型内存的时候，内存大小已经确定，系统可以记忆并且进行管理，在析构时，系统不会调用析构函数**。它直接通过指针可以获取实际分配的内存空间，哪怕是一个数组内存空间。


> 以上代码见 tongxin-nginx-02.tar.gz

-------

## 日志打印实现

- 打印输出相关函数借鉴了 nginx 的实现，并做一些改动，见`ngx_printf.cxx`,学习 printf,vprintf 这类函数的内部实现



`void   ngx_log_stderr(int err, const char *fmt, ...);`

- 该函数支持把错误码转换成对应的错误字符串，追加到要显示的字符串末尾

- `ngx_cpymem`: 该函数的功能类似于 `memcpy`,但是 `memcpy` 返回的是指向目标 dst 的指针，而`ngx_cpymem`返回的是目标（复制后的数据）的终点位置，因为有了这个位置后，后续继续复制数据时就很方便了。

- `ngx_vslprintf`: 功能相当于系统的 `printf` 函数

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/通信框架-日志打印01.69qcjx2373c0.png)

### 代码中一些要点笔记

#### va_list用法

VA_LIST 是在 C 语言中解决变参问题的一组宏，变参问题是指参数的个数不定，可以是传入一个参数也可以是多个;可变参数中的每个参数的类型可以不同,也可以相同;可变参数的每个参数并没有实际的名称与之相对应，用起来是很灵活。

VA_LIST 的用法： 

（1）首先在函数里定义一具 VA_LIST 型的变量，这个变量是指向参数的指针； 

（2）然后用 VA_START 宏**初始化**变量刚定义的 VA_LIST 变量； 

（3）然后用 VA_ARG 返回可变的参数，VA_ARG 的第二个参数是你要返回的参数的类型（如果函数有多个可变参数的，依次调用 VA_ARG 获取各个参数）；

（4）最后用 VA_END 宏结束可变参数的获取


#### 日志等级划分

参考 nginx 的日志等级划分，nginx 日志分成 8 个等级，级别从高到低，数字最小的级别最高，数字最大的级别最低，nginx 中有专门的日志处理模块处理日志(*很复杂，没看*)

日志等级在文件 `ngx_macro.h` 中可以查看

```cpp
#define NGX_LOG_STDERR            0    //控制台错误【stderr】：最高级别日志，日志的内容不再写入log参数指定的文件，而是会直接将日志输出到标准错误设备比如控制台屏幕
#define NGX_LOG_EMERG             1    //紧急 【emerg】
#define NGX_LOG_ALERT             2    //警戒 【alert】
#define NGX_LOG_CRIT              3    //严重 【crit】
#define NGX_LOG_ERR               4    //错误 【error】：属于常用级别
#define NGX_LOG_WARN              5    //警告 【warn】：属于常用级别
#define NGX_LOG_NOTICE            6    //注意 【notice】
#define NGX_LOG_INFO              7    //信息 【info】
#define NGX_LOG_DEBUG             8    //调试 【debug】：最低级别
```

并在配置文件 `nginx.conf` 中添加日志篇日志项


#### 日志初始化

 `ngx_log_init()` 函数实现 日志初始化，该函数实现的功能：

 - 从配置文件中读取和日志相关的配置信息

- 调用 open 函数打开日志文件，没有就创建，有就以 **只读** 方式打开并追加内容

`ngx_log_error_core` 写日志文件

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/通信框架-日志打印02.6ejjori3jkw0.png)

### 信号相关函数


#### 日志输出时遇到了问题

`printf` 函数不加“`\n`”无法及时输出，就是说，我们在实现`ngx_vslprintf`函数 [打印日志] 测试的时候，等待了好几秒，发现屏幕上迟迟没有日志输出的结果，然后突然之间，在屏幕上出现一大堆输出结果。

后来查了 `printf()`底层实现后发现，这是 **行缓存（输出缓冲区)的问题**，标准输入输出函数都是带有缓存的，一般是行缓存（还发现 window 系统上没有这个问题，但是 Unix 系统就有），就是把需要输出的数据先缓存到某个地方，等待 **行刷新标志** 或者 **缓存已满** 的情况下，才会把缓存的数据显示出来。

“`\n`” 可以认为是刷新标志，也可以通过调用 `fflush(stdout)` 函数刷新缓冲区，将结果显示出来。


### write 思考

> 多个进程同时去写一个文件会怎样？    
> 因为多个进程的原因导致产生输出日志的混乱。

本项目是 1 个 master 进程， 4 个 worker 进程，假如 5 个进程跟同时不停地调用  ，同时向日志文件中写日志，会不会造成日志文件混乱？


> `ngx_log_error_core`往日志文件中写日志，代码中有自动加换行符，所以调用时字符串不用刻意加 `\n`；

```cpp
// 日过定向为标准错误，则直接往屏幕上写日志【比如日志文件打不开，则会直接定位到标准错误，此时日志就打印到屏幕上，参考 ngx_log_init() 】
//level:一个等级数字，我们把日志分成一些等级，以方便管理、显示、过滤等等，如果这个等级数字比配置文件中的等级数字"LogLevel"大，那么该条信息不被写到日志文件中
//err：是个错误代码，如果不是0，就应该转换成显示对应的错误信息,一起写到日志文件中，
//ngx_log_error_core(5,8,"这个XXX工作的有问题,显示的结果是=%s","YYYY");
void ngx_log_error_core(int level,  int err, const char *fmt, ...)
```

**解决方案**

通过修改 master 进程 ngx_master_process_cycle)( master 子进程的功能函数) 函数中的 for 无限循环代码，增加一条日志输出。

```cpp
for ( ;; ) 
{

  //usleep(100000);
  ngx_log_error_core(0,0,"haha--这是父进程，pid为%P",ngx_pid);

}
```


修改 worker 进程 `ngx_worker_process_cycle`(worker子进程的功能函数) 函数中 for 无限循环代码，增加一条日志输出。


```cpp
for(;;)
{
  ngx_log_error_core(0,0,"good--这是子进程，编号为%d,pid为%P！",inum,ngx_pid);

}
```

发现打印的日志是有序的，并不混乱，所以写日志代码在应对多个进程向同一个日志文件中写日志的时候是没有问题的。

> 那么 write 的底层是怎么实现的呢？ 通过查看 write 函数底层的原理实现了上面的功能

- ngx_log_init 函数中调用了 open 函数，open 函数中的 O_APPEND 标志可以保证多个进程操作同一个文件的时候不会相互覆盖，如果不加这个标记，某些情况下就会出现数据彼此覆盖的问题

- write 函数在写入文件的时候是原子操作，2 个进程同时写入是竞争关系，最终只会由某个进程写入数据。

- 父进程 fork 出子进程，在父进程都会执行的公共代码就已经调用了 open 函数打开了日志文件，然后才通过 fork 创建出子进程，这种父子进程之间会共享文件表项，文件表项里有当前文件偏移量，子进程用 write 原子操作写了一个日志，文件偏移量会移动到文件末尾，父进程的当前文件偏移量也会移动到文件末尾，因为是共享文件表项，所以父进程 write 是接着子进程写的内容末尾开始写，因此不会混乱。

> 所以本项目中利用这种机制实现也没问题

调用 write 函数之后，把应用程序缓冲区中的内容写到了内核缓冲区，这比从内核缓冲区向磁盘写快很多，所以 write 函数调用返回的速度是很快的。

#### 怎么读数据

读数据时也是从磁盘先读到内核缓冲区，然后再从内核缓冲区返回应用程序缓冲区。

就算我们只需要 read 函数读 1 字节的数据，操作系统也要读 1~4kB 的数据（而不是只读 1 字节）。


#### write 每次都写入磁盘么

内核可以在任何时候写磁盘，但并不是所有的 write 操作都会导致内核的写操作，内核会把待写数据暂存在缓冲区，积累到一定数量后再一次性写入磁盘，如果出现意外，断电，计算机崩溃等，内核还没来得及把内核缓冲区的数据写入磁盘，这些数据就会丢失。

为了确保内核缓冲区中的数据被及时写入磁盘，内核缓冲区中设立了一个时间上限，达到时间上限后，内核会把所有内核缓冲区中的“脏数据”直接写到磁盘。

#### 怎么解决掉电导致 write 写入的数据丢失

- 直接 `I/O`,直接访问物理磁盘，但是这样效率会降低。

本项目的 `ngx_log.cxx` 中的 `ngx_log_init` 函数

```cpp
ngx_log.fd = open((const char *)plogname,O_WRONLY|O_APPEND|O_CREAT,0644);  
```

如果 open 参数增加 O_DIRECT 就会绕过缓冲区

```cpp
ngx_log.fd = open((const char *)plogname,O_WRONLY|O_APPEND|O_CREAT|O_DIRECT,0644);  
```

- 设置 open 文件时的 O_SYNC 选项

O_SYNC 选项也叫**同步选项**，只针对 write 函数有效，使每次 write 操作等待物理 `I/O` 操作完成。也就是说将写入缓冲区的数据立即写入磁盘，而不用等到时间上限，这样将计算机崩溃或者断电时造成的数据丢失减到最小。

也是通过更改 open 第二个参数实现

```cpp
ngx_log.fd = open((const char *)plogname,O_WRONLY|O_APPEND|O_SYNC,0644);  
```

但是直接向磁盘写数据的效率不高，因此磁盘是按 页 或者 扇区 来写数据的，而且还要进行磁盘寻道，也就是说要找到写的位置，这些都需要花时间。

所以使用 O_SYNC 标记写数据时要批量写，不要每次只写几个字节。

- 缓冲同步

这是最推荐的方法

这里涉及到 3 个函数：`sync`,`fsync`,`fdatasync`

(1) sync(void): 将所有修改过的块缓冲区排入写队列，然后立即返回，不等待实际写磁盘操作。但是数据是否写入磁盘并没有保障

(2) fsync(int fd): 将 fd 对应文件的缓冲区理解写入磁盘，并将等待实际写磁盘操作结束后返回。可用于数据库这样的应用程序，因为这种应用程序需要确保修改过的数据理解写到磁盘上。

(3) fdatasync(int fd): 类似于 fsync，但只影响文件的数据部分。除数据外，fsync 还会同步更新文件属性（如文件大小，文件访问时间等。文件属性和文件内容是分开存储的，写磁盘会涉及 2 次寻道）。所以 `fdatasync`比 `fsync` 速度更快。

我们采取的方法是：

调用多次 write 函数，在调用 1 次 fsync 函数，因为频繁调用 fsync 函数效率会很低。

如果文件很大，就都写完，然后调用 1 次 fsync 函数

还有如果整个文件需要调用 write 函数 10 次才能写完，那么没写 1 次，就调用 fsync 函数 1 次意义就不大， 所以应该写 10 次后，再调用 fsync 函数 1 次。

> 本项目中写日志使用 write 系统调用，工作没有问题，但是使用 fwrite 来写日志，就会出现日志混乱问题。

#### fwrite 和 write 有什么区别

read write 这类函数时属于 **系统调用**，

而 fwrite printf 属于标准 IO 库里面的函数，**内部实现有缓冲区的，此时写日志可能就要用到锁机制**。

#### fwrite 实现原理

当调用 fwrite 函数的时候，写入的内容会被放入一个系统的 CLib 缓冲区中（可以理解成 stdio 这个库里面提供的缓冲区）。当 CLib 缓冲区满之后，会将内容移至内核缓冲区。所以这里相当于在应用程序和内核之间加了层。所以 IO 库函数相当于一层用于缓存，最终还是调用底层 IO，也就是系统调用来实现相关功能。

所谓的缓存就是内存，用于在输入输出设备和 CPU 之间临时保存数据，使低速输入输出设备和高速输入输出设备能够协调工作，避免低速的输入输出设备占用 CPU，解放出 CPU，使其能够高效工作。

### 怎么创建 worker 子进程
 
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


worker 子进程创建时调用 `ngx_worker_process_init` 进行一些初始化工作,这个时候 worker 子进程的信号屏蔽已经被释放，那么 master 父进程的信号屏蔽也应该被释放。通过 `sigsuspend()` 函数来实现释放。

```cpp
void ngx_master_process_cycle() 
{
	...
	 for ( ;; ) 
    {
		...
		sigsuspend(&set);  // 相当于取消了所有的信号屏蔽（不阻塞任何信号）
		...
	}
	...
}
```

`sigsuspend()` 函数的作用：阻塞在这里，等待一个信号，阻塞时进程是挂起的，不占用 CPU，只有收到信号才会被唤醒（`sigsuspend()`才返回），所以其后面的语句才是处理信号的语句。

> `sigsuspend()` 函数把一系列操作捏到一起成为一个原子操作，不能被打断，从而保证了调用 `sigsuspend()` 函数的时刻收到一个信号，也不会丢失这个信号

> **注意**：master 进程是用来管理进程的，在 for 无限循环中，可以使用 `sigsuspend` 函数，只让信号来驱动程序执行流程往下走。但是在 worker 进程中，不适合用  `sigsuspend` 函数来触发，因为 worker 进程不仅是接受信号，还有很多业务都能触发 worker 进程的流程往下走。

### 守护进程以及信号处理

#### 守护进程的实现

`ngx_deamon.cxx` 文件实现守护进程。`ngx_deamon()` 是核心函数，

读取配置文件，拿到配置文件中是否按守护进程方式启动的选项。

**守护进程是实现逻辑**：

- fork 出了一个子进程，核心目的是让这个子进程作为 master 进程，旧进程需要退出

- 通过`setsid()`让子进程脱离终端，
  
- 设置 `umask(0)`,不要让它来限制文件权限，以免引起混乱

- 以读写方式打开黑洞设备,`open("/dev/null", O_RDWR);`

**守护进程的调用时机**：

我们在创建 worker 子进程之前（也就是在调用`ngx_master_process_cycle()`函数之前）、日志初始化之后调用`ngx_deamon()`函数创建守护进程。

### 避免子进程变成僵尸进程

> 使用 `kill -9` 命令杀死一个 worker 进程后，再次使用 ps 命令查看发现这个 worker 进程并没有消失，而是变成了僵尸进程。

**解决方案**

在父进程中接收 SIGCHILD 信号并在其中调用 waitpid 来解决这个问题

信号处理函数：`ngx_signal_handler()`

大致的逻辑是

- 在函数中，通过一个 for 语句 `for (sig = signals; sig->signo != 0; sig++)` 遍历信号数组，寻找收到的信号
- 针对 master 进程，在收到 SIGCHLD 信号(子进程退出，父进程就会收到这个信号)后，会将一个全局标记（全局变量）`ngx_reap`设置为 1，目前本项目中并没有用到这个标记，但是将来可能会用到，（如果 worker 子进程运行崩溃或者被杀掉后，master 进程就可以通过该标记重新 fork 出一个子进程）
- 真正处理僵尸进程是通过调用 `ngx_process_get_status` 函数并在该函数中调用了系统函数 waitpid 来进行的。但是参考了 nginx 的源码，在这个函数中引入了一个 for 无限循环的写法，for 无限循环会执行 2 吃，第一次循环执行 waitpid 时返回大于 0，所以再次循环执行 waitpid 时返回结果等于 0 并直接返回。

这样就实现了子进程一旦死掉之后，父进程可以通过调用 waitpid,防止子进程变成僵尸进程。

----------

## 网络通信


### 客户端和服务端通信 demo

> 一个服务端对应一个客户端

- server.c

```c
#include <stdio.h>
#include <ctype.h>
#include <unistd.h>
#include <arpa/inet.h>  //serv_addr htonl
#include <sys/socket.h>
#include <sys/types.h>  
#include <string.h>
#include <stdlib.h>

#define SERV_PORT 9000

int main(int argc,char* const* argv) {

	int bindId;
	int listenId;
	int connfd;

	//1.创建socket
//int socket(int domain, int type, int protocol);
//AF_INET：IPV4 ， AF_INET6：IPv6 ， SOCK_STREAM：TCP ，SOCK_DGRAM: UDP
	int listenfd = socket(AF_INET,SOCK_STREAM,0);
	if(listenfd < 0) {
		perror("socket");
		exit(1);
	}

	//定义服务器的地址结构 IPv4
	struct sockaddr_in serv_addr;
	//初始化
// void *memset(void *str, int c, size_t n)  复制 c --> str
	memset(&serv_addr,0,sizeof(serv_addr));

	//2.设置通配地址「bind前的处理」
/*描述IPV4的套接字地址格式
struct sockaddr_in
{
	sa_family_t sin_family;   协议族
	in_port_t sin_port;       端口号 
	struct in_addr sin_addr;   Internet address. 32-bit

	//这里仅仅用作占位符，不做实际用处  
	unsigned char sin_zero[8];
};
*/
	serv_addr.sin_family = AF_INET;  //地址族，IPv4 或者 IPv6
	serv_addr.sin_port = SERV_PORT;  // 端口号
	// 监听本地所有的IP地址；INADDR_ANY表示的是一个服务器上所有的网卡
/*
对于 IPv4 的地址来说，使用 INADDR_ANY 来完成通配地址的设置
对于 IPv6 的地址来说，使用 IN6ADDR_ANY 来完成通配地址的设置
*/
	serv_addr.sin_addr.s_addr = htonl(INADDR_ANY);  //IPV4通配地址
/*
uint32_t htonl(uint32_t hostlong);
uint16_t htons(uint16_t hostshort);
uint32_t ntohl(uint32_t netlong);
uint16_t ntohs(uint16_t netshort);
h表示host，n表示network，l表示32位长整数，s表示16位短整数。
*/
	//3.bind IP地址和端口号
//bind(int fd, sockaddr * addr, socklen_t len)
	bindId = bind(listenfd,(struct sockaddr*)&serv_addr, sizeof(serv_addr));//绑定服务器地址结构
	if(bindId < 0) {
		perror("bind");
		exit(1);
	}

	//4.listen监听
// /int listen (int socketfd, int backlog)
	listenId = listen(listenfd,32);  // backlog ,这个参数的大小决定了可以接收的并发数

	//5.循环处理用户请求 accept()
	const char *pcontent = "I sent sth to client!"; //指向常量字符串区的指针
	for(;;) {
// int accept(int listensockfd, struct sockaddr *cliaddr, socklen_t *addrlen) //cliaddr 相当于输出参数
		connfd = accept(listenfd,(struct sockaddr*)NULL,NULL);

		//发送数据包给客户端
		write(connfd,pcontent,strlen(pcontent));

		//只给一个客户端发送信息，然后直接关闭套接字连接
		close(connfd);
	}
	close(listenfd); //实际上这个用例不会走到这里
	

	return 0;
};
```

- client.c

```c
#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <string.h>

#define SERV_PORT 9000    //要连接到的服务器端口，服务器必须在这个端口上listen着

int main(int argc,char *const* argv)
{
	char * serverIp = "192.168.136.100";
	int inetId;
	int connectId;

	// 1.创建套接字
	int sockfd = socket(AF_INET,SOCK_STREAM,0);

	//2.设置通配地址
	struct sockaddr_in serv_addr;
	serv_addr.sin_family = AF_INET;
	serv_addr.sin_port = htons(SERV_PORT);

	//设定要连接的服务器 IP 地址和端口号

//inet_pton: 把ip地址转化为用于网络传输的二进制数值
// int inet_pton(int family, const char *strptr, void *addrptr); 

//inet_ntop: 将数值格式转化为点分十进制的ip地址格式
// const char * inet_ntop(int family, const void *addrptr, char *strptr, size_t len); 
	inetId = inet_pton(AF_INET,serverIp,&serv_addr.sin_addr);
	if(inetId < 0) {
		perror("inet_pton");
		exit(1);
	}

	//3.连接服务器
// int connect(int sockfd, const struct sockaddr *servaddr, socklen_t addrlen)
	connectId = connect(sockfd,(struct sockaddr*)&serv_addr,sizeof(serv_addr));
	if(connectId < 0) {
		printf("调用connect()失败，退出！\n");
		perror("connect");
		exit(1);
	}

	//4.开始读来自服务端的数据
	int n;
	char recvLine[10000 +1];
	while( (n = read(sockfd,recvLine,1000)) > 0 ) {
		recvLine[n]  = 0;
		printf("收到来自服务端的数据：%s\n",recvLine);
	}
	//5.关闭套接字
	close(sockfd);
	printf("接受完毕，客户端退出\n");
	return 0;
}
```

### TCP 三次握手

#### 最大传输单元 MTU

MTU 就是每个数据包所能包含的最大字节数，大小约为 1.5KB，因为一个数据包中还包含 TCP 头，IP 头的内容，所以，每个数据包中，真正能够容纳的有效数据内容可能无法大袋 1.5KB ，应该是 1.46KB 左右。

假如发送的数据大于 1.5KB，那么操作系统就会对数据进行**分片**，也就是把数据拆分成若干个数据包，每个数据包约为 1.5KB，然后发出去，对端的操作系统收到后再重组这些数据包。

#### Telnet 工具

Telnet 工具能够方便地测试服务器的某个 TCP 端口是否通畅、数据能否正常收发等。

`telnet 192.168.136.100 9000`

#### Wireshark监视数据包软件

用来抓包分析网络问题

`host 192.168.136.100 and port 9000`

### TCP状态转换

> 为什么要有 TIME_WAIT 状态

- **TIME_WAIT 有助于可靠地实现 TCP 全双工连接的终止**

如果服务器最后发送的 ACK【应答】包因为某种原因丢失了，那么客户端一定会重新发送 FIN，这样因为服务器端有 TIME_WAIT 的存在，服务器会重新发送 ACK 包给客户端，但是如果没有 TIME_WAIT 这个状态，那么论客户端收到 ACK 包，服务器都已经关闭连接了，此时客户端重新发送 FIN，服务器给回的就不是 ACK 包，而是 RST【连接复位】包，从而使客户端没有完成正常的 4 次挥手，不友好，而且有可能造成数据包丢失；也就是说，TIME_WAIT 有助于可靠的实现 TCP 全双工连接的终止；

> RST 标志: 对于每一个 TCP 连接，操作系统是要开辟出来一个收缓冲区，和一个发送缓冲区 来处理数据的收和发；
>
> 当我们 close 一个 TCP 连接时，如果我们这个发送缓冲区有数据，那么操作系统会很优雅的把发送缓冲区里的数据发送完毕，然后再发 FIN 包表示连接关闭；
> 
> FIN 【四次挥手】，是个优雅的关闭标志，表示正常的 TCP 连接关闭；

> RST标志：出现这个标志的包一般都表示 异常关闭；如果发生了异常，一般都会导致丢失一些数据包；
> 
> 如果将来用 `setsockopt(SO_LINGER)` 选项要是开启的；发送的就是 RST 包，此时发送缓冲区的数据会被丢弃；
>
> RST 是异常关闭，是粗暴关闭，不是正常的四次挥手关闭，所以如果你这么关闭 tcp 连接，那么主动关闭一方也不会进入 TIME_WAIT；

- **允许老的重复的 TCP 数据包在网络中消逝**

如果没有 TIME_WAIT 状态，主动关闭端（服务端）可以在发送完最后一个 ACK 包（第 4 次挥手的第 4 个包），但这个包还没有到达客户端时，接受另一个新的客户端连人服务器建立一个新的连接（假设这个新连接的端口，IP那些都一样），服务器发送的最后一个 ACK 包有可能恰好被这个新连接收到，导致新连接所在的客户端发生混乱。

所以服务器 TCP 连接的 TIME_WAIT 状态可以确保 ACK 包消失不见。

### SO_REUSEADDR

主要经济 TIME_WAIT 状态导致 bind 失败的问题，也就是说，即使有 TIME_WAIT 存在，服务器也能 bind 成功。

### listen队列

- 客户端这个`connect()`什么时候返回

收到三次握手的第二次握手包（也就是收到服务器发回来的`syn/ack`）之后就返回了

- RTT是未完成队列中任意一项在未完成队列中留存的时间，这个时间取决于客户端和服务器

对于客户端，这个RTT时间是第一次和第二次握手加起来的时间

对于服务器，这个RTT时间实际上是第二次和第三次握手加起来的时间

- 如果一个恶意客户，迟迟不发送三次握手的第三个包。那么这个连接就建立不起来，那么这个处于SYN_RCVD的这一项【服务器端的未完成队列中】,就会一致停留在服务器的未完成队列中，这个停留时间大概是75秒，如果超过这个时间，这一项会被操作系统干掉

#### `accept()`函数

accept 函数用于已完成连接队列中的队首位置取出一项，返回给进程（服务器程序）

如果已完成连接队列为空，accept 函数调用就会阻塞，一直等到已完成连接队列有一项内容时才会被唤醒，也就是等待有客户端连接到来。

accept 函数返回的是一个套接字（socket），这个套接字代表已经经过三次握手建立起来的 TCP 连接。

#### 几个思考题

(1)如果两个队列之和【已完成连接队列，和未完成连接队列】达到了`listen()`所指定的第二参数，也就是说队列满了；此时，再有一个客户发送syn请求，服务器怎么反应？

实际上服务器会忽略这个syn，不给回应； 客户端这边，发现syn没回应，过一会会重发syn包；

(2)三次握手完成，连接放到已完成连接队列中，等着 accept 函数从已完成连接队列中把连接取走，

当 accept 还没来得急取走这个连接的时候，因为三次握手已经建立了，客户端如果此时发送数据过来，这个数据就会被保存在已经连接的套接字的接受缓冲区中，这个接受缓冲区的大小就是能接受的最大数据量。


### SYN 攻击

如果一个黑客通过一些特殊的手段，伪造自己的 IP 地址和端口号，不停地给服务器发送 SYN 包（也就是三次握手的第 1 次握手包），就会导致服务器未完成连接队列的条目越来越多，当 未完成连接队列 和 已完成连接队列 已满了，服务器就会忽略掉后续再来的 SYN 包，无法建立正常的 TCP 连接了。因为正常 TCP 连接的三次握手的第 1 次握手包（ SYN 包）被忽略了。

> blocklog 指定内核套接字（服务器监听套接字）上内核为其排队的最大已完成连接数（也就是已完成连接队列中允许存放的最大条数）


### 阻塞与非阻塞

- 阻塞 IO

阻塞：就是调用一个函数，该函数就卡在这里，整个程序流程不会往下走了（此时程序进入休眠状态）。这个函数等待一个时间发生，只有这个事件发生了，程序才会继续玩下走（也就是程序才会继续运行）

这种函数就是 **阻塞函数**，比如服务器使用 accept 函数，调用 accept 时，程序执行流程就卡在 accept 这里，等待客户端连接，只有客户端连接，三次握手成功，accept 才会返回。

- 非阻塞 IO

非阻塞 IO 和 阻塞 IO 是相对的，就比如说刚刚说到的 accept ，如果通过调用某个函数，把监听套接字设置成非阻塞，那么调用 accept 的时候，就算没有客户端连接，这个 accept 调用也不会卡住，会立即返回（当然返回时会有个错误码，我们可以根据这个错误码判断 accept 返回的原因），这样就能充分利用操作系统给进程分配的时间片来做别的事情，执行效率就更高了。

### 异步和同步

- 异步 IO

调用一个异步 IO 函数接收数据时，不管有没有数据，该函数都会立即返回。我们在调用异步 IO 函数时要指定一个接受数据的缓冲区，还要指定一个回调函数，其他的事情操作系统去做了，程序可以自由地干其他事情。


> **非阻塞 IO 和 异步 IO 的差别**？
> - 非阻塞 IO 要不停地调用 IO 函数检查数据是否到来，如果数据到来了，就卡在 IO 函数这里把数据从内核缓冲区复制到用户缓冲区，然后这个 IO 函数才能返回
> - 异步 IO 不需要不停地调用 IO 函数检查数据是否到来，只需要调用 1 次，然后就去做其他事情了，由内核检查数据的到来，内核负责把数据复制到指定缓冲区，整个过程进程并没有被卡住

- 同步 IO

调用一个同步 IO 函数接受数据时，在没有得到结果之前，这个调用就不返回。也就是必须一件一件事做,等前一件做完了才能做下一件事。同步 IO 需要调用 2 个函数才能取到数据，它的优点就是得到了所谓的 IO 复用的能力。

> 调用 1 个函数就能判断一批 TCP 连接是否有数据到的能力，就是 IO 复用

### 监听端口

> 以服务器监听 2 个端口为例 

本服务器项目的体系结构式 1 个 master 进程和多个 worker 进程，主要做事的就是和客户端通信的 worker 进程。

因为服务器是**被动**等待连接的，需要在一些端口上进程监听并等待客户端连接，所以先要实现监听端口。

```cpp
bool CSocekt::ngx_open_listening_sockets()  //开启监听端口
```

- 因为配置文件中一共需要开启 2 个端口，所以利用 for 循环来实现多个监听端口的开启
- 对于每个要监听的端口都要调用 `socket`、`setsockopt`、`setnonblocking` (自定义函数，设置非阻塞`socket`)、`bing`、`listen`函数
- 每个监听的端口信息都放 `m_ListenSocketList` 容器中保存 

#### 怎么实现非阻塞 socket

- 使用 `ioct1()`函数，第二个参数和第三个参数可以 设置 或 清除 非阻塞I/O标记：0：清除，1：设置
- 调用`fcntl()` 函数把套接口描述符设置成非阻塞

```cpp
//设置socket连接为非阻塞模式【这种函数的写法很固定】
bool CSocekt::setnonblocking(int sockfd) 
{    
    int nb=1; //0：清除，1：设置  
    if(ioctl(sockfd, FIONBIO, &nb) == -1) //FIONBIO：设置 或 清除 非阻塞I/O标记：0：清除，1：设置
    {
        return false;
    }
    return true;

    //如下也是一种写法，跟上边这种写法其实是一样的，但上边的写法更简单
    /* 
    //fcntl:file control【文件控制】相关函数，执行各种描述符控制操作
    //参数1：所要设置的描述符，这里是套接字【也是描述符的一种】
    int opts = fcntl(sockfd, F_GETFL);  //用F_GETFL先获取描述符的一些标志信息
    if(opts < 0) 
    {
        ngx_log_stderr(errno,"CSocekt::setnonblocking()中fcntl(F_GETFL)失败.");
        return false;
    }
    opts |= O_NONBLOCK; //把非阻塞标记加到原来的标记上，标记这是个非阻塞套接字【如何关闭非阻塞呢？opts &= ~O_NONBLOCK,然后再F_SETFL一下即可】
    if(fcntl(sockfd, F_SETFL, opts) < 0) 
    {
        ngx_log_stderr(errno,"CSocekt::setnonblocking()中fcntl(F_SETFL)失败.");
        return false;
    }
    return true;
    */
}
```

### Epoll技术简介

**Epoll 就是一种在 Linux 上使用的 IO 多路复用并支持高并发的典型技术**。

比如说有 10 万个并发连接（也就是同一时刻有 10 万个客户端保持和服务器的链接），这 10 万个连接通常也不可能同一时刻都在收发数据，一般在**同一时刻通常只有其中及时或者几百个连接在收发数据，其他连接可能处于只连接而没有收发数据的状态**。

如果以 100ms 为间隔判断一次，可能这 100ms 内只有 100 个活跃连接（就是有数据收发的连接），把这 100 个活跃连接的数据放在一个专门的地方，后续到这个专门的地方来，只需要处理 100 条数据，处理起来的压力就没那么大了。

这也就是 Epoll 的处理方式。而 select 和 poll 是依次判断这 10w 个连接有没有收发数据（可能实际上有数据的只有 100 个连接），有数据就处理。所以不难看出每次检查 10w 个连接与每次检查 100 个连接相比，浪费了巨大的资源和时间。

此外 Epoll 采用了 **事件驱动机制**，只在单独的进程或者线程里收集和处理各种事件，没有进程或线程之间上下文切换的开销。

### Epoll源码

以了一位网友【[王博靖](https://github.com/wangbojing/NtyTcp)】自己写的一套 Epoll 源码为入口，通过阅读源码学习了 Epoll 函数内部的实现原理。

源码中 `nty_epoll_rb.c` 和 `nty_epoll_inner.h` 这 2 个文件是 Epoll 相关的 3 个函数的实现文件。

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

- 参数`timeout`：阻塞等待的时长；`epitem`结构设计的高明之处：既能够作为红黑树中的节点，又能够作为双向链表中的节点；


### 向内核双链表增加节点

epoll_wait 函数实际上就是去双向链表，那么，**操作系统什么时候向双向链表中插入节点呢**？

- 客户端完成三次握手时，操作系统会向双向链表插入节点，这时服务器往往要调用 accept 函数把该连接从已完成连接队列中取走

- 当客户端发送来数据时，操作系统会向双向链表插入节点，这时服务器也要调用 close 关闭对应的 socket

- 当客户端发送数据时，操作系统会向双向链表插入节点，这时服务器要调用 read 或者 recv 来收数据

- 当可以发送数据时，操作系统会向双向链表插入节点，这时服务器可以调用 send 或者 write 向客户端发送数据。可以这样理解：如果客户端接收话剧慢，服务器发送数据快，那么服务器就得等客户端收完一批数据后才能再发下一批。

## 使用 epoll 函数来实现数据的收发

`ngx_c_socket.cc` 中的 `CSocekt::ngx_epoll_init()`

epoll 功能初始化，子进程中进行 ，这个函数被`ngx_worker_process_init()`所调用.

**实现逻辑**

- 首先调用 epoll_create 函数创建一个 epoll 对象，也就是创建了一个红黑树，还创建了一个双向链表，直接以epoll连接的最大项数为参数

```cpp
m_epollhandle = epoll_create(m_worker_connections); 
```

- 接着创建一个连接池

```cpp
 m_pconnections = new ngx_connection_t[m_connection_n]  //m_connection_n 连接池的大小
```

### 创建连接池的目的

目前项目有 2 个监听套接字，以后客户端连入后，每个用户还会产生 1 个套接字，套接字本身只是一个数字，但往往需要保存很多与这个数字相关的信息，这就需要把套接字数字本身与一块内存捆绑起来。所以，引入连接池的目的就是把套接字与连接池中的某个元素捆绑起来，将来就可以通过套接字取得连接池中的元素（内存），一遍读写其中的数据。

### 当一个客户端连入服务器之后，操作系统如何通知程序有新用户连入

把监听套接字相关信息作为一个红黑树节点增加到红黑树中，当监听套接字收到连接时，系统才能通知程序，所以，调用了自己定义的一个函数 `CSocket::ngx_epoll_add_event` 函数(在 `ngx_c_socket.h` 中)，这个函数中调用了 epoll_ctl 向红黑树中增加节点。

这个函数实现的逻辑：

- 用户三次握手连入是对于服务器是一种需要读的事件，所以增加的事件实际是 `EPOLLIIN | EPOLLRDHUP`（系统自定义事件）
- `CSocket::ngx_epoll_add_event`的参数中使用了 EPOLL_CTL_ADD 表示向红黑树增加节点。

通过上述代码，当监听套接字有可以读的事件（比如三次握手连入），该监听套接字就能够得到内核的通知

### 如何快速从该连接池中找到一个空闲连接分配给套接字

这里是借鉴了 epoll 的实现思想

- 项目中通过 `CSocekt::ngx_get_connection(int isock)` 和 `CSocekt::ngx_free_connection(lpngx_connection_t pConn)` 这两个函数来实现

- 借鉴 epoll 技术原理：创建红黑树，把套接字感兴趣的事件作为红黑树的节点加到红黑树中，接收到事件时，有事件的套接字会被内核放进双向队列中。

- 连接池的设计中，数组元素必然在数组中，这就是相当于 epoll 中的红黑树，然后专门用这个数组中空闲的元素构成一个单向链表从而达到快速找到空闲元素（只需要从空闲链表的链表头拿出该元素即可）的目的。

- 同时传递指针和一个二进制数字，在 `CSocekt::ngx_epoll_add_event()`中，利用指针的最后一个二进制位肯定不是 1 技巧，把一个额外的二进制位传递给一个 `void *`。最后在从 `void *`中把指针和这个二进制位拆解出来。

### 如何获取用户的连入事件并将用户接进来

项目中通过实现如下

```cpp
for (;;) 
{
  //处理网路事件和定时事件
  ngx_porcess_events_adn_times();
  ngx_epoll_process_events(-1);
}
```
项目中这个函数是在 worker 子进程中被调用，是放在子进程的 for 无限循环中，意味着这个函数是被不断调用的。


通过 accept 函数把完成了三次握手的客户端接入，也就是和客户端之间建立 TCP 连接，然后，用针对连入的 socket 把事件以及 EPOLLET（边缘触发）标志设置到 epoll 中。这样，后续客户端发送数据时，服务器就感受到了。



#### accept4 和 accept 的区别

这两个函数都是能接入完成了三次握手的客户端（也就是从已完成连接队列中把连接取出来），然后返回一个新的与客户端对应的套接字，用来与客户端通信。

但是 accept4 比 accept 多了一个能力，会自动将返回的客户端对应的套接字设置为非阻塞的，这样就不需要我们专门调用 `setnonblocking` 来设置（在写代码的时候，所有的套接字都必须设置成非阻塞的）。但是并不是所有的类 UNIX 操作系统都实现了 accept4 函数，所以需要判断 accept4 函数是否有效再使用。

### ET 和 LT 模式

#### LT 模式-水平触发

epoll 默认采用的是 LT 模式，只有使用 EPOLLET 参数才会使用 ET（边缘触发）

发生一个事件，如果程序不处理，那么这个事件就一直被触发，具体地说，就是一个新用户连入后，如果程序不调用 accept4 或者 accept 函数将这个用户接入（从已完成连接队列中取出来），使用 epoll_wait 函数获取事件时，就每次都能获取到用户连入的事件通知，也就是 EPOLLIN 事件，显然，这种触发方式效率不高。

#### ET 模式-边缘触发

这种触发只是对非阻塞 socket 有用，因为项目中用的都是非阻塞 socket，所以可以使用边缘触发模式，发生一个事件，内核只会通知程序 1 次，如果一个新用户连入，内核通知程序 1 次，程序必须使用 accept4 或者 accept 将这个新用户接入，如果这次没接进来就麻烦了，因为内核不会再次通知程序。因为边缘触发这种模式减少了通知的次数，所以效率更高。

目前的代码中，这几个监听套接字，在调用 epoll_ctl 增加事件的时候用的都是默认的 LT 模式，这样就能保证不丢失客户端的连接，因为内核会反复通知程序。

对于接入的 socket 连接（accept4 或者 accept 返回的 scoket 连接），程序中用了 ET 模式，从而提高程序工作效率。

### 事件驱动

事件驱动架构，就比如说客户端连入，三次握手完成，只要服务器注册了获取读事件，内核就会通知服务器，这就产生了一个事件，这里的事件发生源是客户端，通过事件收集器来收集和分发事件（这里的事件收集就是 epoll_wait 函数）。然后比如`CSocket::ngx_event_accept`这些函数就是事件处理函数，服务器准备用这些函数来处理或者消费事件。

> 注意：每个事件消费者（处理函数）都不能有阻塞行为，否则整个执行通道就会堵塞了。

### 腾讯面试题

> 使用 linux epoll 模型，水平触发模式，当 socket 可写时，会不停地触发 socket 可写事件，如何处理？

- 第一种方式

需要向 socket 写数据的时候才把 socket 可写事件通知加入 epoll 的红黑树节点，等待可写事件。当程序接受到来自系统的可写事件通知后，调用 write 或者 send 发送数据。所有数据都发送完毕后，把 socket 可写事件通知从 epoll 的红黑树节点中移除（移除的是可写事件通知，而不是红黑树节点）

这种方式的缺点：即使发送很少的数据，也要把 socket 可写事件通知加入 epoll 红黑树节点，写完后再把可写事件通知从 epoll 红黑树节点中删除，有一点的操作代价。

- 第二种方式

开始不把 socket 可写通知事件加入 epoll 的红黑树节点，需要发送数据时，直接调用 write 或者 send 发送，如果 write 或者 send 返回 EAGIN（缓冲区满了，需要等待可写事件才能继续往发送缓冲区写数据），再把 socket 的写事件通知加入 epoll 的红黑树节点。这就变成了在 epoll 的驱动下发送数据，全部数据发送完毕后，再把可写事件通知从 epoll 红黑树节点中删除

这种方式的优点是：数据不多的时候避免 epoll 的红黑树节点中针对写事件通知的增删，提高了程序执行效率。

### 深入理解ET LT

- LT 是水平触发，属于低速模式，如果事件还没处理完，就会被一直触发
- ET 是边缘触发，属于高速模式，这个事件的通知只会出现一次

### Epoll 中 ET 和 LT 模式的处理编码不同

如果发送来了数据，一个读事件就会被内核放到双向链表，如果我们不使用 recv 来接受数据或者只使用 recv 接受了部分数据，也就是说 TCP 连接的接受缓冲区中还有数据没有接受完

在 LT 模式下，内核就不会把这个读事件的节点从双向链表中删除，这样每次程序调用 epoll_wait 都能获取通知。

ET 模式不一样，不管我们是否调用 recv 来接受数据，一旦从双向链表中把读事件对应的节点取走，内核肯定把这个节点从双向链表中删除了，所以下次用 epoll_wait 去取事件时取不到的，除非后续客户端又发来了数据，内核会再次向这个双向链表中添加一个读事件的节点，程序使用 epoll_wait 才能再次收到读事件。


一般来讲，本项目的服务器程序，如果收发的数据包后固定格式，都建议采用 LT 模式--编程简单，清晰，写好了效率上估计也不会很差。

如果收发数据包没有固定格式，可以考虑采用 ET 模式，反复收数据，收完为止，编程难度较大，但是效率会高一些。再浏览器反问一个 web 服务器页面时，发送的数据就可能没有固定格式，浏览器一次可能向 web 服务器发送一大批数据，然后等 web 服务器回应。所以 nginx 采用的是 ET 模式。

### TCP 粘包和缺包

#### 客户端粘包

客户端采用了 Nagle 优化算法（参考网络实现），即使客户端 3 次调用 write 来发送数据包，Nagle 优化算法也很可能把这 3 次 write 调用打包成 1 个数据包直接发送给服务器，当然这个可以调用某个函数关闭 Nagle 优化算法，关闭后，可能这 3 次 write 调用就分成了 3 个数据包发送给服务器，客户端的数据包粘包问题就解决了。

但是代价就是本来 1 个包可以发送全部内容，现在分成 3 个包，每个包都要带 TCP 头，IP 头，以太网帧头等。多了这些头，效率显然要差一些。

#### 服务器粘包

就算客户端不粘包，服务器也存在粘包问题，服务器不可能随时都在 recv（接收）数据，可能 recv 完一次之后要做一些其他操作，需要时间，假设这期间客户端发送的 3 个包到了服务器， 保存在服务器针对这个 socket 连接（TCP连接）的接收缓冲区中，也就是说 abcdefgij 都在服务器的接收缓冲区中了，等服务器完成请他操作，调用 recv 接受数据，还是会一次把 abcdefgij 全部收到，这就叫做服务端的粘包。

#### 缺包

服务器调用 recv 收包时，收到多少数据都有可能，可能数据包小，一次就收完几个数据包，也可能因为网络迟延或数据包过大，几次才收完一个完整的包（缺包）

#### 粘包和缺包问题解决

要解决粘包问题就要把这几个包逐个拆出来，主要服务器能够正确区分出来每个包，那么粘包问题就解决了。

首先我们要给收发的数据包定义一个统一的格式，服务器端以及客户端都要按照这个格式来收发数据。

> 那么数据包的格式是怎样的呢？

就是包头 + 包体 的格式，收发的任何一个数据包，都要遵循这种包头+ 包体 的格式，其中包头是**固定长度**的。包头其实是一个结构，在包头中有一个成员，用于记录整个包的长度（包头+包体的长度），因为包头长度固定，并且能从包头中获取整个包的长度，用整个包的长度减去包头的长度，就可以得到包体的长度，从而能完整收到包体。

接受一个数据包的过程

- 先收固定长度的包头

- 根据包头中的内容，计算出包体长度

- 再收包体长度这么多的数据

这样就收到一个完整的数据包，于是，粘包问题就解决了。

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/tcp数据包.78v7tmsz1700.png)


### 收包分析

- 每个包虽然都是包头 + 包体形式，但是在本项目中规定，一个包的总长度不超过 30 000 字节。如果有人恶意伪造数据包包头，告诉服务器这个数据包长度是 300 亿字节，服务器程序不能收 300 亿字节才认为收包结束，那会把服务器程序内存消耗光的。所以这个规定主要是防止恶意伪造数据包或通信双方无意中写错数据包长度信息而将服务器置于危险境地。

#### 字节对齐问题

在 C/C++ 语言中，结构有 字节对齐 的问题，也就是说不同操作系统、不同编译器对于一个相同的结构，其 sizeof 值可能不同。包体也是一种结构，在客户端，sizeof 计算是 10 字节，发送出去，如果服务器相同的结构，sizeof 却是 12 个字节，如果服务端按照 10 字节收取，那整个收到的包就乱套了。所以，必须保证客户端和服务端对于同一个结构的 sizeof 值相同，项目中采用 **1字节对齐**的方式来定义结构，

也就是说，结构体成员内存之间不需要添加额外字节，一个挨着一个，这样就可以保证筒一个结构，在客户端和服务器，sizeof 值必然不同。这正是本项目所需要的。

注意，一个结构，如果在定义这个结构的程序内部使用，是否字节对齐无关紧要，但是如果要通过网络进行传输，就必须制定 1 字节对齐。

实现方式是在要指定 1 字节对齐的结构之前加一条语句：

```cpp
# pragma pack(1)  //对齐方式，1 字节对齐（结构之间不做任何字节对齐，紧密排列子啊一起）
```

然后如果要还原默认的字节对齐方式

```cpp
# pragma pack() //取消指定对齐，恢复默认对齐
```

#### 怎么处理数据包过期问题

#### 服务端怎么识别客户端断线问题


```cpp
//消息头，引入的目的是当收到数据包时，额外记录一些内容以备将来使用
typedef struct _STRUC_MSG_HEADER
{
	lpngx_connection_t pConn;         //记录对应的链接，注意这是个指针
	uint64_t           iCurrsequence; //收到数据包时记录对应连接的序号，将来能用于比较是否连接已经作废用
	//......其他以后扩展	
}STRUC_MSG_HEADER,*LPSTRUC_MSG_HEADER;
```


使用**消息头**来处理，也就是对于服务端，一个完整的数据包应该是 **消息头+包头+包体**，其中包头+包体来自客户端，消息头是服务器后增加上去的。

如果收到客户端发送来的一个数据包，服务器处理这个数据包对应的业务用了 3 秒，处理完成并向客户端发送结果时客户端可能已经断线了，所以需要消息头来识别客户端是否断线。观察消息头结构`_STRUC_MSG_HEADER`成员，其中 pConn 用于记录 socket 连接对应的连接池中连接的内存地址，`iCurrsequence`是个序号，从连接池中获取一个连接（CSocket::ngx_get_connection 函数）时，这个序号值会再次 +1 。

当收到一个客户端发送来的数据包时，就把这个序号记录在所收到包的**消息头**中，处理完数据包并向客户端回应时，在比较消息头中的序号与这时候连接池中这个连接的序号，如果两者不相等，表示该客户端已经断线了（断线的客户端会因为调用了 `CSocket::ngx_free_connection`函数使对应的连接池中连接的序号 + 1），就不需要向客户端回应数据包了。

此外，我们考虑到消息头和包头的 sizeof 值会经常使用，所以在 CSocket 类中引入 2 个成员变量，专门用于保存消息头和包头的 sizeof 值。

```cpp
	//一些和网络通讯有关的成员变量
	size_t  m_iLenPkgHeader;                      	
	size_t  m_iLenMsgHeader;    
```

### 收包流程

`CSocket::ngx_write_request_handler()` 函数中

- 首先调用`CSocket::ngx_write_request_handler()`函数将收包初始化以及分配内存

- 利用`CSocket::recvproc`函数来收包（其实开始收的就是包头）
  - 内部其实是调用系统函数 recv 来收包的

- 刚开始是收包头，如果包头收完整了，就调用`CSocket::ngx_wait_request_handler_proc_p1`函数处理该包头，如果包头没收完整，这进入`_PKG_HD_RECVING`状态并继续收包头中剩余的字节。总之，只要包头接收完整，就调用`CSocket::ngx_wait_request_handler_proc_p1`函数来处理。

- 接着开始**处理收到的数据包**
  - 取出整个包的长度放在 e_pkgLen 变量中，根据包的长度判断是否是恶意包并做相应处理，注意，收到一个合法的包头之后，分配足以保存消息头+包头+包体的内存，把消息头、包头率先保存进去。然后继续为后续包体做准备（如果有包体）。如果有一个恶意用户，向服务器只发包头不发包体（甚至发完包头后直接关闭 socket 连接），服务器如何释放刚刚分配的这块内存呢？

  - 项目中在 ngx_connection_t 的结构体中引入了 `ifnewrecvMem`成员，标记新建了一块内存，并用一个指针 `pnewMemPointer`成员指向这块内存。一旦数据包没接收完整，客户端就关闭 `socket`连接，服务器端也能及时回收这块分配出去的内存，以防内存泄漏。

- 包体没收完整，就设置收包状态为 `_PKG_BD_RECVING`并继续收包体；如果包体也收完整了，就调用`CSocket::ngx_wait_request_handler_proc_plast`函数处理整个包。

  - 这里把消息体放进消息队列中，然后重新设置收包状态
  - 为了防止不断向消息队列中放数据导致内存耗费严重，需要适当清理数据，比如当消息数量超过 1000 条时就做清理操作。

到目前为止整个收包流程就完成了。


--------------------------

## 服务器业务逻辑处理框架

服务器首先要通过 包头+包体 的格式正确接收客户端发送过来的请求数据包，根据请求，指派线程池中的一个线程去执行对应的业务逻辑，并将业务的处理结果以包头+包体的格式反馈给客户端。

### 使用多线程解析和处理数据包

> 将接收的数据包放在接收消息队列中，然后对这些数据包进行解析。那么怎么去处理和解析这些数据包呢？    
> 采用 **多线程** 

如果服务器正好开启了几百个线程，但是恰好有几百个任务需要线程处理，那么这几百个线程都卡住，后续的任务就只能等待了。

所以为了保证及时处理用户需求（处理用户的业务逻辑）可能需要启动几十个甚至上百个线程。这些线程专门用于处理用户逻辑，与网络通信启动的线程不同，比如 epoll 这类技术就没有额外启动网路通信线程，而是在主线程中进行数据的接收。

项目中的 `CSocket::inMsgRecvQueue()` 函数用于向消息队列（接收消息的队列，简称消息队列）中仿消息，如果有多个线程要到这个消息队列中去走消息并进行处理(虽然有多个线程，但是每条消息只能有 1 个线程成功取到并处理)，这就以为着，由主线程把收到的消息放进消息队列，但可能有若干个线程从这个队列取消息并进行处理，所以，操作这个消息队列时线程间是互斥的。

- POSIX 线程：定义了创建和操作线程的一套 API ，这些函数一般都是以 pthread 开头。linux 下多线程相关的开发一般采用的就是 POSIX 线程标准，所以提供这些函数一般都是 pthread_xxx 开头。

-----

### 代码实现笔记

#### 消息队列临界问题

可能有多个线程从消息队列中取数据，所以无论是 入消息队列 还是 出消息队列，都需要**临界**（或者说**互斥**，保证同一时刻只有 1 个线程能够访问这个队列。我们可以引入 **互斥量**来解决这个问题。

> 互斥量实际上就是一把 **锁**

在 `ngx_c_socket.h` 中定义一个 收消息队列互斥量 的成员变量。

```cpp
thread_mutex_t					m_recvMessageQueueMutex;  //收到消息互斥量
```

并在`ngx_c_socket.cxx` 的构造函数和析构函数中加入互斥量初始化和释放的语句。


```cpp
//互斥量初始化
pthread_mutex_init(&m_recvMessageQueueMutex,NULL);
//互斥量释放
pthread_mutex_destroy(&m_recvMessageQueueMutex);
```

### 互斥锁 pthread_mutex_init 函数

POSIX 下抽象了一个锁类型的结构：`ptread_mutex_t`。通过对这个结构的操作，来判断资源是否可以访问。顾名思义，加锁(`lock`)后，别人就无法打开，只有当锁没有关闭(`unlock`)的时候才能访问资源。

也就是**对象互斥锁**的概念，来保证在任一时刻，只能有一个线程访问该对象。

### 线程相关

 在`Linux`中，新建的线程并不是在原先的进程中，而是系统通过一个系统调用`clone()`。该系统调用`clone()` copy 了一个和原先进程完全一样的进程，并在这个进程中执行线程函数。不过这个 copy 过程和 fork 不一样。 copy 后的进程和原先的进程共享了所有的变量，运行环境。这样，原先进程中的变量变动在 copy 后的进程中便能体现出来。

#### 线程标识

线程 ID 是用 pthread_t 数据类型来表示。实现的时候可以用一个结构来代表 pthread_t 数据类型，因此必须使用一个函数一个函数来对两个线程 ID 进程比较

```c
#include <pthread/h>
int pthread_equal(pthread_t tid1,pthread_t tid2);
```

此外，线程可以通过 pthread_self 函数获得自身的线程 ID

#### 单个线程的终止

单个线程可以通过 3 种方式退出，可以在不终止整个进程的情况下，停止它的控制流

- 线程可以简单地从启动例程中返回，返回值是线程的退出码
- 线程可以被同一进程中的其他线程取消
- 线程调用 pthread_exit

```c
void pthread_exit(void *rval_ptr) //rval_ptr是一个无类型指针。
```

##### pthread_join 函数

代码中如果没有`pthread_join`主线程会很快结束从而使整个进程结束，从而使创建的线程没有机会开始执行就结束了。加入`pthread_join`后，主线程会一直等待直到等待的线程结束自己才结束，使创建的线程有机会执行。

```c
int pthread_join(pthread_t thread, void **value_ptr);
thread：等待退出线程的线程号。
value_ptr：退出线程的返回值。
```

可以通过`pthread_join()`函数来使主线程阻塞等待其他线程退出，这样主线程可以清理其他线程的环境。但是还有一些线程，更喜欢自己来清理退出 的状态，他们也不愿意主线程调用`pthread_join`来等待他们。我们将这一类线程的属性称为`detached` [`/dɪˈtætʃd/`] （分离的）。如果我们在调用 `pthread_create()`函数的时候将属性设置为 NULL，则表明我们希望所创建的线程采用默认的属性，也就是`jionable`（此时不是`detached`）。

如果需要将属性 设置为`detached`。则应该如下设定：

```c
pthread_attr_t  attr;
pthread_attr_init(&attr);
pthread_attr_setdetachstate(&attr,  PTHREAD_CREATE_DETACHED);
pthread_create(&pthreadid,  &attr,  myprocess,  &arg);
```

在线程设置为`joinable`后，可以调用`pthread_detach()`使之成为`detached`。但是相反的操作则不可以。还有，如果线程已经调用`pthread_join()`后，则再调用`pthread_detach()`则不会有任何效果。

线程可以通过自身执行结束来结束，也可以通过调用`pthread_exit()`来结束线程的执行。另外，线程甲可以被线程乙(但这两个线程必须属于同一个进程)被动结束。这个通过调用`pthread_cancel()`来达到目的。

```c
int pthread_cancel(pthread_t thread);  //函数调用成功返回0。
```




------


步骤：

**入消息队列**：`CSocket::inMsgRecvQueue()`

- 首先是自动加锁加锁，下面语句会创建一个 lock 锁对象，会自动执行 CLock 类的构造函数，这样就自动加锁了，当整个函数执行完之后，lock 这个全局对象会被自动析构，会自动执行 Clock 类的析构函数，这样就自动解锁了。

- 我们还需要记录消息队列的大小，后续可能会用，直接使用一个变量那来记录，因为考虑到效率的问题，并没有使用`size()`函数

**出消息队列**：`CSocket::outMsgRecvQueue()`

- 一个主线程往消息队列中放客户端发来的数据，然后有一批线程从消息队列中读数据

- 也是使用加锁的方式达到 互斥 的目的

- 在读数据的时候，将消息从消息队列中移除，消息队列大小自动减 1 并将这条消息的首地址返回。

### 什么是线程池

就是提前创建的一批线程，并创建一个类来同一管理和调度这批线程，收到一个任务（一个消息），就从这批线程中找出一个空闲的线程去做这个任务，任务处理完成后，线程中有个循环语句，可以使这个线程循环回来等待新的任务，这就好像这个线程可以回收再利用一样。

### 项目中怎么使用线程池

本项目使用 POSIX 的线程标准库（ pthread 库），这个库不是 linux 下默认的库，所以在使用 g++ 编译项目时，g++ 命令末尾要增加 -lpthread 选项，否则会报链接错误。



### 线程池功能的实现

- 我们定义了一个 CThreadPool 类来管理线程池，这个类中定义了一个内存结构，用来记录线程相关信息，也就是说每创建一个线程，就建一个 ThreadItem 对象与该线程绑定。这个其实与客户端连接三次握手进入服务器后服务器要从连接池中取出一个连接时相同的道理。

- 接着调用 Create 函数创建线程池

- 然后我们使用`std::vector<ThreadItem *>  m_threadVector`将所有生成的 ThreadItem 对象都放在容器中。

- 后线程入口函数`static void* ThreadFunc(void *threadData);`我们定义为静态成员函数,然后通过一个 while 循环来完成主要逻辑。然后就实现了线程池了。

> 详细代码见`ngx_c_threadpool.cxx`

关于这个 while(true) 循环

- 需要要考虑临界，一个进程进入了临界区，另外一个线程就要卡在这里等着了。
- 然后从消息队列中取出一条消息
- 接着调用 `pthread_cond_wait`系统函数等待条件变量`m_pthreadCond`处于激活状态，否则该函数就一直卡在这里，同时释放`m_pthreadMutex`互斥量，让别的线程执行。
- 当`Create`函数执行完毕后，所有的线程都卡在`pthread_cond_wait`这里等待任务，并且`m_pthreadMutex`**互斥量**处于被释放状态。


### 使用 crc32 算法解决数据包收发过程中内容被篡改的问题

引入 CRC32 的目的是对收发的数据包进行简单校验，以确保数据包中的内容是没有被篡改的。这部分代码是借鉴过来的。

项目中主要是用到 Get_CRC 这个成员函数，这个函数的作用是：给定一段内存以及该内存的长度，可以计算出 crc32 值并返回，这段给定的内存内容或长度如果不同，返回的数字一般就会不同

当客户端将要发送一个数据包给服务器时，会提前把这个数据包的包体通过该函数计算出一个 crc32 值，放到要发送的数据包内。服务器收到一个完整的数据包之后，会根据收到的包体内容计算包体 crc32 值，与客户端发送过来的 crc32 值比较，如果 2 个 值相同，就认为这个数据包合法，否则就认为不合法丢弃。

如果一个恶意的客户端，就算破解出本项目的包格式（包头+包体），只要他破解不出服务端用的 crc32 算法，他发过来的数据包就不会被服务器认可，会被服务器丢弃。为本项目的网络服务器多了一层保障。

## 连接池中连接资源的回收

为了整个服务器工作的稳定，如果服务器程序判断某个连接不用了，不应该立即放入空闲列表中，而是放到一个地方等待一段时间，在回收到空闲列表中，只有回收到空闲连接列表中的连接才能被分配给新的客户端使用。这个连接不理解回收能够很大程度上 **确保服务器的稳定** 


