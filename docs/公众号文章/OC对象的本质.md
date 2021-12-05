> 最近开始接触并学习了 iOS 开发相关技能，比如 OC，swift，今天来总结一下 OC 的对象

了解 OC 开发的同学都知道，OC 中创建对象的方式为：`NSObject *obj = [[NSObject alloc] init];`

## NSObject 对象的内存布局

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

但是我们使用 malloc_size 函数查看时 16

```objectivec
// 获得obj指针所指向内存的大小 >> 16
NSLog(@"%zd", malloc_size((__bridge const void *)obj));  //使用桥接转成 C语言指针类型
```

我们通过查看源码中 class_getInstanceSize 和 malloc_size 的具体实现克可知，这个函数返回的是实例对象的成员变量所占用的实际大小，也就是 8，但是系统给这个对象分配的空间是 16 个字节，因为源码中：`if (size < 16) size = 16;`

- class_getInstanceSize

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/OC对象本质01.46ffriru73w0.png)

- malloc_size

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/OC对象本质03.1ab0f73zb7nk.png)

因此可以得知 NSObject 对象的内存分布图如下：

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/OC对象本质02.1ecfy7fsvig0.png)


> 因此可以回答一开始的问题，一个 NSObject 对象占用多少内存      
> 系统分配了 16 个字节给 NSObject 对象，通过 malloc_size 函数查看，但是 NSObject 对象内部只使用了 8 个字节（前提是在 64 位系统环境下）可以通过 class_getInstanceSize 函数查看。










