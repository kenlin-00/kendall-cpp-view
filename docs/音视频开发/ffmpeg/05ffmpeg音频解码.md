## 1.`ffmpeg`解码

> 从本地读取 AAC 码流，然后解码

大致流程

![](./img/音频解码01.png)


解码需要理解四个结构体`AVStream`、 `AVPacket` 和 `AVFrame` 以及 `AVCodecContext`， 其中`AVPacket` 是存放是编码格式的一帧数据， `AVFrame` 存放的是解码后的一帧数据。 解码的过程其实就是从`AVCodecContext` 取出一个`AVPacket` 解码成 `AVFrame`的过程。


![](./img/音频解码02.jpg)

关键函数说明：

`avcodec_register_all()`：注册所有的编解码器。
`avcodec_find_decoder`：根据指定的`AVCodecID`查找注册的解码器。
`av_parser_init`：初始化`AVCodecParserContext`。返回的是`AVCodecParserContext`
`avcodec_alloc_context3`：为`AVCodecContext`分配内存。
`avcodec_open2`：打开解码器。
`av_parser_parse2`：解析获得一个`Packet`。
`avcodec_send_packet`：将`AVPacket`压缩数据给解码器。
`avcodec_receive_frame`：获取到解码后的`AVFrame`数据。
`av_get_bytes_per_sample`: 获取每个`sample`中的字节数。

## 2.关键数据结构

`AVCodecParser`

`AVCodecParser`用于解析输入的数据流并把它分成一帧一帧的压缩编码数据。比较形象的说法就是把长长的一段连续的数据“切割”成一段段的数据。

## 3.avcodec 编解码API介绍

