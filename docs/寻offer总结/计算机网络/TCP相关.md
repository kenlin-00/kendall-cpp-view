
<!-- vscode-markdown-toc -->

- [TCP 头部](#tcp-头部)
  - [为什么需要TCP，TCP工作在哪一层](#为什么需要tcptcp工作在哪一层)
- [什么是 TCP 连接](#什么是-tcp-连接)
- [如何确定 TCP 连接](#如何确定-tcp-连接)
- [TCP的最大连接数是多少](#tcp的最大连接数是多少)
- [UDP 头部](#udp-头部)
- [TCP 和 UDP 的区别](#tcp-和-udp-的区别)
- [TCP 和 UDP 应用场景](#tcp-和-udp-应用场景)
- [为什么 UDP 头部没有首部长度字段，而 TCP 头部有呢](#为什么-udp-头部没有首部长度字段而-tcp-头部有呢)
- [怎么计算 TCP 的数据长度](#怎么计算-tcp-的数据长度)
- [**TCP 三次握手**](#tcp-三次握手)
- [为什么使用三次握手，两次握手可不可以](#为什么使用三次握手两次握手可不可以)
- [**四次挥手过程**](#四次挥手过程)
- [为什么连接的时候是三次握手，关闭的时候却是四次握手](#为什么连接的时候是三次握手关闭的时候却是四次握手)
- [为什么客户端和服务端的初始序列号 ISN 是不相同的](#为什么客户端和服务端的初始序列号-isn-是不相同的)
  - [ISN 是固定不变的吗？](#isn-是固定不变的吗)
- [MTU 和 MSS](#mtu-和-mss)
- [发送缓冲区](#发送缓冲区)
- [SYN 攻击](#syn-攻击)
- [避免 SYN 攻击](#避免-syn-攻击)
- [**什么是半连接队列**](#什么是半连接队列)
- [三次握手的最后一个 ACK 丢失了会怎样](#三次握手的最后一个-ack-丢失了会怎样)
- [如何查看 TCP 状态](#如何查看-tcp-状态)
- [**TIME_WAIT 为什么要等于2MSL**](#time_wait-为什么要等于2msl)
- [需要 TIME-WAIT 状态的原因](#需要-time-wait-状态的原因)
- [Time_wait状态的链接过多会怎样](#time_wait状态的链接过多会怎样)
- [如何优化Time_wait](#如何优化time_wait)
- [连接已经建立，客户端突然出现故障会怎样](#连接已经建立客户端突然出现故障会怎样)
- [keepalive 保活机制](#keepalive-保活机制)
- [**TCP 相关问题**](#tcp-相关问题)
- [如果 一个 ACK 丢失了怎么办](#如果-一个-ack-丢失了怎么办)
- [如果接收方接收到了分组，但是里面出错怎么办](#如果接收方接收到了分组但是里面出错怎么办)
- [accept 发生在三次握手的哪一步](#accept-发生在三次握手的哪一步)
- [客户端调用 close 了，连接断开的流程是什么](#客户端调用-close-了连接断开的流程是什么)
- [已建立连接的TCP，收到SYN会发生什么](#已建立连接的tcp收到syn会发生什么)
- [TCP 四次挥手收到乱序的 FIN 包会如何处理](#tcp-四次挥手收到乱序的-fin-包会如何处理)
- [**TCP怎么保证可靠传输的**](#tcp怎么保证可靠传输的)
- [重传机制](#重传机制)
- [1.超时重传](#1超时重传)
  - [2.快速重传](#2快速重传)
  - [3.SACK 方法](#3sack-方法)
    - [4.D-SACK](#4d-sack)
- [滑动窗口](#滑动窗口)
  - [窗口大小由哪一方决定](#窗口大小由哪一方决定)
- [流量控制](#流量控制)
  - [操作系统缓冲区与滑动窗口的关系](#操作系统缓冲区与滑动窗口的关系)
  - [当应用程序没有及时读取缓存时，发送窗口和接收窗口的变化](#当应用程序没有及时读取缓存时发送窗口和接收窗口的变化)
  - [服务器资源紧张时会出现丢包](#服务器资源紧张时会出现丢包)
  - [TCP 是如何解决窗口关闭时，潜在的死锁现象](#tcp-是如何解决窗口关闭时潜在的死锁现象)
- [拥塞控制](#拥塞控制)
- [**拥塞控制有哪些控制算法**](#拥塞控制有哪些控制算法)
- [拥塞控制和流量控制的区别](#拥塞控制和流量控制的区别)
- [udp如何实现可靠性传输](#udp如何实现可靠性传输)
  - [RTP](#rtp)

------

[参考这里](https://blog.csdn.net/qq_34827674/category_9811520.html)

------

## TCP 头部

> `TCP`的全部功能体现在它首部中的各字段的中。tcp 首部有 20 个字节

<img src="https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/OfficialAccounts/tcp首部.3bk2olobrrm0.png" style="zoom:67%;" />


（1）源端口，`2`个字节；发送报文的进程的端口号

（2）目的端口，`2`个字节；接收报文的进程的端口号

（3）序号：`seq`序列号，占 4 个字节，在建立连接时由计算机随机生成的随机数，通过 SYN 包传给接收端主机，每发送一次数据，就「累加」一次这个「数据字节数」的大小。，用来**解决网络包乱序的问题**。

（4）确认号：`ack`序号，占`4`个字节，就是指下一次 期望 收到的数据的序列号。只有当标志位中的 `ACK` 标志为 `1` 时该确认号的字段才有效。主要**用来解决不丢包的问题**。


（5）标志位：共`6`个，即`ACK`、`FIN`、`P·`、`RST`、`SYN`、`URG`等，具体含义如下： `afprsu`

    ACK：为确认序号，一旦建立接收端接受数据之后，就将 ACK 置为 1。
    
    FIN：为结束序号，该位为 1 时，表示今后不会再有数据发送，希望断开连接。当通信结束希望断开连接时，通信双方的主机之间就可以相互交换 FIN 位为 1 的 TCP 段。
    
    PSH：指示接收方立即将数据提交给应用层，而不是等待缓冲区满；
    
    RST：该位如果为 1，表示 TCP 连接中出现异常必须强制断开连接
    
    SYN：为同步标志，用于数据同步
    
    URG：为紧急序号，URG=1 是紧急指针有效；

（6）检验和：占`2`字节，用于检验数据的完整性

### 为什么需要TCP，TCP工作在哪一层

IP 层是「不可靠」的，不提供可靠的传输服务、也不保证网络数据包的完整性。

如果需要保障网络数据包的可靠性，那么就需要由上层（传输层）的 TCP 协议来负责。

因为 TCP 是一个工作在传输层的可靠数据传输的服务，它能确保接收端接收的网络数据包是无差错，不丢失，不重复，且有序。

## 什么是 TCP 连接

TCP 是一个**面向连接的**、**可靠的**、**基于字节流**的传输层通信协议。

- 面向连接：一定是「一对一」才能连接，不能像 UDP 协议可以一个主机同时向多个主机发送消息，也就是一对多是无法做到的
- 可靠的：无论的网络链路中出现了怎样的链路变化，TCP 都可以保证一个报文一定能够到达接收端
- 字节流：消息是「没有边界」的，所以无论我们消息有多大都可以进行传输。并且消息是「有序的」，当「前一个」消息没有收到的时候，即使它先收到了后面的字节，那么也不能扔给应用层去处理，同时对「重复」的报文会自动丢弃。

## 如何确定 TCP 连接

**TCP 四元祖**可以唯一确定 TCP 连接

- 源地址
- 源端口号
- 目的地址
- 目的端口号

源地址和目的地址的字段（32位）是在 IP 头部中，作用是通过 IP 协议发送报文给对方主机。

源端口和目的端口的字段（16位）是在 TCP 头部中，作用是告诉 TCP 协议应该把报文发给哪个进程。

## TCP的最大连接数是多少

> 有一个 IP 的服务器监听了一个端口，它的TCP的最大连接数是多少?

服务器的 IP 地址和端口号一般是固定不变的，等待客户端的连接请求。

客户端 IP 和 端口是可变的，其理论值计算公式如下:

<strong><font color="orange" size=5 >最大 TCP 连接数 = 客户端的 IP 数 * 客户端的端口数</font></strong>

- 对 IPv4，客户端的 IP 数最多为 2 的 32 次方，客户端的端口数最多为 2 的 16 次方，也就是服务端单机最 大 TCP 连接数，约为 2 的 48 次方。

- 当然，服务端最大并发 TCP 连接数远不能达到理论上限
  - 首先主要是**文件描述符限制**，Socket 都是文件，所以首先要通过 `ulimit` 配置文件描述符的数目;
  - 另一个是**内存限制**，每个 TCP 连接都要占用一定内存，操作系统的内存是有限的。

## UDP 头部

> 首部字段很简单，只有`8`个字节

<img src="https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/udp头部.20nt6p2qxqw0.png" style="zoom:50%;" />

- （1）源端口：发送报文的进程的端口号。在需要对方回信时选用。不需要时可用全`0`。

- （2）目的端口：接收报文的进程的端口号。在终点交付报文时使用。

- （3）包长度：`UDP`用户数据报的长度，其最小值是`8`（仅有首部）。

- （4）检验和：检测`UDP`用户数据报在传输中是否有错。有错就丢弃。

## TCP 和 UDP 的区别

1. 连接

- TCP 是面向连接的传输层协议，传输数据前要通过三次握手建立连接。
- UDP 是不需要连接，即刻就可以传输数据。

2. 服务对象

- TCP 是一对一的两点服务，即一条连接只有两个端点。
- UDP 支持一对一、一对多、多对多的交互通信

3. 可靠性

- TCP 的通信信道是全双工可靠信道，数据可以无差错、不丢失、不重复、且有序到达。
- UDP 是尽最大努力交付，不保证可靠交付数据。

4. 拥塞控制、流量控制

- TCP 有拥塞控制和流量控制机制，保证数据传输的安全性。
- UDP 则没有，即使网络非常拥堵了，也不会影响 UDP 的发送速率。

5. 首部开销

- TCP 首部长度较长，会有一定的开销，首部在没有使用「选项」字段时是 20 个字节，如果使用了「选项」字段则会变长的。
- UDP 首部只有 8 个字节，并且是固定不变的，开销较小。
6. 传输方式

- TCP 是面向字节流的，没有边界，可能会出现粘包问题
- UDP 是一个包一个包的发送，是有边界的，但可能会丢包和乱序。

7. 分片不同

TCP 的数据大小如果大于 MSS「TCP 最大分段长度」时，则会在传输层进行**分片**，目标主机收到后，也同样在传输层**组装** TCP 数据包，如果中途丢失了一个分片，只需要传输丢失的这个分片就可以了。

UDP 的数据大小如果大于 MTU {最大传输单元,一般1500个字节} 大小，则会在 **IP 层**进行分片，目标主机收到后，在 IP 层**组装**完数据，接着再传给传输层，但是如果中途丢了一个分片，则就需要重传所有的数据包，这样传输效率非常差，所以通常 UDP 的报文应该小于 MTU。

> 连服可拥首传分      


## TCP 和 UDP 应用场景

由于 TCP 是面向连接，能保证数据的可靠性交付，因此经常用于：

- FTP 文件传输
- HTTP / HTTPS

由于 UDP 面向无连接，它可以随时发送数据，再加上 UDP 本身的处理既简单又高效，因此经常用于：

- 包总量较少的通信，如 DNS 、SNMP 等
- 视频、音频等多媒体通信
- 广播通信

## 为什么 UDP 头部没有首部长度字段，而 TCP 头部有呢

原因是 TCP 有**可变长**的「选项」字段，而 UDP 头部长度则是**不会变化**的，无需多一个字段去记录 UDP 的首部长度。

## 怎么计算 TCP 的数据长度

<strong><font color="orange" size=5 >TCP 数据的长度 = IP 总长度 - IP 首部长度 - TCP 首部长度</font></strong>


其中 IP 总长度 和 IP 首部长度，在 IP 首部格式是已知的。TCP 首部长度，则是在 TCP 首部格式已知的，所以就可以求得 TCP 数据的长度。



## **TCP 三次握手**

<img src="https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/三次握手.4vj51xsb8mc0.png" style="zoom:50%;" />

- 第一次握手：

客户端要向服务端发起连接请求，首先客户端随机生成一个起始序列号`ISN`(比如是`100`)，那客户端向服务端发送的报文段包含同步序号`SYN`标志位(也就是`SYN=1`)，序列号`seq=100`。

这时候`client`处于同步状态`SYN_SENT`。也就是可以建立连接。服务端处于监听状态`LISTEN`。

- 第二次握手

服务端收到客户端发过来的报文后，发现同步序号`SYN=1`，知道这是一个连接请求，于是将客户端的起始序列号`100`存起来，并且随机生成一个服务端的起始序列号(比如是`300`)。然后给客户端回复一段报文，回复报文包含`SYN`和`ACK`标志(也就是`SYN=1`,`ACK=1`)、序列号`seq=300`、确认号`ack=101`(*客户端发过来的序列号+1*)。

这个时候服务端处于`SYN_RECV`同步接收状态。

- 第三次握手

客户端收到服务端的回复后发现`ACK=1`并且`ack=101`,于是知道服务端已经收到了序列号为`100`的那段报文；同时发现`SYN=1`，知道了服务端同意了这次连接，于是就将服务端的序列号`300`给存下来。然后客户端再回复一段报文给服务端，报文包含`ACK`标志位(`ACK=1`)、`ack=301`(*服务端序列号+1*)、`seq=101` (第一次握手时发送报文是占据一个序列号的，所以这次`seq`就从`101`开始，需要注意的是不携带数据的`ACK`报文是不占据序列号的，所以后面第一次正式发送数据时`seq`还是`101`)。当服务端收到报文后发现`ACK=1`并且`ack=301`，就知道客户端收到序列号为`300`的报文了，就这样客户端和服务端通过`TCP`建立了连接。


> 上面过程中，**第三次握手是可以携带数据的，前两次握手不可以携带数据。**        
> 一旦完成三次握手，双方都处于 ESTABLISHED [` /ɪˈstæblɪʃt/` ]「已连接」 状态，此时连接就已建立完成，客户端和服务端就可以相互发送数据了。

## 为什么使用三次握手，两次握手可不可以

- **三次握手可以阻止重复历史连接的初始化**

简单的说就是防止旧的重复连接初始化造成混乱。

因为网络环境是错综复杂的，往往并没有我们期望的一样，先发送数据包，就先到达主机。可能由于网络堵塞等一些乱七八糟的原因会使得旧的数据包先到达目标主机。

就比如一个旧的`SYN`报文比最新的`SYN`报文先到达服务端，那么服务端就会给客户端返回一个 `SYN+ACK` 报文。如果是三次握手的话，客户端收到这个报文后可以根据自己的上下文判断这是不是一个历史连接（通过序列号过期或者超时判断），如果是历史连接，客户端就会给服务端发送一个 `RST` 报文给服务端，表示终止这一次连接。当然如果不是历史连接就发送一个`ACK`报文，双方就会成功建立链接。

但是如果是两次握手，客户端就不能判断连接是否是历史连接。

<img src="https://imgconvert.csdnimg.cn/aHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L2doL3hpYW9saW5jb2Rlci9JbWFnZUhvc3QyLyVFOCVBRSVBMSVFNyVBRSU5NyVFNiU5QyVCQSVFNyVCRCU5MSVFNyVCQiU5Qy9UQ1AtJUU0JUI4JTg5JUU2JUFDJUExJUU2JThGJUExJUU2JTg5JThCJUU1JTkyJThDJUU1JTlCJTlCJUU2JUFDJUExJUU2JThDJUE1JUU2JTg5JThCLzE5LmpwZw?x-oss-process=image/format,png" style="zoom:50%;" />

-----

- **三次握手可以同步双方的初始序列号**

为了保证数据传输的可靠性，当客户端发送携带「初始序号`seq`」的 `SYN`报文的时候，需要服务端回一个 `ACK` 应答报文，表示客户端的 `SYN` 报文已被服务端成功接收，那当服务端发送「初始序列号」给客户端的时候，依然也要得到客户端的应答回应，这样一来一回，才能确保双方的初始序列号能被可靠的同步。

而两次握手只能保证一方的初始序号被对方接收，不能保证双方的初始序号都能被确认接收。

- 接收方可以去除重复的数据；
- 接收方可以根据数据包的序列号按序接收；
- 可以标识发送出去的数据包中， 哪些是已经被对方收到的；

----

- **三次握手才可以避免资源浪费**

如果只有「两次握手」，当客户端的 SYN 请求连接在网络中阻塞，客户端没有接收到 ACK 报文，就会重新发送 SYN ，由于没有第三次握手，服务器不清楚客户端是否收到了自己发送的连接的 ACK 确认号，所以每收到一个 SYN 就只能先主动建立一个连接。

那么如果服务端发送回给客户端的 ACK 报文阻塞了，那么客户端由于没有收到 ACK 确认号，就会重复多次发送 SYN 报文，那么服务器在收到请求连接报文后就会**建立多个冗余的无效连接**。造成不必要的资源浪费。

> 四次握手其实也能够可靠的同步双方的初始化序号，但由于第二步和第三步可以优化成一步，没必要两次握手来分别发送 ACK 报文 和 SYN 报文。所以就成了「三次握手」

<img src="https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/四次握手.6az8xsuu6sg0.png" style="zoom: 50%;" />

-----

## **四次挥手过程**

> 四次挥手的目的是关闭一个连接

当我们的应用程序不需要数据通信了，就会发起断开 `TCP` 连接。建立一个连接需要三次握手，而终止一个连接需要经过四次挥手。

假如客户端先发起关闭请求。

- 第一次挥手。客户端向服务端发送一个 FIN 报文，报文中会指定一个序号（假如`seq = u`)，这个时候客户端处于终止等待1 `FIN_WAIT_1` 状态，客户端会停止发送数据，主动关闭 TCP 连接，并等待服务端确认。

- 第二次挥手，服务端收到客户端的 FIN 报文后，就知道这是一个关闭请求。然后服务端向客户端返回一个确认报文，包含确认序号`ACK = 1`，`ack = seq + 1`,也就是`u+1`,并带上自己的序号`squ = v`,这时候服务端处于终止等待`CLOSE_WAIT` 状态，客户端进入`FIN_WAIT_2` 状态。TCP 处于半关闭状态，因为客户端不会发送数据了，不过服务器端有数据发送的话，客户端依然需要接收。

- 第三次挥手，如果服务端也想断开连接了，和客户端的第一次挥手一样，发给 FIN 报文，且指定一个序列号。也就是服务端没有数据要向客户端发送了，服务端发出**连接释放报文段**包含（`FIN=1`，`ACK=1`，序号`seq=w`，确认号`ack=u+1`），服务端进入` LAST_ACK`（最后确认）状态，等待客户端的确认。

- 第四次挥手。客户端收到服务器的 `FIN` 包后，向服务端返回确认报文（`ACK=1，ack=w+1`），这个时候客户端就进入了 `TIME_WAIT` （时间等待）状态。注意此时 `TCP` 连接还没有释放，必须经过 `2*MSL` 后，才进入 `CLOSED` 状态。而服务器端收到客户端的确认包 `ACK` 后就进入了 `CLOSED` 状态，可以看出服务器端结束 `TCP` 连接的时间要比客户端早一些。

<img src="https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/四次握手.7do6qsang0g.jpg" style="zoom:67%;" />

## 为什么连接的时候是三次握手，关闭的时候却是四次握手

> 三次握手中，因为当`Server`端收到`Client`端的`SYN`连接请求报文后，可以直接发送`SYN+ACK`报文。

- 关闭连接时，客户端向服务端发送 FIN 时，仅仅表示客户端不再发送数据了但是还能接收数据。
- 服务器收到客户端的 FIN 报文时，先回一个 ACK 应答报文，而服务端可能还有数据需要处理和发送，等服务端不再发送数据时，才发送 FIN 报文给客户端来表示同意现在关闭连接。

从上面过程可知，服务端通常需要等待完成数据的发送和处理，所以服务端的 ACK 和 FIN 一般都会分开发送，从而比三次握手导致多了一次。


----


## 为什么客户端和服务端的初始序列号 ISN 是不相同的

如果一个已经失效的连接被重用了，但是该旧连接的历史报文还残留在网络中，如果序列号相同，那么就无法分辨出该报文是不是历史报文，如果历史报文被新的连接接收了，则会产生数据错乱。

所以，每次建立连接前重新初始化一个序列号主要是**为了通信双方能够根据序号将不属于本连接的报文段丢弃**。

另一方面是为了安全性，防止黑客伪造的相同序列号的 TCP 报文被对方接收。

### ISN 是固定不变的吗？

`ISN` 如果是固定的，攻击者很容易猜出后续的确认序号，为了安全起见，避免被第三方猜到从而发送伪造的 RST 报文，因此 `ISN` 是动态生成的


## MTU 和 MSS

- MTU：一个网络包的最大长度，以太网中一般为 1500 字节。
- MSS：除去 IP 和 TCP 头部之后，一个网络包所能容纳的 TCP 数据的最大长度。「TCP 最大分段长度」

<img src="https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/tcp分割数据.66xmbk7p3ig0.png" style="zoom:67%;" />

> 如果在 TCP 的整个报文（头部 + 数据）交给 IP 层进行分片，会有什么异常呢？

> 传输层 < == > 网络层

当 IP 层有一个超过 MTU 大小的数据（TCP 头部 + TCP 数据）要发送，那么 IP 层就要进行分片，把数据分片成若干片，保证每一个分片都小于 MTU。把一份 IP 数据报进行分片以后，由目标主机的 IP 层来进行重新组装后，再交给上一层 TCP 传输层。

这看起来井然有序，但这存在隐患的，那么当如果一个 IP 分片丢失，整个 IP 报文的所有分片都得重传。

因为 IP 层本身没有超时重传机制，它由传输层的 TCP 来负责超时重传。

当接收方发现 TCP 报文（头部 + 数据）的某一片丢失后，则不会响应 ACK 给对方，那么发送方的 TCP 在超时后，就会重发「整个 TCP 报文（头部 + 数据）」。

因此，IP 层进行分片传输，是非常没有效率的。

所以，**为了达到最佳的传输效能** TCP 协议在建立连接的时候通常要协商双方的 MSS 值，当 TCP 层发现数据超过 MSS 时，则就先会进行分片，当然由它形成的 IP 包的长度也就不会大于 MTU ，自然也就不用 IP 分片了。


经过 TCP 层分片后，如果一个 TCP 分片丢失后，进行重发时也是**以 MSS 为单位，而不用重传所有的分片**，大大增加了重传的效率。

> IP 片丢失，IP 没有重传机制，由 TCP 负责，所以效率低       
> TCP 就进行分片，就是保证了不超过 MTU，提高效率

## 发送缓冲区

当 TCP 三次握手成功，TCP 连接成功建立后，操作系统内核会为每一个连接创建配套的基础设施，比如**发送缓冲区**。

发送缓冲区的大小可以通过套接字选项来改变，当我们的应用程序调用 `write ` 函数时，实际所做的事情是**把数据从应用程序中拷贝到操作系统内核的发送缓冲区中**，并不一定是把数据通过套接字写出去。

- 如果内核的发送缓冲区足够大，那么我们的程序从`write()`调用结束退出后，返回的字节数就是应用程序的数据大小。

- 发送缓冲区不足以容纳所有的应用程序数据，这时候应用程序被阻塞，也就是应用程序在`write()`函数调用处停留，不直接返回。

## SYN 攻击

假设攻击者短时间伪造不同 IP 地址的 SYN 报文，服务端每接收到一个 SYN 报文，就进入SYN_RCVD 状态，但服务端发送出去的 ACK + SYN 报文，无法得到未知 IP 主机的 ACK 应答，久而久之就会占满服务端的 SYN 接收队列（未连接队列），使得服务器不能为正常用户服务。

## 避免 SYN 攻击

1. 方式一

其中一种解决方式是通过修改 Linux 内核参数，控制队列大小和当队列满时应做什么处理。

- 当网卡接收数据包的速度大于内核处理的速度时，会有一个队列保存这些数据包。控制该队列的最大值参数：`net.core.netdev_max_backlog`

- SYN_RCVD 状态连接的最大个数：`net.ipv4.tcp_max_syn_backlog`

- 超出处理能时，对新的 SYN 直接返回 RST 报文，丢弃连接：`net.ipv4.tcp_abort_on_overflow`

2. 方式二

分析这个要从 Linux 内核中的 SYN （未完成连接建立）队列与 Accpet （已完成连接建立）队列是如何工作入手分析。

<img src="https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/SYN攻击避免01.3fi25a873ee0.png" style="zoom: 67%;" />

正常流程：

- 当服务端接收到客户端的 SYN 报文时，会将其加入到内核的「 SYN 队列」；
- 接着发送 SYN + ACK 给客户端，等待客户端回应 ACK 报文；
- 服务端接收到 ACK 报文后，从「 SYN 队列」移除放入到「 Accept 队列」；
- 应用通过调用 `accpet()` socket 接口，从「 Accept 队列」取出连接。

不正常的情况是：

- 应用处理过慢

如果应用程序过慢时，就会导致「 Accept 队列」被占满。

- 受到攻击

如果不断收到 SYN 攻击，就会导致「 SYN 队列」被占满。

设置 `net.ipv4.tcp_syncookies = 1`的方式可以应对 SYN 攻击

**大致流程是**：

    - 当 「 SYN 队列」满之后，后续服务器收到 SYN 包，不进入「 SYN 队列」；
    - 计算出一个 cookie 值，再以 SYN + ACK 中的「序列号」返回客户端，
    - 服务端接收到客户端的应答报文时，服务器会检查这个 ACK 包的合法性。如果合法，直接放入到「 Accept 队列」。
    - 最后应用通过调用 「accpet()」 socket 接口，从「 Accept 队列」取出的连接。

## **什么是半连接队列**

服务器第一次收到客户端的 `SYN` 之后，就会处于 `SYN_RCVD` 状态，此时双方还没有完全建立连接。服务器会把这种状态下请求连接放在一个队列里，我们把这种队列称之为半连接队列。

当然还有一个全连接队列，就是已经完成三次握手，建立起连接的就会放在全连接队列中。如果队列满了就有可能会出现丢包现象。


## 三次握手的最后一个 ACK 丢失了会怎样

- **Server 端**

第三次的 ACK 在网络中丢失，那么 Server 端该 TCP 连接的状态为 SYN_RECV,并且会根据 TCP 的超时重传机制，会等待3秒、6秒、12秒后重新发送SYN+ACK包，以便  Client 重新发送ACK包。

而Server重发SYN+ACK包的次数，可以通过设置`/proc/sys/net/ipv4/tcp_synack_retries`修改，默认值为5.

如果重发指定次数之后，仍然未收到 client 的 ACK 应答，那么一段时间后，Server 自动关闭这个连接。

- **Client 端**

在 linux c 中，client 一般是通过 `connect()` 函数来连接服务器的，而 `connect()`是在 TCP 的三次握手的第二次握手完成后就成功返回值。也就是说 client 在接收到 SYN+ACK 包，它的 TCP 连接状态就为 established `[ɪˈstæblɪʃt]`（已连接），表示该连接已经建立。那么如果 第三次握手中的 ACK 包丢失的情况下，Client 向 server 端发送数据，Server 端将以 RST 包响应，就能感知到 Server 的错误。

## 如何查看 TCP 状态

在linux系统中可以通过 `netstat -napt` 命令查看。

<img src="https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/查看tcp状态.3k61escyq340.png" style="zoom: 67%;" />


----

## **TIME_WAIT 为什么要等于2MSL**

`TIME_WAIT`是指四次挥手中客户端接收了服务端的`FIN`报文并发送`ACK`报文给服务器后，仍然需要等待`2MSL`时间的过程。虽然按道理，四个报文都发送完毕，我们可以直接进入`CLOSED`状态了，但是我们必须假设网络是不可靠的，有可能最后一个`ACK`丢失。如果客户端发送的`ACK`发生丢失，服务器会再次发送`FIN`报文给客户端，所以`TIME_WAIT`状态就是用来重发可能丢失的`ACK`报文。`Linux` 系统停留在 `TIME_WAIT` 的时间为固定的 `60` 秒。

比如如果被动关闭方没有收到断开连接的最后的 ACK 报文，就会触发超时重发 Fin 报文，另一方接收到 FIN 后，会重发 ACK 给被动关闭方， 一来一去正好 2 个 MSL。

注意：**只有发起连接终止的一方会进入 TIME_WAIT 状态**。

## 需要 TIME-WAIT 状态的原因

- 防止旧连接的数据，导致数据错乱

  如果 TIME-WAIT  没有等待时间或时间过短

  <img src="https://imgconvert.csdnimg.cn/aHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L2doL3hpYW9saW5jb2Rlci9JbWFnZUhvc3QyLyVFOCVBRSVBMSVFNyVBRSU5NyVFNiU5QyVCQSVFNyVCRCU5MSVFNyVCQiU5Qy9UQ1AtJUU0JUI4JTg5JUU2JUFDJUExJUU2JThGJUExJUU2JTg5JThCJUU1JTkyJThDJUU1JTlCJTlCJUU2JUFDJUExJUU2JThDJUE1JUU2JTg5JThCLzMxLmpwZw?x-oss-process=image/format,png" style="zoom: 50%;" />

  - 如上图黄色框框服务端在关闭连接之前发送的 `SEQ = 301` 报文，被网络延迟了。
  - 这时有相同端口的 TCP 连接被复用后，被延迟的 `SEQ = 301` 抵达了客户端，那么客户端是有可能正常接收这个过期的报文，这就会产生数据错乱等严重的问题。

- 保证连接正确关闭
  如果 TIME-WAIT  没有等待时间或时间过短

  <img src="https://imgconvert.csdnimg.cn/aHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L2doL3hpYW9saW5jb2Rlci9JbWFnZUhvc3QyLyVFOCVBRSVBMSVFNyVBRSU5NyVFNiU5QyVCQSVFNyVCRCU5MSVFNyVCQiU5Qy9UQ1AtJUU0JUI4JTg5JUU2JUFDJUExJUU2JThGJUExJUU2JTg5JThCJUU1JTkyJThDJUU1JTlCJTlCJUU2JUFDJUExJUU2JThDJUE1JUU2JTg5JThCLzMyLmpwZw?x-oss-process=image/format,png" style="zoom:67%;" />

  - TIME-WAIT 作用是**等待足够的时间以确保最后的 ACK 能让被动关闭方接收，从而帮助其正常关闭**
  - 当客户端发起建立连接的 `SYN` 请求报文后，服务端会发送 `RST` 报文给客户端，连接建立的过程就会被终止


## Time_wait状态的链接过多会怎样

- 第一是内存资源占用，这个目前看来不是太严重，基本可以忽略。

- 第二是对端口资源的占用，一个 TCP 连接至少消耗一个本地端口。要知道，端口资源也是有限的，一般可以开启的端口为 32768～61000 ，*也可以通过`net.ipv4.ip_local_port_range`指定*，如果 TIME_WAIT 状态过多，会导致无法创建新连接。

> 可以使用 SO_REUSEADDR 解决 TIME_WAIT 状态导致 bind 失败的问题

```c
	int reuseaddr = 1;
	//SO_REUSEADDR 即使有 time_wait 出现的时候，也能bind成功
	if(setsockopt(listenfd,	SOL_SOCKET,SO_REUSEADDR,(const void*) &reuseaddr,sizeof(reuseaddr)) < 0) { 
         char *perrorinfo = strerror(errno); 
        printf("setsockopt(SO_REUSEADDR)返回值为%d,错误码为:%d，错误信息为:%s;\n",-1,errno,perrorinfo);
	}
```


## 如何优化Time_wait

- 【最提倡】修改内存选项，`net.ipv4.tcp_tw_reuse` 和  `tcp_timestamp` ，这个参数开启后，就可以复用处于 TIME_WAIT 的 socket 为新的连接所用。有一点需要注意的是，**tcp_tw_reuse 功能只能用客户端（连接发起方），因为开启了该功能，在调用 connect() 函数时，内核会随机找一个 time_wait 状态超过 1 秒的连接给新的连接复用。**

  ```
  net.ipv4.tcp_tw_reuse = 1
  ```

  使用这个选项，还有一个前提，需要打开对 TCP 时间戳的支持，也就是

  ```
  net.ipv4.tcp_timestamps=1（默认即为 1）
  ```

  这个时间戳的字段是在 TCP 头部的「选项」里，用于记录 TCP 发送方的当前时间戳和从对端接收到的最新时间戳。

  由于引入了时间戳，我们在前面提到的 `2MSL` 问题就不复存在了，因为重复的数据包会因为时间戳过期被自然丢弃。

-   一个暴力的方法是通过 `sysctl` 命令，将系统值「`net.ipv4.tcp_max_tw_buckets`」调小。这个值默认为 18000，当系统中处于 TIME_WAIT 的连接一旦超过这个值时，系统就会将所有的 TIME_WAIT 连接状态重置，并且只打印出警告信息。这个方法过于暴力，而且治标不治本，带来的问题远比解决的问题多，**不推荐使用**。

- `SO_LINGER` (停留) 的设置，我们可以通过设置套接字选项，来设置调用 `close` 或者 `shutdown` 关闭连接时的行为。TCP 连接将跳过四次挥手，也就跳过了`TIME_WAIT`状态，直接关闭。不过是一个非常危险的行为，不值得提倡。

## 连接已经建立，客户端突然出现故障会怎样
## keepalive 保活机制

定义一个时间段，在这个时间段内，如果没有任何连接相关的活动，TCP 保活机制会开始作用，每隔一个时间间隔，发送一个探测报文，该探测报文包含的数据非常少，如果连续几个探测报文都没有得到响应，则认为当前的 TCP 连接已经死亡，系统内核将错误信息通知给上层应用程序。

在 Linux 内核可以有对应的参数可以设置保活时间、保活探测的次数、保活探测的时间间隔，以下都为默认值

```c
net.ipv4.tcp_keepalive_time=7200
net.ipv4.tcp_keepalive_intvl=75  
net.ipv4.tcp_keepalive_probes=9
```

- tcp_keepalive_time=7200：表示保活时间是 7200 秒（2小时），也就 2 小时内如果没有任何连接相关的活动，则会启动保活机制

- tcp_keepalive_intvl=75：表示每次检测间隔 75 秒；

- tcp_keepalive_probes=9：表示检测 9 次无响应，认为对方是不可达的，从而中断本次的连接。

也就是说在 Linux 系统中，最少需要经过 2 小时 11 分 15 秒才可以发现一个「死亡」连接。

这个时间是有点长的，我们也可以根据实际的需求，对以上的保活相关的参数进行设置。

-----

## **TCP 相关问题**

## 如果 一个 ACK 丢失了怎么办

这样发送方就不能知道接收方有没有收到自己发过去的报文，所以发送方会重新再付发送原来的分组。

这样的话，接收方就可能接收到两个或者更多的相同的分组

## 如果接收方接收到了分组，但是里面出错怎么办

这种情况可能是数据包中的内容被篡改了，可以使用编码技术来解决，比如说 CRC 检验，我之前的项目中就有使用过 crc32 算法来解决数据包被篡改的问题，

当客户端发送一个数据包给服务端时，会提前对这个数据包的包体计算出一个 crc32 值（通过Get_CRC函数计算），放到要发送的数据包内。服务器收到一个完整的数据包之后，会根据收到的包体内容计算包体 crc32 值，与客户端发送过来的 crc32 值比较，如果 2 个 值相同，就认为这个数据包合法，否则就认为不合法丢弃。

## accept 发生在三次握手的哪一步

客户端 connect 成功返回是在第二次握手，服务端 accept 成功返回是在三次握手成功之后。

## 客户端调用 close 了，连接断开的流程是什么

- 客户端调用 close，表明客户端没有数据需要发送了，则此时会向服务端发送 FIN 报文，进入 FIN_WAIT_1 状态；
- 服务端接收到了 FIN 报文，TCP 协议栈会为 FIN 包插入一个文件结束符 EOF 到接收缓冲区中，应用程序可以通过 read 调用来感知这个 FIN 包。这个 EOF 会被放在已排队等候的其他已接收的数据之后，这就意味着服务端需要处理这种异常情况，因为 EOF 表示在该连接上再无额外数据到达。此时，服务端进入 CLOSE_WAIT 状态；
- 接着，当处理完数据后，自然就会读到 EOF，于是也调用 close 关闭它的套接字，这会使得客户端会发出一个 FIN 包，之后处于 LAST_ACK 状态；
- 客户端接收到服务端的 FIN 包，并发送 ACK 确认包给服务端，此时客户端将进入 TIME_WAIT 状态；
- 服务端收到 ACK 确认包后，就进入了最后的 CLOSE 状态；

- 客户端经过 2MSL 时间之后，也进入 CLOSE 状态；

## 已建立连接的TCP，收到SYN会发生什么

> 一个已经建立的 TCP 连接，客户端中途宕机了，而服务端此时也没有数据要发送，一直处于 establish 状态，客户端恢复后，向服务端建立连接，此时服务端会怎么处理？

TCP 连接是由「四元组」唯一确认的。然后这个场景中，客户端的IP、服务端IP、目的端口并没有变化，所以这个问题关键要看客户端发送的 SYN 报文中的源端口是否和上一次连接的源端口相同。

- 1. 客户端的 SYN 报文里的端口号与历史连接不相同

如果客户端恢复后发送的 SYN 报文中的源端口号跟上一次连接的源端口号不一样，此时服务端会认为是新的连接要建立，于是就会通过三次握手来建立新的连接。

> **那旧连接里处于 establish 状态的服务端最后会怎么样呢**？

> 如果服务端发送了数据包给客户端，由于客户端的连接已经被关闭了，此时客户的内核就会回 RST 报文，服务端收到后就会释放连接。

> 如果服务端一直没有发送数据包给客户端，在超过一段时间后， TCP 保活机制就会启动，检测到客户端没有存活后，接着服务端就会释放掉该连接。

- 2.客户端的 SYN 报文里的端口号与历史连接相同

如果客户端恢复后，发送的 SYN 报文中的源端口号跟上一次连接的源端口号一样，也就是处于 establish 状态的服务端收到了这个 SYN 报文。

**处于 establish 状态的服务端如果收到了客户端的 SYN 报文（注意此时的 SYN 报文其实是乱序的，因为 SYN 报文的初始化序列号其实是一个随机数），会回复一个携带了正确序列号和确认号的 ACK 报文，这个 ACK 被称之为 Challenge ACK。**

**接着，客户端收到这个 Challenge ACK，发现序列号并不是自己期望收到的，于是就会回 RST 报文，服务端收到后，就会释放掉该连接。**

## TCP 四次挥手收到乱序的 FIN 包会如何处理

> 如果 FIN 报文比数据包先抵达客户端，此时 FIN 报文其实是一个乱序的报文，此时客户端的 TCP 连接并不会从 FIN_WAIT_2 状态转换到 TIME_WAIT 状态。

因此这个问题关注点是看「在 FIN_WAIT_2 状态下，是如何处理收到的乱序到 FIN 报文，然后 TCP 连接又是什么时候才进入到 TIME_WAIT 状态?」

在 FIN_WAIT_2 状态时，如果收到乱序的 FIN 报文，那么就被会加入到「乱序队列」，并不会进入到 TIME_WAIT 状态。

等再次收到前面被网络延迟的数据包时，会判断乱序队列有没有数据，然后会检测乱序队列中是否有可用的数据，如果能在乱序队列中找到与当前报文的序列号保持的顺序的报文，就会看该报文是否有 FIN 标志，如果发现有 FIN 标志，这时才会进入 TIME_WAIT 状态。

> https://blog.csdn.net/qq_34827674/article/details/117922761

-----

> [参考](https://blog.csdn.net/qq_34827674/article/details/105606205)

## **TCP怎么保证可靠传输的**

> 重传机制，滑动窗口，流量控制，拥塞控制

## 重传机制

<font color=orange size=4>**重传机制**</font>

在 TCP 中，当发送端的数据到达接收主机时，接收端主机会返回一个确认应答消息，表示已收到消息。

但在错综复杂的网络，万一数据在传输过程中丢失了，TCP 针对数据包丢失的情况，会用**重传机制**解决。

**接下来说说常见的重传机制**：

## 1.超时重传

<b><font color=green size=3 font-weight=bold>1.超时重传</font></b>

重传机制的其中一个方式，就是在发送数据时，设定一个定时器，当超过指定的时间后，没有收到对方的 `ACK` 确认应答报文，就会重发该数据，也就是我们常说的**超时重传**。

> 先来了解一下什么是 RTT
>
> `RTT` 就是**数据从网络一端传送到另一端所需的时间**，也就是包的往返时间。

<img src="https://imgconvert.csdnimg.cn/aHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L2doL3hpYW9saW5jb2Rlci9JbWFnZUhvc3QyLyVFOCVBRSVBMSVFNyVBRSU5NyVFNiU5QyVCQSVFNyVCRCU5MSVFNyVCQiU5Qy9UQ1AtJUU1JThGJUFGJUU5JTlEJUEwJUU3JTg5JUI5JUU2JTgwJUE3LzYuanBn?x-oss-process=image/format,png" style="zoom:67%;" />

超时重传时间是以 `RTO` （Retransmission Timeout 超时重传时间）表示。

> 超时时间 `RTO` 「较长或较短」时，会发生什么事情呢

- 当超时时间 **RTO 较大**时，重发就慢，丢了老半天才重发，没有效率，性能差；
- 当超时时间 **RTO 较小**时，会导致可能并没有丢就重发，于是重发的就快，会增加网络拥塞，导致更多的超时，更多的超时导致更多的重发。

**超时重传时间 RTO 的值应该略大于报文往返 RTT 的值**。

-------

### 2.快速重传

<b><font color=green size=3 font-weight=bold>2.快速重传</font></b>


TCP 还有另外一种**快速重传**（Fast Retransmit）机制，它不以时间为驱动，而是以数据驱动重传。

<img src="https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/快速重传01.21a9dmnfvigw.png"  />

发送方发出了 1，2，3，4，5 份数据：

  - 第一份 Seq1 先送到了，于是就 Ack 回 2；
  - 结果 Seq2 因为某些原因没收到，Seq3 到达了，于是还是 Ack 回 2；

  - 后面的 Seq4 和 Seq5 都到了，但还是 Ack 回 2，因为 Seq2 还是没有收到；

  - **发送端收到了三个 Ack = 2 的确认，知道了 Seq2 还没有收到，就会在定时器过期之前，重传丢失的 Seq2**。

  - 最后，收到了 Seq2，此时因为 Seq3，Seq4，Seq5 都收到了，于是 Ack 回 6 。

> 快速重传的工作方式是当收到三个相同的 ACK 报文时，会在定时器过期之前，重传丢失的报文段。



**快速重传的问题**：

- **重传的时候，是重传之前的一个，还是重传所有的问题。**

比如对于上面的例子，是重传 Seq2 呢？还是重传 Seq2、Seq3、Seq4、Seq5 呢？因为发送端并不清楚这连续的三个 Ack 2 是谁传回来的。

> 为了解决不知道该重传哪些 TCP 报文，于是就有 **SACK** 方法。

-----

### 3.SACK 方法

<font size=3 color=#0075f8 >**3.SACK 方法**</font>

这种方式需要在 TCP 头部「选项」字段里加一个 SACK 的东西，它可以将缓存的信息发送给发送方，这样发送方就可以知道哪些数据收到了，哪些数据没收到，知道了这些信息，就可以只重传丢失的数据。

<img src="https://imgconvert.csdnimg.cn/aHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L2doL3hpYW9saW5jb2Rlci9JbWFnZUhvc3QyLyVFOCVBRSVBMSVFNyVBRSU5NyVFNiU5QyVCQSVFNyVCRCU5MSVFNyVCQiU5Qy9UQ1AtJUU1JThGJUFGJUU5JTlEJUEwJUU3JTg5JUI5JUU2JTgwJUE3LzExLmpwZw?x-oss-process=image/format,png" style="zoom:80%;" />

如果要支持 SACK，必须双方都要支持。在 Linux 下，可以通过 net.ipv4.tcp_sack 参数打开这个功能（Linux 2.4 后默认打开）。


#### 4.D-SACK

<font size=3 color=#0075f8 >**4.D-SACK**</font>

又称 `D-SACK`，其主要**使用了 SACK 来告诉「发送方」有哪些数据被重复接收了。**

- **例如 ACK 丢包情况**
  - 「接收方」发给「发送方」的两个 ACK 确认应答都丢失了，所以发送方超时后，重传第一个数据包（3000 ~ 3499）
  - 于是「接收方」发现数据是重复收到的，于是回了一个 SACK = 3000~3500，告诉「发送方」 3000~3500 的数据早已被接收了，因为 ACK 都到了 4000 了，已经意味着 4000 之前的所有数据都已收到，所以这个 SACK 就代表着 D-SACK。
  - 这样「发送方」就知道了，数据没有丢，是「接收方」的 ACK 确认报文丢了。

<img src="https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/快速重传02.6k0rqb81qbc0.png" style="zoom: 67%;" />

- **例如 网络延时**

  - 数据包（1000~1499） 被网络延迟了，导致「发送方」没有收到 Ack 1500 的确认报文。

  - 而后面报文到达的三个相同的 ACK 确认报文，就触发了快速重传机制，但是在重传后，被延迟的数据包（1000~1499）又到了「接收方」；

  - 所以「接收方」回了一个 SACK=1000~1500，因为 ACK 已经到了 3000，所以这个 SACK 是 D-SACK，表示收到了重复的包。

  - 这样发送方就知道快速重传触发的原因不是发出去的包丢了，也不是因为回应的 ACK 包丢了，而是因为网络延迟了。

    <img src="https://imgconvert.csdnimg.cn/aHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L2doL3hpYW9saW5jb2Rlci9JbWFnZUhvc3QyLyVFOCVBRSVBMSVFNyVBRSU5NyVFNiU5QyVCQSVFNyVCRCU5MSVFNyVCQiU5Qy9UQ1AtJUU1JThGJUFGJUU5JTlEJUEwJUU3JTg5JUI5JUU2JTgwJUE3LzEzLmpwZw?x-oss-process=image/format,png" style="zoom:67%;" />

**D-SACK 有这么几个好处**：

  - 可以让「发送方」知道，是发出去的包丢了，还是接收方回应的 ACK 包丢了;
  - 可以知道是不是「发送方」的数据包被网络延迟了;
  - 可以知道网络中是不是把「发送方」的数据包给复制了;
  - 在 Linux 下可以通过 net.ipv4.tcp_dsack 参数开启/关闭这个功能（Linux 2.4 后默认打开）。



------

## 滑动窗口

<font color=orange size=4>**滑动窗口**</font>

我们都知道 TCP 是每发送一个数据，都要进行一次确认应答。当上一个数据包收到了应答了， 再发送下一个。

所以 **数据包的往返时间越长，通信的效率就越低**

为了解决这个问题，所以 TCP 就引入了 **窗口** 这个概念，即使在 往返时间较长的情况下，它也不会降低网络通信的效率。有了窗口，就可以指定窗口大小，窗口大小就是指**无需等待确认应答，而可以继续发送数据的最大值**

> 假设窗口大小为 `3` 个 TCP 段，那么发送方就可以「连续发送」 `3` 个 TCP 段，并且中途若有 ACK 丢失，可以通过「下一个确认应答进行确认」。如下图：

<img src="https://imgconvert.csdnimg.cn/aHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L2doL3hpYW9saW5jb2Rlci9JbWFnZUhvc3QyLyVFOCVBRSVBMSVFNyVBRSU5NyVFNiU5QyVCQSVFNyVCRCU5MSVFNyVCQiU5Qy9UQ1AtJUU1JThGJUFGJUU5JTlEJUEwJUU3JTg5JUI5JUU2JTgwJUE3LzE1LmpwZw?x-oss-process=image/format,png" style="zoom:80%;" />

ACK 600 确认应答报文丢失，也没关系，因为可以通过下一个确认应答进行确认，只要发送方收到了 ACK 700 确认应答，就意味着 700 之前的所有数据「接收方」都收到了。这个模式就叫**累计确认**或者**累计应答**。



### 窗口大小由哪一方决定

TCP 头里有一个字段叫 `Window`，也就是窗口大小

这个字段是接收端告诉发送端自己还有多少缓冲区可以接收数据。于是发送端就可以根据这个接收端的处理能力来发送数据，而不会导致接收端处理不过来。

所以，通常窗口的大小是由**接收方的窗口**大小来决定的。

发送方发送的数据大小不能超过接收方的窗口大小，否则接收方就无法正常接收到数据。

- **发送方的滑动窗口**

当发送方把数据「全部」都一下发送出去后，可用窗口的大小就为 0 了，表明可用窗口耗尽，在没收到 ACK 确认之前是无法继续发送数据了。

假如当发送方收到之前发送数据的 5 个字节的 ACK 确认后，则滑动窗口往右边移动 5 个字节，因为有 5 个字节的数据被应答确认，

> [更详细的滑动窗口参考](https://blog.csdn.net/qq_34827674/article/details/105606205)

- **接收方的滑动窗口**

接收窗口和发送窗口的大小，并不是完全相等，接收窗口的大小是**约等于**发送窗口的大小的。

因为滑动窗口并不是一成不变的。比如，当接收方的应用进程读取数据的速度非常快的话，这样的话接收窗口可以很快的就空缺出来。那么新的接收窗口大小，是通过 TCP 报文中的 Windows 字段来告诉发送方。那么这个传输过程是存在时延的，所以接收窗口和发送窗口是约等于的关系。

## 流量控制

<font color=orange size=4>**流量控制**</font>

发送方不可能一直给接收方发送数据，因为需要考虑到接收方的处理能力，如果接收方处理不过来，那么就会导致触发重发机制，从而导致网络流量的无端的浪费

流量控制就是保证 TCP 可以让「发送方」根据「接收方」的实际接收能力控制发送的数据量。

> 流量窗口就是用来解决这个问题，**让「发送方」根据「接收方」的实际接收能力控制发送的数据量**

### 操作系统缓冲区与滑动窗口的关系

发送窗口和接收窗口中所存放的字节数，都是放在操作系统内存缓冲区中的，而操作系统的缓冲区，会被操作系统调整。

> 那操心系统的缓冲区，是如何影响发送窗口和接收窗口的呢？

### 当应用程序没有及时读取缓存时，发送窗口和接收窗口的变化

考虑以下场景：

- 客户端作为发送方，服务端作为接收方，发送窗口和接收窗口初始大小为 360
- 服务端非常的繁忙，当收到客户端的数据时，应用层不能及时读取数据。
- 当客户端想服务端发送数据报文，服务端会会返回一个 ACK + window 报文，告诉客户端窗口还剩多少

接收窗口「服务端」会依次收缩到 0，发送窗口也会随之减小到 0，也就是发生了窗口关闭。当发送方可用窗口变为 0 时，发送方实际上会定时发送窗口探测报文，以便知道接收方的窗口是否发生了改变。

### 服务器资源紧张时会出现丢包

当服务端系统资源非常紧张的时候，操心系统可能会直接减少了接收缓冲区大小，这时应用程序又无法及时读取缓存数据，那么这时候会出现**数据包丢失**的现象。因为发送方只会看自己的可用窗口大小发送数据给接收方（此时接收方的窗口已经减小了但发送方还没有收到接收方的通告窗口报文）。

为了防止这种情况发生，TCP 规定是不允许同时减少缓存又收缩窗口的，而是采用**先收缩窗口，过段时间再减少缓存**，这样就可以避免了丢包情况。

### TCP 是如何解决窗口关闭时，潜在的死锁现象

接收方向发送方通告窗口大小时，是通过 ACK 报文来通告的。

为了解决这个问题，TCP 为每个连接设有一个持续定时器，**只要 TCP 连接一方收到对方的零窗口通知，就启动持续计时器**

如果持续计时器超时，就会发送**窗口探测** ( Window probe ) **报文**，而对方在确认这个探测报文时，给出自己现在的接收窗口大小。

- 如果接收窗口仍然为 0，那么收到这个报文的一方就会重新启动持续计时器；
- 如果接收窗口不是 0，那么死锁的局面就可以被打破了。

窗口探测的次数一般为 3 次，每次大约 30-60 秒（不同的实现可能会不一样）。如果 3 次过后接收窗口还是 0 的话，有的 TCP 实现就会发 RST 报文来中断连接。

## 拥塞控制

<font color=orange size=4>**拥塞控制**</font>

拥塞控制，目的就是避免「发送方」的数据填满整个网络。

> 什么是拥塞窗口？和发送窗口有什么关系呢？

**在网络出现拥堵时，如果继续发送大量数据包，可能会导致数据包时延、丢失等，这时 TCP 就会重传数据，但是一重传就会导致网络的负担更重，于是会导致更大的延迟以及更多的丢包，这个情况就会进入恶性循环被不断地放大…**，就有了**拥塞控制**，控制的目的就是**避免「发送方」的数据填满整个网络。**

> 那么怎么知道当前网络是否出现了拥塞呢？

其实只要「发送方」没有在规定时间内接收到 ACK 应答报文，也就是发生了超时重传，就会认为网络出现了用拥塞。

## **拥塞控制有哪些控制算法**

- **慢启动**。慢启动算法的思路是当主机开始发送数据时，先以比较小的拥塞窗口进行发送，然后每次翻倍，也就是说，由小到大逐渐增加拥塞窗口的大小，而这个大小是指数增长的，即`1、2、4、8、16`
  * 为了防止拥塞窗口`cwnd`增长过大引起网络拥塞，还要另外设置一个慢启动阈值`ssthresh`状态变量，当拥塞窗口的大小超过慢启动阈值的时候（ `cwnd > ssthresh` 时），停止使用慢启动算法而改用拥塞避免算法。

- **拥塞避免**：设置慢启动阈值，一般开始都设为`65536`。拥塞避免是指当拥塞窗口大小达到这个阈值的时候，拥塞窗口的值不再指数上升，而是采用加法增加（也就是每经过一个往返时间`RTT`就把发送方的拥塞窗口大小`+1`），以此来避免拥塞。

- **快速重传**：当发送端连续收到三个重复的`ack`时，表示该数据段已经丢失，TCP 认为这种情况不严重，因为大部分没丢，只丢了一小部分
  - 滑动窗口：`cwnd = cwnd/2` ，也就是设置为原来的一半;
  - 阈值： `ssthresh = cwnd;`
  - 进入快速恢复算法

- **快速恢复**: 
  - 拥塞窗口 `cwnd = ssthresh + 3` （ 3 的意思是确认有 3 个数据包被收到了）；
  - 重传丢失的数据包；
  - 如果再收到重复的 ACK，那么 cwnd 增加 1；
  - 如果收到新数据的 ACK 后，把 cwnd 设置为第一步中的 ssthresh 的值，原因是该 ACK 确认了新的数据，然后再次进入**拥塞避免**算法；


## 拥塞控制和流量控制的区别

拥塞控制是防止过多的数据注入到网络中，导致网络发生拥塞；

而流量控制是防止发送方一下子发送过多的数据到接收方，导致接收方缓存放不下。

------

## udp如何实现可靠性传输

传输层无法保证数据的可靠传输，只能通过应用层来实现了。实现的方式可以参照 tcp 可靠性传输的方式，只是实现不在传输层，实现转移到了应用层。

最简单的方式是在应用层模仿传输层TCP的可靠性传输。下面不考虑拥塞处理，可靠UDP的简单设计。

- 1、添加 seq/ack 机制，确保数据发送到对端
- 2、添加发送和接收缓冲区，主要是用户超时重传。
- 3、添加超时重传机制。

详细说明：送端发送数据时，生成一个随机seq=x，然后每一片按照数据大小分配seq。数据到达接收端后接收端放入缓存，并发送一个ack=x的包，表示对方已经收到了数据。发送端收到了ack包后，删除缓冲区对应的数据。时间到后，定时任务检查是否需要重传数据

开源程序利用udp实现了可靠的数据传输，比如 RTP

### RTP

实时传输协议（RTP）为数据提供了具有实时特征的端对端传送服务，如在组播或单播网络服务下的交互式视频音频或模拟数据。应用程序通常在 UDP 上运行 RTP 以便使用其多路结点和校验服务；

RTP 本身并没有提供按时发送机制或其它服务质量（QoS）保证，它依赖于底层服务去实现这一过程。 RTP 并不保证传送或防止无序传送，也不确定底层网络的可靠性。 RTP 实行有序传送， RTP 中的序列号允许接收方重组发送方的包序列，同时序列号也能用于决定适当的包位置，例如：在视频解码中，就不需要顺序解码。





