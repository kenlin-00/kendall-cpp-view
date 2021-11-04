
> 学完了就该总结，总结了就应该分享出来，这样才有进步，这篇文章将从源码层面来介绍 AVPacket 几个 API，包括：av_packet_alloc、av_init_packet、av_packet_unref、av_packet_free、av_frame_move_ref、av_packet_clone

我们应该都知道，对于多个 AVPacket 共享同一个缓存空间，FFmpeg  使用的引用计数的机制来管理（即浅拷贝机制）

- `AVBuffer`是`FFmpeg`中的缓冲区，一开始时`AVBuffer`的引用计数(`refcount`)初始化为 0

- 当有新的`Packet`引用共享的缓存空间时，就将引用计数再 +1

- 当`Packet`释放掉对`AVBuffer`这块共享缓存空间的引用时,将引用计数 -1

- 只有当`refcount`为 0 的时候，才会释放掉缓存空间`AVBuffer`

了解了上面的引用计数机制，就可以介绍 AVpacket 的几个常用 API 了

### AVPacket 结构体

因为下面都是基于 AVPacket 来分析，所以有必要看一下 AVPacket 的内部结构，具体的见源码。

```c
typedef struct AVPacket {
    AVBufferRef *buf;

    int64_t pts;

    int64_t dts;
    uint8_t *data;
    int   size;
    int   stream_index;
    int   flags;

    AVPacketSideData *side_data;
    int side_data_elems;


    int64_t duration;

    int64_t pos;                            

} AVPacket;
```

### av_packet_alloc

`av_packet_alloc` 的作用是调用 `av_init_packet` 初始化 packet 的值为默认值，该函数不会影响 data 引用的数据缓存空间和 size，需要单独处理。

此外，`av_packet_alloc` 和 `av_packet_free` 必须要配对使用，否则会造成内存泄漏。`av_packet_free` 实际是释放AVPacket 的空间。

下面来看看 av_packet_alloc 的源码实现

```c
AVPacket *av_packet_alloc(void)
{
    AVPacket *pkt = av_mallocz(sizeof(AVPacket));
    if (!pkt)
        return pkt;

    av_packet_unref(pkt);

    return pkt;
}
```
> FFmpeg 中 av_init_packet() 和 av_packet_alloc()av_packet_unref() 三者的区别以及用法

很奇怪，av_packet_alloc 中并没有调用 av_init_packet ，
通过下图可以发现 av_packet_alloc 中调用了  av_packet_unref ， av_packet_unref 内部才调用 av_init_packet （老版本的 ffmpeg 中 av_packet_alloc 是直接调用 av_init_packet ）

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/av_new_packet01.687lp9olmhk0.png)

调用逻辑图

<img src="https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/av_new_packet.6alnru95cpg0.png" style="zoom:80%;" />

**这里注意**，在注意，在 av_init_packet 中初始化并不涉及 data 和 size 成员，它们必须分别初始化。 

### av_new_packet

av_new_packet 的作用是：为 pkt 分配一个指定大小的内存。

```c
int av_new_packet(AVPacket *pkt, int size)
{
    AVBufferRef *buf = NULL;
    int ret = packet_alloc(&buf, size);
    if (ret < 0)
        return ret;

    av_init_packet(pkt);
    pkt->buf      = buf;
    pkt->data     = buf->data;
    pkt->size     = size;

    return 0;
}
```

通过源码可以发现，av_new_packet 中为 pkt 的 buf 分配一个大小，且内部还调用了 av_init_packet 对 pkt 进行初始化。而且注意，该函数的返回值并不是引用计数，之前在网上看到有些博客写返回的是引用计数（是不对的），这个函数返回值永远都是 0，没有具体意义。

> 一般在开发过程中都会遵循以下几步

```c
AVPacket *pkt = NULL;
pkt = av_packet_alloc();
ret = av_new_packet(pkt, MEM_ITEM_SIZE);
av_packet_free(&pkt);
```

下面通过一个测试示例来应用下这几个 API

```c
#define MEM_ITEM_SIZE (20*1024*102)
void av_packet_test1()
{
    AVPacket *pkt = NULL;
    int ret = 0;

    pkt = av_packet_alloc();
    ret = av_new_packet(pkt, MEM_ITEM_SIZE);  
    //把数据写到data区域,  av_init_packet 内部初始化并不是涉及 data 和 size
    memccpy(pkt->data,(void*)&av_packet_test1,1,MEM_ITEM_SIZE);
    av_packet_free(&pkt);
}
```

通过下图调试可以发现，av_packet_alloc 只是为 pkt 分配了内存空间，buf 依然为 NULL。在 av_new_packet 之后真正的为 buf 分配内存空间。

<img src="https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/av_new_packet02.5j90qcgdtlc0.png" style="zoom:100%;" />


<img src="https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/av_new_packet03.mgellv17ca8.png" style="zoom:100%;" />

### av_packet_free

av_packet_free 先把 pkt 中的内容清空，然后再把指针清空，让 pkt 彻底无法使用了，如果需要重新使用，需要重新分配内存。

```c
void av_packet_free(AVPacket **pkt)
{
    if (!pkt || !*pkt)
        return;

    av_packet_unref(*pkt);
    av_freep(pkt);
}
```

> 如果在 av_packet_free 前调用 av_init_packet 会怎样？

```c
void av_apacket_test2() {
    AVPacket *pkt = NULL;
    int ret = 0;
    pkt = av_packet_alloc();
    ret = av_new_packet(pkt,MEM_ITEM_SIZE);
    memccpy(pkt->data,(void*)&av_apacket_test2,1,MEM_ITEM_SIZE);
//    av_init_packet(pkt);
    //如果在av_packet_free前调用 av_init_packet 就会把 buf 置空，这样的话在 av_packet_free 内部就会直接 return
    //导致 buf 无法释放，所以会导致内存泄漏

    av_packet_free(&pkt);
}
```

我们知道 av_init_packet 内部就是对 pkt 进行初始化，会将 buf 置空，所以在 av_packet_unref 前调用 av_init_packet 会导致 buf 无法正常释放，从而会造成内存泄漏。

具体可以结合下面源码截图来看

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/av_packet01.3tqkc2rt13s0.png)

### 补充 av_frame_move_ref 和 av_packet_clone

> av_frame_move_ref 和 av_packet_clone 的区别？

- av_frame_move_ref
  
将src中包含的所有内容移动到dst并重置src。会将 src 内部初始化为空，类似【移动】

```c
void av_frame_move_ref(AVFrame *dst, AVFrame *src)
{
    av_assert1(dst->width == 0 && dst->height == 0);
    av_assert1(dst->channels == 0);

    *dst = *src;
    if (src->extended_data == src->data)
        dst->extended_data = dst->data;
    memset(src, 0, sizeof(*src));
    get_frame_defaults(src);
}
```

- av_packet_clone

创建一个与 src 相同结构体 pkt，但是 src 中的内容仍然保留，类似【拷贝】

```c
AVPacket *av_packet_clone(const AVPacket *src)
{
    AVPacket *ret = av_packet_alloc();

    if (!ret)
        return ret;

    if (av_packet_ref(ret, src))
        av_packet_free(&ret);

    return ret;
}
```






