

- [C++11多线程](#c11多线程)
  - [detach 函数](#detach-函数)
  - [用一个类来创建线程](#用一个类来创建线程)

--------

## C++11多线程

C++ 11 新标准引入了对多线程的支持，解决了跨平台问题。

使用 C++11 编写多线程

```cpp
#include <iostream>
#include <thread>
using namespace std;

void myprint() {
    cout << "我的线程开始执行"<< endl;

    cout << "我的线程执行完毕了" << endl;
}

int main() {
    cout << "main主线程开始" << endl;

    std::thread mytoobj(myprint);
    mytoobj.join();  //阻塞，等待子线程执行完毕

    cout << "main 主线程结束" << endl;

    return 0;
}
```

结果

```
main主线程开始
我的线程开始执行
我的线程执行完毕了
main 主线程结束
```

### detach 函数

如果创建了很多子线程，让主线程逐个等待线程结束，这种方法就显得不是很好，所以需要引入 detach 这种写法，让主线程和子线程分离，主线程不必等待子进程运行结束。

```cpp
mytoobj.detach();
```

一旦调用了 detach，就不可在调用 join 了。

### 用一个类来创建线程

