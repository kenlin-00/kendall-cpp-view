

------ 

## 视频采集

### 视频采集的步骤

- 1、创建并初始化输入（ AVCaptureInput `[ˈkæptʃər]` ）和输出（ AVCaptureOutput ）
  - AVCaptureOutput 是一个抽象类，AVCaptureSession 的输出端必须是 AVCaptureOutput 的实现类。
这里我们用到的是 AVCaptureVideoDataOutput，作为视频数据的输出端。
    - AVCaptureOutput 是一个抽象类，AVCaptureSession 的输出端必须是AVCaptureOutput的实现类。
这里我们用到的是 AVCaptureVideoDataOutput，作为视频数据的输出端。
  - AVCaptureOutput 是一个抽象类，AVCaptureSession 的输出端必须是 AVCaptureOutput 的实现类。
这里我们用到的是 AVCaptureVideoDataOutput，作为视频数据的输出端。

- 2、创建并初始化AVCaptureSession，把AVCaptureInput和AVCaptureOutput添加到AVCaptureSession中

- 3、调用 AVCaptureSession 的 startRunning 开启采集

----

- 优化卡顿带来的累积延时

- 怎么做到直播秒开优化

https://github.com/0voice/audio_video_streaming/blob/main/case_interview/001-README.md#subject_001

- 如何降低延迟？如何保证流畅性？如何解决卡顿？解决网络抖动

https://github.com/0voice/audio_video_streaming/blob/main/case_interview/001-README.md#%E9%9D%A2%E8%AF%95%E9%A2%9830

-  YUV
https://blog.csdn.net/lizhongfu2013/article/details/108219449




基于 IOS 的农产品生产链直播 APP 

本项目是我学习啊本科师弟的毕业设计，我只是参与了一部分的开发工作，后期还帮忙解决了一些优化问题，比如对缓冲 buffer 控制的优化，解决了优卡顿带来的累积延时，

我主要负责的是从 IOS 摄像头 采集视频数据，对视频 H264 进行硬编码和硬解码

利用 

基于 IOS 的绿色农产品生产链直播 APP 

本项是一款实时共享农产品生产流程的 IOS 客户端，让农产品可以更透明地呈现个消费者。
参与工作：
- 负责将 FFmpeg 基于到 IOS 平台，对摄像头采集的视频数据进行进行 H264 硬编码和硬解码。
- 缓冲 Buffer 的控制，优化卡顿带来的累积延时，并使用缓冲队列解决直播过程中的卡顿问题。

