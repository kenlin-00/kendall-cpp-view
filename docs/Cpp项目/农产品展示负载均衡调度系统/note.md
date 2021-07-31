
 
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


### 单例模式的连接池

> 使用 pthread_once_t 保证初始化只执行换一次

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





