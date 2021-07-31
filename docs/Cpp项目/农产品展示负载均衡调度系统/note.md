
 
## 目录结构以及测试

api 层（客户端） 和 Lars 通信 通过 UDP，因为比较快

> makefile 生成库 需要加 FPIC

## 实现简单回显功能

涉及到的知识点

- 忽略信号，信号处理函数
- socket 编程
  

## 自定义内存池管理

- 不能大量使用 malloc 
- 内存管理机制，预先分配

内存池

内存大小做一个层级划分，用链表管理

map 结构

key: 内存层级大小

value：链表，小内存 io_buf

### 内存池设计

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/内存池.4y5ylsipo580.png)

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


