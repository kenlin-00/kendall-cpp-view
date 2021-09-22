

- [C++11多线程](#c11多线程)
  - [怎么样实现并发](#怎么样实现并发)
  - [C++11新标准线程库](#c11新标准线程库)
    - [thread](#thread)
    - [join](#join)
    - [detach 函数](#detach-函数)
    - [joinable](#joinable)
  - [使用 detach 时候需要注意什么问题(线程安全问题)](#使用-detach-时候需要注意什么问题线程安全问题)
    - [C++中的 mutable 关键字](#c中的-mutable-关键字)
- [C++11 中互斥量](#c11-中互斥量)
  - [C++11 中解决死锁](#c11-中解决死锁)
    - [关于 std::adopt_lock 参数](#关于-stdadopt_lock-参数)
  - [lock_guard 与 unique_lock](#lock_guard-与-unique_lock)
  - [c++ overwrite(重写)](#c-overwrite重写)

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

一旦调用了 detach，就不可再调用 join 了。

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

### 使用 detach 时候需要注意什么问题(线程安全问题)

- 不要往线程中传递引用，指针之类的参数
- 建议使用值传递，建议在创建线程这一行就构造出临时对象，然后线程入口函数的形参**使用引用**来作为形参。 


```cpp
//不能这样使用
void myprint(const int& i,const string& pmybuf) {...}

//main()中
std::thread mytojob(myprint,mvar,mybuf);
mytojob.join();
```

C++ 语言只会为 const 引用临时对象，第一个参数不建议使用引用，因为 主线程可能先执行结束被回收了，导致 mvar 变量被回收。

第二个参数系统内部隐式将 char 数组转成 string 对象，但是这个转换时机可能发生在 主线程 执行结束后，这时候 mybuf 被系统回收了。

更改：
```
std::thread mytojob(myprint,mvar,string(mybuf));
```

直接将 mybuf 转换成 string 对象，`string(mybuf))`会生成一个临时对象，并将这个临时对象绑定到  pmybuf ，因此可以保证 pmybuf 肯定是有效的。

> 给线程入口函数传递类型对象时，只要使用临时对象作为实参，就可以确保线程入口函数的形参在 main 主函数退出前就已经创建完毕，可以保证线程安全。

> 参考：C++ 新经典 P480-486

#### C++中的 mutable 关键字

在C++中，mutable 是为了突破 const 的限制而设置的。被 mutable 修饰的变量，将永远处于可变的状态，即使在一个 const 函数中。


## C++11 中互斥量

```cpp
#incclude <mutex>
std::mutex my_mutex;
......
bool outMsgLULProc(int &command) {
    my_mutex.lock();
    if(!msgRecvQueue.empty())
    {
        comman = msgRecvQueue.front();
        msgRecvQueue.pop_front();
        my_mutex.unlock();
        return true;
    }
    my_mutex.unlock();
    return false;
}
```

上面程序，同一时刻只有一个线程能拿到锁，这就意味着同一时刻只有一个线程能操作这个共享数据，但是写程序的时候会在 return 前忘记 unlock。

C++11 引入了 std::lock_guard `[ɡɑːrd]`的**类模板**，会自动 unlock，这点和智能指针释放内存类似。

### C++11 中解决死锁

- **lock_guard**

lock_guard 可以同时取代 lock 和 unlock 两个函数，上面代码改造

```cpp
bool outMsgLULProc(int &command) {
    std::lock_guard<std::mutex> myguard(my_mutex);
    // my_mutex.lock();
    if(!msgRecvQueue.empty())
    {
        comman = msgRecvQueue.front();
        msgRecvQueue.pop_front();
        // my_mutex.unlock();
        return true;
    }
    // my_mutex.unlock();
    return false;
}
```

**lock_guard 工作原理**：

在 lock_guard 类模板的构造函数里，调用了 mutex 的 lock 成员函数，而在 析构函数 中，调用了 mutex 的 unlock 函数。

> std::lock 函数模板能一次锁住两个或者两个以上的互斥量，它不存在多个线程中因为锁的顺序问题导致死锁的风险。        
> 如果这些 互斥量 中有一个没有锁住，就要卡在 std::lock 那里等着，等所有互斥量都锁住，std::lock 才会返回，程序才会继续往下走。

- **unique_lock**

> 一般开发中使用 lock_guard 就够用了

unique_lock 是一个类模板，和 lock_guard 一样，都是用来取代 mutx 的 lock 和 unlock 函数，原理和 lock_guard 一样

#### 关于 std::adopt_lock 参数

std::adopt_lock 标记表示这个互斥量已经被 lock 过了，不希望再再构造函数中 lock  这个互斥量了。

```cpp
std::lock_guard<std::mutex> myguard(my_mutex,std::adopt_lock);
std::unique_lock<std::mutex> myguard(my_mutex,std::adopt_lock);
```

unique_lock 相对于 lock_guard 更占用内存，运行效率差一点，但是使用比较灵活。unique_lock 有三个参数，第三个参数 std::try_to_lock 会尝试用 mutex 的 lock 去锁定这个 mutex，但是如果没锁住就会立即返回，不会阻塞在那里。

> 使用 std::try_to_lock 的前提是开发者不可以自己吧互斥量 lock 上，因为 std::try_to_lock 已经尝试 unlock 了，如果开发者 再次 lock ，程序会卡死

### lock_guard 与 unique_lock

两个都是在离开作用域时，检查关联的 mutex 是否 lock ，如果没有，就帮助开发者 unlock，

工作原理都是：在 `lock_guard/unique_lock` 类模板的构造函数里，调用了 mutex 的 lock 成员函数，而在 析构函数 中，调用了 mutex 的 unlock 函数。

unique_lock 相对于 lock_guard 更占用内存，运行效率差一点，但是使用比较灵活。unique_lock 有三个参数，第三个参数 std::try_to_lock 会尝试用 mutex 的 lock 去锁定这个 mutex，但是如果没锁住就会立即返回，不会阻塞在那里。

### c++ overwrite(重写)

- 如果派生类的函数与基类的函数同名，但是参数不同。此时，不论有无 virtual 关键字，基类的函数将被隐藏

- 如果派生类的函数与基类的函数同名，并且参数也相同，但是基类函数没有 virtual 关键字。此时，基类的函数被隐藏。

## `A a`和`A *aa = new A()`区别

唯一的区别就是` A a` 的 a 是在栈上申请的空间，`A * aa` 是在堆上申请的空间，a 退出作用范围后，自动析构了！而  aa 没有析构，需要人为的调用`delete aa`来析构`aa`。使用时没有区别！



