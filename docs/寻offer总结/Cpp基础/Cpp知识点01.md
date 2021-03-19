## main函数执行之前和执行之后有什么区别?

首先我们来看一段代码

```cpp
#include <iostream>
using namespace std;
class A {
public:
    A() {
        cout << "this is A Contructor" << endl;
    }
    ~A() {
        cout << "this is A distructor" << endl;
    }
};

A a;

int main() {
    cout << "this is main" << endl;
    return 0;
}
```

程序输出：

```
this is A Contructor
this is main
this is A distructor
```
会发现最终打印的不仅仅是`this is main`这句话

以前我总以为所有的代码都是在`main`函数执行之后才会执行的,但其实不是这样的，`main`函数只不过是提供了一个函数的入口而已，在`main`函数中的代码在执行之前，编译器会生成`_main`函数，这时候会进行所有全局对象的构造以及初始化工作。简单的说就是静态变量、全局变量和全局对象的分配是在`main`函数之前完成的，所以`C++`中并非所有的动作都是由于`main`函数引起的。

同样在`main()`函数执行后,程序退出，这时候对全局变量和全局对象进行销毁操作，所以在`main()`函数之后还会执行相应的代码

还可以使用`ateit()`函数，使`main()`函数之后可以执行其他函数。

```cpp
void fun1() {
    cout << "this is fun1" << endl;
}
void fun2() {
    cout << "this is fun2" << endl;
}
int main() {
    atexit(fun1);
    atexit(fun2);
    cout << "this is main" << endl;
    return 0;
}
```

执行结果：
```
this is main
this is fun2
this is fun1
```

## 指针和引用的区别

* 指针是一个新的变量，指向另一个变量的地址，我们可以通过访问这个地址来修改另一个变量；而引用是一个别名，对引用的操作就是对变量的本身进行操作
* 指针可以有多级，引用只有一级
* 传参的时候，使用指针的话需要解引用才能对参数进行修改，而使用引用可以直接对参数进行修改
* 指针的大小一般是4个字节，引用的大小取决于被引用对象的大小
* 指针可以为空，引用不可以。
* 引用一旦进行初始化之后，不会再改变其指向；但指针可以

```cpp
void test(int *p) {
    int a = 1;
    p = &a;
    cout << "p = " << p << endl;  // p = 0x7ffeef7836f4  指针指向的是一个变量的地址
    cout << "*p = " << *p << endl; // *p = 1  

    int &b = a;  //b只是a的别名,引用必须初始化，不能为空
    cout << "b = a = " <<  b << endl; //b = a = 1
    // 更改b，a也会更改，对引用的操作就是对变量的本身进行操作
    b = 2;
    cout << "a = " << a << endl; //a = 2
}

int main() {
    int *p = NULL;  //指针可以为空
    test(p);
    return 0;
}
```



