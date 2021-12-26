

------

## 闭包的本质

一个函数和它所捕获的「常量\变量」环境组合起来，称为「闭包」。
- 一般指定义在函数内部的函数
- 一般它捕获的是外层函数的 局部变量\常量

> 如果使用到局部变量，那么在 return 内部函数的时候会分开辟一个 「堆内存」 ，然后将栈空间的变量拷贝到堆内存中。

```swift
//ypealias 是用来为已经存在的类型重新定义名字的，通过命名，可以使代码变得更加清晰
typealias Fn = (Int) -> Int

func getFn() -> Fn {
    var num = 0
    func plus(_ i: Int) -> Int {
        num += i
        return num
    }
    return plus
}
 
 //一块堆内存
var fn1 = getFn()
print(fn1(1))  //1
print(fn1(3))  //4

//另一块堆内存
var fn2 = getFn()
print(fn2(2)) // 2
print(fn2(4)) // 6 
```

上面代码在 `return plus` 的时候分配 「堆内存」，所以 `print(fn1(1)) `  返回 1， `print(fn1(2)) `  返回 4.

但是如果 num 是一个全局变量（不在 getFn）函数中，那么就不会分配「堆内存」了。


----

## 属性

### 存储属性

类似成员变量，**存储在实例的内存中**，结构体和类都可以计算存储属性，但是枚举不能定义存储属性。（因为枚举的内存是用来存储 case 关联值得）

> 创建「类」或者「结构体」实例对象时，必须要为所有的存储属性赋初始值。
> - 可以在初始化器里面赋初始值
> - 可以在创建示例的时候赋初始值 

```swift 
struct Point {
    //必须为x和y赋初始值
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

本质是方法（函数），**不占用实例内存**，枚举、结构体、类都可以定义计算属性。

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

当「结构体」包含一个延迟存储属性时，只有 var 才能访问延迟存储属性，因为延迟属性初始化时需要改变结构体的内存

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/lazy属性01.1q6asnhktkm8.png)

### 属性观察器

可以为非 lazy 的 var 存储属性设置属性观察器

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
swapFunc(&n1, &n2)  //传递地址
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
        didSet {  //默认有个 oldValue 
            print("didSetSide ",oldValue,side) //oldValue 保存的是修改之前的值
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

//test(&shape.width)  //存储属性：还是直接将 shape.width 的地址值传进去

test(&shape.girth)  //这是计算属性，依然修改成功
//shape.show()

// 输出：

getGirth
test
setGirth, newValue = 20
```

因为计算属性不是存储在结构体的内存中的，所以不可能直接传递结构体内存地址到 test 函数中修改。

- 首先调用 get 方法
- get 方法返回值放在「临时存储空间」
- 然后把这个存储空间「地址值」传入 test 函数中
- 接下来调用 set 方法，相当于把修改之后的 20 传给 newValue

> 那么如果 inout 传递的是「带有属性观察器」的存储属性呢 ？

```swift
test(&shape.side)
```

带有属性观察器的存储属性的值真正修改不是发生在 test 函数里面

- 首先拿到 side 的值，放到一个「局部变量」里面
- 然后把这个局部变量的地址值传递到 test 里面，通过 test 函数去修改这个局部变量地址的值
- 最后再把这个局部变量赋值给 side

因为 test 函数只是关心才进来的地址值，只负责修改，test 并不关心才进来的是存储属性还是计算属性，为了实现通用性。

### 类型属性

严格来说，属性可以分为：**实例属性** 和 **类型属性**

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

----

## mutating

结构体 和 枚举 是「值类型」，默认情况下，值类型的属性不能被自身的实例方法修改，类 就没有这个限制，可以直接修改。

**在 func 关键字前加 mutating 可以允许这种修改行为**

```swift
struct Point {
    var x = 0.0, y = 0.0
    //加上 mutatin 才能修改
    mutating func moveBy(dataX: Double,dataY: Double) {
        x += dataX
        y += dataY
    }
}

enum StateWitch: Int{
    case low = 1,middle = 2,high = 3
    mutating func next() {
        switch self {
            case .low:
                self = .middle
            case .middle:
                self = .high
            case .high:
                self = .low
        }
    }
}

var p = Point()
p.moveBy(dataX: 1, dataY: 2)
print("x = \(p.x),y = \(p.y)")

var low = StateWitch.low
var lowNext = low.next()
```

## 下标 subsrcipt

使用 subscript 可以给任意类型（枚举，结构体，类）增加下标功能

subscript 的语法类似实例方法，计算属性，其本质就是方法（函数）

