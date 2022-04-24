<font color="green" size=4>更多读书笔记关注公众号:**零K同学**</font>

![零K同学](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-02/公众号二维码.leozf4yvy34.jpg)

- [网络层与数据链路层有什么关系](#网络层与数据链路层有什么关系)
- [IP 基本认识](#ip-基本认识)
- [ICMP 是什么](#icmp-是什么)

  ------------

> [参考](https://blog.csdn.net/qq_34827674/article/details/105930929)

## 网络层与数据链路层有什么关系

 IP 的作用是主机之间通信用的，而 MAC 的作用则是实现「直连」的两个设备之间通信，而 IP 则负责在「没有直连」的两个网络之间进行通信传输。

 > 在区间内移动相当于数据链路层，充当区间内两个节点传输的功能，区间内的出发点好比源 MAC 地址，目标地点好比目的 MAC 地址。

 > 整个旅游行程表就相当于网络层，充当远程定位的功能，行程的开始好比源 IP，行程的终点好比目的 IP 地址。

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L2doL3hpYW9saW5jb2Rlci9JbWFnZUhvc3QvJUU4JUFFJUExJUU3JUFFJTk3JUU2JTlDJUJBJUU3JUJEJTkxJUU3JUJCJTlDL0lQLzMuanBn?x-oss-process=image/format,png)

在网络中数据包传输中也是如此，源IP地址和目标IP地址在传输过程中是不会变化的，只有源 MAC 地址和目标 MAC 一直在变化。


## IP 基本认识

IP 在 TCP/IP 参考模型中处于第三层，也就是网络层。

网络层的主要作用是：实现主机与主机之间的通信，也叫点对点（end to end）通信。

> **IP 的作用是在复杂的网络环境中将数据包发送到给最终的目标主机**

在 TCP/IP 网络通信时，为了保证能正常通信，每个设备都需要配置正确的 IP 地址，否则无法实现正常的通信。

IP 地址（IPv4 地址）由 32 位正整数来表示，IP 地址在计算机是以二进制的方式处理的。

而人类为了方便记忆采用了点分十进制的标记方式，也就是将 32 位 IP 地址以每 8 位为组，共分为 4 组，每组以「`.`」隔开，再将每组转换成十进制。

![](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L2doL3hpYW9saW5jb2Rlci9JbWFnZUhvc3QvJUU4JUFFJUExJUU3JUFFJTk3JUU2JTlDJUJBJUU3JUJEJTkxJUU3JUJCJTlDL0lQLzQuanBn?x-oss-process=image/format,png)

所以 IP 地址的最大值就是： $2^{32}$

## ICMP 是什么

> ping 是基于 `ICMP` 协议工作的，所以要明白 ping 的工作，首先我们先来熟悉 **ICMP 协议**。

ICMP 全称是 **Internet Control Message Protocol**，也就是**互联网控制报文协议**。

在 `IP` 通信中如果某个 `IP` 包因为某种原因未能达到目标地址，那么这个具体的原因将**由 ICMP 负责通知**。

<img src="https://imgconvert.csdnimg.cn/aHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L2doL3hpYW9saW5jb2Rlci9JbWFnZUhvc3QvJUU4JUFFJUExJUU3JUFFJTk3JUU2JTlDJUJBJUU3JUJEJTkxJUU3JUJCJTlDL3BpbmcvNC5qcGc?x-oss-process=image/format,png" style="zoom:80%;" />

主机 `A` 向主机 `B` 发送了数据包，由于某种原因，途中的路由器 `2` 未能发现主机 `B` 的存在，这时，路由器 `2` 就会向主机 `A` 发送一个 `ICMP` 目标不可达数据包，说明发往主机 `B` 的包未能成功。

从路由器 `2` 返回的 ICMP 包会按照往常的路由控制先经过路由器 `1` 再转发给主机 `A` 。收到该 ICMP 包的主机 `A` 则分解 ICMP 的首部和数据域以后得知具体发生问题的原因。

**回送消息**用于进行通信的主机或路由器之间，判断所发送的数据包是否已经成功到达对端的一种消息，`ping` 命令就是利用这个消息实现的。

<img src="https://imgconvert.csdnimg.cn/aHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L2doL3hpYW9saW5jb2Rlci9JbWFnZUhvc3QvJUU4JUFFJUExJUU3JUFFJTk3JUU2JTlDJUJBJUU3JUJEJTkxJUU3JUJCJTlDL3BpbmcvNy5qcGc?x-oss-process=image/format,png" style="zoom:80%;" />

