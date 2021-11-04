
 
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

### 读写 buffer 机制

```cpp

//从一个fd中读取数据到reactor_buf中
int input_buf::read_data(int fd)
{
    int need_read; //硬件中更有多少数据是可以都的

    //一次性将io中的缓存数据全部都出来
    //需要给fd设置一个属性
    //传出一个参数,目前缓冲中一共有多少数据是可读
    if (ioctl(fd, FIONREAD, &need_read) == -1) {
        fprintf(stderr, "ioctl FIONREAD\n");
        return -1;
    }


    if (_buf == NULL) {
        //如果当前的input_buf里的_buf是空，需要从buf_pool拿一个新的
        _buf = buf_pool::instance()->alloc_buf(need_read);
        if (_buf == NULL) {
            fprintf(stderr, "no buf for alloc!\n");
            return -1;
        }
    }
    else {
        //如果当前buf可用,判断一下当前buf是否够存
        assert(_buf->head == 0);
        if (_buf->capacity - _buf->length < need_read) {
            //不够存
            io_buf *new_buf = buf_pool::instance()->alloc_buf(need_read+_buf->length);
            if (new_buf == NULL) {
                fprintf(stderr, "no buf for alloc\n");
                return -1;
            }

            //将之前的_buf数据拷贝到新的buf中
            new_buf->copy(_buf);
            //将之前的_buf 放回内存池中
            buf_pool::instance()->revert(_buf);
            //新申请的buf称为当前的io_buf
            _buf = new_buf;
        }
    }

    int already_read = 0;

    //当前的buf是可以容纳  读取数据
    do {
        if (need_read == 0) {
            already_read = read(fd, _buf->data + _buf->length, m4K);//阻塞直到有数据
        }
        else {
            already_read = read(fd, _buf->data + _buf->length, need_read);
        }
    } while(already_read == -1 && errno == EINTR);//systemcall一个终端，良性，需要继续读取


    if (already_read > 0) {
        if (need_read != 0) {
            assert(already_read == need_read);
        }

        //读数据已经成功
        _buf->length += already_read;
    }

    return already_read;
}

//获取当前的数据的方法
const char *input_buf::data()
{
    return _buf != NULL ? _buf->data + _buf->head : NULL;
}

//重置缓冲区
void input_buf::adjust()
{
    if (_buf != NULL) {
        _buf->adjust();
    }
}

// =========================================== 
    //将一段数据 写到 自身的_buf中
int output_buf::send_data(const char *data, int datalen)
{
    if (_buf == NULL) {
        //如果当前的output_buf里的_buf是空，需要从buf_pool拿一个新的
        _buf = buf_pool::instance()->alloc_buf(datalen);
        if (_buf == NULL) {
            fprintf(stderr, "no buf for alloc!\n");
            return -1;
        }
    }
    else {
        //如果当前buf可用,判断一下当前buf是否够存
        assert(_buf->head == 0);

        if (_buf->capacity - _buf->length < datalen) {
            //不够存
            io_buf *new_buf = buf_pool::instance()->alloc_buf(datalen+_buf->length);
            if (new_buf == NULL) {
                fprintf(stderr, "no buf for alloc\n");
                return -1;
            }

            //将之前的_buf数据拷贝到新的buf中
            new_buf->copy(_buf);
            //将之前的_buf 放回内存池中
            buf_pool::instance()->revert(_buf);
            //新申请的buf称为当前的io_buf
            _buf = new_buf;
        }
    }

    //将data 数据写到io_buf中 拼接到后面    
    memcpy(_buf->data + _buf->length, data, datalen);
    _buf->length += datalen;

    return 0;
}

//将_buf中的数据写到一个fd中
int output_buf::write2fd(int fd) //取代 io层 write方法
{
    assert(_buf != NULL && _buf->head == 0);

    int already_write = 0;

    do {
        already_write = write(fd, _buf->data, _buf->length);
    } while (already_write == -1 && errno == EINTR);//系统调用中断产生，不是一个错误


    if (already_write > 0) {
        //已经写成功
        _buf->pop(already_write);
        _buf->adjust();
    }


    //如果fd是非阻塞的,会报already_write==-1 errno==EAGAIN
    if (already_write == -1 && errno == EAGAIN) {
        already_write = 0;//表示非阻塞导致的-1 不是一个错误,表示是正确的只是写0个字节
    }

    return already_write;
}


```