```swift
class Point {
    var x = 0.0,y = 0.0
    subscript(index: Int) -> Double {
        set {
            if(index == 0) {
                x = newValue
            }else if index == 1 {
                y = newValue
            }
            else {
                print("error")
            }
        }
        get {
            if index == 0 {
                return x
            } else if index == 1 {
                return y
            }
            return 0
        }
    }
}
var point:Point = Point()
point[0] = 10
point[1] = 11
point[2] = 1
print(point[0])
print(point[1])

//error
//10.0
//11.0
```

> 注意：subscript 可以没有 set 方法，但是必须有 get 方法，如果只有 get 方法，可以省略 get 关键字。

此外，下标方法可以设置多个参数，也可以设置标签

```swift
class Sum {
    //类方法
    static subscript(index1 a:Int,index2 b: Int) -> Int {
        return a + b
    }
}

print(Sum[index1: 10,index2: 20])  //如果设置标签就必须加上标签

// 30
```


## 继承

在 swift 里面，值类型是不支持继承的，就是说 struct 是不支持继承的，只有 class 才支持继承。

### 重写方法和重写下标

重写必须加 override 关键字

```swift
class Animal {
    func show() {
        print("this is Animal")
    }
    subscript(index: Int) -> Int {
        print("Animal subscript")
        return index
    }
}
class Cat : Animal {
    override func show() {
        //调用父类的方法
        super.show()
        print("this is Cat")
    }
    override subscript(index: Int) -> Int {
        print("Cat subscript")
        return super[index] + 1  // 2 + 1
    }
}
var cat:Cat = Cat()
print(cat[2])

//Cat subscript
// Animal subscript
//3
```

- 被 class 修饰的「计算属性」能被子类重写
- 被 static 修饰的「计算属性」不能被子类重写

## swift的多态

多态就是父类指针指向子类对象

对于结构体来说，结构体是不能被继承的，所以在编译的时候就能知道调用的是哪个方法。

但是对于类，只有在运行的时候才能知道实际调用哪个方法

```swift
//基类
class Animal {
    func speak() {
        print("Animal speak")
    }
    func eat() {
        print("Animal eat")
    }
    func sleep() {
        print("Animal sleep")
    }
}
//子类
class Dog : Animal {
    override func speak() {
        print("Dog speak")
    }
    override func eat() {
        print("Dog eat")
    }
    //没有重写sleep 方法
    //自己的分
    func run() {
        print("Dog run")
    }
}
var animal = Animal()
animal = Dog()  //父类指针指向子类对象

animal.speak()  //Dog speak
animal.eat()    //Dog eat
animal.sleep()  //Animal sleep
//animal.run()  //error
```

对于 swift 对象，前 8 个字节存储的是「类型相关信息」，比如下图中前面存储的是 Dog 类型信息相关，后面一块区域存储的是方法的地址，比如 Dog 重写了 speak 和 eat 方法。

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/swift多态01.3w1kiuaj1zs0.png)

当调用 `anim.speak()`，首先先取出 `Dog` 对象的前 8 个字节，根据这 8 个字节指针找到指针指向的内存，找到内存地址之后加上一个固定偏移量，就会获得 `Dog.speak` 方法的内存地址，找到方法之后调用。

同理，Dog eat也是先取出前8字节，找到这8字节的内存地址，然后再加上一个固定偏移量，找到 `Dog.eat` 方法，找到方法之后调用。

> **注意**： 无论创建多少个同类型对象，对象的类型信息都指向同一块内存地址。     
> 对象类型信息保存在「**全局区**」。

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/swift多态02.4h6w6bxfu2e0.png)

## 初始化器

每个类至少有一个指定初始化器，指定初始化器是类的主要初始化器

默认初始化器总是类的「指定初始化器」

类偏向于少量指定初始化器，**一个类通常只有一个指定初始化器**


```swift
class Size {
    var width: Int
    var height: Int
    //指定初始化器(主要初始化器）
    init(width: Int,height: Int) {
        self.width = width
        self.height = height
    }
    //便捷初始化器
    convenience init(width: Int) {
        //需要调用指定初始化器
        self.init(width: width,height: 0)
    }
    convenience init(height: Int) {
        self.init(width: 0, height: height)
    }
    convenience init() {
        self.init(width: 0,height: 0)
    }
}
var s1 = Size(width: 11, height: 22)
var s2 = Size(width: 21)
var s3 = Size(height: 31)
var s4 = Size()

```

初始化器的相互调用规则：

1. 指定初始化器必须从它的直系父类调用指定初始化器
2. 便捷初始化器必须从相同的类里调用另一个初始化器，最终必须调用一个指定初始化器

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/初始化器01.23i0levp15b4.png)

这一套规则保证了使用任意初始化器，都可以完整地初始化实例。

