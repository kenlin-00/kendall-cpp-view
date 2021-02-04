
> [c++单例模式简单介绍见上一章](/C++随记/C++单例模式.md)

如果对象没有被释放，在运行期间可能会存在内存泄露问题。有人可能会说，在进程结束时，操作系统会进行必要的清理工作，包括释放进程的所有堆栈等信息，即使存在内存泄露，操作系统也会收回的；且对于单例来讲，进程运行期间仅有一个对象实例，而且该实例有可能根本就没有进行内存的申请操作，不释放实例所占内存，对进程的运行也不会造成影响。这么说好像很有道理的样子，既然操作系统会清理一切后续工作，那么我们还有必要进行内存释放工作吗？

我们在程序结束之前，通过`delete`来释放，但是程序员可能会忘记`delete`，一般情况下，单例对象在整个程序执行期间，都是存在的，直到程序退出;有些内存泄漏检测程序(valgrind)会认为单例对象就是内存泄漏;但是实际上并不是内存泄漏。

所以我们可以实现一个自动释放回收的单例模式

## 1.嵌套类+静态对象

我们可以重新定义一个嵌套类`AutoRelease`，借助该类的析构函数来完成。

```cpp
#include <iostream>
#include <stdio.h>
using std::cout;
using std::endl;

//单例对象的自动释放
//1.方法一：嵌套类 + 静态对象

class Singleton
{
	//定义一个嵌套类，专门为Singleton提供服务
	class AutoRelease
	{
	public:
		AutoRelease() {
			cout << "AutoRelase()" << endl;
		}
		~AutoRelease()
		{
			if(_pInstance){  //如果_pInstance还存在就释放掉
				delete _pInstance;
				cout << "~AutoRelease()" << endl;
			}
		}
	};
public:
	static Singleton * getInstance()
	{  
		
		if(_pInstance == NULL){
			_pInstance = new Singleton();
		}
		return _pInstance;
	}
private:
	Singleton() { cout << "Singleton()" << endl; }
	~Singleton() { cout << "~Singleton()" << endl;  }

private:
	static Singleton * _pInstance;
	// static AutoRelease _ar;
};

//静态成员必须初始化
Singleton * Singleton::_pInstance = NULL;


int main()
{
	//AutoRelease ar;

	//下面两个属于同一个对象
	Singleton *p1 = Singleton::getInstance();
	Singleton *p2 = Singleton::getInstance();
	
	printf("p1 = %p\n",p1);
	printf("p2 = %p\n",p2);

	//回收
	// Singleton::detroy(); //有可能你会忘掉
	return 0;
}
```

这样实现存在一个问题，`getInstance()`在多线程环境下并不是线程安全的，我们可以想到对里面的`if`语句进行加锁，但是加锁可能会带来效率的损失。也可以使用饱汉模式来解决。
```
// Singleton * Singleton::_pInstance = NULL;//饿汉模式，懒汉模式
// --> 懒加载 (只在需要的时候创建单例对象)

// 饱汉模式 (多线程安全的)
Singleton * Singleton::_pInstance = getInstance();
```


## 2.通过C标准库的atexit()函数注册释放函数

`atexit()`函数可以用来注册终止函数。如果打算在`main()`结束后执行某些操作，可以使用该函数来注册相关函数。

- 关于 atexit方法

```c
#include <stdlib.h>
int atexit(void (*function)(void));
```

进程正常退出的时候会被调用

测试：

```cpp
#include <iostream>
#include <stdlib.h>
using namespace std;

void dispaly()
{
	cout << "display()" << endl;
}

int main()
{
	cout << ">> main start " << endl;

	atexit(dispaly);

	cout << ">> main exit " << endl;
	return 0;
}
```
结果：

```
>> main start
>> main exit
display()
```

所以我们可是使用`atexit()`函数来实现单例模式的自动释放

```cpp
#include <iostream>
#include <stdlib.h>
#include <pthread.h>
#include <stdio.h>
using std::cout;
using std::endl;

class Singleton
{
	
public:
	static Singleton * getInstance()
	{ 
		
		if(_pInstance == NULL){
			_pInstance = new Singleton();
			// 程序结束的时候会执行
			atexit(destory);
		}
		return _pInstance;
	}
	//销毁函数
	static void destory()
	{
		if(_pInstance)
			delete _pInstance;
	}
private:
	Singleton() { cout << "Singleton()" << endl; }
	~Singleton() { cout << "~Singleton()" << endl;  }

private:
	static Singleton * _pInstance;
};

Singleton * Singleton::_pInstance = NULL;

int main()
{
	//下面两个属于同一个对象
	Singleton *p1 = Singleton::getInstance();
	Singleton *p2 = Singleton::getInstance();
	
	printf("p1 = %p\n",p1);
	printf("p2 = %p\n",p2);

	return 0;
}
```

标准规定`atexit()`至少可以注册32个终止函数，如果系统中有多个单例，我们可能要注册多个函数，或者在同一个终止函数中释放所有单例对象。但是方式的问题依然存在。必须由程序猿手工注册，且有可能遗漏某个对象。

## 3.使用 pthread_once

在多线程情况下保证这个函数只执行一次，所以能保证`pInstance`是唯一的，这种方法实现能保证在多线程下是安全的

```cpp
#include <iostream>
#include <stdlib.h>
#include <pthread.h>
#include <stdio.h>
using std::cout;
using std::endl;

class Singleton
{
public:
	static Singleton * getInstance()
	{ 
		
		//保证多线程下是线程安全的
		pthread_once(&_once,init);
		return _pInstance;
	}
	//定义一个初始化函数让多线程下之执行一次
	static void init ()
	{
		_pInstance = new Singleton();
		atexit(destory);
	}

	//销毁函数
	static void destory()
	{
		if(_pInstance)
			delete _pInstance;
	}
private:
	Singleton() { cout << "Singleton()" << endl; }
	~Singleton() { cout << "~Singleton()" << endl;  }

private:
	static Singleton * _pInstance;
	static pthread_once_t _once;
};

Singleton * Singleton::_pInstance = NULL;
pthread_once_t Singleton::_once = PTHREAD_ONCE_INIT;

int main()
{
	//下面两个属于同一个对象
	Singleton *p1 = Singleton::getInstance();
	Singleton *p2 = Singleton::getInstance();
	
	printf("p1 = %p\n",p1);
	printf("p2 = %p\n",p2);

	return 0;
}
```
执行：

```
 g++ 03autoRealseSingleton.cpp -lpthread

Singleton()
p1 = 0xccdc20
p2 = 0xccdc20
~Singleton()
```

好了，我们可以像之前一样使用单例了，不需要再关心对象的释放问题。进程结束时，操作系统会帮我们去释放的。