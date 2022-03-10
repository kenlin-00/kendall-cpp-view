
> 之前在[这篇文章](https://mp.weixin.qq.com/s?__biz=MzkwMjIzNjc4NA==&mid=2247484128&idx=1&sn=052e12e238782a3ccedeffb281118c0b&chksm=c0a9ddfff7de54e98d4202e3b8d454df3dfe4c5d20eba954858eaa7e96d3f99e4877d7d61a75#rd)中有介绍 CPU 的工作原理，但是只是简单介绍，对于计算机原理不是很了解的同学理解起来还是比较吃力，但是后面的笔记总是频繁用到这些知识，所以今天就决定来缕清楚 CPU 内部的工作流程，看完后相信你能对 CPU 有一个更深刻的认识。

各位优秀的小伙伴应该都知道，**CPU 主要由运算器、控制器、寄存器组和内部总线构成。** 下面我们注意来对各个组成部分分析。

## 存储器是什么

存储被划分成很多个存储单元，比如划分成 128 个存储单元，如下图所示，然后一个存储单元可以存储 1byte 的信息，也就是 1 字节，通常 1 字节 由 8bit 或者 4bit 组成。如果你对这些计算机单位分不清，可以参考我之前分享的[这篇推文](https://mp.weixin.qq.com/s?__biz=MzkwMjIzNjc4NA==&mid=2247484146&idx=1&sn=75043975b1ae9bbbcb548f7f2a399046&chksm=c0a9ddedf7de54fb6d62190d9f50dc19002df5bf5b2bc30904f50f1cac96b2aab69d2a6671f6#rd)。

所以对于拥有 128 个存储单元的存储器，可以说它的存储容量就是 128 字节。

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/存储单元.v0w5v7acy80.png)

CPU 如果想要从内存中 读和写 数据，就需要指定存储单元的地址，知道地址在哪才能找得到呀，对吧！然后需要连接 CPU 和内存的导向，这就是【总线】。

> **总线有分成 3 类：地址总线，数据总线，控制总线**

下图展示了 CPU 从 3 号单元中读取数据的过程。

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/总线.15vzq7aybv9c.png)

- CPU 通过地址线将地址信息 3 发出
- CPU 通过控制线发出内存读命令，并通知内存要从中取出数据
- 存储器将 3 号单元中的数据 8 通过数据线送入 CPU

> 下面来介绍下这 3 类总线

### 地址总线

CPU 是通过地址总线来指定存储单元的，一个 CPU 有 N 根地址线，也就是地址总线的宽度为 N，这样的 CPU 的寻址能力是 2<sup>N</sup>，也就是可以寻找 2 的 N 次方个内存单元。

比如一个 CPU 有 10 根地址总线，我们知道一根导向可以传送的状态只有两种，高电平和低电平，用二进制表示就是 1 或 0，10 根 导向可以传送 10 位 二进制数据，10 根导线有 2<sup>10</sup> 个不同的数据，最小为 0 ，最大为 1023。

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/地址总线.2eu1un4g5qfw.png)


> 举个例子：一个 CPU 的寻址能力为 8KB ，那么它的地址总线宽度为 13，因为 8kb = 8*1024B = 2<sup>13</sup>


### 数据总线

CPU 与内存的数据传送是通过数据总线来进行的，8 根数据总线一次可以传送一个 8 位二进制数据（也就是一个字节）。

> 8086 数据总线有 16 为数据线，那么一次可以传 16 位数据（16 个二进制），同样的数据给 8088 数据总线，有 8 为数据线，那么一次可以传 8 为数据，就需要写两次。

- **8 位数据总线上传送 89D8（2次）**【8088 数据总线】

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/数据总线.6m84rqrfz6w0.png)

- **16 位数据总线上传送 89D8（1次）**【8086 数据总线】

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/数据总线2.4wd5czx3ac0.png)

### 控制总线

CPU 通过控制总线来对外部器件进行控制，控制总线决定 CPU 对外部器件的控制能力。

