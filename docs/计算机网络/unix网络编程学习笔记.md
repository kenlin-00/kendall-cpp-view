## 1 Tcp和Socket
### 1.1 字节序
计算机有两种存储数据的方式:**大端字节序** （big endian）和**小段字节序**（little endian）。

比如：数值0x2211使用两个字节储存：高位字节是0x22，低位字节是0x11

>- 大端字节序：高位字节在前面，低位字节在后面,这符合人类的读写数值方法
>- 小端字节序：地位字节在前面，高位字节在后面。

比如：`0x1234567`的大端字节序和小端字节序的写法如下图

![](./img/字节序01.gif)

**为什么会有小端字节序？**

计算机都是从低位开始处理字节效率比较高，以为计算都是从低位开始的，因此计算机内部都是小段字节序。            
但是人类比较习惯大端字节序，所以除了计算机内部处理，其他场合一般都用大端字节序，比如网络参数，文件存储。

计算机在处理字节序的时候是按照顺序读取字节的，**如果是大端字节序，先读到的就是高位字节，后读到的就是低位字节。小端字节序正好相反。**

> 注意：**只有读取的时候，才必须区分字节序，其他情况都不用考虑。**          
> 处理器读取外部数据的时候，必须知道数据的字节序，将其转成正确的值。然后，就正常使用这个值，完全不用再考虑字节序。      
> 即使是向外部设备写入数据，也不用考虑字节序，正常写入一个值即可。外部设备会自己处理字节序的问题。

> [参考](http://www.ruanyifeng.com/blog/2016/11/byte-order.html)

### 1.2 socket模型创建

- 基于TCP创建的socket模型流程图

![](./img/socket01.png)

#### 1.2.1 socket函数

```c
#include <sys/types.h> /* See NOTES */
#include <sys/socket.h>
int socket(int domain, int type, int protocol);
```
- domain：哪个底层协议族？
  * `AF_INET` 这是大多数用来产生socket的协议，使用TCP或UDP来传输，用IPv4的地址
  * `AF_INET6 `与上面类似，不过是来用IPv6的地址
  * `AF_UNIX `本地协议，使用在Unix和Linux系统上，一般都是当客户端和服务器在同一台及其上的时候使用

- type：哪个服务？
  * `SOCK_STREAM`:（数据流，TCP）)这个协议是按照顺序的、可靠的、数据完整的基于字节流的连接。这是一个使用最多的`socket`类型，这个`socket`是使用TCP来进行传输。
	* `SOCK_DGRAM` :（数据报，UDP）这个协议是无连接的、固定长度的传输调用。该协议是不可靠的，使用UDP来进行它的连接。
	* `SOCK_SEQPACKET`:该协议是双线路的、可靠的连接，发送固定长度的数据包进行传输。必须把这个包完整的接受才能进行读取。
	* `SOCK_RAW`: `socket`类型提供单一的网络访问，这个`socket`类型使用ICMP公共协议。（ping、traceroute使用该协议）
	* `SOCK_RDM` 这个类型是很少使用的，在大部分的操作系统上没有实现，它是提供给数据链路层使用，不保证数据包的顺序

- protocol：默认为0，因为前两个参数已经足够确定。

#### 1.2.2 bind函数
```c
#include <sys/types.h> /* See NOTES */
#include <sys/socket.h>
int bind(int sockfd, const struct sockaddr *addr, socklen_t addrlen);
```
- `sockfd`：
	* `socket`文件描述符
- `addr`:
	* 构造出IP地址加端口号
- `addrlen`:
	* `sizeof(addr)`长度
- 返回值：
	* 成功返回`0`，失败返回`-1`, 设置`errno`

服务器程序所监听的网络地址和端口号通常是固定不变的，客户端程序得知服务器程序的地址和端口号后就可以向服务器发起连接，因此服务器需要调用`bind`绑定一个固定的网络地址和端口号。

`bind()`的作用是将参数`sockfd`和`addr`绑定在一起，使`sockfd`这个用于网络通讯的文件描述符监听`addr`所描述的地址和端口号

