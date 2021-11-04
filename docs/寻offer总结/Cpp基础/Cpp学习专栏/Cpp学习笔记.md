
- [C++的内存管理](#c的内存管理)
  - [堆](#堆)
  - [栈](#栈)
  - [RAII](#raii)
- [实现C++智能指针](#实现c智能指针)
  - [模板化变成一个类模板](#模板化变成一个类模板)
  - [“移动”指针](#移动指针)
  - [引用计数](#引用计数)
  - [完整的 smart_ptr 代码](#完整的-smart_ptr-代码)


-----
## C++的内存管理

> 笔记来源：https://time.geekbang.org/column/article/169225

C++的内存管理需要涉及三个重要的概念：堆，栈，RAII。

- **堆**

在内存管理的语境下，指的是动态分配内存的区域。这个堆跟数据结构里的堆不是一回事。这里的内存，被分配之后需要手工释放，否则，就会造成内存泄漏。          
    
C++ 标准里一个相关概念是自由存储区，就是 free shore ,指使用 new 和 delete 来分配和释放内存区域，一般而言，这是堆的一个子集。

- new 和 delete 操作的区域是 free 
- storemalloc 和 free 操作的区域是 heap

但 new 和 delete 通常底层使用 malloc 和 free 来实现，所以 free store 也是 heap。

- **栈**

在内存管理环境下，栈值的是函数调用过程中产生的本地变量和调用数据的区域，这个栈和数据结构中的栈其实很相似，都是先进后出。

- **RAII**

是 C++ 所特有的资源管理方式。RAII 依托栈和析构函数，来对所有的资源——包括堆内存在内——进行管理。对 RAII 的使用，使得 C++ 不需要类似于 Java 那样的垃圾收集方法，

### 堆

在堆上分配内存，有些语言可能使用 new 这样的关键字，有些语言则是在对象的构造时隐式分配，不需要特殊关键字。不管哪种情况，程序通常需要牵涉到三个可能的内存管理器的操作：
  - 让内存管理器分配一个一定大小的内存块
  - 让内存管理器释放一个之前分配的内存块
  - 让内存管理器进行垃圾收集操作，寻找不再使用的内存块并予以释放

C++ 通常使用上面的 1 和 2。

> C++ 通常会做上面的操作 1 和 2。Java 会做上面的操作 1 和 3。而 Python 会做上面的操作 1、2、3。这是语言的特性和实现方式决定的。

第一，分配内存要考虑程序当前已经有多少未分配的内存。内存不足时要从操作系统申请新的内存。内存充足时，要从可用的内存里取出一块合适大小的内存，并将其标记为已用，然后将其返回给要求内存的代码。

第二，释放内存不只是简单地把内存标记为未使用。对于连续未使用的内存块，通常内存管理器需要将其合并成一块，以便可以满足后续的较大内存分配要求。毕竟，目前的编程模式都要求申请的内存块是连续的。

第三，垃圾收集操作有很多不同的策略和实现方式，以实现性能、实时性、额外开销等各方面的平衡。但是 C++ 里通常都不使用垃圾收集。



**在不考虑垃圾收集的情况下，内存需要手工释放；我们可以使用 new 和 delete。每个 new 出来的对象都应该用 delete 来释放，但是在此过程中，内存也可能有碎片化的情况**。

但是我们如果漏掉了 delete ，就会导致内存泄漏。

> 在C++中，更常见、也更合理的情况，是分配和释放不在一个函数里。


### 栈

我们先来看一段示例代码，来说明 C++ 里函数调用、本地变量是如何使用栈的。

```cpp

void foo(int n)
{
  …
}

void bar(int n)
{
  int a = n + 1;
  foo(a);
}

int main()
{
  …
  bar(42);
  …
}
```

这段代码执行过程中的栈变化：

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/内存管理栈变化01.5br4oybod6w0.png)

栈是向上增长的，**栈的生长方向是地地址**，因而上方意味着低地址。当一个函数调用另一个函数的时候，会把参数也压入栈里（我们此处忽略使用寄存器传递参数的情况），然后把下一行汇编指令的地址压入栈，并跳转到新的函数。新的函数进入后，首先做一些必须的保存工作，然后会调整栈指针，分配出本地变量所需的空间，随后执行函数中的代码，并在执行完毕之后，根据调用者压入栈的地址，返回到调用者未执行的代码中继续执行。

本地变量所需的内存就在栈上，跟函数执行所需的其他数据在一起。当函数执行完成之后，这些内存也就自然而然释放掉了。

- 栈上的分配极为简单，移动一下栈指针而已。
- 栈上的释放也极为简单，函数执行结束时移动一下栈指针即可。
- 由于后进先出的执行过程，不可能出现内存碎片。

> 注意：编译器会自动调用析构函数，包括在函数执行发生异常的情况。也就是不管是否发生了异常，析构函数都会得到执行。「也就是栈展开」


### RAII

C++ 支持将对象存储在栈上面。但是，在很多情况下，对象不能，或不应该，存储在栈上。比如：
- 对象很大；
- 对象的大小在编译时不能确定；
- 对象是函数的返回值，但由于特殊的原因，不应使用对象的值返回。

设置一个函数返回值类型是基类，那么怎么保证返回值不发生内存泄露呢？

答案就在析构函数和它的栈展开行为上。我们只需要把这个返回值放到一个本地变量里，并确保其析构函数会删除该对象即可。

```cpp
class shape_wrapper {
public:
  explicit shape_wrapper(
    shape* ptr = nullptr)
    : ptr_(ptr) {}
  ~shape_wrapper()
  {
    delete ptr_;
  }
  shape* get() const { return ptr_; }

private:
  shape* ptr_;
};
```

那么这样 delete 指针为空的话会怎样呢？

事实上，使用 new 分配内存时，会调用构造函数构造一个对象，如果构造成功 new 整体操作就完成，如果构造失败，那么就会释放掉刚刚分配内存并向外抛出构造函数产生异常。delete 时则判断指针是否为空，在指针不为空时调用析构函数并释放之前分配的内存。

在析构函数里做必要的清理工作，这就是 RAII 的基本用法。

这种清理并不限于释放内存，也可以是：

- 关闭文件（fstream 的析构就会这么做）

- 释放同步锁

- 释放其他重要的系统资源

> [动手敲的代码](/寻offer总结/Cpp基础/Cpp学习专栏/code/Cpp学习笔记Code?id=c的内存管理代码)

具体见：[这里的 RAII 部分](https://time.geekbang.org/column/article/169225)


-----

## 实现C++智能指针

回忆一下这个类

```cpp
class shape_wrapper {
public:
  explicit shape_wrapper(
    shape* ptr = nullptr)
    : ptr_(ptr) {}
  ~shape_wrapper()
  {
    delete ptr_;
  }
  shape* get() const { return ptr_; }

private:
  shape* ptr_;
};
```

这个类可以完成智能指针的最基本的功能：**对超出作用域的对象进行释放**

但是：

- 这个类只适用于 shape 类
- 该类对象的行为不够像指针拷贝
- 该类对象会引发程序行为异常

### 模板化变成一个类模板

要让这个类能够包装任意类型的指针，我们需要把它变成一个类模板。

我们就是在开头增加模板声明 template ，然后把代码中的 shape 替换成模板参数 T 而已。

这个模板使用也很简单，把原来的 `shape_wrapper` 改成 `smart_ptr<shape>` 就行。

目前这个 smart_ptr 的行为还是和指针有点差异的：

- 它不能用 `*` 运算符解引用
- 它不能用 `->` 运算符指向对象成员
- 它不能像指针一样用在布尔表达式里

不过，这些问题也相当容易解决，加几个成员函数就可以：

```cpp
template <typename T>
class smart_ptr {
public:
    // explicit 的作用是表明该构造函数是显示的, 而非隐式的, 跟它相对应的另一个关键字是implicit, 意思是隐藏的,
  explicit smart_ptr(T* ptr = nullptr)
    : ptr_(ptr) 
    {}

  ~smart_ptr()
  {
    delete ptr_;
  }
  
  T* get() const { return ptr_; }

  //添加的几个成员函数

  T& operator*() const 
  { 
      return *ptr_; 
  } 
  T* operator->() const 
  { 
      return ptr_; 
  }
  operator bool() const 
  { 
      return ptr_; 
  }

private:
  T* ptr_;
};
```

如果我们拷贝,比如：

```cpp
smart_ptr<shape> ptr1{create_shape(shape_type::circle)};
smart_ptr<shape> ptr2{ptr1}; //应该让它在编译的时候报错
```

`smart_ptr ptr2{ptr1};` 在编译时不会出错，但在运行时却会有未定义行为——由于会对同一内存释放两次，通常情况下会导致程序崩溃。

```
a.out(88274,0x10c1d55c0) malloc: *** error for object 0x7f8628402b60: pointer being freed was not allocated
a.out(88274,0x10c1d55c0) malloc: *** set a breakpoint in malloc_error_break to debug
Abort trap: 6
```

第二行应该让它在编译的时候报错    
最简单的情况显然是禁止拷贝。我们可以使用下面的代码：

```cpp

template <typename T>
class smart_ptr {
public:
    // explicit 的作用是表明该构造函数是显示的, 而非隐式的, 跟它相对应的另一个关键字是implicit, 意思是隐藏的,
  explicit smart_ptr(T* ptr = nullptr)
    : ptr_(ptr) 
    {}

  ~smart_ptr()
  {
    delete ptr_;
  }
  
  T* get() const { return ptr_; }

  //添加的几个成员函数

  T& operator*() const 
  { 
      return *ptr_; 
  } 
  T* operator->() const 
  { 
      return ptr_; 
  }
  operator bool() const 
  { 
      return ptr_; 
  }

  //禁止拷贝和赋值
  smart_ptr(const smart_ptr&) = delete; smart_ptr& operator=(const smart_ptr&) = delete;

private:
  T* ptr_;

};
```

我们可以尝试在拷贝时转移指针的所有权

```cpp

template <typename T>
class smart_ptr {
  …
  smart_ptr(smart_ptr& other)
  {
    ptr_ = other.release();
  }
  smart_ptr& operator=(smart_ptr& rhs)
  {
    smart_ptr(rhs).swap(*this);
    return *this;
  }
  …

  //释放所有权
  T* release()
  {
    T* ptr = ptr_;
    ptr_ = nullptr;
    return ptr;
  }
  void swap(smart_ptr& rhs)
  {
    using std::swap;
    swap(ptr_, rhs.ptr_);
  }
  …
};
```

在拷贝构造函数中，通过调用 other 的 release 方法来释放它对指针的所有权。

在赋值函数中，则通过拷贝构造产生一个临时对象并调用 swap 来交换对指针的所有权

> 上面实现的只能指针就是 auto_ptr

上面实现的最大问题是，它的行为会让程序员非常容易犯错。**一不小心把它传递给另外一个 smart_ptr，你就不再拥有这个对象了……**

### “移动”指针

smart_ptr 可以如何使用“移动”来改善其行为。

我们需要对代码做两处小修改

```cpp

template <typename T>
class smart_ptr {
  …

  //把拷贝构造函数中的参数类型 smart_ptr& 改成了 smart_ptr&&；现在它成了移动构造函数。
  smart_ptr(smart_ptr&& other)
  {
    ptr_ = other.release();
  }
  //赋值函数中的参数类型 smart_ptr& 改成了 smart_ptr
  smart_ptr& operator=(smart_ptr rhs)
  {
    rhs.swap(*this);
    return *this;
  }
  …
};
```

- 把拷贝构造函数中的参数类型 `smart_ptr&` 改成了 `smart_ptr&&`；现在它成了移动构造函数。

- 把赋值函数中的参数类型 `smart_ptr&` 改成了 `smart_ptr`，在构造参数时直接生成新的智能指针，从而不再需要在函数体中构造临时对象。现在赋值函数的行为是移动还是拷贝，完全依赖于构造参数时走的是移动构造还是拷贝构造。


> `operator=()`的参数在接收参数的时候，会调用构造函数，如果调用的是拷贝构造，那赋值操作就是拷贝，如果调用的是移动构造，那么赋值操作就是移动。

如果我提供了移动构造函数而没有手动提供拷贝构造函数，那后者自动被禁用

```cpp
smart_ptr<shape> ptr1{create_shape(shape_type::circle)};
smart_ptr<shape> ptr2{ptr1};             // 编译出错
smart_ptr<shape> ptr3;
ptr3 = ptr1;                             // 编译出错
ptr3 = std::move(ptr1);                  // OK，可以
smart_ptr<shape> ptr4{std::move(ptr3)};  // OK，可以
```

> 这也是 C++11 的 unique_ptr 的基本行为。

不知道你注意到没有，一个 `circle*` 是可以隐式转换成 `shape*` 的，但上面的 smart_ptr 却无法自动转换成 `smart_ptr`。

不过，只需要额外加一点模板代码，就能实现这一行为。在我们目前给出的实现里，只需要增加一个构造函数即可——这也算是我们让赋值函数利用构造函数的好处了。

```cpp
  template <typename U>
  smart_ptr(smart_ptr<U>&& other)
  {
    ptr_ = other.release();
  }
```

这样，我们自然而然利用了指针的转换特性：现在 `smart_ptr` 可以移动给 `smart_ptr`，但不能移动给 `smart_ptr`。不正确的转换会在代码编译时直接报错。

理论上，这里的模板参数`smart_ptr(smart_ptr<U>&& other)`是万能引用，既可以引用左值，又可以引用右值，万能引用在【完美转发】中大有用武之地。 因此上面这段代码所表达的是一个构造函数模板，实例化后可能是拷贝构造函数，也可能是移动构造函数。 

> 补充：在函数模板中，如果参数列表是带“&&”的模板参数，那么这个参数的类型不是右值引用，而是万能引用。

### 引用计数

`unique_ptr` 算是一种较为安全的智能指针了。但是，一个对象只能被单个 `unique_ptr` 所拥有，这显然不能满足所有使用场合的需求。一种常见的情况是，多个智能指针同时拥有一个对象；当它们全部都失效时，这个对象也同时会被删除。这也就是 `shared_ptr` 了。

![](https://static001.geekbang.org/resource/image/07/c8/072fc41e503d22c3ab2bf6a3801903c8.png)

多个不同的 shared_ptr 不仅可以共享一个对象，在共享同一对象时也需要同时共享同一个计数。当最后一个指向对象（和共享计数）的 shared_ptr 析构时，它需要删除**对象**和**共享计数**

我们先来写出共享计数的接口

```cpp
class shared_count {
public:
  shared_count();
  void add_count();   //增加计数
  long reduce_count();  //减少计数
  long get_count() const;  //获取计数
};
```

注意上面的接口增加计数不需要返回计数值；但减少计数时需要返回计数值，以供调用者判断是否它已经是最后一个指向共享计数的 shared_ptr 了。

```cpp

class shared_count {
public:
  shared_count() : count_(1) {}
  void add_count()
  {
    ++count_;
  }
  long reduce_count()
  {
    return --count_;
  }
  long get_count() const
  {
    return count_;
  }

private:
  long count_;
};
```

现在我们可以实现我们的引用计数智能指针了。首先是构造函数、析构函数和私有成员变量：

```cpp

template <typename T>
class smart_ptr {
public:
  explicit smart_ptr(T* ptr = nullptr)
    : ptr_(ptr)
  {
    if (ptr) {
      shared_count_ =
        new shared_count();
    }
  }
  ~smart_ptr()
  {
    if (ptr_ &&
      !shared_count_
         ->reduce_count()) {
      delete ptr_;
      delete shared_count_;
    }
  }

private:
  T* ptr_;
  shared_count* shared_count_;
};
```

构造函数跟之前的主要不同点是会构造一个 `shared_count` 出来。析构函数在看到 `ptr_` 非空时（此时根据代码逻辑，`shared_count` 也必然非空），需要对引用数减一，并在引用数降到零时彻底删除对象和共享计数。原理就是这样，不复杂。

当然，我们还有些细节要处理。为了方便实现赋值（及其他一些惯用法），我们需要一个新的 swap 成员函数：

```cpp
  void swap(smart_ptr& rhs)
  {
    using std::swap;
    swap(ptr_, rhs.ptr_);
    swap(shared_count_,
         rhs.shared_count_);
  }
```

赋值函数可以跟前面一样，保持不变，但拷贝构造和移动构造函数是需要更新一下的：

```cpp
  smart_ptr(const smart_ptr& other)
  {
    ptr_ = other.ptr_;
    if (ptr_) {
      other.shared_count_
        ->add_count();
      shared_count_ =
        other.shared_count_;
    }
  }
  template <typename U>
  smart_ptr(const smart_ptr<U>& other)
  {
    ptr_ = other.ptr_;
    if (ptr_) {
      other.shared_count_
        ->add_count();
      shared_count_ =
        other.shared_count_;
    }
  }
  template <typename U>
  smart_ptr(smart_ptr<U>&& other)
  {
    ptr_ = other.ptr_;
    if (ptr_) {
      shared_count_ =
        other.shared_count_;
      other.ptr_ = nullptr;
    }
  }
```

除复制指针之外，对于拷贝构造的情况，我们需要在指针非空时把引用数加一，并复制共享计数的指针。对于移动构造的情况，我们不需要调整引用数，直接把 other.ptr_ 置为空，认为 other 不再指向该共享对象即可。

上面实现的代码会报错

错误原因是模板的各个实例间并不天然就有 friend 关系，因而不能互访私有成员 ptr_ 和 shared_count_。我们需要在 smart_ptr 的定义中显式声明：

```cpp
  template <typename U>
  friend class smart_ptr;
```

此外，我们之前的实现（类似于单一所有权的 unique_ptr ）中用 release 来手工释放所有权。在目前的引用计数实现中，它就不太合适了，应当删除。但我们要加一个对调试非常有用的函数，返回引用计数值。定义如下：

```cpp
  long use_count() const
  {
    if (ptr_) {
      return shared_count_
        ->get_count();
    } else {
      return 0;
    }
  }
```

### 完整的 smart_ptr 代码

```cpp

#include <utility>  // std::swap

class shared_count {
public:
  shared_count() noexcept
    : count_(1) {}
  void add_count() noexcept
  {
    ++count_;
  }
  long reduce_count() noexcept
  {
    return --count_;
  }
  long get_count() const noexcept
  {
    return count_;
  }

private:
  long count_;
};

template <typename T>
class smart_ptr {
public:
  template <typename U>
  friend class smart_ptr;

  explicit smart_ptr(T* ptr = nullptr)
    : ptr_(ptr)
  {
    if (ptr) {
      shared_count_ =
        new shared_count();
    }
  }
  ~smart_ptr()
  {
    if (ptr_ &&
      !shared_count_
         ->reduce_count()) {
      delete ptr_;
      delete shared_count_;
    }
  }

  smart_ptr(const smart_ptr& other)
  {
    ptr_ = other.ptr_;
    if (ptr_) {
      other.shared_count_
        ->add_count();
      shared_count_ =
        other.shared_count_;
    }
  }
  template <typename U>
  smart_ptr(const smart_ptr<U>& other) noexcept
  {
    ptr_ = other.ptr_;
    if (ptr_) {
      other.shared_count_->add_count();
      shared_count_ = other.shared_count_;
    }
  }
  template <typename U>
  smart_ptr(smart_ptr<U>&& other) noexcept
  {
    ptr_ = other.ptr_;
    if (ptr_) {
      shared_count_ =
        other.shared_count_;
      other.ptr_ = nullptr;
    }
  }
  template <typename U>
  smart_ptr(const smart_ptr<U>& other,
            T* ptr) noexcept
  {
    ptr_ = ptr;
    if (ptr_) {
      other.shared_count_
        ->add_count();
      shared_count_ =
        other.shared_count_;
    }
  }
  smart_ptr&
  operator=(smart_ptr rhs) noexcept
  {
    rhs.swap(*this);
    return *this;
  }

  T* get() const noexcept
  {
    return ptr_;
  }
  long use_count() const noexcept
  {
    if (ptr_) {
      return shared_count_
        ->get_count();
    } else {
      return 0;
    }
  }
  void swap(smart_ptr& rhs) noexcept
  {
    using std::swap;
    swap(ptr_, rhs.ptr_);
    swap(shared_count_,
         rhs.shared_count_);
  }

  T& operator*() const noexcept
  {
    return *ptr_;
  }
  T* operator->() const noexcept
  {
    return ptr_;
  }
  operator bool() const noexcept
  {
    return ptr_;
  }

private:
  T* ptr_;
  shared_count* shared_count_;
};

template <typename T>
void swap(smart_ptr<T>& lhs,
          smart_ptr<T>& rhs) noexcept
{
  lhs.swap(rhs);
}

template <typename T, typename U>
smart_ptr<T> static_pointer_cast(
  const smart_ptr<U>& other) noexcept
{
  T* ptr = static_cast<T*>(other.get());
  return smart_ptr<T>(other, ptr);
}

template <typename T, typename U>
smart_ptr<T> reinterpret_pointer_cast(
  const smart_ptr<U>& other) noexcept
{
  T* ptr = reinterpret_cast<T*>(other.get());
  return smart_ptr<T>(other, ptr);
}

template <typename T, typename U>
smart_ptr<T> const_pointer_cast(
  const smart_ptr<U>& other) noexcept
{
  T* ptr = const_cast<T*>(other.get());
  return smart_ptr<T>(other, ptr);
}

template <typename T, typename U>
smart_ptr<T> dynamic_pointer_cast(
  const smart_ptr<U>& other) noexcept
{
  T* ptr = dynamic_cast<T*>(other.get());
  return smart_ptr<T>(other, ptr);
}
```