```swift
class Person {
    var age: Int
    init(age: Int) {
        print("Person init")
        self.age = age
    }
}
class Student : Person {
    var score: Int
    init(age: Int,score: Int) {
        print("Studet init")
        self.score = score
        
//        print(super.age)
//        print(self.age
        //初始化才调用父类的初始化器，且必须得调用，也就是必须等第一阶段结束
        super.init(age: age)
        
        //只有初始化完才能进行其他的访问与修改,下面代码属于第二阶段调用
        self.age = 10
        print(super.age)
        print(self.age)
    }
    //便捷初始化器
    convenience init(score: Int) {
        print("Student convenience init")
        self.init(age: 0,score: score)
    }
}

var stu1: Student = Student(age: 11, score: 100)
print("--------")
//直接调用便捷初始化器初始化
var stu2 = Student(score: 99)
```

输出

```
Studet init
Person init
10
10
--------
Student convenience init
Studet init
Person init
10
10
```

**两段式初始化**

**第1阶段**：初始化所有存储属性

- ① 外层调用指定\便捷初始化器
- ② 分配内存给实例，但未初始化
- ③ 指定初始化器确保当前类定义的存储属性都初始化
- ④ 指定初始化器调用父类的初始化器，不断向上调用，形成初始化器链

**第2阶段**：设置新的存储属性值

- ⑤ 从顶部初始化器往下，链中的每一个指定初始化器都有机会进一步定制实例
- ⑥ 初始化器现在能够使用 self 访问、修改它的属性，调用它的实例方法等等
- ⑦ 最终，链中任何便捷初始化器都有机会定制实例以及使用 self

> 直到第1阶段结束，实例才算完全合法   

**补充**：一般我们自定义UIView都会重写它的init(frame: CGRect)方法，如下：

```swift
override init(frame: CGRect) {
    super.init(frame: frame)
    setupLayout()
}
```


> 这时候你可能会疑惑为什么这里的`super.init`在最上面？  
  
其实不管是重写初始化器还是自定义初始化器，都是定义一个初始化器，重写初始化器一般「没有」新的参数(作为属性)，所以 `super.init` 在最上面，如果是自定义一个新的初始化器，一般都有新的参数(作为属性)，所以就是上面的两段式初始化。

### 重写初始化器

如果子类写了一个匹配父类便捷初始化器的初始化器，不用加上 override 。因为父类的便捷初始化器永远不会通过子类直接调用，因此，严格来说，子类无法重写父类的便捷初始化器。

```swift
class Person {
    var age: Int
    //指定初始化器
    init(age: Int) {
        self.age = age
    }
    //便捷初始化器
    convenience init() {
        self.init(age: 0)
    }
}
class Student : Person {
    var score: Int
    //指定初始化器
    init(age: Int, score: Int) {
        self.score = score
        super.init(age: age)
    }
    //希望重写父类便捷初始化器,但是不能调用父类的便捷初始化器
    init() { //不报错
        self.score = 0
        super.init(age: 0)
    }
}
```

> - 如果子类没有自定义任何指定初始化器，它会自动继承父类所有的指定初始化器（一旦你自定义了一个指定初始化器，那么父类的指定初始化器统统不给你用了） 
>        
> - 我们一般不自定义指定初始化器，这样才能自动继承父类的指定初始化器，我们一般自定义便捷初始化器

## 反初始化器 `#deinit`

`#deinit` 叫做反初始化器，类似于 C++ 的析构函数、OC 中的 dealloc 方法.

当类的实例对象被释放内存时，就会调用实例对象的 deinit 方法

```swift
 class Person {
    deinit {
print("Person对象销毁了") }
}
```

- deinit 不接受任何参数，不能写小括号，不能自行调用 
- 父类的 deinit 能被子类继承
- 子类的 deinit 实现执行完毕后会调用父类的  deinit

## 可选链

可选链就是在变量的类型后面添加 `?`, 可能为 nil，具体看下面代码

```swift
class Car {
    var price = 0
}
class Dog {
    var weight = 0
}
class Person {
    var name: String = ""
    var dog: Dog = Dog()
    var car: Car? = Car()  //可选类型，指的是可能 nil
    func age() -> Int { 18 }
    func eat() {
        print("Person eat ...")
    }
}
//定义可选类型
var person: Person? = Person()
//var age = person.age()  //报错，因为person可能为nil
//age 类型是可选类型 var age: Int?
var age = person?.age()   //如果是nil，后面.age 就不会发生，如果不是 nil ，返回 nil, 就解包调用 age()
var name = person?.name

//强制解包
var name1 = person!.name
```

## 协议

https://blog.csdn.net/u014795020/article/details/71270576

## 错误

需要设置自定义错误协议，并且遵守这个协议

