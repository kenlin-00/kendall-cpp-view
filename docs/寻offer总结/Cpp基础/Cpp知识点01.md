## 1.main函数执行之前和执行之后有什么区别?

首先我们来看一段代码

```cpp
// #include <iostream>
// using namespace std;
// #include <stdio.h>


// void test() 
// { 
//  char s1[10]; 
//  const char *s2="0123456789";
//  strcpy(s1, s2); 
//  cout << s1 << endl;
// }

// int main() {
//     // test();
//     // return 0;
//     union V {
//         struct X {
//         unsigned char s1:2;
//         unsigned char s2:3;
//         unsigned char s3:3;
//         } x;
//         unsigned char c;
//     } v;
//     v.c = 100;
//     printf("%d", v.x.s3);
// }

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

同样在`main()`函数执行后,程序退出，这时候对全局变量和

首先main()函数只不过是提供了一个函数入口，在main()函数中的显示代码执行之前，会由编译器生成_main函数，其中会进行所有全局对象的构造以及初始化工作。简单来说对静态变量、全局变量和全局对象来说的分配是早在main()函数之前就完成的，所以C/C++中并非所有的动作都是由于main()函数引起的。 
同理在main()函数执行后，程序退出，这时候会对全局变量和全局对象进行销毁操作，所以在main()函数还会执行相应的代码。 
在上面的例子中，a的构造函数会先执行，再执行main，最后会调用a的析构函数。