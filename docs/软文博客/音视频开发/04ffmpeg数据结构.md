## 1.ffmpeg数据结构介绍
ffmpeg的数据结构有很多，各司其职，大致见下面的音视频播放流程图：

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/ffmpeg数据结构01.30bhhwy7f6m0.png)

ffmpeg的数据结构可以分为以下几类：

- (1)解协议（http,rtsp,rtmp,mms）
  
  * `AVIOContext`，`URLProtocol`，`URLContext`主要存储视音频使用的协议的类型以及状态。
  * `URLProtocol`存储输入音视频使用的封装格式。每种协议都对应一个`URLProtocol`结构。（注意：FFMPEG中文件也被当做一种协议“file”）

- (2)解封装（flv,avi,rmvb,mp4）
  
  * `AVFormatContext`主要存储视音频封装格式中包含的信息
  * `ffmpeg`支持各种各样的音视频输入和输出文件格式（例如FLV, MKV, MP4, AVI），而  `AVInputFormat`和`AVOutputFormat` 结构体则保存了这些格式的信息和一些常规设置。

- (3)解码（h264,mpeg2,aac,mp3）

	* `AVStream`是存储每一个视频/音频流信息的结构体。
	* `AVCodecContext`: 编解码器上下文结构体，存储该视频/音频流使用解码方式的相关数据。
	* `AVCodec`: 每种视频（音频）编解码器(例如H.264解码器)对应一个该结构体。
	
	三者的关系如下图:

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/ffmpeg数据结构02.2wmury82usk0.png)


- (4)存数据

	对于视频，每个结构一般是存一帧；音频可能有好几帧
  * 解码前数据：`AVPacket`
  * 解码后数据：`AVFrame`


## 2.各种结构体之间的关系

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/ffmpeg数据结构03.31vbcezocym0.jpg)
> 图片来源雷神博客

### 2.1 AVFormatContext 和 AVInputFormat之间的关系

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/ffmpeg数据结构04.fnx3k76bak0.png)



`AVInputFormat`被封装在`AVFormatContext`里

`AVFormatContext` 作为`API`被外界调用

`AVInputFormat` 主要是`FFmpeg`内部调用

`AVFormatContext`里保存了视频文件封装格式相关信息，它是负责储存数据的结构体。而`AVInputFormat`代表了各个封装格式，属于方法，这是一种面向对象的封装。
 
通过 `int avformat_open_input(AVFormatContext **ps, const char *filename,AVInputFormat *fmt, AVDictionary **options)`函数装载解封装器.


### 2.2 `AVFormatContext`, `AVStream`和`AVCodecContext`之间的关系

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/ffmpeg数据结构05.69ymb94m49c0.png)

`AVStream`和`AVpacket`中都有`index`字段用于区分不同的码流（视频、音频、字幕等），`AVFormatContext`中包含输入的`AVStream`数组用于记录各个码流，`nb_streams`记录输入码流的数量。`AVCodecContext`记录着`AVStream`需要用那种解码器来进行解码。