```swift
enum SomeError: Error {
    case illegalArg(String)
    case outOfBounds(Int,Int)
    case outOfMemory
}

func divide(_ num1: Int,_ num2: Int) throws -> Int {
    if num2 == 0 {
        throw SomeError.illegalArg("0不能为除数")
    }
    return num1 / num2
}

//var result = try divide(10, 2)
//print( result)

//捕捉异常
func test() {
    print(1)
    do {
        print(2)
        print(try divide(200, 0))
        //下面这些都不会执行了
        print(3)
        print(3)
        print(3)
    } catch let SomeError.illegalArg(msg) {
        print("参考异常：",msg)
    } catch let SomeError.outOfBounds(size, index) {
        print("下标越界：", "size = \(size)","index=\(index)")
    } catch SomeError.outOfMemory {
        print("内存溢出")
    } catch {
        print("其他错误")
    }
    print(4)
}
test()
```

输出

```
1
2
参考异常： 0不能为除数
4
```



## 可选项的本质

可选项的本质就是 enum 类型

 ```swift
var age: Int?

switch age {
case let v?:  //如果有值就解包给 v
    print("1",v)
case nil:   //如果没值就为 nil
    print("2")
}
 ```

 但是由于可选项是枚举，因此可以跟下面这样写

 ```swift
switch age {
case let .some(v):
    print("1",v)
case .none:
    print("2")
}
```


## 运算符重载

下面是一种比较简单的重载方式

```swift
struct Point {
    var x: Int = 0
    var y: Int = 0
    
    //重载加号,必须是 static
    static func + (p1: Point,p2: Point) -> Point {
        return Point(x: p1.x + p2.x, y: p1.y + p2.y)
    }
}

var p1 = Point(x: 1, y: 2)
var p2 = Point(x: 3, y: 4)
var p3: Point = p1 + p2
print(p3.x,p3.y)
```

## Equatable

判断两个实例是否等价，一般的做法就是遵守 Equatable 协议，并重载 `==` 运算符

与此同时，这也等价与重载了 `!=` 运算符

```swift
class Person: Equatable {
    var age: Int
    init(age: Int) {
        self.age = age
    }
    //重载 ==
    static func == (lhs: Person, rhs: Person) -> Bool {
        lhs.age == rhs.age  //如果两个 person 的 age 相等，就认为这两个 person 实例相等
    }
}

var p1 = Person(age: 10)
var p2 = Person(age: 11)
print(p1 == p2)
print(p1 != p2)  //默认也重载了 != ，但是必须遵守 Equatable 协议
```

> swift 为一下几种类型提供默认的 Equatable 实现

- 没有关联类型的枚举

```swift
enum Answer: String {
    case wrong
    case right
}
var s1 = Answer.wrong
var s2 = Answer.right
print(s1 == s2)  //默认实现 Equatable 
```

- 只遵守 Equatable 协议关联类型枚举

```swift
enum Answer: Equatable {
    case wrong(Int)  //Int 类型是遵守 Equatable 协议的，所以 Answer 不需要实现 ==
    case right
}
var s1 = Answer.wrong(10)
var s2 = Answer.wrong(10)
print(s1 == s2)  //默认实现 Equatable
```

- 只拥有遵守 Equatable 协议存储属性的结构体


## Comparable 

要比较两个实例大小，遵守 Comparable 协议，并重载相应的运算符

实现和上面的 Equatable 类似

## 扩展

扩展（Extension）可以为枚举，结构，类，协议 增加新功能

```swift
extension Double {
    var km: Double { self * 1_1000.0}
    var m: Double { self }
    var dm: Double { self / 10.0}
    var cm: Double { self / 100.0}
    var mm: Double { self / 1_000.0}
}

var d = 100.0
print(d.km)
print(d.m)
print(d.dm)
print(d.mm)
```

## 内存管理

跟 OC 一样，swif 是采取基于引用计数的 ARC 内存管理方案。

swift 中的 ARC 有三种引用

- 强引用，默认情况下的引用都是强引用


- 弱引用(weak reference): 通过 weak 定义弱引用

> 必须是可选类型的 var，因为实例销毁后，ARC 会自动将弱引用设置为 nil       
> ARC自动给弱引用设置 nil 时，不会触发属性观察器

```swift
class Person {
    deinit {
        print("Person deinit")
    }
}


weak var p1: Person? = Person()  //Person deinit
```


- 无主引用(unowned reference):通过unowned定义无主引用

> 不会产生强引用，实例销毁后仍然存储着实例的内存地址(类似于 OC 中的 `unsafe_unretained`)      
> 试图在实例销毁后访问无主引用，会产生运行时错误(野指针)


### 循环引用

weak、unowned 都能解决循环引用的问题， unowned 要比 weak 少一些性能消耗

- 在声明周期中可能会变为 nil 的使用 weak
- 初始化赋值后再也不会变为 nil 的使用 unowned










