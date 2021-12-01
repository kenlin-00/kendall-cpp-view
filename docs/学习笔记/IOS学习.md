
- [OC部分](#oc部分)
  - [NSLog 和printf区别](#nslog-和printf区别)
  - [一个 NSObject 对象占用多少内存](#一个-nsobject-对象占用多少内存)
- [Swift 和 OC 的区别](#swift-和-oc-的区别)
- [swift 编译过程](#swift-编译过程)
- [Optional](#optional)
- [String 和 SubString](#string-和-substring)
- [guard](#guard)
- [闭包](#闭包)
- [项目实战](#项目实战)
  - [项目配置](#项目配置)

------

## OC部分

### NSLog 和printf区别

NSLog是Foundation框架􏰀供的 Objective-C 日志输出函数,与标准C中的printf函数类似,并可以格式化输出。

- NSLog传递进去的格式化字符是NSString的对象,而不是char *这种字符串指针
- NSLog输出的内容中会自动包含一些系统信息
- NSLog输出的内容会自动换行
- NSLog声明在NSObjCRuntime.h中

声明：void NSLog(NSString *format, ...);

### 一个 NSObject 对象占用多少内存





-----

## Swift 和 OC 的区别

- 编程范式
  - Swift 可以面向协议编程、函数式编程、面向对象编程
  - Objective-C 以面向对象编程为主，当然你可以引入类似 ReactiveCocoa 的类库 来进行函数式编程。但是这不是语言本身的特性，而是引入第三方类库实现的

- 类型安全
  - Swift 是一门类型安全的语言。鼓励程序员在代码中清楚明确值的类型。如果代码中使用一个字符串 String，那么你不能错误地传递一个整型 Int 给它。因为 Swift 是类型安全的，它会在代码编译的时候做类型检查，并且把所有不匹配的类型作为一个错误标记出来。这样使得程序员在开发中尽可能早地发现和修正错误。
  - 而 Objective-C 则不然，你声明一个 NSString 变量，仍然可以传一个 NSNumber 给它，尽管编译器会抱怨，但是你仍然可以作为 NSNumber 来使用它

- 值类型的增强
  - 在 Swift 中，典型的有 struct、enum 以及 tuple 都是值类型。而平时使用的 Int、 Double、Float、String、Array、Dictionary、Set 其实都是用结构体实现的，也是值类型。
  - Objective-C中，NSNumber、NSString 以及 集合类对象 都是指针类型。

- 枚举增强
  - Swift 的枚举可以使用整型、浮点型、字符串等，还能拥有属性和方法，甚至支持 泛型、协议、扩展等等。
  - Objective-C 里面的枚举则简单很多，它只是个标记值而已

- 泛型
  - Swift 中支持泛型，也支持泛型的类型约束等特性。泛型可以使我们更加好的去面向对象编程
  - 苹果推出了 Swift 2.0 版本，为了让开发者从 Objective-C 更好地过渡到 Swift 上， 苹果也为 Objective-C 带来了 Generics 泛型支持，不过 Objective-C 的泛型约束也 仅停留在编译器警告阶段。

- 协议和扩展
  - Swift 对协议的支持更加丰富，配合扩展(extension)、泛型、关联类型等可以实现面 向协议编程，从而大大提高代码的灵活性。同时，Swift 中的 protocol 还可以用于值类 型，如结构体和枚举
  - Objective-C 的协议缺乏强约束，提供的 optional『可选的』 特性往往成为很多问题的来源，而如 果放弃 optional 又会让实现代价过大。

- 函数和闭包
  - Swift 函数是一等公民，可以直接定义函数类型变量，可以作为其他函数参数传递， 可以作为函数返回值返回。
  - Objective-C 里面函数仍然是次等公民，需要 selector 封装或者使用block才能模拟 Swift 中类似的效果。

 ## swift 编译过程

 > 查资料

```
//编译执行
 swiftc -o main.out main.swift 
//生成抽象语法树
swiftc main.swift -dump-ast

//生成中间语言
swiftc main.swift -emit-sil

//得到中间层表示
swiftc main.swift -emit-ir 

```

## Optional

## String 和 SubString

## guard

## 闭包

> 自动闭包和逃避闭包，用的不多

 



---

## 项目实战

### 项目配置

- 进入工程目录 
- 创建一个 Profile 文件
  
```
 %  cat Podfile 
platform :ios, "9.0"
use_frameworks!

target "geekTime" do

  pod "Kingfisher"
  pod "SnapKit"
  pod "R.swift"

end
```

- 开始下载第三方依赖库

pod install 

- 安装完成之后文件夹下会出现一个 `.xcworkspace` 文件

- 关闭之前的项目打开这个 `.xcworkspace` 文件

- 添加脚本

```
# Shell
"$PODS_ROOT/R.swift/rswift" generate "$SRCROOT/R.generated.swift"

# input Files
$TEMP_DIR/rswift-lastrun

# output Files
$SRCROOT/R.generated.swift
```


