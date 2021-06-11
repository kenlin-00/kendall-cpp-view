

- [类对象所占用的内存](#类对象所占用的内存)

--------

## 类对象所占用的内存

```cpp
class A {
public:
};

int main() {
    A a;
    cout << sizeof(a) << endl; // 1
    return 0;
}
```
一个空类 `sizeof(a)` 的结果是 1。因为对象是有地址的。内存中的一个地址单元**里面存的是 1 个字节的内容**

```cpp
class A {
public:
    void func1();
    void func2();
    
};

int main() {
    A a;
    cout << sizeof(a) << endl; // 1
    return 0;
}
```

类中的成员函数是不占用类对象内存空间的。

```cpp
class A {
public:
    int a = 1;
    void func1();
    void func2();
    
};

int main() {
    A a;
    cout << sizeof(a) << endl; // 4
    return 0;
}
````

成员变量是包含在每个对象中，占字节的

```cpp
class A {
public:
    int a = 1;
    void func1() {
        int a = 2;
    }
    void func2();
    
};

int main() {
    A a;
    cout << sizeof(a) << endl; // 4
    return 0;
}
```

成员函数不占类对象的字节空间

```cpp
class A {
public:
    virtual void fun3();
    
};

int main() {
    cout << sizeof(A) << endl; // 8
    return 0;
}
```

类中如果有一个虚函数，对象的 sizeof 会增加 4 个字节，因为这个类会有一个指向虚函数的指针。（但是我在 Linux 和 MacBook 测试是 8）

> 注意： sizeof(a)的返回值是一个无符号整数十进制的值，即 unsigned_int, 并不是 int 类型

静态成员变量不计算在对象的 sizeof 内



