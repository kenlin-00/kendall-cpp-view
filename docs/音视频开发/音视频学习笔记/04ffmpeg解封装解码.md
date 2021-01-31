## 1.ffmpeg解封装

### 1.1 封装格式相关函数
```c
avformat_alloc_context();负责申请一个AVFormatContext
结构的内存,并进行简单初始化
avformat_free_context();释放该结构里的所有东西以及该
结构本身
avformat_close_input();关闭解复用器。关闭后就不再需要
使用avformat_free_context 进行释放。
avformat_open_input();打开输入视频文件
avformat_find_stream_info()：获取视频文件信息
av_read_frame(); 读取音视频包
avformat_seek_file(); 定位文件
av_seek_frame():定位文件
```

### 1.2 解封装函数

![](./img/ffmpeg解封装01png.png)


