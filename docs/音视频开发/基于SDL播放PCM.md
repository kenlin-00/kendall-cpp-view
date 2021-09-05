> 首先我们可以使用 ffplay 播放 PCM 文件


**播放PCM需要指定相关参数**：

- *ar*：采样率
- *ac*：声道数
- *f*：采样格式
	- *s16le*：PCM signed 16-bit little-endian
	- 更多PCM的采样格式可以使用命令查看
		- Windows：*ffmpeg -formats | findstr PCM*
		- Mac：*ffmpeg -formats | grep PCM* 


```sh
ffplay -ar 44100 -ac 2 -f s16le out.pcm
```

## SDL 概述

SDL（Simple DirectMedia Layer），是一个跨平台的C语言多媒体开发库。其 API 文档：[wiki](https://wiki.libsdl.org/)

其实 SDL 本身并不提供音视频播放的功能，它只是封装了音视频播放的底层 API ，SDL封装了Direct3D这类的API用于播放视频；封装了DirectSound这类的API用于播放音频。因为SDL的编写目的就是简化视音频播放的开发难度，所以使用SDL播放视频（YUV/RGB）和音频（PCM）数据非常的容易。

### SDL播放音频的流程

- 初始化子系统

SDL 实际上不限于音视频播放，它内部将各个功能分成多个子系统，在开发的时候首先要初始化响应的子系统，比如：

```cpp
//extern DECLSPEC int SDLCALL SDL_Init(Uint32 flags);
SDL_Init(SDL_INIT_AUDIO | SDL_INIT_VIDEO);  //既播放声音播放画面
```

其中，flags可以取下列值：

```cpp
SDL_INIT_TIMER：定时器
SDL_INIT_AUDIO：音频
SDL_INIT_VIDEO：视频
SDL_INIT_JOYSTICK：摇杆
SDL_INIT_HAPTIC：触摸屏
SDL_INIT_GAMECONTROLLER：游戏控制器
SDL_INIT_EVENTS：事件
SDL_INIT_NOPARACHUTE：不捕获关键信号???
SDL_INIT_EVERYTHING：包含上述所有选项
```

- 打开音频设备

```cpp
// extern DECLSPEC int SDLCALL SDL_OpenAudio(SDL_AudioSpec * desired, SDL_AudioSpec * obtained);
// desired：期望的参数。
// obtained：实际音频设备的参数，一般情况下设置为NULL即可。

SDL_OpenAudio(&spec,nullptr)
```

使用 `SDL_OpenAudio()`打开音频设备。该函数需要传入一个 `SDL_AudioSpec`的结构体。

```cpp
typedef struct SDL_AudioSpec
{
    int freq;                   /**音频数据的采样率。常用的有48000,44100等。 */
    SDL_AudioFormat format;     /**音频数据的格式 常见格式见下面*/
    Uint8 channels;             /**声道数。例如单声道取值为1，立体声取值为2 */
    Uint8 silence;              /**设置静音的值 */
    Uint16 samples;             /**音频缓冲区中的采样个数，要求必须是2的n次方 */
    Uint16 padding;             /**<考虑到兼容性的一个参数 */
    Uint32 size;                /**音频缓冲区的大小，以字节为单位*/
    SDL_AudioCallback callback; /**填充音频缓冲区的回调函数 */
    void *userdata;             /**用户自定义的数据 */
} SDL_AudioSpec;
```

SDL_AudioFormat 常见格式：

```cpp
#define AUDIO_U8        0x0008  /**< Unsigned 8-bit samples */
#define AUDIO_S8        0x8008  /**< Signed 8-bit samples */
#define AUDIO_U16LSB    0x0010  /**< Unsigned 16-bit samples */
#define AUDIO_S16LSB    0x8010  /**< Signed 16-bit samples */
#define AUDIO_U16MSB    0x1010  /**< As above, but big-endian byte order */
#define AUDIO_S16MSB    0x9010  /**< As above, but big-endian byte order */
#define AUDIO_U16       AUDIO_U16LSB
#define AUDIO_S16       AUDIO_S16LSB
```


- 清除子系统

播放结束之后还需要清除所有的子系统

```cpp
SDL_Quit();
```

> 未完待更...

