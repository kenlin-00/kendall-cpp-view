在程序开发中，我们有时候需要定义一个值不能被改变的变量，就可以使用`const`来定义。
> const名叫常量限定符，用来限定特定变量，以通知编译器该变量是不可修改的。习惯性的使用const，可以避免在函数中对某些不应修改的变量造成可能的改动。

## const 修饰一般的变量

**const修饰的变量必须初始化**，原因是不能给const对象在初始化后赋值。非const对象默认是extern的，可以在多个文件间共享，而const对象则被认为是文件的**局部变量**。
```js
//    const int num1;  //error const定义的常量必须被初始化
    const int num2 = 100;
    num2 = 200;   //error
```

## const 修饰指针

> `*` 放在`const`**前面**说明指针是一个常量，是指**这个指针的指向(存的地址)不能变**，指针指向的值不能变     
> `*` 放在`const`**后面**说明指针指向的值是一个常量，是指**这个指针的指向的值不能变**，指针的指向(存的地址)能改变
```js
    int num1 = 10;
    int num2 = 20;

    const int  * pc1 = &num1; //* 在const之后，指针指向的值不变，地址可变
    pc1 = &num2;
    // *pc1 = 30; //error

    int * const pc2 = &num1;//* 在const之前，指针指向的值可变，地址不可变
    // pc2 = &num2;   //error
    *pc2 = num2;

    const int * pc3 = &num1;  //两者都不可变
```

其实可以直接谈`顶层const`和`底层const`。

> **顶层const**: 本身的值（地址）不变           
> **底层const**： 本身指向的值不变，允许改变值（或地址）
```js
int main(){
    int num = 0;
    int *const p = &num; // 顶层const
    const int var = 1; // 顶层const
    const int *ptr = &var; // 底层const
    const int *const lptr = ptr; // 第一个const为底层const，第二个const为顶层const
    cout << "num: " << num << "       *ptr = " << *ptr << "       var = " << var << endl;
    return 0;
}
```
其实判断也很简单，主要看`const`修饰的目标
```js
const int var = 1; // const修饰的是int变量, var的值不能变,所以是顶层const
int *const p = &a; // const修饰的是p这个指针变量, p的值不能变, 但p所指向的int变量,所以是顶层const
```

## const的引用

可以把引用绑定到const对象上，就像绑定到其他对象上一样，称之为**常量的引用**，但是不能修改绑定的对象。
```js
    const int cnum1 = 100;
    const int &c1 = cnum1;   //正确，引用及其对象的对象都是常量
//    c1 = 10;              //error  r1是对常量的引用
//    int &c2 = cnum1;      //error 不能让一个非常量引用指向一个常量对象
```

## const修饰函数参数

使用const修饰函数参数，可以防止传入引用或指针改变原来的实参值。
```js
void func(const int i){};  //func可以读取i，但是不能向i写值
```

```js
int func(const int &a) {
//    a = 10; //error
    int b = a;
    b = 20;
//    int &c = a;  //error 
//    c = 30;      //不能通过应用c修改a的值
}
int main(){
    int a = 10;
    func(a);
    cout << a << endl;
    return 0;
}
```
> 是否应将`void Func(int x)` 改写为`void Func(const int &x)`，以便提高效率？完全没有必要，因为内部数据类型的参数不存在构造、析构的过程，而复制也非常快，“值传递”和“引用传递”的效率几乎相当。
> - 对于非内部数据类型的输入参数，应该将“值传递”的方式改为“const 引用传递”，目的是提高效率。例如将`void Func(A a)` 改为`void Func(const A &a)`。
> - 对于内部数据类型的输入参数，不要将“值传递”的方式改为“`const` 引用传递”。否则既达不到提高效率的目的，又降低了函数的可理解性。例如`void Func(int x)` 不应该改为`void Func(const int &x)`。

备注：          
*内部数据类型是编译器本来就认识的，不需要用户自己定义*           
*非内部数据类型不是编译器本来就认识的，需要用户自己定义才能让编译器识别*

*运算符使用是否正确，编译器在编译扫描分析时就可以判定*                
*库函数是已编译的代码，编译器不会编译检查，由链接器将库同用户写的代码合成exe文件*

## 用const修饰函数的返回值

### const 修饰函数返回值（返回指针）

如果给以“指针传递”方式的函数返回值加 `const` 修饰，那么函数返回值（即指针）的内容不能被修改，该返回值只能被赋给加`const` 修饰的同类型指针。

例如:
```js
const char *getString() {
    return "a";
}

int main() {
//    char *str = getString();  //error
    const char *str = getString();  //正确   //str存的地址能变，str指向的值不能变
    cout << str << endl;    //a
    return 0;
}
```

### const 用于修饰“返回引用”函数的返回值

如果函数返回值采用“值传递方式”，由于函数会把返回值复制到外部临时的存储单元中，加`const`修饰没有任何价值。例如把函数`int GetInt(void)` 写成`const int GetInt(void)`是没有意义的。

如果返回值不是内部数据类型，将函数`MyClass GetObj(void) `改写为`const Myclass & GetObj(void)`的确能提高效率。但此时千万千万要小心，一定要搞清楚函数究竟是想返回一个对象的“拷贝”还是仅返回“别名”就可以了，否则程序会出错。

这里对函数返回值使用 `const` 的目的在于限制不能将函数调用表达式作为左值使用。例如有如下函数：
```
int & min ( int &i, int &j);
```
可以对函数调用进行赋值，因为它返回的是左值： `min ( a , b )=4;`

但是，如果对函数的返回值限定为 `const` 的，即：
```
const int & min ( int & i, int &j );
```

那么，就不能对 `min ( a, b )` 调用进行赋值了。

事实上，函数返回值采用“引用传递”的场合并不多，这种方式一般只出现在类的赋值函数中，目的是为了实现链式表达。

```js
class A

{

    A &amp; 
    operate = (const A &amp; other); // 赋值函数

} ;

A a, b, c; // a, b, c 为A 的对象

a = b = c; // 正常的链式赋值

(a = b) = c; // 不正常的链式赋值，但合法
```

小结：

- 修饰内置类型的返回值时, 加`const`没有意义
- 修饰自定义类型的返回值时, 此时的返回值不能作为左值使用, 既不能被赋值, 也不能被修改
- 修饰指针或引用的返回值时, 取决于我们想让用户干什么


>后期更新(学习对象后来补全)
> https://www.toutiao.com/i6644404128439075332/
> https://www.jianshu.com/p/4c5ef15c3326