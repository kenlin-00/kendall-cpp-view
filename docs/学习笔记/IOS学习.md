
- [OC部分](#oc部分)
  - [NSLog 和printf区别](#nslog-和printf区别)
  - [一个 NSObject 对象占用多少内存](#一个-nsobject-对象占用多少内存)
- [Swift](#swift)

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

## Swift

- 常量的值不要求在编译时期确定，但是在使用之前需要赋初始值
- 常量在初始化之前是不能使用的

- swift 和 oc 的区别
- 编译过程


- 泛型

给泛型类型添加约束

```swift
//在一个数组里面查找一个值
//会报错，所以要加约束 Equatable
func findIndex<T: Equatable> (of valueFind: T,in array:[T]) -> Int? {
    for (index,value) in array.enumerated() {
        if value == valueFind {
            return index
        }
    }
    return nil
}

let names = ["zhangsan","lisi","wangwu"]
print(findIndex(of: "lisi", in: names))
```

- 关联类型 Container



 


