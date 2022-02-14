 媒体播放器播放一个媒体文件，需要以下步骤：解协议，解封装，解码，视音频同步，如果播放本地文件则不需要解协议。其中解封装（解复用）的作用是将输入的封装格式（AVI、MP4、TS、FLV等封装格式）的数据分离成音频流压缩编码数据和视频压缩编码数据，把这些视音频以及字幕等基本流分离出来。在这个解封装的过程中，我们可以获取到媒体文件的一些基本信息。

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/ffmpeg解封装01.1f067zwyl8v4.png)


> 先来简单认识先解封装的流程和相关函数，为后面核心部分做铺垫

## 封装格式的相关函数

|  函数原型   | 介绍 |
|  ----  | ----  |
| `avformat_alloc_context`  | 分配一个`AVFormatContext`,并进行简单初始化 (调用者不一定需非调用) |
| `avformat_free_context`  | 释放掉`AVFormatContext`和其里面的流数据 |
|  `avformat_close_input`   | 关闭解复用器，关闭后就不再需要使用`avformat_free_context `进行释放 |
|  `avformat_open_input`   | 打开输入流 (音视频文件) |
|  `avformat_find_stream_info`   | 读取媒体文件并获取流信息 |
|  `av_read_frame`   | 读取音视频包 (文件中的内容),但不进行验证这些码流哪些帧是有效帧 |
|  `avformat_seek_file`   | 定位文件，比如播放器中的拖动定位播放 |
|  `av_seek_file`   |  寻找关键帧 |

> `AVFormatContext`主要存储视音频封装格式中包含的信息


## 解封装流程

- (1)分配解复用器上下文（AVFormatContext）<非必须>
- (2)打开文件(或者网络流）、获取封装信息上下文`AVFormatContext`
- (3)获取取媒体文件音视频信息，这一步会将`AVFormatContext`内部变量填充
- (4)读取码流信息：循环处理
  
  * 4.1 从文件中读取数据包`av_read_frame`
  * 4.2 定位文件 `avformat_seek_file` 或 `av_seek_frame`

- (5)关闭解复用器

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/ffmpeg解封装02.60xe5klq6iw0.png)


---

## 先来认识一下 AVFormatContext

因为在使用 ffmpeg 进行开发的时候，时刻都会使用到 AVFormatContext 这个数据结构，因为很多函数的参数都会以它为参数，所以有必要先了解一下这个结构体。

AVFormatContext 描述一个媒体文件或媒体流的构成和基本信息。

