
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
    - [va_start 和 va_end 使用](#va_start-和-va_end-使用)
    - [日志等级划分](#日志等级划分)
    - [日志初始化](#日志初始化)
    - [日志输出时遇到了问题](#日志输出时遇到了问题)
  - [信号功能实现](#信号功能实现)
    - [怎么创建 worker 子进程](#怎么创建-worker-子进程)
  - [关于write文件的思考](#关于write文件的思考)
    - [写日志混乱问题](#写日志混乱问题)
  - [守护进程以及信号处理](#守护进程以及信号处理)
    - [守护进程的实现](#守护进程的实现)
    - [避免子进程变成僵尸进程](#避免子进程变成僵尸进程)
- [网络通信](#网络通信)
  - [一个浏览器访问网页的过程](#一个浏览器访问网页的过程)
  - [客户端和服务端通信demo](#客户端和服务端通信demo)
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
- [服务器业务逻辑处理框架](#服务器业务逻辑处理框架)
  - [多线程和线程池](#多线程和线程池)
    - [消息队列临街问题](#消息队列临街问题)
    - [项目中怎么使用线程池](#项目中怎么使用线程池)
    - [线程池功能的实现](#线程池功能的实现)
    - [线程池临界区问题（就是线程同步）](#线程池临界区问题就是线程同步)
    - [使用 crc32 算法解决数据包收发过程中内容被篡改的问题](#使用-crc32-算法解决数据包收发过程中内容被篡改的问题)
  - [进程退出时线程的安全终止](#进程退出时线程的安全终止)

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

#### va_start 和 va_end 使用



```c
void va_start(va_list ap, last_arg);
```

对ap进行初始化，让ap指向可变参数表里面的**第一个参数**。第一个参数是 ap 本身，第二个参数是在变参表前面紧挨着的一个变量，即“...”之前的那个参数；





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

#### 日志输出时遇到了问题

`printf` 函数不加“`\n`”无法及时输出，就是说，我们在实现`ngx_vslprintf`函数测试的时候，等待了好几秒，发现屏幕上迟迟没有日志输出的结果，然后突然之间，在屏幕上出现一大堆输出结果。

后来查了 `printf()`底层实现后发现，这是 **行缓存（输出缓冲区)的问题**，标准输入输出函数都是带有缓存的，一般是行缓存（还发现 window 系统上没有这个问题，但是 Unix 系统就有），就是把需要输出的数据先缓存到某个地方，等待 **行刷新标志** 或者 **缓存已满** 的情况下，才会把缓存的数据显示出来。

“`\n`” 可以认为是刷新标志，也可以通过调用 `fflush(stdout)` 函数刷新缓冲区，将结果显示出来。



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

### 关于write文件的思考

#### 写日志混乱问题

> 本项目是 1 个master 进程，4 个worker 进程，如果这 5 个进程同时向日志文件中写日志，就会造成日志混乱的问题。

-在 master 进程 ` ngx_master_process_cycle()` 函数中的无限循环代码中增加一条日志输出。

```cpp
for( ; ; ) {
	ngx_log_error_core(NGX_LOG_ALERT,errno,"ngx_master_process_cycle()中sigprocmask()失败!");	
}
```

-在 worker 进程 ` ngx_worker_process_cycle()` 函数中的无限循环代码中增加一条日志输出。

```cpp
for( ; ; ) {
	ngx_log_error_core(NGX_LOG_ALERT,errno,"ngx_worker_process_cycle()中sigprocmask()失败!");	
}
```

这样就可以解决日志混乱的问题了。

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

#### 避免子进程变成僵尸进程

> 使用 `kill -9` 命令杀死一个 worker 进程后，再次使用 ps 命令查看发现这个 worker 进程并没有消失，而是变成了僵尸进程。

**解决方案**

在父进程中接收 SIGCHILD 信号并在其中调用 waitpid 来解决这个问题

信号处理函数：`ngx_signal_handler()`

大致的逻辑是

- 在函数中，通过一个 for 语句 `for (sig = signals; sig->signo != 0; sig++)` 遍历信号数组，寻找收到的信号
- 针对 master 进程，在收到 SIGCHLD 信号(子进程退出，父进程就会收到这个信号)后，会将一个全局标记（全局变量）`ngx_reap`设置为 1，目前本项目中并没有用到这个标记，但是将来可能会用到，（如果 worker 子进程运行崩溃或者被杀掉后，master 进程就可以通过该标记重新 fork 出一个子进程）
- 真正处理僵尸进程是通过调用 `ngx_process_get_status` 函数并在该函数中调用了系统函数 waitpid 来进行的。

这样就实现了子进程一旦死掉之后，父进程可以通过调用 waitpid,防止子进程变成僵尸进程。

----------

## 网络通信

### 一个浏览器访问网页的过程

比如说在客户端浏览器中输入`www.taobao.com`并按回车，浏览器向淘宝网服务器发送了一个数据包，大概意思就是告诉淘宝网：“我需要访问你，清把你的网页内容传递给我”，淘宝网服务器收到这个请求之后，就把某个约定好的网页传递到浏览器中上。

因为互联网的数据包大小最大为 1.5KB 左右，而淘宝网页面上内容很多，可能有成百上千个 1.5KB ，所以淘宝网就像客户端的类论文发送成百上千个数据包。

在收取数据包的过程中，浏览器也要不断地发送一回应包告诉淘宝服务器：“我收到了一些数据包，请继续发送给我下面的数据包。” 

因为淘宝网也不能一股脑地把数据包塞给服务器，以免浏览器处理不过来。

简单的说就是：淘宝网服务器给浏览器返回一个数据包，浏览器收到后会给淘宝服务器返回应一个数据包，然后淘宝网才会继续给浏览器返回剩余的数据包。

最终，数据传递完毕之后，双方发送一些特殊标志的数据包，来标识所有数据全部传送完毕了。就这样本次浏览器和服务器的通信就结束了。

### 客户端和服务端通信demo

- server.c

```c

#include <stdio.h>
#include <ctype.h>
#include <unistd.h>
#include <sys/types.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <stdlib.h>
#include <string.h>

#define SERV_PORT 9000  //本服务器要监听的端口号，一般1024以下的端口很多都是属于周知端口，所以我们一般采用1024之后的数字做端口号

int main(int argc, char *const *argv)
{    
    //这些演示代码的写法都是固定套路，一般都这么写

    //服务器的socket套接字【文件描述符】
    int listenfd = socket(AF_INET, SOCK_STREAM, 0);    //创建服务器的socket，大家可以暂时不用管这里的参数是什么，知道这个函数大概做什么就行

    struct sockaddr_in serv_addr;                  //服务器的地址结构体
    memset(&serv_addr,0,sizeof(serv_addr));
    
    //设置本服务器要监听的地址和端口，这样客户端才能连接到该地址和端口并发送数据
    serv_addr.sin_family = AF_INET;                //选择协议族为IPV4
    serv_addr.sin_port = htons(SERV_PORT);         //绑定我们自定义的端口号，客户端程序和我们服务器程序通讯时，就要往这个端口连接和传送数据
    serv_addr.sin_addr.s_addr = htonl(INADDR_ANY); //监听本地所有的IP地址；INADDR_ANY表示的是一个服务器上所有的网卡（服务器可能不止一个网卡）多个本地ip地址都进行绑定端口号，进行侦听。

    bind(listenfd, (struct sockaddr*)&serv_addr, sizeof(serv_addr));//绑定服务器地址结构体
    listen(listenfd, 32);     //参数2表示服务器可以积压的未处理完的连入请求总个数，客户端来一个未连入的请求，请求数+1，连入请求完成，c/s之间进入正常通讯后，请求数-1

    int connfd;
    const char *pcontent = "I sent sth to client!"; //指向常量字符串区的指针
    for(;;)
    {
        //卡在这里，等客户单连接，客户端连入后，该函数走下去【注意这里返回的是一个新的socket——connfd，后续本服务器就用connfd和客户端之间收发数据，而原有的lisenfd依旧用于继续监听其他连接】        
        connfd = accept(listenfd, (struct sockaddr*)NULL, NULL);

        //发送数据包给客户端
        write(connfd,pcontent,strlen(pcontent)); //注意第一个参数是accept返回的connfd套接字
        
        //只给客户端发送一个信息，然后直接关闭套接字连接；
        close(connfd); 
    } //end for
    close(listenfd);     //实际本简单范例走不到这里，这句暂时看起来没啥用
    return 0;
}
```

- client.c

```c
#include <stdio.h>
#include <ctype.h>
#include <unistd.h>
#include <sys/types.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <stdlib.h>
#include <string.h>


#define SERV_PORT 9000    //要连接到的服务器端口，服务器必须在这个端口上listen着

int main(int argc, char *const *argv)
{    
    //这些演示代码的写法都是固定套路，一般都这么写
    int sockfd = socket(AF_INET, SOCK_STREAM, 0); //创建客户端的socket，大家可以暂时不用管这里的参数是什么，知道这个函数大概做什么就行

    struct sockaddr_in serv_addr; 
    memset(&serv_addr,0,sizeof(serv_addr));

    //设置要连接到的服务器的信息
    serv_addr.sin_family = AF_INET;                //选择协议族为IPV4
    serv_addr.sin_port = htons(SERV_PORT);         //连接到的服务器端口，服务器监听这个地址
    //这里为了方便演示，要连接的服务器地址固定写
    if(inet_pton(AF_INET,"192.168.1.126",&serv_addr.sin_addr) <= 0)  //IP地址转换函数,把第二个参数对应的ip地址转换第三个参数里边去，固定写法
    {
        printf("调用inet_pton()失败，退出！\n");
        exit(1);
    }

    //连接到服务器
    if(connect(sockfd,(struct sockaddr*)&serv_addr,sizeof(serv_addr)) < 0)
    {
        printf("调用connect()失败，退出！\n");
        exit(1);
    }

    int n;
    char recvline[1000 + 1]; 
    while(( n = read(sockfd,recvline,1000)) > 0) //仅供演示，非商用，所以不检查收到的宽度，实际商业代码，不可以这么写
    {
        recvline[n] = 0; //实际商业代码要判断是否收取完毕等等，所以这个代码只有学习价值，并无商业价值
        printf("收到的内容为：%s\n",recvline);
    }
    close(sockfd); //关闭套接字
    printf("程序执行完毕，退出!\n");
    return 0;
}
```

### TCP 三次握手

#### 最大传输单元 MTU

MTU 就是每个数据包所能包含的最大字节数，大小约为 1.5KB，因为一个数据包中还包含 TCP 头，IP 头的内容，所以，每个数据包中，真正能够容纳的有效数据内容可能无法大袋 1.5KB ，应该是 1.46KB 左右。

假如发送的数据大于 1.5KB，那么操作系统就会对数据进行**分片**，也就是把数据拆分成若干个数据包，每个数据包约为 1.5KB，然后发出去，对端的操作系统收到后再重组这些数据包。

#### Telnet 工具

Telnet 工具能够方便地测试服务器的某个 TCP 端口是否通畅、数据能否正常收发等。

#### Wireshark监视数据包软件

用来抓包分析网络问题

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

(1)如果两个队列之和【已完成连接队列，和未完成连接队列】达到了listen()所指定的第二参数，也就是说队列满了；此时，再有一个客户发送syn请求，服务器怎么反应？

实际上服务器会忽略这个syn，不给回应； 客户端这边，发现syn没回应，过一会会重发syn包；

(2)从连接被扔到已经完成队列中去，到`accept()`从已完成队列中把这个连接取出这个之间是有个时间差的，如果还没等`accept()`从已完成队列中把这个连接取走的时候，客户端如果发送来数据，这个数据就会被保存再已经连接的套接字的接收缓冲区里，这个缓冲区有多大，最大就能接收多少数据量；

### SYN 攻击

如果一个黑客通过一些特殊的手段，伪造自己的 IP 地址和端口号，不停地给服务器发送 SYN 包（也就是三次握手的第 1 次握手包），就会导致服务器未完成连接队列的条目越来越多，当 未完成连接队列 和 已完成连接队列 已满了，服务器就会忽略掉后续再来的 SYN 包，无法建立正常的 TCP 连接了。因为正常 TCP 连接的三次握手的第 1 次握手包（ SYN 包）被忽略了。


### 阻塞与非阻塞

- 阻塞 IO

阻塞：就是调用一个函数，该函数就卡在这里，整个程序流程不会往下走了（此时程序进入休眠状态）。这个函数等待一个时间发生，只有这个事件发生了，程序才会继续玩下走（也就是程序才会继续运行）

这种函数就是 **阻塞函数**，比如服务器使用 accept 函数，调用 accept 时，程序执行流程就卡在 accept 这里，等待客户端连接，只有客户端连接，三次握手成功，accept 才会返回。

- 非阻塞 IO

非阻塞 IO 和 阻塞 IO 是相对的，就比如说刚刚说到的 accept ，如果通过调用某个函数，把监听套接字设置成非阻塞，那么调用 accept 的时候，就算没有客户端连接，这个 accept 调用也不会卡住，会立即返回（当然返回时会有个错误码，我们可以根据这个错误码判断 accept 返回的原因），这样就能充分利用操作系统给进程分配的时间片来做别的事情，执行效率就更高了。

### 异步和同步

- 异步 IO

调用一个异步 IO 函数接收数据时，不管有没有数据，该函数都会立即返回。但是，我们在调用异步 IO 函数时要指定一个接受数据的缓冲区，还要指定一个回调函数，其他的事情操作系统去做了，程序可以自由地干其他事情。

操作系统会判断数据是否到来，如果到来了，操作系统会把数据复制到我们指定的接受数据的缓冲区，然后调用我们所指定的回调函数来通知程序。

> **非阻塞 IO 和 异步 IO 的差别**？
> - 非阻塞 IO 要不停地调用 IO 函数检查数据是否到来，如果数据到来了，就卡在 IO 函数这里把数据从内核缓冲区复制到用户缓冲区，然后这个 IO 函数才能返回
> - 异步 IO 不需要不停地调用 IO 函数检查数据是否到来，只需要调用 1 次，然后就去做其他事情了，由内核检查数据的到来，内核负责把数据复制到指定缓冲区，整个过程进程并没有被卡住

- 同步 IO

调用一个同步 IO 函数接受数据时，在没有得到结果之前，这个调用就不返回。也就是必须一件一件事做,等前一件做完了才能做下一件事。同步 IO 需要调用 2 个函数才能取到数据，它的优点就是得到了所谓的 IO 复用的能力。

### 监听端口

> 以服务器监听 2 个端口为例 

本服务器项目的体系结构式 1 个master 进程和多个 worker 进程，主要做事的就是和客户端通信的 worker 进程。

因为服务器是被动等待连接的，需要在一些端口上进程监听并等待客户端连接，所以先要实现监听端口。

```cpp
bool CSocekt::ngx_open_listening_sockets()
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

epoll 功能初始化，子进程中进行 ，本函数被`ngx_worker_process_init()`所调用


## 服务器业务逻辑处理框架

服务器首先要通过 包头+包体 的格式正确接收客户端发送过来的请求数据包，根据请求，指派线程池中的一个线程去执行对应的业务逻辑，并将业务的处理结果以包头+包体的格式反馈给客户端。

### 多线程和线程池

> 将接收的数据包放在接收消息队列中，然后对这些数据包进行解析。那么怎么去处理和解析这些数据包呢？    
> 采用 **多线程** 

- POSIX 线程：定义了创建和操作线程的一套 API ，这些函数一般都是以 pthread 开头。

#### 消息队列临街问题

可能有多个线程从消息队列中取数据，所以无论是 入消息队列 还是 出消息队列，都需要**临街**（或者说**互斥**，保证同一时刻只有 1 个线程能够访问这个队列。我们可以引入 **互斥量**来解决这个问题。

在 `ngx_c_socket.h` 中定义一个 收消息队列互斥量 的成员变量。并在`ngx_c_socket.cxx` 的构造函数和析构函数中加入互斥量初始化和释放的语句

```cpp
pthread_mutex_init(&m_recvMessageQueueMutex,NULL);
pthread_mutex_destroy(&m_recvMessageQueMutex,NULL); 
```

#### 项目中怎么使用线程池

本项目使用 POSIX 的线程标准库（ pthread 库），这个库不是 linux 下默认的库，所以在使用 g++ 编译项目时，g++ 命令末尾要增加 -lpthread 选项，否则会报链接错误。

我们定义了一个 CThreadPool 类来管理线程池，这个类中定义了一个内存结构，用来记录线程相关信息，也就是说每创建一个线程，就建一个 ThreadItem 对象与该线程绑定。这个其实与客户端连接三次握手进入服务器后服务器要从连接池中取出一个连接时相同的道理。

#### 线程池功能的实现
#### 线程池临界区问题（就是线程同步）

- 设置临界，一个线程进入临界区，另一个线程就跌卡在这里等着。

使用的是互斥量 

> 斥量用于线程的互斥，信号量用于线程的同步。

#### 使用 crc32 算法解决数据包收发过程中内容被篡改的问题

客户端将要发送一个数据包给服务器时，会提前把这个数据包的包体通过`Get_CRC`函数技术拿出一个 crc32 的值，放到发送的数据包内，服务器收到一个完整的数据包之后，会根据收到的包体内容计算包体的 crc32 值，与客户端发送过来的 crc32 值比较，如果 2 个值相同，就认为这个数据包合法，否则认为不合法丢弃。

### 进程退出时线程的安全终止

在本项目中没有完美的回收所有的资源，但是如果是要设计优雅地退出进程的话，应该先让 ServerRecyConnectionTread 线程先退出，应该需要找个合适的位置把全局变量 g_stopEvent 设置为 1.这样 ServerRecyConnectionTread 线程就会跳出 while(1) 无线循环并结束自身的运行。同时，通过在其他线程（如主线程）中调用 pthread_join 系统函数，等待 ServerRecyConnectionTread 线程的执行结束。


