
- [OC 和 C++ 的区别](#oc-和-c-的区别)
- [什么是 runtime](#什么是-runtime)
- [为什么说 OC 是一门动态编程语言](#为什么说-oc-是一门动态编程语言)
- [objc在向一个对象发送消息时，发生了什么](#objc在向一个对象发送消息时发生了什么)
- [isa 指针](#isa-指针)
- [objc中向一个nil对象发送消息将会发生什么](#objc中向一个nil对象发送消息将会发生什么)
- [swift总结](#swift总结)
  - [class 和 struct 的区别](#class-和-struct-的区别)
  - [实现一个 min 函数，返回两个元素较小的元素](#实现一个-min-函数返回两个元素较小的元素)
  - [guard 使用场景](#guard-使用场景)

-----


## OC 和 C++ 的区别

- Objective-C 不支持多重承继，而 C++ 语言支持多重继承（从侧面可以说明多重继承的效率不高）；
- Objective-C 通过互相传递消息实现函数调用，而 C++ 直接进行函数调用
- Objective-C 是动态定型（dynamicaly typed)。所以它的类库比 C++ 要容易操作。Objective-C 在运行时可以允许根据字符串名字来访问方法和类，还可以动态连接和添加类。而 C++ 对象的静态类型决定你是否可以发送消息给它。


## 什么是 runtime
## 为什么说 OC 是一门动态编程语言 

OC 是一门动态性比较强的编程语言，允许很多操作推迟到程序运行时再进行

比如说 C/C++ ，编译完之后生成的二进制文件和源代码是保持是一致的。而 OC 可以在程序运行过程中去修改之前编译好的东西。

> 代码就执行流程一般都是
>
> 编写代码 --> 编译链接 --> 执行

OC 的动态性就是由 Runtime 来支撑和实现的，Runtime 是一套 C 语言的 API，封装了很多动态性相关的函数

平时编写的OC代码，底层都是转换成了Runtime API进行调用

也就是说 Objective-C 的动态性是由 `Runtime` API来支撑的.

## objc在向一个对象发送消息时，发生了什么

objc在向一个对象发送消息时，runtime 会根据对象的 isa 指针找到该对象实际所属的类，然后在该类中的方法列表以及其父类方法列表中寻找方法运行，如果一直到根类还没找到，转向拦截调用，走消息转发机制，一旦找到 ，就去执行它的实现 IMP 。

## isa 指针

『以前」实例对象的 isa 指向 类对象，类对象的 isa 指向 源类对象

- instance 的 isa 指向 class
  - 当调用对象方法时，通过instance的isa找到class，最后找到对象方法的实现进行调用

- class 的 isa 指向 meta-class
  - 当调用类方法时，通过 class 的 isa 找到 meta-class ，最后找到类方法的实现进行调用

但是从 ARM64 开，例对象的 isa 不是直接指向 类对象，类对象的 isa 不是直接指向 源类对象，而是需要 &ISA_MASK  的值，才能得到类对象的地址值。

> 从arm64架构开始，对isa进行了优化，变成了一个共用体（union）结构，还使用位域来存储更多的信息

## objc中向一个nil对象发送消息将会发生什么

如果向一个nil对象发送消息，首先在寻找对象的isa指针时就是0地址返回了，所以不会出现任何错误。也不会崩溃。

详解：

如果一个方法返回值是一个对象，那么发送给nil的消息将返回0(nil)；

如果方法返回值为指针类型，其指针大小为小于或者等于sizeof(void*) ，float，double，long double 或者long long的整型标量，发送给nil的消息将返回0；

如果方法返回值为结构体,发送给nil的消息将返回0。结构体中各个字段的值将都是0；

如果方法的返回值不是上述提到的几种情况，那么发送给nil的消息的返回值将是未定义的



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