

- [尽量使用 const，enum,inline 替换 `#define`](#尽量使用-constenuminline-替换-define)
  - [class 专属常量](#class-专属常量)
  - [`#define`定义宏函数](#define定义宏函数)

---

## 尽量使用 const，enum,inline 替换 `#define`

因为`#define` 定义的常量是在预处理阶段进行替换，而 const 在编译阶段确定它的值。

```
#define NUM 10
```

如果用 define 定义一个宏，让我们需要用这个常量来获得一个编译错误信息的时候，可能无法获取，因为这个错误信息是 10 而不是 NUM。

### class 专属常量

在类中，为了将常量的作用域限制在 class 内，一般都加一个 static 修饰成员。

但是下面代码

```cpp
classs A {
private:
    static const int num = 5;   //声明式而非定义式
    //使用常量
    int nums[num];
}
```

上面的 num 是声明而不是定义，这种方式主要不对 num 取地址，可以声明并使用，不需要定义，但是如果要对 num 取地址，就需要进行如下定义

```cpp
const int A::num;  //num 的定义
```

而且建议把这条语句写在实现文件而不是头文件中，因此 class 常量已经在声明时就获得初始值了，因此定义时不需要再设初始值。

> 注意，不能用 `#define` 创建一个常量，因为 #define 并不重视作用域这个概念，一旦被定义，它就会在编译过程中有效，这就意味着 `#define` 不仅不能用来定义 class 专属常量，也不能提供任何封装性。

> 对 const 取地址合法，对 enum 取地址不合法，`#define` 取地址通常不合法


### `#define`定义宏函数

宏函数看起来像函数，但是不会没有函数调用带来的开销，但是使用 宏函数 最好要用「小括号」将所有实参括起来