#### 1.2.3 connect函数

```c
#include <sys/types.h> 					/* See NOTES */
#include <sys/socket.h>
int connect(int sockfd, const struct sockaddr *addr, socklen_t addrlen);
```

```
sockdf:
	socket文件描述符
addr:
	传入参数，指定服务器端地址信息，含IP地址和端口号
addrlen:
	传入参数,传入sizeof(addr)大小
返回值：
	成功返回0，失败返回-1，设置errno
```

客户端需要调用`connect()`连接服务器，`connect`和`bind`的参数形式一致，区别在于bind的参数是自己的地址，而`connect`的参数是对方的地址。`connect()`成功返回`0`，出错返回`-1`。

#### 1.2.4 listen函数

```c
#include <sys/types.h> /* See NOTES */
#include <sys/socket.h>
int listen(int sockfd, int backlog);
```

```
sockfd:
	socket文件描述符
backlog:
	排队建立3次握手队列和刚刚建立3次握手队列的链接数和
```

可以通过命令查看默认的`backlog`:

```bash
$ cat /proc/sys/net/ipv4/tcp_max_syn_backlog
128
```
典型的服务器程序可以同时服务于多个客户端，当有客户端发起连接时，服务器调用的`accept()`返回并接受这个连接，如果有大量的客户端发起连接而服务器来不及处理，尚未`accept`的客户端就处于连接等待状态，`listen()`声明`sockfd`处于监听状态，并且最多允许有`backlog`个客户端处于连接待状态，如果接收到更多的连接请求就忽略。`listen()`成功返回0，失败返回-1。

#### 1.2.5 accept函数

```c
#include <sys/types.h> 		/* See NOTES */
#include <sys/socket.h>
int accept(int sockfd, struct sockaddr *addr, socklen_t *addrlen);
```

```
sockdf:
	socket文件描述符
addr:
	传出参数，返回链接客户端地址信息，含IP地址和端口号
addrlen:
	传入传出参数（值-结果）,传入sizeof(addr)大小，函数返回时返回真正接收到地址结构体的大小
返回值：
	成功返回一个新的socket文件描述符，用于和客户端通信，失败返回-1，设置errno
```

三方握手完成后，服务器调用`accept()`接受连接，如果服务器调用`accept()`时还没有客户端的连接请求，就阻塞等待直到有客户端连接上来。`addr`是一个传出参数，`accept()`返回时传出客户端的**地址**和**端口号**。`addrlen`参数是一个传入传出参数`（value-result argument）`，传入的是调用者提供的缓冲区`addr`的长度以避免缓冲区溢出问题，传出的是客户端地址结构体的实际长度（有可能没有占满调用者提供的缓冲区）。如果给`addr`参数传`NULL`，表示不关心客户端的地址。

> TCP服务端通信的简单流程:
> **创建套接字** --> **绑定端口和IP** --> **监听套接字** (创建两个连接队列，一个未完成连接队列，经过三次握手成功后到已完成连接队列)--> **提取连接**（从已完成队列提取，提取连接的大得到一个新的连接套接字，接下来用这个已连接套接字和客户端通信）--> **读写数据** --> **关闭**

客户端`client1`向`server`的监听套接字建立连接，然后通过调用`accept()`函数从已完成连接队列中提取新的连接，创建已连接套接字，然后用已连接套接字和`client1`进行通信，这时候监听套接字和`client1`的连接就可以断开了，如果有新的`client2`来请求同样和监听套接字建立请求连接。

![](./img/socket02.png)

### 1.3 server和client通信示例（TCP）

#### 1.3.1 client

`client.c`的作用是从命令行参数中获得一个字符串发给服务器，然后接收服务器返回的字符串并打印。

[client.c](/计算机网络/code/client.md)

#### 1.3.2 server

`server.c`的作用是从客户端读字符，然后将每个字符转换为大写并回送给客户端。

[server.c](/计算机网络/code/server.md)    
[wrap.c](/计算机网络/code/wrapc.md)
[wrap.h](/计算机网络/code/wraph.md)