源码中的注释非常详细，可以参考源码或者点击[雷神的博客](https://blog.csdn.net/leixiaohua1020/article/details/14214705)

AVFormatContext 中比较重要的几个字段

```c
struct AVInputFormat *iformat：输入数据的封装格式
AVIOContext *pb：输入数据的缓存
unsigned int nb_streams：  音视频流的个数
AVStream **streams：       视频流
char filename[1024]：    文件名
int64_t duration：   时长（单位：微秒us，转换为秒需要除以1000000）
int bit_rate：       比特率（单位bps，转换为kbps需要除以1000）
AVDictionary *metadata：元数据
```

## 打开网络流

通过 avformat_network_init 初始化和打开网络流，因为本文是基于本地媒体文件，不需要用到网络功能，可以不加这一句，也不进行介绍(后期学到再深入)。

## 打开本地媒体文件 avformat_open_input

该函数用于打开多媒体数据并且获取一些信息，它的声明位于 `libavformat/avformat.h`

函数原型：

```c
int avformat_open_input(AVFormatContext **ps,  
        const char *filename,  
        AVInputFormat *fmt,  
        AVDictionary **options)
```
- ps: 媒体文件的上下文结构
- filename：需要打开媒体文件的文件名
- fmt：是打开媒体格式的操作结构，因为是读，所以是 inputFormat，在这可以传入一个自定义的的 inputFormat ,对应命令行中的 -f xxx 段，如果指定了它，在打开文件中就不会再探测文件的实际格式了，就以这个为准了。
- options： 是对某种格式的一些操作，是为了在命令行中可以对不同的格式传入，一般为 NULL

避免篇幅过长，源码详细介绍可以[参考这里](https://blog.csdn.net/qq_36391075/article/details/90514721)

大致流程：

- avformat_alloc_context 创建上下文结构

- init_input 它主要的工作就是打开视频数据并且探测视频的格式
  - 最后调用 av_probe_input_buffer2 来推测 AVInputFormat；每次探测返回的分数太低时，探测缓冲区大小都会增加，并进行另一次尝试。 达到最大探测大小时，将返回分数最高的输入格式。
    - av_probe_input_format2 探测数据
      - av_probe_input_format3：主要通过从 format 链表 first_iformat 中不断取出链表项同数据流中包含的格式信息进行比对，当找到符合的表项的时候，就将表项中的信息都保存在AVInputFormat{} 结构体中
- `AVInputFormat-> read_header()`：在调用完 init_input 完成基本的初始化并且推测出相应的 AVInputFormat 之后，回调用 read_header 方法读取媒体文件的文件头，并且完成相关的初始化。read_header 是一个位于 AVInputFormat 结构体中的一个函数指针，对于不同的封装格式，回调用不同的read_header。例如，当属入的视频的封装格式为FLV的时候，会到 FLV 的AVInputFormat 中的 read_header。

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/avformat_open_input.6j87rq9lfzs0.png)

具体使用如下：

> 文末有完整代码


```c
    int ret = avformat_open_input(&ifmt_ctx,in_filename,NULL,NULL);
    if(ret < 0) {
        char buf[1024] = {0};
//        三个参数分别是错误码\用户设置的错误描述缓存\缓存大小.
        av_strerror(ret,buf,sizeof(buf) - 1); //获取错误信息
        printf("open %s is failed: %s\n",in_filename,buf);
        goto failed;  //需要关闭上下文
    }
```
## 读取pkt并提取媒体流中的信息 avformat_find_stream_info

avformat_find_stream_info 主要是读一些包（packets ），然后从中提取初流的信息。有一些文件格式没有头，比如说MPEG格式的，这个时候，这个函数就很有用，因为它可以从读取到的包中获得到流的信息。在MPEG-2重复帧模式的情况下，该函数还计算真实的帧率。

函数原型：

```c
int avformat_find_stream_info(AVFormatContext *ic, AVDictionary **options)
```

应用示例

```c
    ret = avformat_find_stream_info(ifmt_ctx,NULL);
    if(ret < 0) {
        char buf[1024] = {0};
        av_strerror(ret,buf,sizeof(buf) - 0);
        printf(("avformat_find_stream_info %s failed: %s",in_filename,buf));
        goto failed;
    }
```

## 打印出媒体流的上下文信息 av_dump_format


打印关于输入或输出格式的详细信息，例如持续时间，比特率，流，容器，程序，元数据，边数据，编解码器和时基

```c
void av_dump_format(AVFormatContext *ic, int index, const char *url,int is_output);
```

参数说明：

**最后一个参数 is_output 选择指定的上下文是输入(0)还是输出(1)，也就说最后一个参数填0，打印输入流；最后一个参数填1，打印输出流**

```c
#include <stdio.h>
#include <libavformat/avformat.h>


void av_demux_text(char *in_filename) {

    //打开网络流。这里如果只需要读取本地媒体文件，不需要用到网络功能，可以不用加上这一句
//    avformat_network_init();

    //如果不输入参数的话就
    char *default_name = "believe.mp4";
    if(in_filename == NULL)  {
        in_filename = default_name;
    }
    printf("in_filename = %s\n",in_filename);

    //AVFormatContext是描述一个媒体文件或媒体流的构成和基本信息的结构体
    AVFormatContext *ifmt_ctx = NULL;

    int videoindex = -1;  //视频索引
    int audioindex = -1;  //音频索引

    //打开本地媒体文件  avformat_open_input: 打开多媒体数据并且获取一些信息
    int ret = avformat_open_input(&ifmt_ctx,in_filename,NULL,NULL);
    if(ret < 0) {
        char buf[1024] = {0};
//        三个参数分别是错误码\用户设置的错误描述缓存\缓存大小.
        av_strerror(ret,buf,sizeof(buf) - 1); //获取错误信息
        printf("open %s is failed: %s\n",in_filename,buf);
        goto failed;  //需要关闭上下文
    }
    //读取pkt并提取媒体流中的信息
    ret = avformat_find_stream_info(ifmt_ctx,NULL);
    if(ret < 0) {
        char buf[1024] = {0};
        av_strerror(ret,buf,sizeof(buf) - 0);
        printf(("avformat_find_stream_info %s failed: %s",in_filename,buf));
        goto failed;
    }

    //走到这里说明打开媒体文件和从媒体流中提取信息成功
//    打印关于输入或输出格式的详细信息
    printf_s("\n==== av_dump_format in_filename:%s ===\n", in_filename);
 /*
  * printf只是检查format字符串是否为空。如果为空，会触发assert(false)。
    而printf_s还会检查format字符串是否有效，即其中格式是否合法。如果不合法，也会触发assert(false)。
  * */
//    void av_dump_format(AVFormatContext *ic, int index, const char *url,int is_output);
    av_dump_format(ifmt_ctx,0,in_filename,0);  //打印出媒体流的上下文信息
    printf_s("\n==== av_dump_format finish =======\n\n");

    printf("media name: %s\n",ifmt_ctx->url);           //打印媒体 路径/名字

    printf("stream number: %d\n", ifmt_ctx->nb_streams);  // nb_streams: nb_streams媒体流数量

    printf("media average ratio: %lldkbps\n",(int64_t)(ifmt_ctx->bit_rate/1024));

    //媒体文件时长，单位微妙
    int total_seconds,hour,minute,second;
    total_seconds = (ifmt_ctx->duration) / AV_TIME_BASE;  //#define AV_TIME_BASE 1000 000 1000us = 1ms, 1000ms = 1秒
    hour = total_seconds / 3600;
    minute = (total_seconds % 3600) / 60;
    second = (total_seconds % 60);
    //可以得到媒体文件的总时长
    printf("media time: %02d:%02d:%02d\n",hour,minute,second);
    printf("\n");

 failed:
    if(ifmt_ctx) {
        avformat_close_input(&ifmt_ctx);
    }
    getchar();
    return;
}
```

运行结果可以看出

可以看到 believe.flv 一共有两个流，

    #0:0视频流，h264编码，yuv420, 1920*1080, 14.46fps,

    #0:1音频流   aac编码，48000Hz, stereo立体声

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/av_dump_format_finish.67rjwy267m40.png)




