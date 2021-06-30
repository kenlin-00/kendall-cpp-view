

- [C++11多线程](#c11多线程)
  - [怎么样实现并发](#怎么样实现并发)
  - [C++11新标准线程库](#c11新标准线程库)
    - [thread](#thread)
    - [join](#join)
    - [detach 函数](#detach-函数)
    - [joinable](#joinable)

--------

## C++11多线程

线程不能越多越好，每个线程都需要一个独立的堆栈空间爱你，消耗内存，一个线程占用 1MB 堆栈空间，而且线程之间的切换也要保存很多中间状态等，也就是设计到上下文切换。 

### 怎么样实现并发

- 通过多个进程实现并发
- 通过单独一个进程创建多个线程实现并发

### C++11新标准线程库

C++ 11 新标准引入了对多线程的支持，解决了跨平台问题。

POSIX thread(pthread) 是可以跨平台的，但仍需要进行一些配置。

使用 C++11 编写多线程

#### thread

thread 是 C++ 新标准库中的类，这个类就是用来创建线程的。这个类生成一个对象，里面是一个可调用对象（函数）

#### join

阻塞，主线程等待子线程执行完毕，执行流程最终汇合在一起。

```cpp
vo

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

#### detach 函数

如果创建了很多子线程，让主线程逐个等待子线程结束，这种方法就显得不是很好，所以需要引入 detach 这种写法，**让主线程和子线程分离**，主线程不必等待子进程运行结束。

```cpp
mytoobj.detach();
```

一旦调用了 detach，就不可在调用 join 了。

#### joinable

判断是否成功使用 join 或者 detach

```cpp
#include <iostream>
#include <thread>
using namespace std;

void myprint()
{
    cout << "我的线程开始执行了"<<endl;


    cout << "我的线程执行完毕了"<<endl;
}

int main(){
    cout << "main主线程开始" << endl;

    std::thread mytojob(myprint);

    if(mytojob.joinable()) {
        cout << "joinable is true" << endl;
    }
    else {
        cout << "joinable is false" << endl;
    }

    mytojob.detach();

    if(mytojob.joinable()) {
        cout << "joinable is true" << endl;
    }
    else {
        cout << "joinable is false" << endl;
    }

    cout << "main主线程结束" << endl;


    return 0;
}
```

结果：

```
main主线程开始
joinable is true
我的线程开始执行了
我的线程执行完毕了
joinable is false
main主线程结束
```




