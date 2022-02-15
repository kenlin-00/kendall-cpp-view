
- [环境准备](#环境准备)
- [OC对象的本质](#oc对象的本质)
  - [一个 NSObject 对象占用多少内存](#一个-nsobject-对象占用多少内存)
  - [自定义 NSObject 对象](#自定义-nsobject-对象)
  - [OC 对象的分类](#oc-对象的分类)
  - [对象的 isa 指针指向哪里](#对象的-isa-指针指向哪里)
  - [class 的 superclasss 指针](#class-的-superclasss-指针)
  - [meta-class 的 superclass 指针](#meta-class-的-superclass-指针)
  - [isa、superclass总结](#isasuperclass总结)
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

---

## OC对象的本质

### 一个 NSObject 对象占用多少内存

> 一个 NSObject 对象占用多少内存呢？也就是 obj 指针所指向的内存空间多大？

如果想很好的回答这个问题，我们需要先知道 NSObject 对象的内存布局。

我们平时写的 Objective-C 代码，底层实现歧视就是 C/C++ 代码，所以 OC 的面向对象其实就是基于 C/C++ 的数据结构来实现的。所以可以猜到，**OC 中的对对象和类其实就是 C/C++ 中的结构体实现的**。

首先我们编写如下一段 OC 代码

```objectivec
#import <Foundation/Foundation.h>

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSObject *obj = [[NSObject alloc] init];
    }
    return 0;
}
```

我们需要将上面这段代码转成 cpp 代码，可以使用如下命令：

```
xcrun  -sdk  iphoneos  clang  -arch  arm64  -rewrite-objc  OC源文件  -o
```

然后在生成的 `.cpp` 文件中搜索如下代码快，顾名思义，NSObject_IMPL  表示 NSObject Implement，翻译过来就是 NSObject 的实现。因此也验证了 NSObject 对象是通过 「结构体」来实现的。

```cpp
struct NSObject_IMPL {
	Class isa;
};
```

我们再来看看 NSObject 的定义。发现和上面代码一样，都是一个 isa 类。其中 isa 的类型就是一个结构体指针：`typedef struct objc_class *Class;`，在 64 位机器中，指针占 8 个字节。

```objectivec
@interface NSObject <NSObject> {
    Class isa  OBJC_ISA_AVAILABILITY;
}
@end
```

因此可以初步认为一个 NSObject 对象占 8 个字节（其实不是），在结构体中只有一个成员，那么该成员的地址就是结构体的地址。所以 obj 是指向 isa 的地址空间。我们也可以使用。我们也可以通过 class_getInstanceSize 方法来查看对象占用的实际空间.

```objectivec
// 获得NSObject实例对象的成员变量所占用的大小 >> 8
NSLog(@"%zd",class_getInstanceSize([NSObject class]));  // 8
```

- class_getInstanceSize

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/oc对象本质01.44u8ake7cwc0.webp)

但是我们使用 malloc_size 函数查看时 16

```objectivec
// 获得obj指针所指向内存的大小 >> 16
NSLog(@"%zd", malloc_size((__bridge const void *)obj));  //使用桥接转成 C语言指针类型
```

我们通过查看源码中 class_getInstanceSize 和 malloc_size 的具体实现可知，这个函数返回的是实例对象的成员变量所占用的实际大小，也就是 8，但是系统给这个对象分配的空间是 16 个字节，因为源码中：`if (size < 16) size = 16;`

我们追踪 alloc 的源码可知 OC 中的 alloc 实际上是通过 C 语言的 calloc 函数实现的，具体见下图。

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/OC对象本质03.1ab0f73zb7nk.png)

因此可以得知 NSObject 对象的内存分布图如下：

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/OC对象本质02.1ecfy7fsvig0.png)


> 因此可以回答一开始的问题，一个 NSObject 对象占用多少内存      
> 系统分配了 16 个字节给 NSObject 对象，通过 malloc_size 函数查看，但是 NSObject 对象内部只使用了 8 个字节（前提是在 64 位系统环境下）可以通过 class_getInstanceSize 函数查看。

此外，我们还可以通过查看对象的内存来认证

查看内存数据

```
<NSObject: 0x101254910>
(lldb) memory read 0x101254910
0x101254910: 89 4c c9 44 f8 ff 1d 01 00 00 00 00 00 00 00 00  .L.D............  
0x101254920: 2d 5b 4e 53 54 6f 6f 6c 62 61 72 43 6f 6c 6c 65  -[NSToolbarColle
```

`89 4c c9 44 f8 ff 1d 01` 存储 isa 指针，后面八个字节 `00 00 00 00 00 00 00 00 ` 是分配但没被使用的内存。

> LLDB 指令

```
//print、p：打印

po：打印对象

//读取内存
memory read/数量格式字节数  内存地址
x/数量格式字节数  内存地址
x/3xw  0x10010

//修改内存中的值
memory  write  内存地址  数值
memory  write  0x0000010  10
```

---

### 自定义 NSObject 对象

```objc
@interface Student : NSObject
{
    @public
    int _no;
    int _age;
}
@end

@implementation Student

@end
```

我们先生成它的 C++ 代码查看它的实现

```cpp
//struct NSObject_IMPL {
//    Class isa;
//};
//

struct Student_IMPL {
    Class isa;  //直接把父类的成员拿过来
    int _no;
    int _age;
};

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        Student *stu = [[Student alloc] init];
        
       NSLog(@"%zd",class_getInstanceSize([Student class]));  //16
       NSLog(@"%zd",malloc_size((__bridge const void *)stu));  //16
        
        stu->_no = 4;
        stu->_age = 5;

    }
    return 0;
}
```

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/oc对象本质02.xlbryrpoab.webp)

查看地址可以看到 4 和 5 的存储位置

```
(lldb) x 0x0000000100717140
0x100717140: 41 81 00 00 01 80 1d 01 04 00 00 00 05 00 00 00  A...............
0x100717150: 2d 5b 4e 53 44 65 62 75 67 54 6f 75 63 68 42 61  -[NSDebugTouchBa
```

> 再看继承关系的时候内存占用情况

```objc
//struct Person_IMPL {
//    struct NSObject_IMPL NSObject_IVARS; // 8
//    int _age; // 4
//}; // 16 内存对齐：结构体的大小必须是最大成员大小的倍数
//
//struct Student_IMPL {
//    struct Person_IMPL Person_IVARS; // 16  但是后面 4 个字节是空的
//    int _no; // 4
//}; // 16
@interface Person : NSObject
{
    @public
    int _age;
}
@end
@interface  Student: Person
{
    @public
    int _no;
}
@end

@implementation Person

@end
@implementation Student

@end

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        Student *stu = [[Student alloc] init];
        Person *per = [[Person alloc] init];
        
        NSLog(@" Person: %zd",class_getInstanceSize([Person class]));  // 16
        NSLog(@"Student: %zd",class_getInstanceSize([Student class]));  // 16
        
        NSLog(@" Person: %zd",malloc_size((__bridge const void *)per));  // 16
        NSLog(@" Person: %zd",malloc_size((__bridge const void *)stu));  // 16

    }
    return 0;
}
```

再看看如果增加属性的情况

```objc
@interface Person : NSObject
{
    @public
    int _age;
}
@property (nonatomic, assign) int height;  //增加一个属性，填在后面的空的 4 个字节
@property (nonatomic, assign) int weight;
//增加两个属性之后就会变成分配 32
@end
@interface  Student: Person
{
    @public
    int _no;
}
@end

@implementation Person

@end
@implementation Student



@end

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        Student *stu = [[Student alloc] init];
        Person *per = [[Person alloc] init];
        
        NSLog(@" Person使用了: %zd",class_getInstanceSize([Person class]));  // 24
        NSLog(@"Student使用了: %zd",class_getInstanceSize([Student class]));  // 24
        
        NSLog(@" Person分配了: %zd",malloc_size((__bridge const void *)per));  // 32
        NSLog(@" Person分配了: %zd",malloc_size((__bridge const void *)stu));  // 32

    }
    return 0;
}
```

### OC 对象的分类

- `instance`「实例对象」 对象就是通过类 alloc 出来的对象，每次调用 alloc 都会产生新的 instance 对象
  -  instance 对象在内存中存储的信息包括：
       - isa 指针
       - 其他成员变量
- class 「类对象」

```objc
int main(int argc, const char * argv[]) {
    @autoreleasepool {
        
        NSObject *obj1 = [[NSObject alloc] init];
        NSObject *obj2 = [[NSObject alloc] init];
        
        //获取类对象
        Class objcClass1 = [obj1 class];
        Class objcClass2 = [obj2 class];
        Class objcClass3 = object_getClass(obj1);
        Class objcClass4 = object_getClass(obj2);
        Class objcClass5 = [NSObject class];
        
        NSLog(@"%p %p %p %p %p",
              objcClass1,
              objcClass2,
              objcClass3,
              objcClass4,
              objcClass5);
        //全部输出 0x7ff844c94c88 同一个地址
        
    }
    return 0;
}
```

`objcClass1 ~ objcClass5` 都是 NSObject 的 class 对象（类对象）

它们是同一个对象。每个类在内存中有且只有一个 class 对象

class 对象内存存储的信息包括

- isa 指针
- superclass 指针
- 类的属性信息（`@property`）、类的对象方法信息（`instance method`）
- 类的协议信息（`protocol`）、类的成员变量信息（`ivar`）
- 成员变量信息

- meta-class「元类对象」

```objc
//获取元类对象
Class objectMetaClass1 = object_getClass([NSObject class]);  //Runtime API
Class objectMetaClass2 = object_getClass(objcClass2);
NSLog(@"objectMetaClass1: %p,objectMetaClass2: %p",objectMetaClass1, objectMetaClass2);
//地址是一样的
```

`objectMetaClass` 是 `NSObject的meta-class `对象（元类对象）

每个类在内存中有且只有一个 meta-class 对象

meta-class 对象和 class 对象的内存结构是一样的，但是用途不一样，在内存中存储的信息主要包括

- isa 指针
- superclass 指针
- 类的类方法信息（`class method`）

总结为如下图；

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/OC类分类01.784xe7s4evg0.webp)

-----

### 对象的 isa 指针指向哪里

```objc
Person *person = [[Person alloc] init];
//调用对象方法
[person personInstanceMethod];
//上面调用方法的本质是：objc_msgSend(person, @selector(personInstanceMethod))
//就是给实例对象 person 对象发送消息

//调用类方法
[Person personClassMethod];
//本质 objc_msgSend([Person,class], @selector(personInstanceMethod))
```

上面通过实例对象调用对象方法时，其本质是给「类对象」发送消息，因为对象方法存储在「类对象」中。如果调用「类方法」，就需要给「元类对象」发送消息，因为类方法存储在「元类对象」中。

因此就需要 isa 指针作为桥梁

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/OC类分类02.50i5c09715o0.webp)

- **instance 的isa 指向 class**
    - 当调用对象方法时，通过 instance 的 isa 找到 class，最后找到「对象方法」的实现进行调用

- **class 的 isa 指向 meta-class**
    - 当调用类方法时，通过 class 的 isa 找到 meta-class ，最后找到「类方法」的实现进行调用


### class 的 superclasss 指针

```objc
Student *student = [[Student alloc] init];
//调用 Person 的对象方法
[student personInstanceMethod];
```

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/superclass指针01.74sb4rgyjxs0.webp)

当 Student 的 instance 对象要调用 Person 的对象方法时，会先通过 isa 找到 Student 的 class，然后通过 superclass 找到 Person 的 class，最后找到对象方法的实现进行调用

### meta-class 的 superclass 指针

```objc
//调用 Person 的 类方法
[Student personClassMethod];
```

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/superclass指针02.69pgnq42tk40.webp)
 
当 Student 的 class 要调用 Person 的类方法时，会先通过 isa 找到 Student 的 meta-class ，然后通过 superclass 找到 Person 的 meta-class ，最后找到类方法的实现进行调用。

### isa、superclass总结

- instance 的 isa 指向 class

- class 的 isa 指向 meta-class

- meta-class 的 isa 指向基类的 meta-class

- class 的 superclass 指向父类的 class
  - 如果没有父类，superclass 指针为 nil

- meta-class 的 superclass 指向父类的 meta-class
  - 基类的 meta-class 的 superclass 指向基类的 class

- instance 调用对象方法的轨迹
  - isa 找到 class，方法不存在，就通过 superclass 找父类

- class 调用类方法的轨迹
  - isa 找 meta-class，方法不存在，就通过 superclass 找父类


![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/OC类分类03.5okmqa5vcj00.webp)




----

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




-----

