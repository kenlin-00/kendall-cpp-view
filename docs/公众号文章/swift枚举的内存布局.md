
> 这段时间接触并学习了 iOS 开发，感觉写 APP 还是挺有意思的，之前接触并学习了 OC，也学习了 OC 的内存分布，还没总结完，总结完了将会分享出来。
> 
> 因为前两周面试了 **阿里lazada**，得知我面试的部门主要是用 swift 开发，一开始知道我以为就两轮技术面，知道二面通过后，贼激动，二话不说赶紧肝起了 swift，没想到还有第三轮，[此处好多个捂脸]。

> 刚好今天学习并分析了 swift 的枚举的内存分布，总结一下吧。主要通过几段示例代码来窥探 swift 枚举的内存布局。


## 第一段

先来看看下面第一段示例代码

```swift
enum EnumTest {
    case test1,test2,test3
}
var t = EnumTest.test1   

t = .test2
t = .test3
```

> 那么上述代码中的 t 占用多少内存呢？

我们可以通过下面代码来查看枚举的内存大小，具体看下面代码

```swift
//实际用了多少
print(MemoryLayout<EnumTest>.size)   // 1
//分配了多少内存
print(MemoryLayout<EnumTest>.stride)  //1
//对齐的内存
print(MemoryLayout<EnumTest>.alignment) // 1
```

下面通过断点调试来查看变量 t 的内存分布图，看看这 1 个字节到底存储的是什么？具体步骤如下图，首先在 `t = .test2` 处添加一个断点,当代码执行完 `var t = EnumTest.test1 ` 时，第一个字节存储的是 `00`

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/枚举内存分布01.5jc9pinzlww0.png)

内存分布图如下

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/枚举内存分布02.2gj73y02b7rw.png)

当执行到 `t = .test2` 时，内存分布图如下，发现这时候开始的 1 个字节存储的是 `01`

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/枚举内存分布03.h1cjjsue14o.png)

当执行到 `t = .test3` 时，内存分布图如下，发现这时候开始的 1 个字节存储的是 `02`

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/枚举内存分布04.3f3omifpcug0.png)

由于枚举是占用 1 个字节，因此从上图可以发现，一开始 `t = .test1` 时 存储的是 0，`t = .test2` 时存储 1，`t = .test3` 时存储 2。也就是说，枚举中采取一个字节存储每个 case 的标识 ，分别是 `0,1,2,3,4, ...... , 256 `。

## 第二段

接着看第二段示例代码，如果给枚举设置原始值呢？

```swift
//设置原始值
enum EnumTest: Int {
    case test1 = 10,test2 = 20,test3 = 30
}
var t = EnumTest.test1   

t = .test2
t = .test3
```

我们知道在 64 位操作系统中，Int 类型占 8 个字节，那么这里的 t 是不是占用 8 个字节呢？其实并不是，通过下面代码打印发现依然是 1 个字节

```swift
//实际用了多少
print(MemoryLayout<EnumTest>.size)   // 1
//分配了多少内存
print(MemoryLayout<EnumTest>.stride)  //1
//对齐的内存
print(MemoryLayout<EnumTest>.alignment) // 1
```

其实在 swift 的枚举中设置原始值，并不代表这个值就存储在枚举中，只能说这个值和枚举的 case 是关联的，比如上述代码的 test1 和 1 是关联的，我们也可以通过下面代码拿到对应 case 的值

```swift
print(EnumTest.test1.rawValue)  // 10
print(EnumTest.test2.rawValue)  // 20
print(EnumTest.test3.rawValue)  // 30
```

## 第三段

```swift
enum TestEnum {
    case test1(Int,Int,Int)
    case test2(Int,Int)
    case test3(Int)
    case test4(Bool)
    case Test5
}

var t = TestEnum.test1(1, 2, 3)
t = .test2(4, 5)
t = .test3(6)
t = .test4(true)
t = .Test5
```

我们先来看看此时 t 占用多少内存

```swift
//实际用了多少
print(MemoryLayout<TestEnum>.size)   // 25
//分配了多少内存
print(MemoryLayout<TestEnum>.stride)  //32
//对齐的内存
print(MemoryLayout<TestEnum>.alignment) //8   
```

可以发现这时候系统给枚举分配了 32 个字节，但是占用了 25 个字节，如果说按照「字节对齐」来算，test1 三个 Int ，应该为 24 个字节才对，为何未 25 呢？？？

同样我们通过上述方法查看 t 的内存分布。

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/枚举内存分布05.2og1xsj118y0.png)

从上图可以看出，这时候 t 占 32 个字节，其中第一个 8 字节存放 01，第二个 8 字节存放 02 第三个 8 字节存放 03，第四个 8 字节存放 0（因为是 case 1，所以是 0）

最后需要记录是第几个 case，因此很容易知道当代码执行到 `t = .test2(4,5)` 时，内存分布为，第一个 8 字节存 4 ，第二个 8 字节存 5，第三个 8 字节存 0「因为内存对齐」，第四个 8 字节存 1「因为是第二个 case」。后面以此类推，其中 true 存储的是 1；当执行到 `t = .Test5` 时，前三个 8 字节存的是 0，第四个 8 字节存的 4。

因此可知，**在枚举的内存中，有 1 个字节存储成员值，N 个字节存储关联词，其中 N 为占用内存最大的关联值。上述代码的 N = 24「24+1(case标识) = 25」**

那么如果是只有一个 case 呢？这时候就不需要 1 个字节来记录属于哪个 case，因此占用的内存就是 1，比如下面代码枚举占用的内存就是 0

```swift
enum TestEnum {
    case test1
}
var t = TestEnum.test1  // t不占用内存

//实际用了多少
print(MemoryLayout<TestEnum>.size)   // 0
//分配了多少内存
print(MemoryLayout<TestEnum>.stride)  //1
//对齐的内存
print(MemoryLayout<TestEnum>.alignment) //1 
```

> 以上就是 swift 中的枚举的内存布局啦       
> **想知道的越多，不懂的就越多**，
