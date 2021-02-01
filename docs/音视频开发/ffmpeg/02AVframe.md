## 2.ffmpeg结构体

### 2.1 AVFrame

从第一张图中可以看出在解码中。`AVFrame` 是解码器的输出；在编码中，`AVFrame` 是编码器的输入。

`AVFrame`中存储的是经过解码后的原始数据（即非压缩数据，例如对视频来说是YUV，RGB，对音频来说是PCM），此外还包含了一些相关的信息。比如说，解码的时候存储了宏块类型表，QP表，运动矢量表等数据。编码的时候也存储了相关的数据。

**下面看一下结构体的定义**（位于avcodec.h）：

```c
/**
 * This structure describes decoded (raw) audio or video data.
 *
 * AVFrame must be allocated using av_frame_alloc(). Note that this only
 * allocates the AVFrame itself, the buffers for the data must be managed
 * through other means (see below).
 * AVFrame must be freed with av_frame_free().
 *
 * AVFrame is typically allocated once and then reused multiple times to hold
 * different data (e.g. a single AVFrame to hold frames received from a
 * decoder). In such a case, av_frame_unref() will free any references held by
 * the frame and reset it to its original clean state before it
 * is reused again.
 *
 * The data described by an AVFrame is usually reference counted through the
 * AVBuffer API. The underlying buffer references are stored in AVFrame.buf /
 * AVFrame.extended_buf. An AVFrame is considered to be reference counted if at
 * least one reference is set, i.e. if AVFrame.buf[0] != NULL. In such a case,
 * every single data plane must be contained in one of the buffers in
 * AVFrame.buf or AVFrame.extended_buf.
 * There may be a single buffer for all the data, or one separate buffer for
 * each plane, or anything in between.
 *
 * sizeof(AVFrame) is not a part of the public ABI, so new fields may be added
 * to the end with a minor bump.
 *
 * Fields can be accessed through AVOptions, the name string used, matches the
 * C structure field name for fields accessible through AVOptions. The AVClass
 * for AVFrame can be obtained from avcodec_get_frame_class()
 */
typedef struct AVFrame {
    uint8_t *data[AV_NUM_DATA_POINTERS];
    int linesize[AV_NUM_DATA_POINTERS];
    uint8_t **extended_data;
    int width, height;
    int nb_samples;
    int format;
    int key_frame;
    enum AVPictureType pict_type;
    AVRational sample_aspect_ratio;
    int64_t pts;
    ......
} AVFrame;
```

**AVFrame 的用法**：

- `AVFrame` 对象必须调用 `av_frame_alloc()` 在堆上分配，注意此处指的是 `AVFrame` 对象本身，`AVFrame` 对象必须调用 `av_frame_free() `进行销毁。
- `AVFrame` 通常只需分配一次，然后可以多次重用，每次重用前应调用 `av_frame_unref()` 将 frame 复位到原始状态。

**下面看几个主要变量的作用：**

**data**

```c
    /**
     * pointer to the picture/channel planes.
     * This might be different from the first allocated byte
     *
     * Some decoders access areas outside 0,0 - width,height, please
     * see avcodec_align_dimensions2(). Some filters and swscale can read
     * up to 16 bytes beyond the planes, if these filters are to be used,
     * then 16 extra bytes must be allocated.
     *
     * NOTE: Except for hwaccel formats, pointers not needed by the format
     * MUST be set to NULL.
     */
    uint8_t *data[AV_NUM_DATA_POINTERS];
```
- 存储原始帧数据(未编码的原始图像或音频格式，作为解码器的输出或编码器的输入)。
- `data` 是一个指针数组，数组的每一个元素是一个指针，指向视频中图像的某一 `plane` 或音频中某一声道的 `plane。`

- 对于 packet 格式，一幅 YUV 图像的 Y、U、V 交织存储在一个 plane 中，形如 YUVYUV...，`data[0]` 指向这个 plane；
- 一个双声道的音频帧其左声道 L、右声道 R 交织存储在一个 plane 中，形如 LRLRLR...，`data[0]` 指向这个 plane。
- 对于 planar 格式，一幅 YUV 图像有 Y、U、V 三个 plane，`data[0]` 指向 Y plane，`data[1]` 指向 U plane，`data[2]` 指向 V plane；
- 一个双声道的音频帧有左声道 L 和右声道 R 两个 plane，`data[0] `指向 L plane，`data[1`] 指向 R plane。