- `vcodec_send_packet`、`avcodec_receive_frame`的`API`是`FFmpeg3`版本加入的。为了正确的使用它们，有必要阅读`FFmpeg`的[文档说明](https://www.ffmpeg.org/doxygen/4.1/group__lavc__encdec.html#details)。


`FFmpeg`提供了两组函数，分别用于编码和解码：

解码：`avcodec_send_packet()`、`avcodec_receive_frame()`。

解码：`avcodec_send_frame()`、`avcodec_receive_packet()`。

API的设计与编解码的流程非常贴切。

建议的使用流程如下：

- 1.像以前一样设置并打开`AVCodecContext`。

- 2.输入有效的数据：

  * 解码：调用avcodec_send_packet()给解码器传入包含原始的压缩数据的AVPacket对象。
  * 编码：调用 avcodec_send_frame()给编码器传入包含解压数据的AVFrame对象。

两种情况下推荐AVPacket和AVFrame都使用refcounted（引用计数）的模式，否则libavcodec可能需要对输入的数据进行拷贝。

- 3.在一个循环体内去接收codec的输出，即周期性地调用avcodec_receive_*()来接收codec输出的数据：
	* 解码：调用avcodec_receive_frame()，如果成功会返回一个包含未压缩数据的AVFrame。
	* 编码：调用avcodec_receive_packet()，如果成功会返回一个包含压缩数据的AVPacket。
	
反复地调用`avcodec_receive_packet()`直到返回 `AVERROR(EAGAIN)`或其他错误。返回`AVERROR(EAGAIN)`错误表示`codec`需要新的输入来输出更多的数据。对于每个输入的`packet`或`frame`，`codec`一般会输出一个`frame`或`packet`，但是也有可能输出`0`个或者多于`1`个。

- 4.流处理结束的时候需要`flush`（洗刷） `codec`。因为`codec`可能在内部缓冲多个`frame`或`packet`，出于性能或其他必要的情况（如考虑B帧的情况）。 处理流程如下：

	* 调用`avcodec_send_*()`传入的`AVFrame`或`AVPacket`指针设置为`NULL`。 这将开启`draining mode`（排水模式）。
	* 反复地调用`avcodec_receive_*()`直到返回`AVERROR_EOF`的错误，这个方法这个时候不会返回`AVERROR(EAGAIN)`的错误，除非你忘记了开启`draining mode`。
	* `codec`可以重新开启，但是需要先调用 `avcodec_flush_buffers()`来重置`codec`。
	
**说明：**

- 编码或者解码刚开始的时候，`codec`可能接收了多个输入的`frame`或`packet`后还没有输出数据，直到内部的`buffer`被填充满。上面的使用流程可以处理这种情况。
- 理论上调用`avcodec_send_*()`的时候可能会发生`AVERROR(EAGAIN)`的错误，这只应该在有输出数据没有被接收的情况，你可以依赖这个机制来实现区别于上面建议流程的处理方式，比如反复地调用`avcodec_send_*()`，出现`AVERROR(EAGAIN)`错误的时候再去调用`avcodec_receive_*()`。
- 并不是所有的`codec`都遵循一个严格、可预测的数据处理流程，唯一可以保证的是 “调用`avcodec_send_*()/avcodec_receive_*()`返回`AVERROR(EAGAIN)`的时候去`avcodec_receive_*()/avcodec_send_*()`会成功，否则不应该返回`AVERROR(EAGAIN)`的错误。”一般来说，任何`codec`都不允许无限制地缓冲输入或者输出。
- 在同一个`AVCodecContext`上混合使用新旧`API`是不允许的，这将导致未定义的行为。

## 4.示例代码

```c
/**
 * audio decoding with libavcodec API example
 * FFmpeg/doc/examples/decode_audio.c
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <libavutil/frame.h>
#include <libavutil/mem.h>

#include <libavcodec/avcodec.h>

#define AUDIO_INBUF_SIZE 20480
#define AUDIO_REFILL_THRESH 4096

static void decode(AVCodecContext *dec_ctx, AVPacket *pkt, AVFrame *frame,
                   FILE *outfile)
{
    int i, ch;
    int ret, data_size;

    /* send the packet with the compressed data to the decoder */
    ret = avcodec_send_packet(dec_ctx, pkt);
    if (ret < 0) {
        fprintf(stderr, "Error submitting the packet to the decoder\n");
        exit(1);
    }

    /* read all the output frames (in general there may be any number of them */
    while (ret >= 0) {
        ret = avcodec_receive_frame(dec_ctx, frame);
        if (ret == AVERROR(EAGAIN) || ret == AVERROR_EOF)
            return;
        else if (ret < 0) {
            fprintf(stderr, "Error during decoding\n");
            exit(1);
        }
        data_size = av_get_bytes_per_sample(dec_ctx->sample_fmt);
        if (data_size < 0) {
            /* This should not occur, checking just for paranoia */
            fprintf(stderr, "Failed to calculate data size\n");
            exit(1);
        }
        for (i = 0; i < frame->nb_samples; i++)
            for (ch = 0; ch < dec_ctx->channels; ch++)
                fwrite(frame->data[ch] + data_size*i, 1, data_size, outfile);
    }
}

int main(int argc, char **argv)
{
    const char *outfilename, *filename;
    const AVCodec *codec;
    AVCodecContext *c= NULL;
    AVCodecParserContext *parser = NULL;
    int len, ret;
    FILE *f, *outfile;
    uint8_t inbuf[AUDIO_INBUF_SIZE + AV_INPUT_BUFFER_PADDING_SIZE];
    uint8_t *data;
    size_t   data_size;
    AVPacket *pkt;
    AVFrame *decoded_frame = NULL;

    if (argc <= 2) {
        fprintf(stderr, "Usage: %s <input file> <output file>\n", argv[0]);
        exit(0);
    }
    filename    = argv[1];
    outfilename = argv[2];

    pkt = av_packet_alloc();

    /* find the MPEG audio decoder */
    codec = avcodec_find_decoder(AV_CODEC_ID_AAC);
    if (!codec) {
        fprintf(stderr, "Codec not found\n");
        exit(1);
    }

    parser = av_parser_init(codec->id);
    if (!parser) {
        fprintf(stderr, "Parser not found\n");
        exit(1);
    }

    c = avcodec_alloc_context3(codec);
    if (!c) {
        fprintf(stderr, "Could not allocate audio codec context\n");
        exit(1);
    }

    /* open it */
    if (avcodec_open2(c, codec, NULL) < 0) {
        fprintf(stderr, "Could not open codec\n");
        exit(1);
    }

    f = fopen(filename, "rb");
    if (!f) {
        fprintf(stderr, "Could not open %s\n", filename);
        exit(1);
    }
    outfile = fopen(outfilename, "wb");
    if (!outfile) {
        av_free(c);
        exit(1);
    }

    /* decode until eof */
    data      = inbuf;
    data_size = fread(inbuf, 1, AUDIO_INBUF_SIZE, f);

    while (data_size > 0) {
        if (!decoded_frame) {
            if (!(decoded_frame = av_frame_alloc())) {
                fprintf(stderr, "Could not allocate audio frame\n");
                exit(1);
            }
        }

        ret = av_parser_parse2(parser, c, &pkt->data, &pkt->size,
                               data, data_size,
                               AV_NOPTS_VALUE, AV_NOPTS_VALUE, 0);
        if (ret < 0) {
            fprintf(stderr, "Error while parsing\n");
            exit(1);
        }
        data      += ret;
        data_size -= ret;

        if (pkt->size)
            decode(c, pkt, decoded_frame, outfile);

        if (data_size < AUDIO_REFILL_THRESH) {
            memmove(inbuf, data, data_size);
            data = inbuf;
            len = fread(data + data_size, 1,
                        AUDIO_INBUF_SIZE - data_size, f);
            if (len > 0)
                data_size += len;
        }
    }

    /* flush the decoder */
    pkt->data = NULL;
    pkt->size = 0;
    decode(c, pkt, decoded_frame, outfile);

    fclose(outfile);
    fclose(f);

    avcodec_free_context(&c);
    av_parser_close(parser);
    av_frame_free(&decoded_frame);
    av_packet_free(&pkt);

    return 0;
}
```




