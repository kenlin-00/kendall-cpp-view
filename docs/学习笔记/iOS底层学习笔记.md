
- [环境准备](#环境准备)
- [RunLoop](#runloop)
  - [RunLoop 在实际开发中的应用](#runloop-在实际开发中的应用)
  - [RunLoop 的基本作用](#runloop-的基本作用)
  - [RunLoop 与线程的关系](#runloop-与线程的关系)
  - [获取 RunLoop](#获取-runloop)
  - [RunLoop 相关类](#runloop-相关类)
  - [RunLoop 运行逻辑](#runloop-运行逻辑)
  - [CFRunLoopObserverRef 的集中状态](#cfrunloopobserverref-的集中状态)
  - [RunLoop 内部实现逻辑](#runloop-内部实现逻辑)
  - [RunLoop休眠的实现原理](#runloop休眠的实现原理)
  - [RunLoop 与 NSTimer](#runloop-与-nstimer)
    - [解决 tableview 滑动时 NSTImer 失效问题](#解决-tableview-滑动时-nstimer-失效问题)

-----

## 环境准备

- 连接真机

首先让电脑和 iphone  处于同一个局域网下，并连接上数据线

然后开始如下步骤

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/真机调试01.799owfflr3w0.png)

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/真机调试02.2dvvu445uam8.png)

等到出现上图的图标的时候可以拔掉数据线，在手机上输入密码之后，

会提示输入钥匙串中的密钥，输入电脑密码极客

这时候就可以正常连接了。

但是真机调试需要添加 tream，个人账户就是登录 Apple ID

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/真机调试03.76z9zeikzb80.png)

但是 xcode 上的 APP 在 iPhone 上运行需要添加信任，以 iphone 13 为例：

> 设置 --> 通用 --> VPN与设备管理 --> 点击「开发者App」下面的账户 --> 信任

这样就可以正常进行真机调试了

-----

## RunLoop

### RunLoop 在实际开发中的应用

- 控制线程的生命周期（线程保活）
- 解决 NSTimer 在滑动时停止工作的问题
- 监控应用卡顿
- 性能优化

### RunLoop 的基本作用

- 保存程序的持续运行
- 除了 APP 的各种事件（比如：触摸事件，定时事件）
- 节省 CPU 资源，提高程序性能；该做事的时候做事，该休息的时候休息

### RunLoop 与线程的关系

- 每一条线程都有唯一的一条与之对应的 RunLoop 对象
- RunLoop 保存在一个全局的 Dictionary 里面，线程作为 key，RunLoop 作为 value
- 线程刚创建时并没有 RunLoop 对象，RunLoop 会在第一次获取它的时候创建
- RunLoop 会在线程结束时销毁
- 主线程的 RunLoop 已经自动获取（创建），子线程默认没有开启 RunLoop

### 获取 RunLoop

```Objectivec
NSLog(@"%p,%p",[NSRunLoop currentRunLoop],[NSRunLoop mainRunLoop]);  // OC 方式
NSLog(@"%p,%p",CFRunLoopGetCurrent(),CFRunLoopGetMain());  //C语言 方式
```

上面两行打印的地址是不一样，真正的 RunLoop 地址是 C语言 方式打印的地址，NSRunLoop 是对 CFRunLoop 包装。打印的只是包装后的地址。

### RunLoop 相关类

- `CFRunLoopRef`
- `CFRunLoopModeRef`
- `CFRunLoopSourceRef`
- `CFRunLoopTimeRef`
- `CFRunLoopObserverRef`

其数据结构如下

抽取出 `__CFRunLoop` 数据结构中几个关键的有用成员

```c
struct __CFRunLoop {
    pthread_t _pthread;
    CFMutableSetRef _commonModes;
    CFMutableSetRef _commonModeItems;
    CFRunLoopModeRef _currentMode;
    CFMutableSetRef _modes;
};
```

CFRunLoopModeRef 又是一个结构体，__CFRunLoopMode 数据结构如下

```objectivec
typedef struct __CFRunLoopMode *CFRunLoopModeRef;
struct __CFRunLoopMode {
    CFStringRef _name;
    Boolean _stopped;
    CFMutableSetRef _sources0;  // 对应CFRunLoopSourceRef
    CFMutableSetRef _sources1;  // 对应CFRunLoopSourceRef
    CFMutableArrayRef _observers;  //对应CFRunLoopObserverRef
    CFMutableArrayRef _timers;   //对应 CFRunLoopTimeRef
};
```

因此上面的相关类的关系就是 `CFRunLoopRef` 装着 `CFRunLoopModeRef`，`CFRunLoopModeRef` 装着 `CFRunLoopSourceRef`， `CFRunLoopTimeRef`， `CFRunLoopObserverRef`。

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/RunLoop01.4q187cyh9pc0.png)


**CFRunLoopModeRef 代表 RunLoop 的运行模式**

一个 RunLoop 包含若干个Mode，每个 Mode 又包含若干个`Source0/Source1/Timer/Observer`

RunLoop 启动时只能选择其中一个 Mode，作为 currentMode

如果需要切换 Mode，只能退出当前 Loop，再重新选择一个 Mode 进入.         
不同组的 `Source0/Source1/Timer/Observer` 能分隔开来，互不影响

如果 Mode 里没有任何 `Source0/Source1/Timer/Observer`，RunLoop 会立马退出.

###  RunLoop 运行逻辑

> Source0 
> - 触摸事件处理
> - performSelector:onThread:

在点击事件内部打断点调试，然后在 lldb 命令行敲 `bt` 可以发现处理点击时间就是从 source0 开始的

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/RunLoop02.6a0or4up69g0.webp)

> Source1
> - 基于Port的线程间通信
> - 系统事件捕捉

> Timers
> - NSTimer
> - performSelector:withObject:afterDelay:

> - Observers
> - 用于监听 RunLoop 的状态
> - UI刷新（BeforeWaiting）
> - Autorelease pool（BeforeWaiting）  //自动释放池

```objectivec
self.view.backgroundColor = [UIColor redColor];
```

这句代码并不是一执行就生效，它是通过 Observers 监听到 RunLoop 在睡觉之前才刷新 UI，才将 view 设置为红色


### CFRunLoopObserverRef 的集中状态

```objectivec
/* Run Loop Observer Activities */
typedef CF_OPTIONS(CFOptionFlags, CFRunLoopActivity) {
    kCFRunLoopEntry = (1UL << 0),       //即将进入 Loop
    kCFRunLoopBeforeTimers = (1UL << 1), //即将处理Timer
    kCFRunLoopBeforeSources = (1UL << 2), //即将处理Source
    kCFRunLoopBeforeWaiting = (1UL << 5),  //即将进入休眠
    kCFRunLoopAfterWaiting = (1UL << 6),  //刚从休眠中唤醒
    kCFRunLoopExit = (1UL << 7),           //即将退出 Loop
    kCFRunLoopAllActivities = 0x0FFFFFFFU
};
```

### RunLoop 内部实现逻辑

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/RunLoop04-运行逻辑.vr6lhc1tq2o.webp)

### RunLoop休眠的实现原理

我们知道RunLoop在不断的切换Mode处理其中的 Source0，Source1，Observers，Timers，如果没有相关的触发就会休眠，进行线程阻塞，等到有相关的触发继续干活。

通过源码分析可以知道，会用到一个 mach_msg 函数，mach_msg 是比较底层的函数，就是切换到内核态， 让线程直接阻塞休眠，实现真正的休眠。等到有相关的消息触发，又会苏醒干活。

如果是以 `while(1){};` 这种形式是可以阻塞线程，但是CPU还是在不断的工作，不过是死循环而已。

它们的区别：

- 当用 mach_msg 的时候，会从用户态转化到内核态去让线程阻塞，休眠
- 当用 `while(1){};` 的时候，还是在用户态，只不过是代码逻辑阻塞，线程没有真正的休眠

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/RunLoop03.1njh8v1tk43k.webp)

> 这种休眠可以达到真正休眠的目的，可以实现节省 CPU 性能。可是达到手机省电的效果


### RunLoop 与 NSTimer

- NSTimer 是由 RunLoop 来管理的，NSTimer 其实就是 CFRunLoopTimeRef ，他们之间是 tool-free bridged「桥接」 的，他们之间可以相互转换；
- 如果我们在子线程上使用 NSTimer，就必须开启子线程的 RunLoop，否则定时器无法生效

#### 解决 tableview 滑动时 NSTImer 失效问题

- 我们知道，RunLoop 同一时间只能运行在一种模式下，当我们滑动 `tableview/scrollview` 的时候 RunLoop 会切换到 UITrackingRunLoopMode 界面追踪模式下。如果我们的 NSTimer 是添加到 RunLoop 的 `KCFRunLoopDefaultMode/NSDefaultRunLoopMode` 默认模式下的话，此时是会失效的。

- **解决**：我们可以将 NSTimer 添加到 RunLoop 的 `KCFRunLoopCommonModes/NSRunLoopCommonModes` 通用模式下，来保证无论在默认模式还是界面追踪模式下 NSTimer 都可以执行。

- **NSTimer 的创建方式**

如果我们是通过以下方法创建的 NSTimer，是自动添加到 RunLoop 的默认模式下的

```objc
[NSTimer scheduledTimerWithTimeInterval:1.0 repeats:YES block:^(NSTimer * _Nonnull timer) {
    NSLog(@"123");
}];
```

我们可以通过以下方法创建 NSTimer，来自定义添加到RunLoop的某种模式下

```objc
NSTimer *timer = [NSTimer timerWithTimeInterval:1.0 repeats:YES block:^(NSTimer * _Nonnull timer) {
    NSLog(@"123");
}];
[[NSRunLoop currentRunLoop] addTimer:timer forMode:NSRunLoopCommonModes];
```

> 一般情况下，通过 `timerxxx` 开头方法创建的 NSTimer 是不会自动添加到 RunLoop 中的，所以一定要记得手动添加，否则 NSTimer 不生效。




