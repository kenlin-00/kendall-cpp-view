
- [网络层与数据链路层有什么关系](#网络层与数据链路层有什么关系)
- [IP 基本认识](#ip-基本认识)

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

