

------

## 闭包的本质

一个函数和它所捕获的常量\变量环境组合起来，成为「闭包」。
- 一般指定义在函数内部的函数
- 一般它捕获的是外层函数的 局部变量\常量

> 如果使用到局部变量，那么在 return 内部函数的时候会分开辟一个 堆内存 ，然后将栈空间的变量拷贝到堆内存中。

```swift
typealias Fn = (Int) -> Int

func getFn() -> Fn {
    var num = 0
    func plus(_ i: Int) -> Int {
        num += i
        return num
    }
    return plus
}
 
var fn1 = getFn()
print(fn1(1))  //1
print(fn1(3))  //4

var fn2 = getFn()
print(fn2(2)) // 2
print(fn2(4)) // 6 
```

上面代码在 `return plus` 的时候分配 「堆内存」，所以 `print(fn1(1)) `  返回 1， `print(fn1(2)) `  返回 4.

但是如果 num 是一个全局变量（不在 getFn）函数中，那么就不会分配「堆内存」了。


----

## 属性

### 存储属性

类似成员变量，存储在实例的内存中，结构体和类都可以计算存储属性，但是枚举不能定义存储属性。（因为枚举的内存是用来存储 case 关联值得）

> 创建「类」或者「结构体」示例对象时，必须要为所有的存储属性赋初始值。
> - 可以在初始化器里面赋初始值
> - 可以在创建示例的时候赋初始值 

```swift 
struct Point {
    var x: Int
    var y: Int
    //初始化器
    init() {
        x = 10
        y = 10
    }

        
    //下面这种方法本质也是调用init()初始化器进行初始化
//   var x: Int = 10
//   var y: Int = 10
}
var p = Point()  //默认调用init()
```

### 计算属性

本质是方法（函数），不占用示例内存，枚举、结构体、类都可以定义计算属性。

> 枚举中的 rawValue 本质就是「只读」的计算属性

```swift
enum TestNum: Int {
    case num1 = 10,num2 ,num3
}

var n1 = TestNum.num1
print(n1.rawValue)  // 10
var n2 = TestNum.num2
print(n2.rawValue)  // 11
```

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/枚举的rawValue.4rxgomkh0fm0.png)


我们通过上图查看汇编也可以知道 rawValue 其实就是调用了 getter 方法。因此可以确定 rawValue 本质就是「计算属性」，其大致实现如下：

```swift
enum TestNum: Int {
    case num1 = 10,num2 ,num3
    
    //计算属性
    var rawValue: Int {
        switch self {
            case .num1:
                return 11
            case .num2:
                return 22
            case .num3:
                return 33
        }
    }
}

var n1 = TestNum.num1
print(n1.rawValue)  // 11
var n2 = TestNum.num2
print(n2.rawValue)  // 22 
```
 
### 延迟存储属性

使用 lazy 来修饰，**必须使用 var**，不能使用 let。**在第一次使用的时候才会被初始化**

> 因为 let 必须在实例的初始化方法完成之前就拥有值        
> 如果多个线程同时第一次访问 lazy 属性 无法保证属性只被初始化 1 次      


```swift
class Car {
    init() {
        print("Car init!")
    }
    func run() {
        print("Car is running!")
} }
class Person {
    //延迟属性
    lazy var car = Car()
    init() {
        print("Person init!")
    }
    func goOut() {
        car.run()
} }
```

调用打印

```swift
let p = Person()
print("--------")
p.goOut()

//输出
Person init!
--------
Car init!
Car is running!
```

> 如果某个属性一开始用不到，且初始化比较费劲的时候一般都是要「延迟属性」，比如下面代码,初始化需要发送网络请求。

```swift
 class PhotoView {
    lazy var image: Image = {
        let url = "https://www.520it.com/xx.png" 
        let data = Data(url: url)
        return Image(data: data)
    }() }
```

当结构体包含一个延迟存储属性时，只有 var 才能访问延迟存储属性，因为延迟属性初始化时需要改变结构体的内存

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/lazy属性01.1q6asnhktkm8.png)

### 属性观察器

可以为非lazy的var存储属性设置属性观察器

