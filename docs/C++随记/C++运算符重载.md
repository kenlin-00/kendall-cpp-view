## 基本概念

C++语言的一个很有意思的特性就是除了支持函数重载外还支持运算符重载，原因就是在C++看来运算符也算是一种函数。比如一个`a + b` 的加法表达式也可以用函数的形式：`operator + (a, b)`来表达。这里的operator +代表的就是加法函数。高级语言中的表达式和数学表达式非常相似，在一定的程度上通过运算符来描述表达式会比通过函数来描述表达式更加利于理解和阅读。一般情况下在重载某个运算符的实现时最好要和运算符本身的数学表示意义相似，运算符函数和类的成员函数以及普通函数一样，同样可分为类运算符和普通运算符。要定义一个运算符函数总是按如下的格式来定义和申明:

```
返回类型 operator 运算符(参数类型1 [,参数类型2] [,参数类型3] [, 参数类型N]);
```
运算符重载需要在运算符前面加上关键字`operator`。一般情况下参数的个数不会超过2个，因为运算符大多只是一元或者二元运算，而只有函数运算符()以及`new`和`delete`这三个运算符才支持超过2个参数的情况。

- 可以被重载的运算符
```
双目运算符+  -  *  /  %
关系运算符==  !=  <  >  <=  >=
逻辑运算符||  &&  +
单目运算符+  -  *  &
自增自减运算符++  --
位运算符|  &  ~  ^  <<  >>
赋值运算符=  +=  -=  *=  /=  %=  &=  |=  ^=  <<=  >>=
空间申请和释放new  delete  new[]  delete[]
其他运算符()  ->  ->*  ,  []
```
如果可以被重载的运算符太多不好记忆，那我们可以直接记住不可以被重载的运算符
```
成员访问符 .
成员指针访问运算符 .*
域运算符 ::
长度运算符 sizeof	
条件运算符号 ?:
```

## 运算符重载的方式
首先来看一个问题：下面定义了一个复数类complex，然后用complex定义了2个复数，如何实现这2个复数的加法呢？
```js
#include <iostream>
using std::cout;
using std::endl;

//定义一个虚数类
class Complex {
public:
    Complex(double dreal, double diamg)
    :_dreal(dreal)
    ,_dimag(diamg)
    {
        cout << " Complex(double dreal, double diamg)" << endl;
    }
    void display() {
        cout << _dreal;
        if(_dimag > 0)
            cout << " + " << _dimag << "i" << endl;
        else if(_dimag < 0)
            cout << " - " << (-1) * _dimag << "i" << endl;
        else
            cout << endl;
    }

private:
    double _dreal;  //实部
    double _dimag;  //虚部
};
int main() {
    Complex c1(1,2);
    Complex c2(-3,-4);

    Complex c3 = c1 + c2;  //error
    return 0;
}
```
