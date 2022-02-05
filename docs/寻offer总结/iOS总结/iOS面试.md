
- [OC 和 C++ 的区别](#oc-和-c-的区别)
- [为什么说 OC 是一门动态编程语言](#为什么说-oc-是一门动态编程语言)
- [runtime 实现的机制是什么](#runtime-实现的机制是什么)
- [runtime具体应用](#runtime具体应用)
- [Category 的实现原理？](#category-的实现原理)
- [isa 指针](#isa-指针)
- [Objective-C 如何实现多重继承？](#objective-c-如何实现多重继承)
- [runtime 如何实现 weak 属性](#runtime-如何实现-weak-属性)
- [讲一下 OC 的消息机制](#讲一下-oc-的消息机制)
- [objc在向一个对象发送消息时，发生了什么](#objc在向一个对象发送消息时发生了什么)
- [objc 中向一个 nil 对象发送消息将会发生什么](#objc-中向一个-nil-对象发送消息将会发生什么)
- [runtime如何通过selector找到对应的IMP地址](#runtime如何通过selector找到对应的imp地址)
- [Objective-C中调用方法的过程](#objective-c中调用方法的过程)
- [load和initialize的区别](#load和initialize的区别)
- [UI总结](#ui总结)
  - [ViewController 生命周期](#viewcontroller-生命周期)
    - [两个控制器AB进行跳转调用顺序](#两个控制器ab进行跳转调用顺序)
  - [CALayer 和 UIView](#calayer-和-uiview)
- [UIWindow是什么,有什么特点](#uiwindow是什么有什么特点)
  - [程序启动过程](#程序启动过程)
  - [UI 卡顿掉帧原因](#ui-卡顿掉帧原因)
  - [离屏渲染是什么](#离屏渲染是什么)
  - [什么时候会出现录屏渲染](#什么时候会出现录屏渲染)
- [swift总结](#swift总结)
  - [class 和 struct 的区别](#class-和-struct-的区别)
  - [实现一个 min 函数，返回两个元素较小的元素](#实现一个-min-函数返回两个元素较小的元素)
  - [guard 使用场景](#guard-使用场景)

-----


## OC 和 C++ 的区别

- Objective-C 不支持多重承继，而 C++ 语言支持多重继承（从侧面可以说明多重继承的效率不高）；
- Objective-C 通过互相传递消息实现函数调用，而 C++ 直接进行函数调用
- Objective-C 是动态定型（dynamicaly typed)。所以它的类库比 C++ 要容易操作。Objective-C 在运行时可以允许根据字符串名字来访问方法和类，还可以动态连接和添加类。而 C++ 对象的静态类型决定你是否可以发送消息给它。


## 为什么说 OC 是一门动态编程语言 

OC 是一门动态性比较强的编程语言，允许很多操作推迟到程序运行时再进行

比如说 C/C++ ，编译完之后生成的二进制文件和源代码是保持是一致的。而 OC 可以在程序运行过程中去修改之前编译好的东西。

> 代码就执行流程一般都是
>
> 编写代码 --> 编译链接 --> 执行

OC 的动态性就是由 Runtime 来支撑和实现的，Runtime 是一套 C 语言的 API，封装了很多动态性相关的函数

平时编写的OC代码，底层都是转换成了 Runtime API进行调用

也就是说 Objective-C 的动态性是由 `Runtime` API来支撑的.

## runtime 实现的机制是什么

runtime 是一套比较底层的纯C语言API, 属于1个C语言库, 包含了很多底层的C语言API。

平时编写的OC代码，底层都是转换成了Runtime API进行调用

比如说，下面一个创建对象的方法中，

举例:

```objc
//OC代码
[[Person alloc] init]
//转成 runtime 
objc_msgSend(objc_msgSend(Person , “alloc”), “init”)
```

## runtime具体应用

- 利用关联对象（AssociatedObject）给分类添加属性

- 遍历类的所有成员变量（修改textfield的占位文字颜色、字典转模型、自动归档解档）

- 交换方法实现（交换系统的方法）

- 利用消息转发机制解决方法找不到的异常问题

- KVC 字典转模型

## Category 的实现原理？

- Category 实际上是 Category_t的结构体，在运行时，新添加的方法，都被以倒序插入到原有方法列表的最前面，所以不同的Category，添加了同一个方法，执行的实际上是最后一个。

- Category 在刚刚编译完的时候，和原来的类是分开的，只有在程序运行起来后，通过 Runtime ，Category 和原来的类才会合并到一起。



## isa 指针

「以前」实例对象的 isa 指向 类对象，类对象的 isa 指向 源类对象

- instance 的 isa 指向 class
  - 当调用对象方法时，通过instance的isa找到class，最后找到对象方法的实现进行调用

- class 的 isa 指向 meta-class
  - 当调用类方法时，通过 class 的 isa 找到 meta-class ，最后找到类方法的实现进行调用

- 元类对象的 isa 指向元类的基类

但是从 ARM64 开，例对象的 isa 不是直接指向 类对象，类对象的 isa 不是直接指向 源类对象，而是需要 &ISA_MASK  的值，才能得到类对象的地址值。

> 从arm64架构开始，对 isa 进行了优化，变成了一个共用体（union）结构，还使用位域来存储更多的信息

- isa 有两种类型

    - 纯指针，指向内存地址

    - NON_POINTER_ISA，除了内存地址，还存有一些其他信息

## Objective-C 如何实现多重继承？

Object-c的类没有多继承,只支持单继承,如果要实现多继承的话，可使用如下几种方式间接实现

- 通过组合实现

A和B组合，作为C类的组件

- 通过协议实现

C 类实现 A 和 B 类的协议方法

- 消息转发实现

forwardInvocation:方法

## runtime 如何实现 weak 属性

weak 此特质表明该属性定义了一种「非拥有关系」(nonowning relationship)。为这种属性设置新值时，设置方法既不持有新值（新指向的对象），也不释放旧值（原来指向的对象）。

runtime 对注册的类，会进行内存布局，从一个粗粒度的概念上来讲，这时候会有一个 hash 表，这是一个全局表，表中是用 weak 指向的对象内存地址作为 key，用所有指向该对象的 weak 指针表作为 value。当此对象的引用计数为 0 的时候会 dealloc，假如该对象内存地址是 a，那么就会以 a 为 key，在这个 weak 表中搜索，找到所有以 a 为键的 weak 对象，从而设置为 nil。

**runtime 如何实现 weak 属性具体流程大致分为 3 步**：

- 1、初始化时：runtime 会调用 objc_initWeak 函数，初始化一个新的 weak 指针指向对象的地址。

- 2、添加引用时：objc_initWeak 函数会调用 objc_storeWeak() 函数，objc_storeWeak() 的作用是更新指针指向（指针可能原来指向着其他对象，这时候需要将该 weak 指针与旧对象解除绑定，会调用到 weak_unregister_no_lock），如果指针指向的新对象非空，则创建对应的弱引用表，将 weak 指针与新对象进行绑定，会调用到 weak_register_no_lock。在这个过程中，为了防止多线程中竞争冲突，会有一些锁的操作。

- 3、释放时：调用 clearDeallocating 函数，clearDeallocating 函数首先根据对象地址获取所有 weak 指针地址的数组，然后遍历这个数组把其中的数据设为 nil，最后把这个 entry 从 weak 表中删除，最后清理对象的记录。

## 讲一下 OC 的消息机制

- OC中的方法调用其实都是转成了objc_msgSend函数的调用，给receiver（方法调用者）发送了一条消息（selector方法名）

- objc_msgSend 底层有3大阶段，消息发送（当前类、父类中查找）、动态方法解析、消息转发

## objc在向一个对象发送消息时，发生了什么

objc在向一个对象发送消息时，runtime 会根据对象的 isa 指针找到该对象实际所属的类，然后在该类中的方法列表以及其父类方法列表中寻找方法运行，如果一直到根类还没找到，转向拦截调用，走消息转发机制，一旦找到 ，就去执行它的实现 IMP 。

## objc 中向一个 nil 对象发送消息将会发生什么

如果向一个nil对象发送消息，首先在寻找对象的isa指针时就是0地址返回了，所以不会出现任何错误。也不会崩溃。

详解：

如果一个方法返回值是一个对象，那么发送给nil的消息将返回0(nil)；

如果方法返回值为指针类型，其指针大小为小于或者等于sizeof(void*) ，float，double，long double 或者long long的整型标量，发送给nil的消息将返回0；

如果方法返回值为结构体,发送给nil的消息将返回0。结构体中各个字段的值将都是0；

如果方法的返回值不是上述提到的几种情况，那么发送给nil的消息的返回值将是未定义的

## runtime如何通过selector找到对应的IMP地址

> 每一个类对象中都一个对象方法列表（对象方法缓存）

- 类方法列表是存放在类对象中isa指针指向的元类对象中（类方法缓存）。

- 方法列表中每个方法结构体中记录着方法的名称,方法实现,以及参数类型，其实selector本质就是方法名称,通过这个方法名称就可以在方法列表中找到对应的方法实现。

- 当我们发送一个消息给一个NSObject对象时，这条消息会在对象的类对象方法列表里查找。

- 当我们发送一个消息给一个类时，这条消息会在类的Meta Class对象的方法列表里查找。

## Objective-C中调用方法的过程

Objective-C是动态语言，每个方法在运行时会被动态转为消息发送，即：objc_msgSend(receiver, selector)，整个过程介绍如下：

objc在向一个对象发送消息时，runtime库会根据对象的isa指针找到该对象实际所属的类

然后在该类中的方法列表以及其父类方法列表中寻找方法运行

如果，在最顶层的父类（一般也就NSObject）中依然找不到相应的方法时，程序在运行时会挂掉并抛出异常unrecognized selector sent to XXX

但是在这之前，objc的运行时会给出三次拯救程序崩溃的机会，这三次拯救程序奔溃的说明见问题《什么时候会报unrecognized selector的异常》中的说明


## load和initialize的区别

两者都会自动调用父类的，不需要 super 操作，且仅会调用一次（不包括外部显示调用).

- load 和 initialize方法都会在实例化对象之前调用，以main函数为分水岭，前者在main函数之前调用，后者在之后调用。这两个方法会被自动调用，不能手动调用它们。

- load 和 initialize方法都不用显示的调用父类的方法而是自动调用，即使子类没有initialize方法也会调用父类的方法，而load方法则不会调用父类。

- load 方法通常用来进行Method Swizzle，initialize方法一般用于初始化全局变量或静态变量。

- load 和 initialize 方法内部使用了锁，因此它们是线程安全的。实现时要尽可能保持简单，避免阻塞线程，不要再使用锁。

---

## UI总结


### ViewController 生命周期

```objc
- initWithCoder:(NSCoder *)aDecoder：//（如果使用storyboard或者xib）
- loadView：              // 加载视图 view
- viewDidLoad：           // 视图控制器中的视图加载完成，就是 viewController 自带的 view 加载完成
- viewWillAppear：        // 控制器的view将要显示
- viewWillLayoutSubviews：// view 即将布局它的 Subviews（子控件）
- viewDidLayoutSubviews： // view 的 Subviews 布局完成  
- viewDidAppear:         // 控制器的 view 完全显示
- viewWillDisappear：    // 控制器的 view 即将消失的时候
- viewDidDisappear：     // 控制器的 view 完全消失的时候
- dealloc                //控制器视图销毁
```

#### 两个控制器AB进行跳转调用顺序

- A控制器先展示调用

```objc
 - [ViewControllerA loadView]
 - [ViewControllerA viewWillAppear:]
 - [ViewControllerA viewWillLayoutSubviews]
 - [ViewControllerA viewDidLayoutSubviews]
 - [ViewControllerA viewDidAppear:]
```

- B控制器跳转调用顺序

```objc
 - [ViewControllerB loadView]
 - [ViewControllerB viewDidLoad]
 - [ViewControllerA viewWillDisappear:]
 - [ViewControllerB viewWillAppear:]
 - [ViewControllerB viewWillLayoutSubviews]
 - [ViewControllerB viewDidLayoutSubviews]
 - [ViewControllerA viewDidDisappear:]
 - [ViewControllerB viewDidAppear:]
```

- B控制器返回A顺序

```objc
 - [ViewControllerB viewWillDisappear:]
 - [ViewControllerA viewWillAppear:]
 - [ViewControllerB viewDidDisappear:]
 - [ViewControllerA viewDidAppear:]
```

### CALayer 和 UIView

- UIView 和 CALayer 都是 UI 操作的对象

- UIView 是 CALayer 用于交互的对象, UIView 是 CALayer 的delegate ,
  
- UIView 是 UIResponder 的子类,其中提供了很多 CALayer 所没有的交互接口,主要负责处理用户触发的各种操作;

- CALayer 主要负责绘制,在图像和动画上渲染性能更好

## UIWindow是什么,有什么特点

UIWindow 继承自 UIView, 作为根视图来装置 View 元素, UIWindow 提供一个区域用于显示 UIView,并且将事件分发给 UIView,一般一个应用只有一个 UIWindow;

一般情况下，应用程序只有一个 UIWindow  对象，即使有多个UIWindow 对象，也只有一个 UIWindow 可以接受到用户的触屏事件

### 程序启动过程

**main 函数执行前**:

- 首先当程序启动时，系统会读取程序的可执行文件（mach-o）, 从里面获取动态加载器(dylb)的路径;

- 加载dylb, dylb会初始化运行环境，配合ImageLoader将二进制文件加载到内存中去;

- 动态链接依赖库, 初始化依赖库，初始化 runtime;

- runtime 会对项目中的所有类进行类结构初始化，调用所有的 load 方法;

- 最后 dylb 会返回 main 函数地址，main 函数被调用，进入程序入口

**main 函数执行后**:

- 内部会调用 UIApplicationMain 函数，创建一个UIApplication对象和它的代理，就是我们项目中的 Appdelegate 类

- 开启一个事件循环(main runloop), 监听系统事件

- 程序启动完毕时，通知代理Appdelegate, 调用 didFinishLaunching 代理方法，在这里会创建 UIWindow,设置它的rootViewController,

- 最后调用 self.window makeKeyAndVisable显示窗口

### UI 卡顿掉帧原因

iOS 设备的硬件时钟会发出 Vsync(垂直同步信号)，然后 App 的 CPU 会去计算屏幕要显示的内容，之后将 计算好的内容提交到 GPU 去渲染。随后，GPU 将渲染结果提交到帧缓冲区，等到下一个 VSync 到来时将缓 冲区的帧显示到屏幕上。也就是说，一帧的显示是由 CPU 和 GPU 共同决定的。 

一般来说，页面滑动流畅是60fps，也就是1s有60帧更新，即每隔16.7ms就要产生一帧画面，而如果CPU 和 GPU 加起来的处理时间超过了 16.7ms，就会造成掉帧甚至卡顿。

### 离屏渲染是什么

指的是 GPU （图形处理器）在当前屏幕缓冲区以外新开辟一个缓冲区进行渲染操作。

因为离屏渲染有创建缓冲区和上下文切换。创建新的缓冲区代价都不算大，付出最大代价的是上下文切换。所以离屏渲染非常耗时。所以要尽量避免的则是 GPU 离屏渲染。

- **GPU屏幕渲染有两种方式**:

  - On-Screen Rendering (当前屏幕渲染) 指的是GPU的渲染操作是在当前用于显示的屏幕缓冲区进行。

  - Off-Screen Rendering (离屏渲染) 指的是在GPU在当前屏幕缓冲区以外开辟一个缓冲区进行渲染操作。

### 什么时候会出现录屏渲染

> 圆角(当和 maskToBounds 一起使用时)、或者是图层蒙版、阴影的时候都会可能出现

- 为图层设置遮罩（layer.mask）
- 将图层的 `layer.masksToBounds / view.clipsToBounds` 属性设置为 true
- 将图层 `layer.allowsGroupOpacity` 属性设置为 YES 和 `layer.opacity` 小于 1.0
- 为图层设置阴影（`layer.shadow *`）。
- 为图层设置 `layer.shouldRasterize=true`
- 具有 `layer.cornerRadius，layer.edgeAntialiasingMask，layer.allowsEdgeAntialiasing的` 图层
- 文本（任何种类，包括 UILabel，CATextLayer，Core Text 等）。




[参考](https://juejin.cn/post/6991403913991684109#heading-1)

----

## swift总结


[参考](https://www.jianshu.com/p/f7dd76ea5be5)

[参考](https://www.jianshu.com/p/cc4a737ddc1d)

### class 和 struct 的区别

- class 为类, struct 为结构体, 类是「引用类型」, 结构体为「值类型」, 结构体不可以继承

- 其中值类型的变量包含它们的数据，而引用类型的变量存储对他们的数据引用


- struct 定义结构体类型时其成员可以**没有初始值**，如果使用这种格式定义一个类，编译器是会报错的，他会提醒你这个类没有被初始化。

```swift
struct SRectangle {
    var width = 200
    var height: Int
}

class CRectangle {
    var width = 200
    var height: Int // 报错
}
```

- 所有的 struct 都有一个自动生成的成员构造器，而 class 需要自己生成。

```swift
//struct
var sRect = SRectangle(width: 300)
sRect.width // 结果是300

//class
var cRect = CRectangle()
// 不能直接用CRectangle(width: 300)，需要构造方法
cRect.width // 结果是200
```

- 引用类型对一个变量操作可能影响另一个变量所引用的对象。对于值类型都有他们自己的数据副本，因此对一个变量操作不可能影响另一个变量。

```swift
//struct
var sRect2 = sRect
sRect2.width = 500
sRect.width // 结果是300

//class
var cRect2 = cRect
cRect2.width = 500
cRect.width // 结果是500
```

- struct 的方法要去修改 属性 的值，要加上mutating，class则不需要。

```swift
//struct
struct SRectangle {
    var width = 200
    //需要添加 mutating
    mutating func changeWidth(width: Int) {
        self.width = width
    }
}

//class
class CRectangle {
    var width = 200
    func changeWidth(width: Int) {
        self.width = width
    }
}
```

### 实现一个 min 函数，返回两个元素较小的元素

```swift
func myMin<T: Comparable>(_ a: T, _ b: T) -> T {
    return a < b ? a : b
}

print(myMin(1.2, 2.1))
```

### guard 使用场景

guard 和 if 类似，不同的是，guard 总是有一个 else 语句，如果表达式是假或者值绑定失败的时候，会执行 else 语句，且在 else 语句中一定要停止函数调用.

```swift
guard 1 + 1 == 2 else {
    //为真 不会执行
    fatalError("something wrong")
}

guard 1 + 1 == 3 else {
    //为假 会执行
    fatalError("something wrong")  //main.swift:548: Fatal error: something wrong
}
```

比如说，用户登录的时候, 验证用户是否有输入用户名密码等

```swift
guard let userName = self.userNameTextField.text,
  let password = self.passwordTextField.text else {
    //如果输入的用户名和密码不对就直接 return
    return
}
```

[参考](https://www.jianshu.com/p/23d99f434281)