```swift
  struct Circle {
      //这是存储属性，不是计算属性，因为里面不是 set 和 get 方法
    var radius: Double {
    //即将设置
    willSet {
            print("willSet", newValue)
    } 
    //已经设置
    didSet {
                print("didSet", oldValue, radius)
            }
    } 
    init() {
            self.radius = 1.0
            print("Circle init!")
    }
}
```

如果外部改变 radius ，就会先触发 willSet，再触发 didSet。

```swift
// Circle init!
var circle = Circle()

// willSet 10.5
// didSet 1.0 10.5
circle.radius = 10.5

// 10.5
print(circle.radius)
```

`willSet` 会传递新值，默认叫 `newValue`

`didSet` 会传递旧值，默认叫 `oldValue`

在初始化器中「`init`」设置属性值不会触发 willSet 和 didSet 

在属性定义时设置初始值也不会触发 willSet 和 didSet

## inout

swift 需要对参数进行修改，需要用到 inout 关键字,调用函数时加 `&`，相当于把变量的**地址值**传进去。

> inout 本质就是引用传递「地址传递」

```swift
func swapFunc(_ num1 : inout Int,_ num2: inout Int) {
    var temp: Int;
    temp = num1;
    num1 = num2;
    num2 = temp;
}

var n1: Int = 10
var n2: Int = 20

print("n1 = \(n1),n2 = \(n2)")
swapFunc(&n1, &n2)
print("n1 = \(n1),n2 = \(n2)")

//输出结果：
n1 = 10,n2 = 20
n1 = 20,n2 = 10
```

> 那如果 inout 传递的是 计算属性呢 ？

```swift
struct Shape {
    var width: Int
    //存储属性
    var side: Int {
        willSet {
            print("willSettSide ",newValue)
        }
        didSet {  //默认又个 oldValue
            print("didSetSide ",oldValue,side)
        }
    }
    //计算属性
    var girth: Int {
        set {
            width = newValue / side
            print("setGirth, newValue = \(newValue)")
        }
        get {
            print("getGirth")
            return width * side
        }
    }
    func show() {
        print("width = \(width),side= \(side),girth= \(girth)")
    }
}

func test(_ num: inout Int) {
    print("test")
    num = 20
}

var shape = Shape(width: 10, side: 4)

//test(&shape.width)  //还是直接将 shape.width 的地址值传进去

test(&shape.girth)  //这是计算属性，依然修改成功
//shape.show()

// 输出：

getGirth
test
setGirth, newValue = 20
```

因为计算属性不是存储在结构体的内存中的，所以不可能直接传递结构体内存地址到 test 函数中修改。

- 首先调用 get 方法
- get 方法返回值放在以临时存储空间
- 然后把这个存储空间「地址值」传入 test 函数中
- 接下来调用 set 方法，相当于把修改之后的 20 传给 newValue

> 那么如果 inout 传递的是「带有属性观察器」的存储属性呢 ？

```swift
test(&shape.side)
```


带有属性观察器的存储属性的值真正修改不是发生在 test 函数里面
- 首先拿到 side 的值，放到一个局部变量里面
- 然后把这个局部变量的地址值传递到 test 里面，通过 test 函数去修改这个局部变量地址的值
- 最后再把这个局部变量赋值给 side

因为 test 函数只是关心才进来的地址值，只负责修改，test 并不关心才进来的是存储属性还是计算属性，为了实现通用性。

### 类型属性

严格来说，属性可以分为：实例属性和类型属性

- 实例属性：只能通过实例去访问
  - 存储实例属性：存储在实例的内存中，每个实例都有 1 份
  - 计算实例属性

- 类型属性：只能通过类型去访问，用 static 修饰，类似 C++ 中的静态成员
  - 存储类型属性：整个程序运行过程中就只有 1 份内存
  - 计算类型属性

> 如果是 class，可以使用 class 定义类型属性

```swift
struct Shape {
    static var count: Int = 1
//    也可以写成 class
//    class var count: Int = 1
}
var s = Shape()
//s.count   //实例中不可以访问
Shape.count 
```




