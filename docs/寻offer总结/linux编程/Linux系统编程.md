<font color="green" size=4>更多读书笔记关注公众号:**零K同学**</font>



<!-- TOC -->

- [Linux常见命令](#linux常见命令)
- [gcc的工作流程](#gcc的工作流程)
- [按下开机键 linux 系统发生了什么](#按下开机键-linux-系统发生了什么)
- [介绍 Linux 中的 pthread](#介绍-linux-中的-pthread)
- [说说静态库和动态库](#说说静态库和动态库)
  - [静态库](#静态库)
  - [静态库的制作](#静态库的制作)
  - [静态库的使用](#静态库的使用)
  - [共享库/动态库](#共享库动态库)
  - [动态库的制作](#动态库的制作)
  - [动态库/共享库的使用](#动态库共享库的使用)
    - [遇到了什么问题？怎么解决？](#遇到了什么问题怎么解决)
  - [静态库与动态库的比较](#静态库与动态库的比较)
- [linux文件有哪几种权限，怎么授权？](#linux文件有哪几种权限怎么授权)
  - [修改文件的权限](#修改文件的权限)
  - [修改文件所有者和所属组](#修改文件所有者和所属组)
- [说一下 makefile](#说一下-makefile)
  - [要生成静态库和动态库, Makefile怎么写？](#要生成静态库和动态库-makefile怎么写)

<!-- /TOC -->

---------------------

## Linux常见命令

- 使用`ifconfig` 查看自己的`IP`地址

- `find`和`grep`命令查找文件或者文件内容

```bash
# 按照文件名查找文件
find ./ -name "*.cpp" | grep "mian"

# xargs 查看文件里面的内容
find ./ -name "*llo" |  grep -n -i "World"    # 加 -n 是显示行 加-i是不区分大小写
```
- `top`命令用于实时显示 进程或者系统 的动态。

- grep 命令

`-v` 或`--revert-match` 反转查找。		


- 使用管道			

比如`ps -ef | grep bash`这里的`|`就是匿名管道，可以使用`mkfifo myPipe`创建有名管道

- `kill -l` 命令查看信号，或者使用`kill -9 进程号`杀死一个进程


- 通过`ps aux`查看进程的状态

当时在实习的时候，用的比较多网络相关的命令吧。比如：

- 查看主机名字
  - `hostname`
    - hostname –d 显示机器所属域名
    - hostname –f 显示完整的主机名和域名
    - hostname –i 显示当前机器的 ip 地址
- `ping`命令确认网络是否通畅
- `telnet`命令，通过 `telnet` 协议连接目标主机，如果 `telnet` 连接可以在任一端口上完成就代表着两台主机间的连接良好。
  - `telnet hostname port` –-> 使用指定的端口 `telnet` 主机名。这通常用来测试主机是否在线或者网络是否正常。
- `netstat`: 查看网络连接情况，查看端口是否被监听，
  - `netstat –tcp or netstat –t` 将会显示 `TCP` 连接
  - `netstat –udp or netstat –u` 将会显示 `UDP` 连接
  - `netstat -g` 将会显示该主机订阅的所有多播网络。

--------

## gcc的工作流程

![](./img/gcc.png)

```
// 预处理  cpp预处理器，去掉注释，展开头文件，宏替换
gcc -E test.c -o test.i

// 编译 gcc,将源代码文件编译成汇编语言代码
gcc -S test.i -o test.s

// 汇编：as, 将汇编语言代码编译成了二进制文件(目标代码)
gcc -c test.s -o test.o

// 链接: ld, 链接test.c代码中调用的库函数
gcc test.o -o test
```

## 按下开机键 linux 系统发生了什么

当我们按下电源键，计算机会自动从主板 BIOS 中读取存储的程序

然后计算机会从你选择的存储设备中读取 512 bytes 的 引导记录 MBR，MBR会告诉电脑从该设备的某一个分区(partition)来装载引导加载程序(boot loader)。比如操作系统名称，操作系统内核 (内核)所在位置等

随后，boot loader会帮助我们加载内核(kernel)。内核实际上是一个用来操作计算机的程序，它是计算机操作系统的内核，主要的任务是管理计算机的硬件资源，充当软件和硬件的接口。

> 小结：BIOS -> MBR -> 引导加载程序 -> 内核

如果我们加载的是 Linux 内核，Linux 内核开始工作。内核会首先预留自己运行所需的内存空间，然后通过驱动程序(driver)检测计算机硬件。这样，操作系统就可以知道自己有哪些硬件可用。随后，内核会启动一个init进程。它是 Linux 系统中的1号进程( Linux 系统没有0号进程)。到此，内核就完成了在计算机启动阶段的工作，交接给 init 来管理。


随后，init会运行一系列的初始脚本(startup scripts)，这些脚本是Linux中常见的shell scripts。这些脚本执行如下功能：

> 设置计算机名称，时区，检测文件系统，挂载硬盘，清空临时文件，设置网络……

当这些初始脚本，操作系统已经完全准备好了，只是，还没有人可以登录。init 会给出登录( login )对话框，或者是图形化的登录界面。

输入用户名(比如说 kendall )和密码，kendall 

在此后的过程中，你将以用户(user) kendall 的身份操作电脑。此外，根据你创建用户时的设定，Linux 还会将你归到某个组( group )中，比如可以是stupid 组，或者是 kendall 组。

所以你将是用户 kendall ， 同时是 kendall 组的组员。(注意，组 kendall 和用户 kendall 只是重名而已。你完全也可以是用户  kendall，同时为stupid 组的组员)

> 总结：BIOS -> MBR -> 引导加载程序 -> 内核 -> init process -> login

----

## 介绍 Linux 中的 pthread

在Linux下创建的线程的API接口是pthread_create()，它的完整定义是：

```c
int pthread_create(pthread_t *thread, const pthread_attr_t *attr, void *(*start_routine)(void*), void *arg); 
```

函数参数： 

```
1. 线程句柄 thread：当一个新的线程调用成功之后，就会通过这个参数将线程的句柄返回给调用者，以便对这个线程进行管理。 
2. 入口函数 start_routine()： 当你的程序调用了这个接口之后，就会产生一个线程，而这个线程的入口函数就是start_routine()。如果线程创建成功，这个接口会返回0。 
3. 入口函数参数 *arg : start_routine()函数有一个参数，这个参数就是pthread_create的最后一个参数arg。这种设计可以在线程创建之前就帮它准备好一些专有数据，最典型的用法就是使用C++编程时的this指针。start_routine()有一个返回值，这个返回值可以通过pthread_join()接口获得。 
4. 线程属性 attr： pthread_create()接口的第二个参数用于设置线程的属性。这个参数是可选的，当不需要修改线程的默认属性时，给它传递NULL就行。具体线程有那些属性，我们后面再做介绍。
```

写一个简单的多线程编程范例

```c
#include <stdio.h>  
#include <pthread.h>  
void* thread( void *arg )  
{  
    printf( "This is a thread and arg = %d.\n", *(int*)arg);  
    *(int*)arg = 0;  
    return arg;  
}  
int main( int argc, char *argv[] )  
{  
    pthread_t th;  
    int ret;  
    int arg = 10;  
    int *thread_ret = NULL;  
    ret = pthread_create( &th, NULL, thread, &arg );  
    if( ret != 0 ){  
        printf( "Create thread error!\n");  
        return -1;  
    }  
    printf( "This is the main process.\n" );  
    pthread_join( th, (void**)&thread_ret );  //阻塞
    printf( "thread_ret = %d.\n", *thread_ret );  
    return 0;  
}  
```

将这段代码保存为 thread.c 文件，可以执行下面的命令来生成可执行文件： 

`$ gcc thread.c -o thread -lpthread `

这段代码的执行结果可能是这样：

```bash
$ ./thread
This is the main process.
This is a thread and arg = 10.
thread_ret = 0.
```

----------

## 说说静态库和动态库
### 静态库
静态库可以认为是一些目标代码的集合, 是在可执行程序运行前就已经加入到执行码中, 成为执行程序的一部分. 按照习惯, 一般以`.a`做为文件后缀名.

静态库的命名一般分为三个部分：
- 前缀：`lib`
- 库名称：自定义即可, 如`test`
- 后缀：`.a`

所以最终的静态库的名字应该为：`libtest.a`

### 静态库的制作
假如现在有`fun1.c` , `fun2.c`和`head.h`三个文件。其中head.h文件中有函数的声明,  fun1.c和fun2.c中有函数的实现.

下面以这三个文件为例介绍静态库的制作和使用

- 步骤1：将`c`源文件生成对应的`.o`文件
  
```
gcc -c fun1.c fun2.c
```

- 步骤2：使用打包工具`ar`将准备好的`.o`文件打包为`.a`文件
 
> 在使用`ar`工具是时候需要添加参数`rcs`     
> `r`更新、`c`创建、`s`建立索引

```
ar rcs libtest1.a fun1.o fun2.o
```

![](./img/静态库.png)

### 静态库的使用

静态库制作完成之后, 需要将`.a`文件和头文件一定发布给用户.
假设测试文件为`main.c`, 静态库文件为`libtest1.a`, 头文件为`head.h`

用到的参数：

- `-L`：指定要连接的库的所在目录
- `-l`：指定链接时需要的静态库, 去掉前缀和后缀
- `-I`: 指定`main.c`文件用到的头文件`head.h`所在的路径    
`gcc -o main1 main.c -L./ -ltest1 -I./`

### 共享库/动态库

共享库在程序编译的时候是不会被连接到目标代码中, 而是在程序运行是才被载入。 **不同的应用程序如果调用相同的库, 那么在内存里只需要有一份该共享库的拷贝, 规避了空间浪费问题。** 动态库在程序运行时才被载入, 也解决了静态库对程序的更新、部署和发布会带来麻烦. 用户只需要更新动态库即可, 增量更新。为什么需要动态库, 其实也是静态库的特点导致。
按照习惯, 一般以”`.so`”做为文件后缀名. 共享库的命名一般分为三个部分：
- 前缀：`lib`
- 库名称：自己定义即可, 如`test`
- 后缀：`.so`

所以最终的静态库的名字应该为：`libtest.so`

![](./img/动态库.png)

### 动态库的制作
- 1.生成目标文件`.o`, 此时要加编译选项：`-fPIC（fpic）`
```
gcc -fpic -c fun1.c fun2.c
```
参数：-fpic创建与地址无关的编译程序(pic, position independent code), 目的就是为了能够在多个应用程序间共享.

- 2.生成共享库, 此时要加链接器选项: `-shared`（指定生成动态链接库）
```
gcc -shared fun1.o fun2.o -o libtest2.so
```

### 动态库/共享库的使用
引用动态库编译成可执行文件（跟静态库方式一样）：
```
gcc main.c -I -L./ -ltest2 -o main2
```

用到的参数：
- -L：指定要连接的库的所在目录
- -l：指定链接时需要的动态库, 去掉前缀和后缀
- -I: 指定main.c文件用到的头文件`head.h`所在的路径

#### 遇到了什么问题？怎么解决？

在运行`./main2`，发现竟然报错了。

![](./img/动态库1.png)

**为什么在执行的时候找不到libtest2.so库？**

当系统加载可执行代码时候, 能够知道其所依赖的库的名字, 但是还需要知道所依赖的库的绝对路径。此时就需要系统动态载入器(dynamic linker/loader)。

`ldd`命令可以查看可执行文件依赖的库文件, 执行`ldd main2`, 可以发现libtest2.so找不到.

![](./img/动态库2.png)

**如何让系统找到共享库？**

- 第一种：拷贝自己制作的共享库到/lib或者/usr/lib
- 第二种：把`export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:库路径`, 设置到`∼/.bashrc`文件中。
```
比如：设置成当前目录下的lib目录
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:./lib
```

### 静态库与动态库的比较

- 静态库的优点:
  
  * 1 执行速度快, 是因为静态库已经编译到可执行文件内部了
  * 2 移植方便, 不依赖域其他的库文件
- 缺点: 
    * 1 耗费内存, 是由于每一个静态库的可执行程序都会加载一次
    * 2 部署更新麻烦, 因为静态库修改以后所有的调用到这个静态库的可执行文件都需要重新编译
 
 - 动态库的优点:
    * 1 节省内存
    * 2 部署升级更新方便, 只需替换动态库即可, 然后再重启服务.
 - 缺点: 
    * 1 加载速度比静态库慢
    * 2 移植性差, 需要把所有用到的动态库都移植.

> 由于由静态库生成的可执行文件是把静态库加载到了其内部, 所以静态库生成的可执行文件一般会比动态库大.




## linux文件有哪几种权限，怎么授权？
### 修改文件的权限

linux是通过权限对文件进行控制的，可以通过使用`chmod`命令来修改文件相关的权限。

chmod修改权限有两种方式：
- 文字设定法

```
命令：chmod [who] [+|-|=] [mode] 文件名

操作对象【who】
u -- 用户（user）
g -- 同组用户（group）
o -- 其他用户（other）
a -- 所用用户（all）【默认】

操作符【+-=】
+ -- 添加权限
- -- 取消权限
= -- 赋予给定权限并取消其他权限

权限【mode】
r -- 读
w -- 写
x -- 执行
```
给文件file.txt的所有者和所属组添加读写权限:     
`chmod ug+wr file.txt`

- 数字设定法

```
命令：chmod [+|-|=][mode] 文件名

操作符【+-=】
+ -- 添加权限
- -- 取消权限
= -- 赋予给定权限并取消其他权限 (默认为=)

数字表示的含义
0 -- 没有权限(-)
1 -- 执行权限（x）
2 -- 写权限（w）
4 -- 读权限（r)

例：给file.txt文件设置 rw-rw-r--
chmod 664 file.txt
```

### 修改文件所有者和所属组

用户权限修改文件所有者`chown`

用法：`chown 文件所有者 文件名`
```
sudo chown mytest file.txt
```

修改文件所有者和所属组`chown`

用法：`chown 文件所有者:文件所属组 文件名`
```
sudo chown mytest:mytest file.txt
sudo chown mytest.mytest file.txt
```

> 注意:普通用户需要使用管理员执行该命令     
>注意: 若系统没有其他用户, 可以使用sudo adduser 用户名 创建一个新用户.

## 说一下 makefile

makefile文件定义了一系列的规则来指定，哪些文件需要先编译，哪些文件需要后编译，哪些文件需要重新编译，甚至还能进行更复杂的功能操作。makefile带来的好处就是“**自动化编译**”，一旦写好只需要一个make命令就可以自动编译整个工程。

其中make是一个命令工具，是一个解释makefile中指令的命令工具。

**makefile使用的基本规则**

```
目标:依赖
（tab）命令
```
其中：
- 目标: 要生成的目标文件
- 依赖: 目标文件由哪些文件生成
- 命令: 通过执行该命令由依赖文件生成目标

例子：      
比如现在有`main.c fun1.c fun2.c sum.c`, 根据这个基本规则编写一个简单的makefile文件, 生成可执行文件`main`。
```makefile
# 会去下面找缺失的.o文件
main:main.o fun1.o fun2.o sum.o
	gcc -o main main.o fun1.o fun2.o sum.o

main.o:main.c
	gcc -o main.o -c main.c -I./

fun1.o:fun1.c
	gcc -o fun1.o -c fun1.c

fun2.o:fun2.c
	gcc -o fun2.o -c fun2.c

sum.o:sum.c
	gcc -o sum.o -c sum.c
```

**可以使用变量进行改进**
```makefile
target = main
object = main.o fun1.o fun2.o sum.o

CC = gcc
CPPFLAGS = -I./

$(target):$(object)
	$(CC) -o $@ $^

## 使用模式规则
%.o:%.c
	$(CC) -o $@ -c $< $(CPPFLAGS)

#main.o:main.c
#	$(CC)  -o main.o -c $< $(CPPFLAGS)
#
#fun1.o:fun1.c
#	$(CC)  -o fun1.o -c $<
#
#fun2.o:fun2.c
#	$(CC)  -o fun2.o -c $<
#
#sum.o:sum.c
#	$(CC)  -o sum.o -c sum.c
```
> 特别注意：自动变量只能在规则的命令中使用. 
   
``` 
自动变量：

$@: 表示规则中的目标     
$<: 表示规则中的第一个条件  //冒号后面出现的第一个条件    
$^: 表示规则中的所有条件, 组成一个列表, 以空格隔开, 如果这个列表中有重复的项则消除重复项。 
```
使用makefile函数和清理操作

```makefile
target = main
# 使用函数
src = $(wildcard *.c)  # 找到所有的.c文件
object = $(patsubst %.c, %.o , $(src))  # 把.c换成.o

CC = gcc
CPPFLAGS = -I./

$(target):$(object)
	$(CC) -o $@ $^

## 使用模式规则，匹配该目录下所有.o和。c结尾的文件
%.o:%.c
	$(CC) -o $@ -c $< $(CPPFLAGS)

# 清理操作
.PHONY:clean  #设置伪目标
clean:
	rm -f $(object) $(target)
```

### 要生成静态库和动态库, Makefile怎么写？

- 生成静态库

```
# 使用函数
# 匹配当前目录下所有的.c文件  注意$()中不能添加空格
src = $(wildcard *.c)   
objs = $(patsubst %.c,%.o,$(src))   #将src的.c换成.o
# 普通变量
target = libtest1.a

# 制作静态库
#libtest1.a:add.o sub.o
#	ar rcs libtest1.a add.o sub.o
$(target):$(objs)
	# ar rcs $(target) $(objs)
	ar rcs $@ $^

# 汇编成.o文件
#add.o:add.c
#	gcc -c add.c -o add.o
#
#sub.o:sub.c
#	gcc -c sub.c -o sub.o

# $(objs):$(src)
%.o:%.c 
	gcc -c $<

# 清理操作
.PHONY:clean  #设置伪目标
clean:
	rm -f $(objs) $(target)
```

- 生成动态库

```
src = $(wildcard *.c)
objs = $(patsubst %.c,%.o,$(src));
target = libtest2.so

# 制作动态库  $@--> 自定义变量
$(target):$(objs)
	gcc -shared $^ -o $@ 
	mv $@ ./lib

%.o:%.c
	gcc -c -fpic $< -o $@

.PHONY:clean
clean:
	-rm -f $(target) $(objs)
```

-----



