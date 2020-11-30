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
我们尝试普通的数据类型一样直接进行相加：` Complex c3 = c1 + c2; `,但是很明显报错了。因为加法只针对内置类型起作用，c1,c2是我们自己定义的类型，因此不能直接相加。所以需要对其进行重载，重载一般都是以`operator`开头。

```js
int operator+(int x,int y) {
    return x - y;
}
```

执行报错：运算符重载时，参数的数据类型必须是必须是**类**或者**枚举类型**，不能是内置类型的数据。
```
$ g++ 7.complex.cpp 
7.complex.cpp:31:26: error: ‘int operator+(int, int)’ must have an argument of class or enumerated type
 int operator+(int x,int y) {
```

**运算符重载规则：**

- 重载操作符必须具有一个类类型或者是枚举类型的操作数        
`int operator+(int, int);//不能重载`
- 优先级和结合性是固定的        
操作符的优先级、结合性或操作数个数不能改变
`X == Y + Z;`
- 不再具备短路求值特性          
重载操作符并不保证操作数的求值顺序 ` &&` ` || `   ,
- 不能臆造并重载一个不存在的运算符，
如`@, #，$`等。


**运算符重载的方式分为下面3种：**

	1. 采用普通函数的重载形式

	2. 采用友元函数的重载形式

	3. 采用成员函数的重载形式

- 采用普通函数的重载形式

普通函数形式重载运算符，要求待操作的属性必须是`public`类型的。

```js
//普通函数重载
Complex operator+(const Complex & lhs,const Complex & rhs) {
    //这里不能直接通过.dreal获取，因为是private的，需要在累内部定义get，set方法。
    return Complex(lhs.getReal() + rhs.getReal(),
                    lhs.getImage() + rhs.getImage());
}

// 类内部定义get，set方法
double getReal() const {
    return _dreal;
}
double getImage() const {
    return _dimag;
}

//main函数
int main() {
    Complex c1(1,2);
    cout << "c1 = ";
    c1.display();
    Complex c2(-3,-4);
    cout << "c2 = ";
    c2.display();

    Complex c3 = c1 + c2;
    cout << "c3 = ";
    c3.display();
    return 0;
}

```
运行结果：
```
 Complex(double dreal, double diamg)
c1 = 1 + 2i
 Complex(double dreal, double diamg)
c2 = -3 - 4i
 Complex(double dreal, double diamg)
c3 = -2 - 2i
```

- 采用友元函数的重载形式

用成员函数重载双目运算符时，左操作数无须用参数输入，而是通过隐含的`this`指针传入，这种做法的效率比较高。      
此外，操作符还可重载为友元函数形式，这将没有隐含的参数`this`指针。对双目运算符，友元函数有2个参数，对单目运算符，友元函数有一个参数。       
重载为友元函数的运算符重载函数的声明格式为：    
`friend 返回类型operator 运算符 (参数表);`

```js
//声明友元函数
friend Complex operator+(const Complex &, const Complex &);

//友元函数进行重载
Complex operator+(const Complex & lhs,const Complex & rhs) {

    return Complex(lhs._dreal+ rhs._dreal,
                    lhs._dimag+ rhs._dimag);
}
```
运行结果和上面的一致。

- 采用成员函数的重载形式

成员函数形式的运算符声明和实现与成员函数类似，首先应当在类定义中声明该运算符，声明的具体形式为：        
返回类型  `operator` 运算符（参数列表）;  
   

```js
//成员函数的重载
Complex operator+(const Complex & rhs){   //成员函数第一个参数默认是this
    return Complex(_dreal + rhs._dreal , _dimag +  rhs._dimag);
}
```
既可以在类定义的同时定义运算符函数使其成为`inline`型，也可以在类定义之外定义运算符函数，但要使用作用域限定符“::”，类外定义的基本格式为：        
`返回类型  类名::operator 运算符（参数列表）
{
…
} ` 

```js
    //类内部对加法重载函数的声明
    Complex operator+(const Complex & rhs);

//重载加法函数的实现
Complex Complex::operator+(const Complex &rhs) {
    return  Complex(_dreal + rhs._dreal , _dimag +  rhs._dimag);
}
```

## 特殊运算符

### 下标运算符[]
下标运算符是个二元运算符，C++编译器将表达式
			`sz[x];`
     解释为
			`sz.operator[](z);`
一般情况下，下标运算符的重载函数原型如下：      
`返回类型& operator[ ](参数类型);`

下标运算符的重载函数只能有一个参数，不过该参数并没有类型限制，任何类型都可以，如果类中未重载下标运算符，编译器将会给出下标运算符的缺省定义，此时，参数必须是int型，并且要声明数组名才能使用下标变量，如     
            `computer com[3];`      
