单例模式是一种较为简单的设计模式，可根据不同需求有不同的实现方法。但是单例模式是有局限性的，索引很多人会反对使用单例模式，本文一步一步循序渐进地实现简单的单例模式。

## 什么是单例模式
单例 `Singleton` 是设计模式的一种，要求内存中只能创建一个对象，具有全局变量的特点，在任何位置都可以通过接口获取到那个唯一实例;

**应用场景:**           
1. 直接替换任意的全局对象(变量)         
2. 配置文件         
3. 词典类           
4. 设备管理器，系统中可能有多个设备，但是只有一个设备管理器，用于管理设备驱动           
5. 数据池，用来缓存数据的数据结构，需要在一处写，多处读取或者多处写，多处读取           

## C++单例模式的实现
首先来看这段代码
```js
#include <iostream>
#include <stdio.h>
using std::cout;
using std::endl;

//创建一个类
class Singleton {

};
int main() {
    Singleton s1;
    Singleton s2;  //可以创建多个对象
    return 0;
}
```
按照普通的方式创建一个类，这样就可以创建多个对象，所以让`main`中的`Singleton s1;`编译不通过。因为创建实例的时候会调用构造函数，所以我们可以从构造函数下手，将构造函数放在**设为私有**
```js
private:
    Singleton() {
        cout << "构造函数： Singleton()  "<< endl;
    }
```
将构造函数私有化后下面的几种创建实例方式都会报错
```js
Singleton s3;   //error
static Singleton s4;  //error

int main() {
    //设为私有后，下面的语句将会报错
    Singleton s1;
    Singleton s2;  //可以创建多个对象

    Singleton * p1 = new Singleton();  //error
    return 0;
}
```
`private`中的成员方法只能在类本身中调用，所以在中定义`getInstance()`方法，返回的是一个`Singleton`对象。

```js
class Singleton {
public:
    static Singleton * getInstance() {
        return new Singleton();
    }
private:
    Singleton() {
        cout << "构造函数： Singleton()  "<< endl;
    }
};
int main() {

    Singleton *p1 = Singleton::getInstance();
    Singleton *p2 = Singleton::getInstance();
    //打印地址
    printf("&P1 = %p\n",p1);
    printf("&P1 = %p\n",p2);
    return 0;
}
```
用静态成员函数创建对象，通过打印地址发现，这两个对象地址不一样，说明不是同一对象， 所以需要用一个变量保存第一次创建之后的指针。但是这个变量`_pInstance`必须是`static`的，因为是在静态方法中使用。此外静态成员必须在类的外部进行初始化。             
这时打印`p1`和`p2`的地址，发现地址是一样的， 说明是同一个对象。
```js
class Singleton {
public:
    static Singleton * getInstance() {
        if (NULL == _pInstance) {
            _pInstance = new Singleton();
        }
        return _pInstance;
    }
private:
    Singleton() {
        cout << "构造函数： Singleton()  "<< endl;
    }
private:
    static Singleton * _pInstance;
};

//静态成员必须初始化
Singleton * Singleton::_pInstance = NULL;

int main() {
    Singleton *p1 = Singleton::getInstance();
    Singleton *p2 = Singleton::getInstance();
    //打印地址
    printf("&P1 = %p\n",p1);
    printf("&P1 = %p\n",p2);  //地址一样
    return 0;
}
```
**对象的销毁**
我们可以直接通过`delete p1;`去销毁，但是我们是通过静态方法创建的对象，最后也是用静态的方法销毁，所以必须让这条语句编译不通过。由于对象在销毁的时候会调用析构函数，所以，我们可以把析构函数设置成私有的。然后在类内部定义一个`destory()`函数。
```js
class Singleton {
public:
    static Singleton * getInstance() {
        if (NULL == _pInstance) {
            _pInstance = new Singleton();
        }
        return _pInstance;
    }
    //销毁函数
    static void destory() {
        if (_pInstance) {
            delete _pInstance;  //_pInstance存的就是对象
        }
    }
private:
    Singleton() {
        cout << "构造函数： Singleton()  "<< endl;
    }
    ~Singleton() {
        cout << "析构函数：~Singleton()" << endl;
    }
private:
    static Singleton * _pInstance;
};

//静态成员必须初始化
Singleton * Singleton::_pInstance = NULL;

int main() {
    Singleton *p1 = Singleton::getInstance();
    Singleton *p2 = Singleton::getInstance();
    //打印地址
    printf("&P1 = %p\n",p1);
    printf("&P1 = %p\n",p2);  //地址一样

    //    delete p1;  //希望该语句编译无法通过（析构函数就必须放在private区域）

    Singleton::destory();
    return 0;
}
```
最终运行结果：
```
构造函数： Singleton()  
&P1 = 0x7fa0c54006a0
&P1 = 0x7fa0c54006a0
析构函数：~Singleton()
```

> 这次先讲这么多啦，下次再继续深入~ 