## 1.`ffmpeg`解码

解码需要理解四个结构体`AVStream`、 `AVPacket` 和 `AVFrame` 以及 `AVCodecContext`， 其中`AVPacket` 是存放是编码格式的一帧数据， `AVFrame` 存放的是解码后的一帧数据。 解码的过程其实就是从`AVCodecContext` 取出一个`AVPacket` 解码成 `AVFrame`的过程。

https://blog.csdn.net/lipengshiwo/article/details/52528808
https://www.jianshu.com/p/d77718947e21
https://blog.csdn.net/dingshuhong_/article/details/104193269