则`com[1]`等价于`com.operator[](1)`，如果`[]`中的参数类型非int型，或者非对象数组要使用下标运算符时，需要重载下标运算符`[]`。

下面实现表运算符`[]`:
```js
#include <string.h>
#include <iostream>
using std::cout;
using std::endl;

class CharArray {
public:
    CharArray(int size)
    :_size(size)
    ,_pdata(new char[_size]())
    {}

     char &operator[](size_t idx) {
        if(idx < _size) {
            return _pdata[idx];
        }else {
            static char nullchar = '\0';
            cout << "下标越界！！" << endl;
            return nullchar;
        }
    }
    size_t size() const {
        return _size;
    }
    ~CharArray() {
        delete [] _pdata;
    }

private:
    size_t  _size;
    char * _pdata;
};
int main() {
    const char * pstr = "hello,world";
    CharArray ca(strlen(pstr) +1);  //+1是存'\0'

    for(size_t idx = 0; idx != ca.size(); ++ idx) {
        ca[idx] = pstr[idx];
    }

    for(size_t idx=0;idx != ca.size();++idx) {
        cout << ca[idx] << endl;  //调用char &operator[](size_t idx)
    }
    return 0;
}
```

### 输入>>输出<<的重载
`>>`和`<<`运算符 **只能重载为友元函数形式**.     
因为成员函数的第一个参数默认是this，也就是其本身， 如果以成员函数形式重载输入输出流运算符，左操作数必然是对象本身，而输入输出流运算符左操作数要求是流对象，所以输入输出流运算符不能以成员函数形式进行重载。
```js
#include <iostream>
using namespace std;


class Complex
{
private:
    double imag;		//虚部
    double real;		//实部
public:
    Complex(double r=0.0,double i=0.0)	//构造函数
    {
        real=r;
        imag=i;
    }
    friend ostream& operator<<(ostream& ,Complex& );		//友元函数声明
    friend istream& operator>>(istream& ,Complex& );
};

ostream& operator<<(ostream& os,Complex& C1)			//对操作符<<的重载
{
    os<<C1.real<<"+i*"<<C1.imag<<endl;
    return os;
}

istream& operator>>(istream& is,Complex& C1)			//对操作符>>的重载
{
    is>>C1.real;
    while (is.get()!='*')
    {
        break;
    }
    is>>C1.imag;
    return is;
}

int main()
{
    Complex c1(2.5,3.1);
    cin>>c1;
    cout<<c1;
    return 0;
}
```
### 指针运算符->的重载     
箭头运算符必须是类的成员函数

指针运算符返回值必须是一个指针，或者是一个重载了箭头运算符的对象。
如果返回的是一个指针将调用内置的箭头运算符。执行相当于	        
	`(*(obj.operator->()).data;`

总的来说重载的箭头运算符就是为了改变从哪个对象中获取成员
```js
#include <iostream>
using std::cout;
using std::endl;

class Data {
public:
    Data()
    :_ix(10)
    {
        cout << "Data()" << endl;
    }
    int getX() const {
        return  _ix;
    }
    ~Data() {
        cout << "~Data()" << endl;
    }

private:
    int _ix;
};
//中间层
class MiddleLayer {
public:
    MiddleLayer()
    :_pdata(new Data)
    {
        cout << "MIddleLayer" << endl;
    }
    //指针运算符返回值是一个指针
    Data *operator->() {
        return _pdata;
    }

    ~MiddleLayer() {
        cout << "~MiddleLayer" << endl;
    }

private:
    Data * _pdata;
};
//第三层
class ThridLayer {
public:
    ThridLayer()
    :_pMiddleLayer(new MiddleLayer())
    {
        cout << "ThridLayer()" << endl;
    }
    //指针运算符返回一个重载了指针运算符的对象
    MiddleLayer &operator-> () {
        return * _pMiddleLayer;
    }
    ~ThridLayer() {
        cout << " ~ThridLayer()" << endl;
    }

private:
    MiddleLayer * _pMiddleLayer;
};

int main() {
    MiddleLayer m1;  //m1是一个对象
    cout << "m1调用的：" << m1->getX() << endl;   //调用Data *operator->()
    cout << (m1.operator->())->getX() << endl;

    cout << "--------" << endl;
    ThridLayer t1;
    cout << "--------" << endl;
    cout << "t1调用的：" << t1->getX() << endl;  //t1也可以一步到位
    cout << (t1.operator->().operator->())->getX() << endl;
    return 0;
}
```
运行结果：
```
Data()
MIddleLayer
m1调用的：10
10
--------
Data()
MIddleLayer
ThridLayer()
--------
t1调用的：10
10
 ~ThridLayer()
~MiddleLayer
```







