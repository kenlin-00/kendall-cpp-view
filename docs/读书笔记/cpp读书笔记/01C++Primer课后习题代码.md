## 第六章

### 6.3 
```cpp
#include <iostream>
using namespace std;

int fact( int num) {
    int res = 1;
    while (num != 0) 
    {
        res *= num--;
    }
    return res;
    
}

int main() {

    int num;
    cin >> num;
    cout << "!" << num  << " = " << fact(num) << endl;
    return 0;
}

//5
// !5 = 120
```

### 6.4
```cpp
#include <iostream>
using namespace std;

int fact( int num) {
    if(num < 0) {
        return (-1) * num;
    }
    else return num;
}

int main() {

    int num;
    cin 
    cout << "|" << num  << "| = " << fact(num) << endl;
    return 0;
}

// -20
// |-20| = 20
```

### 6.6 6.7
```cpp
#include <iostream>
using namespace std;

int fact(int a) { //实参 局部变量
    
    //局部静态变量
    static int num;
    return ++num;
}

int main() {
    for(int i=0;i!=10;++i) {
        cout << fact(i) << " "; //形参
    }
    cout << endl;
    return 0;
}
//1 2 3 4 5 6 7 8 9 10 
```
### 6.8 6.9

在同一个文件夹下建立三个文件

- 01test.cpp 
```cpp
#include "Chapter6.h"

int main() {

    int num;
    cout << "please input a num: " ;
    cin >> num;
    cout << "!" << num  << " = " << fact(num) << endl;
    return 0;
}
```

- Chapter6.h 
```cpp
#include <iostream>
using namespace std;

int fact( int num);
```

- fact.cpp

```cpp
#include <iostream>
using namespace std;

int fact( int num) {
    int res = 1;
    while (num != 0) 
    {
        res *= num--;
    }
    return res; 
}
```

运行过程与结果

```
$ rm -rf a.out 
$ g++ -c 01test.cpp 
$ g++ -c fact.cpp 
$ g++ 01test.o fact.o -o main
$ ./main 
please input a num: 5
!5 = 120
```

### 6.10 6.11

```cpp
#include <iostream>
using namespace std;
void fact(int &a,int &b) {//函数的声明及定义，接受两个参数，需要以传址的方式传入(引用)
    int temp;
    temp = a;
    a = b;
    b = temp;
}

int main() {
    int a = 10,b = 20;
    cout << "交换前" << endl;
    cout << "a = " << a << endl;
    cout << "b = " << b << endl;
    fact(a,b);
    cout << "交换后" << endl;
    cout << "a = " << a << endl;
    cout << "b = " << b << endl;
    return 0;
}
```

### 6.12

> 6.10我使用的就是传地址的方式，C++中建议用传地址的方式区别于C语言

### 6.17

```cpp
#include <iostream>
#include <string>
using namespace std;

//判断是否有大写字母
void my_reset1(const string &str,bool &flag) {
    for(int i=0;i<str.size();++i) {
        if(str[i]>='A' && str[i] <= 'Z')
            flag = true;
    }
}
//将大写字母改成小写字母
void my_reset1(string &str) {
    for(int i=0;i<str.size();++i) {
        if(str[i]>='A' && str[i] <= 'Z')
            str[i] = str[i] + 32;
    }
}

int main() {
    string str = "Hello World";
    bool flag = false;
    my_reset1(str,flag);
    if(flag) {
        cout << "str中有大写字母" << endl;
    }
    else {
        cout << "str中没有大写字母" << endl;
    }
    my_reset1(str);
    cout << "str = " << str << endl;
    return 0;
}

//str中有大写字母
// str = hello world
```

### 6.21

```cpp
#include <iostream>
using namespace std;

int fact(int num1,int *num2) {
    if(num1>*num2) return num1;
    else return *num2;
}

int main() {
    int num1 = 10;
    int n = 2;
    int *num2 = &n;
    cout << fact(num1,num2) << endl;
    return 0;
}
```

### 6.22
```cpp
#include <iostream>
using namespace std;

void fact(int * &a,int * &b) {
    int *temp;
    temp = a;
    a = b;
    b = temp;
}
int main() {
    int a = 10,b = 20;
    int *pa = &a,*pb = &b;
    fact(pa,pb);
    cout << "a = " << *pa << endl;
    cout << "b = " << *pb << endl;
    return 0;
}
```

### 6.3

```cpp
#include <iostream>
#include <string>
using namespace std;

// 特殊点：使用argv中的实参时，一定要记得可选参数从argv[1]开始，argv[0]保存的是程序的名字。
int main(int argc,char **argv) {  //argc代表的是argv的个数
    string str;
    for(int i=1;i!=argc;++i) {
        str += argv[i];
    }
    cout << str << endl;
    return 0;
}
```

### 6.27
```cpp
#include <iostream>
#include <initializer_list>
using namespace std;

int sumFunc(initializer_list<int> list) {
    static int sum  = 0;
    for(auto i:list) {
        sum += i;
    }
    return sum;
}
int main(){

    initializer_list<int> ee{ 1,2,3,4 };
    cout << sumFunc(ee) << endl;

    return 0;
}
```


### 6.32

关于返回引用的例子
```cpp
#include <iostream>

using namespace std;

char &get_val(string &a,int x) {  //返回类型是非长隆引用
    return a[x];

}

int main() {
    string a = "hello";
    cout << a << endl;
    for(int i=0;i<a.size();++i) {
        get_val(a,i) =  get_val(a,i) - 32;
    }
    cout << a << endl;
    return 0;
}

//hello
// HELLO
```

### 6.33
```cpp

#include <iostream>
#include <vector>
using namespace std;

void get_val(const vector<int>  &vec,int ix) {
    if(ix < 0) {
        return ;
    }
    cout << vec[ix] << " ";
    get_val(vec,--ix);
}

int main() {
    vector<int> vec;
    for(int i=0;i<=10;++i){
        vec.push_back(i);
    }
    get_val(vec,vec.size()-1);
    cout <<endl;
    return 0;
}
```

### 6.34

```cpp
int (*func(int val))[10];//括号要对，并且维数必须标明
/************************************************************
     type (*function_name(parameter list))[dimension] 
逐层的理解：func(int i),名为func的函数有一个int型的参数i
  (*func(int i)),表明我们可以对函数返回的结果进行解引用操作
  (*func(int i))[10],表明对函数的解引用可以得到大小为10的数组
  int (*func(int i))[10],表示数组中的元素是int类型
************************************************************/

```

本题答案：
```cpp
string (&func(string (&arrStr)[10]))[10]
```

### 6.33

```cpp

using ArrT = string[10];
ArrT& func1(ArrT& arr);//使用类型别名
 
auto func2(ArrT& arr) -> string(&)[10]; //使用尾置返回类型
 
string arrS[10];
decltype(arrS)& func3(ArrT& arr);//使用decltype关键字

```

### 6.47

知识点1：预处理宏`assert(expr)：`包含一个表达式，`expr`为真时，`assert`什么也不做，为假时输出信息并终止程序。包含在`cassert`头文件中。通常用于检查不能发生的条件

知识点2：`assert`依赖于一个`NDEBUG`的预处理变量的状态，如果定义了`NDEBUG`，`assert`什么也不做，默认状态下`NDEBUG`是未定义的。编译器也可以预先定义该变量。

知识点3：也可以使用`NDEBUG`编写自己的条件调试代码，如果`NDEBUG`未定义，将执行`#ifndef`到`#endif之`间的代码，如果定义了`NDEBUG`，这些代码将被忽略。


```cpp
#include <iostream>
#include <vector>
using namespace std;

// #define NDEBUG

void get_val(const vector<int>  &vec,int ix) {
#ifndef NDEBUG
    cout << "func_name" << __func__ << endl;
    cout << "line:" << __LINE__<< endl;
    cout << "vec ix: " << ix << endl;

#endif
    if(ix < 0) {
        return ;
    }
    cout << vec[ix] << " ";
    get_val(vec,--ix);
}

int main() {
    vector<int> vec;
    for(int i=0;i<=10;++i){
        vec.push_back(i);
    }
    get_val(vec,vec.size()-1);
    cout <<endl;
    return 0;
}
```

### 6.49
```cpp
#include <iostream>
using namespace std;

void f() {
    cout << "f() " << endl;
}
void f(int a) {
    cout << "f(int a) " << endl;
}
void f(int a,int b) {
    cout << "f(int a,int b) " << endl;
}
void f(double d1,double d2) {
    cout << "f(double d1,double d2) " << endl;
}

int main() {
    // f(2.56,42); //call to 'f' is ambiguous
    f(42);  //f(int a) 
    f(42,0);//f(int a,int b) 
    f(2.56,4.14);  //f(double d1,double d2) 

    return 0;
}
```

### 6.54

函数指针指向的是函数并非对象。想要声明一个指向函数的指针只要用指针替代函数名即可

```cpp
bool (*pf) (const string &.const string &);
```

如果我们把一个函数名当做一个值来使用，那么这个函数自动转化成指针。

给指针赋予nullptr或者0时，指针不指向任何函数。

虽然不能返回一个函数，但是可以返回一个指向函数的指针。
```cpp
int (*f(int))(int,int);
//f有形参列表，f是个函数，f的返回值为指针，指针本身又有参数列表，因此指针指向的是函数，该函数的类型为int
```

```cpp
#include <iostream>
#include <vector>
using namespace std;


int intFunc(int a,int b){
    return a+b;
}
int main() {
    typedef int(*pInfFunc)(int,int);  //只是把指针替换了函数名
    //声明函数指针，未初始化,pInfFunc为指向函数的指针。使用typedef的声明语句定义的不再是变量而是类型别名
	//就是将变量转化为类型别名的一种方式，pInfFunc原来是指向函数的指针变量，
    //现在变成了指向函数的指针变量的类型别名
    vector<pInfFunc> a;
    return 0;
}
```

### 6.55 6.56

```cpp
#include <iostream>
#include<string>
#include<vector>
using namespace std;
 
int add(int a, int b)
{
	return a+b;
}
int subtract(int a, int b) { return a - b; }
int multiply(int a, int b) { return a * b; }
int divide(int a, int b) { return b != 0 ? a / b : 0; }//声明定义函数
 
int main(int argc, char** argv)
{
	typedef int(*p)(int a, int b);	//声明函数指针，未初始化,p为指向函数的指针。
    //使用typedef的声明语句定义的不再是变量而是类型别名
	//就是将变量转化为类型别名的一种方式，p原来是指向函数的指针变量，现在变成了指向函数的指针变量的类型别名
	vector<p> vec{add, subtract, multiply, divide};//vector初始化的C++11新特性
	for (auto f : vec)
		cout << f(2, 2) <<endl;
	return 0;
}
```

-------
-------

## 第七章
### 7.1 
```cpp
#include <iostream>
#include <string>
using namespace std;

//使用类定义
class Students1 {
    //构造函数
    Students1(string name,int age,int score);

    void showStu() {
        cout << "name = " << _name << " age = " << _age << " score = " << _score << endl;
    }
    string _name;
    int _age;
    int _score;
//上面默认是private
public:
private:
protected:
};
Students1::Students1(string name,int age,int score):_name(name),_age(age),_score(score) { }

//使用strcut定义
struct Students2 {
    //构造函数
    Students2(string name,int age,int score);

    void showStu() {
        cout << "name = " << _name << " age = " << _age << " score = " << _score << endl;
    }
    string _name;
    int _age;
    int _score;
//上面默认是public
public:
private:
protected:
};
Students2::Students2(string name,int age,int score):_name(name),_age(age),_score(score) { }

int main() {

    // Students1 stu1("kendall",20,100); //错误，虽然已声明，但是不可访问。成员没有限定public,默认都是private，外部不可访问
    Students2 stu2("kendall",20,100);

    stu2.showStu();
    return 0;
}
```

此题答案：

```cpp
#include <iostream>
#include<string>
#include<vector>
using namespace std;
struct Sales_data {
	Sales_data();
	string bookNo;
	unsigned units_sold ;
	double revenue ;//类内部的变量成员不允许在定义时初始化，必须使用构造函数
};
Sales_data::Sales_data()
{
	units_sold = 0;
	revenue = 0.0;
}
 
int main(int argc, char **argv)
{
	Sales_data total;//此部分和第一章21页的内容相同
	if (cin >> total.bookNo >> total.units_sold >> total.revenue) {
		Sales_data trans;
		while (cin >> trans.bookNo >> trans.units_sold >> trans.revenue) {
			if (total.bookNo == trans.bookNo) {
				total.units_sold += trans.units_sold;
				total.revenue += trans.revenue;//第三题的使用修改之处
			}
			else {
				cout << total.bookNo << " " << total.units_sold << " "
					<< total.revenue << endl;
				total = trans;
			}
		}
		cout << total.bookNo << " " << total.units_sold << " " << total.revenue
			<< endl;
	}
	else {
		std::cerr << "No data?!" << std::endl;
		return -1;
	}
	return 0;
}
```

### 7.4

```cpp
#include <iostream>
#include <string>
using namespace std;

class Person {
public:
    Person(string name,string addr)
    :_name(name)
    ,_addr(addr)
    {}
    Person();
    const string& getName() const {
        return _name;
    }
    const string& getAddr() const {
        return _addr;
    }
private:
    string _name;
    string _addr;
};
```

### 7.9

```cpp
#include <iostream>
#include <string>
using namespace std;

class Person {
public:
    Person(string name,string addr)
    :_name(name)
    ,_addr(addr)
    {}
    Person();
    // Person() = default; //或者这样写

    const string& getName() const {
        return _name;
    }
    const string& getAddr() const {
        return _addr;
    }
    void showPerson() {
        cout << "name = " << getName() << " address = " << getAddr() << endl;
    }

private:
    string _name;
    string _addr;
};

int main() {

    Person p1("kendall","Beijing");
    p1.showPerson();
    return 0;
}
```

### 7.15 

> 见7.4

### 7.23 7.24

```cpp
#include <iostream>
#include <string>
using  namespace std;

class Screen {
    using pos = string::size_type;
    //默认构造函数
    Screen()= default;

    Screen(pos width,pos height,char ch):_width(width),_height(height),_contents(width * height,ch)  //ch初始化窗口的内容
    {

    }
    char get() const {
        return _contents[_cursor];
    }

    char get(pos r,pos c) const {
        return _contents[r + _width + c];
    }

private:
    pos _cursor = 0;
    pos _height = 0,_width = 0;
    string _contents;
};
```

## 第九章

### 9.4
```cpp
#include <iostream>
#include <string>
#include <vector>
using namespace std;

bool findInt(vector<int>::iterator a ,vector<int>::iterator b ,int const target) {
    for(;a!=b;a++) {
        if(*a == target) return true;
    }
    return false;
}

int main() {
    vector<int> vec;
    int num = 9;
    for(int i=0;i<10;++i) {
        vec.push_back(i);
    }

    if(findInt(vec.begin(),vec.end(),num)) {
        cout << num << " in vec" << endl;
    }
    else {
        cout << num << " not in vec" << endl;
    }
    return 0;
}
```

### 9.5
```cpp
#include <iostream>
#include <string>
#include <vector>
using namespace std;

vector<int>::iterator findInt(vector<int>::iterator a ,vector<int>::iterator b ,int const target) {
    for(;a!=b;a++) {
        if(*a == target) return a;
    }
    return b;
}

int main() {
    vector<int> vec;
    int num = 9;
    for(int i=0;i<10;++i) {
        vec.push_back(i);
    }

    if(findInt(vec.begin(),vec.end(),num) != vec.end()) {
        cout << num << " in vec" << endl;
    }
    else {
        cout << num << " not in vec" << endl;
    }
    return 0;
}
```

### 9.11
```cpp
vector<int> vec;  //0
vector<int> vec(10);  //0
vector<int> vec(10,1);  //1
vector<int> vec{1,2,3,4};
vector<int> vec{other_vec};
vector<int> vec(other_vec.begin(),other_vec.end());
```

### 9.13

```cpp
#include <iostream>
#include <vector>
#include <list>
using namespace std;

int main() {

    list<int> list1(10,1);
    vector<int> vec2(10,2);

    //初始化
    vector<double> dvec1(list1.begin(),list1.end());
    vector<double> dvec2(vec2.begin(),vec2.end());

    //验证
    vector<double>::iterator d1 = dvec1.begin();
    vector<double>::iterator d2 = dvec2.begin();

    for(;d1!=dvec1.end();++d1) {
        cout << *d1 << " ";
    }
    cout << endl;
    for(;d2!=dvec2.end();++d2) {
        cout << *d2 << " ";
    }
    cout << endl;
    return 0;
}
```

### 9.13
```cpp
#include <iostream>
#include <string>
#include <vector>
#include <list>
using namespace std;

int main() {

    list<const char *> list(10,"hello world");
    vector<string>  vec;
    vec.assign(list.begin(),list.end());
    for(auto a: vec) {
        cout << a << endl;
    }
    cout << endl;
    return 0;
}
```

### 9.16
```cpp
#include <iostream>
#include <string>
#include <vector>
#include <list>
using namespace std;

int main() {

    vector<int> vec1{1,2,3,4,5,5};
    vector<int> vec2{1,2,4,4,5};
    if(vec1 == vec2) {
        cout << "vec1 = vec2" << endl;
    }
    else {
        cout << "vec1 != vec2" << endl;
    }
    return 0;
}
```

### 9.16
```cpp
#include <iostream>
#include <string>
#include <vector>
#include <list>
using namespace std;

int main() {
    list<int> list{1,2,4,4,5,};
    // 将list转成vector
    vector<int> listVec(list.begin(),list.end());
    vector<int> vec{1,2,4,4,5};
    if(listVec == vec) {
        cout << "listVec = vec" << endl;
    }
    else {
        cout << "listVec != vec" << endl;
    }
    return 0;
}
```

### 9.18
```cpp
#include <iostream>
#include <string>
#include <vector>
#include <list>
#include <queue>
using namespace std;

int main() {
    string word;
    deque<string> que;
    while ( cin >> word) {
        if(word == "0") break;
        que.push_back(word);
    }
    deque<string>::iterator a = que.begin();
    for(;a!=que.end();++a) {
        cout << *a << " ";
    }
    cout << endl;
    return 0;
}
```

### 9.19

改变类型就可以了
```cpp
#include <iostream>
#include <string>
#include <vector>
#include <list>
#include <queue>
using namespace std;

int main() {
    string word;
    list<string> que;
    while ( cin >> word) {
        if(word == "0") break;
        que.push_back(word);
    }
    list<string>::iterator a = que.begin();
    for(;a!=que.end();++a) {
        cout << *a << " ";
    }
    cout << endl;
    return 0;
}
```

### 9.20

```cpp
#include <iostream>
#include <vector>
#include <deque>
#include <list>

using namespace std;

int main() {

    list<int> li{1,2,3,4,5,6,7,8,9};
    deque<int> que1;
    deque<int> que2;
    list<int>::iterator a = li.begin();
    for(;a!=li.end();++a) {
        if((*a) % 2 == 0) {
            que1.push_back(*a);
        }
        else {
            que2.push_back(*a);
        }
    }
    for(auto q: que1) {
        cout << q << endl;
    }
    cout << "------------- " << endl;
    for(auto q:que2) {
        cout << q << endl;
    }
    
    
    return 0;
}
```

### 9.24
```cpp
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> vec{1,2,3};
    cout << vec.at(0) << endl;
    cout << vec[0] << endl;
    cout << vec.front() << endl;
    cout << *(vec.begin()) << endl;
    
    return 0;
}
```

### 9.26
```cpp
#include<iostream>
#include<fstream>
#include<sstream>
#include<string>
#include<vector>
#include<list>
using namespace std;
 
int main(int argc, char**argv)
{
	int ia[] ={0,1,1,2,3,5,8,13,21,55,89};
	
	vector<int> vec1(ia,ia+9);//拷贝操作
	list<int> list1(ia,ia+9);
 
	vector<int>::iterator it1 = vec1.begin();//使用迭代器
	list<int>::iterator it2 = list1.begin();
 
	while (it1 != vec1.end())//删除操作
	{
		if ((*it1)%2 == 0)
		{
			it1 = vec1.erase(it1);//将删除位置更新
		}
		else//若判断非偶数，则移到下一位置
		{
			++it1;
		}
	}
 
	while (it2 != list1.end())
	{
		if (*it2%2 != 0)
		{
			it2 = list1.erase(it2);//将删除位置更新
		}
		else//若判断非偶数，则移到下一位置
		{
			++it2;
		}
	}
	
	//验证结果
	vector<int>::iterator it3 = vec1.begin();//需要重新定义临时迭代器
	list<int>::iterator it4 = list1.begin();
	for (it3;it3 != vec1.end(); ++it3)
	{
		cout<<*it3<<" ";
	}
	cout<<endl;
	for (it4;it4 != list1.end(); ++it4)
	{
		cout<<*it4<<" ";
	}
	
	return 0;
}
```

## 第十章

### 10.1 
```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> vec{1,2,3,4,5,9,6,7,8,9,9};
    int val = 9;
    cout << "count = " << count(vec.begin(),vec.end(),val) << endl;;
    return 0;
}
```

### 10.2
```cpp
#include <iostream>
#include <vector>
#include <list>
#include <algorithm>
using namespace std;

int main() {
    list<string> vec{"hello","hello","hello","hello","good","kendall"};
    string val = "hello";
    cout << "count = " << count(vec.begin(),vec.end(),val) << endl;;
    return 0;
}
```

### 10.3
```cpp
#include <iostream>
#include <vector>
#include <list>
#include <algorithm>
#include <numeric>
using namespace std;

int main() {
    vector<int> vec{1,2,3,4,5,6,7,8,9,10};
    int sum = accumulate(vec.begin(),vec.end(),0);
    cout<< sum << endl;
    return 0;
}
```

### 10.4

会将`double`转成`int`,损失精度

```cpp
#include <iostream>
#include <vector>
#include <list>
#include <algorithm>
#include <numeric>
using namespace std;

int main() {
    vector<double> vec{1.1,2.2,3.3,4.4};
    auto sum = accumulate(vec.begin(),vec.end(),0);
    cout << sum << endl;
    return 0;
}
```

### 10.6
```cpp
#include <iostream>
#include <vector>
#include <list>
#include <algorithm>
#include <numeric>
using namespace std;

int main() {
    int a[10] = {0,1,2,3,4,5,6,7,8,9};
    vector<int> vec(a,a+10);
	cout<<"修改前：";
	for(int i = 0; i<10 ;++i)
	{
		cout<<vec[i];
    }
    cout << endl;
    fill_n(vec.begin(),vec.size(),0) ;
	cout<<"修改后：";
	for(int i = 0; i<10 ;++i)
	{
		cout<<vec[i];
    }
    cout << endl;
    return 0;
}
```
### 10.9

```cpp
#include <iostream>
#include <vector>
#include <list>
#include <algorithm>
#include <numeric>
using namespace std;

int main() {

    vector<int> vec{1,2,34,3,1,4,4,4,4,4,2,34,44,34,2};
    for(int i = 0; i<vec.size() ;++i)
	{
		cout<<vec[i] << " " ;
    }
    cout << endl;
    vector<int>::iterator end_unique = unique(vec.begin(),vec.end());
    for(int i = 0; i<vec.size() ;++i)
	{
		cout<<vec[i] << " ";
    }
    cout << endl;
    vec.erase(end_unique,vec.end());
    for(int i = 0; i<vec.size() ;++i)
	{
		cout<<vec[i] << " ";
    }
    cout << endl;
    return 0;
}
```
结果：
```
1 2 34 3 1 4 4 4 4 4 2 34 44 34 2 
1 2 34 3 1 4 2 34 44 34 2 34 44 34 2 
1 2 34 3 1 4 2 34 44 34 2 
```

### 10.11
```cpp
#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <numeric>
using namespace std;

bool isSorter(const string &s1,const string &s2) {
    return s1.size() < s2.size();
}
void elimDups(vector<string> &s) {
    cout << "排序前：";
    for(int i=0;i<s.size();++i) {
        cout << s[i] << " ";
    }
    cout << endl << "排序后：" ;
    sort(s.begin(),s.end());
    for(int i=0;i<s.size();++i) {
        cout << s[i] << " ";
    }
    cout << endl ;

    //使用unique删除
    auto end_unique = unique(s.begin(),s.end());
    cout << endl << "unique后：" ;
    for(int i=0;i<s.size();++i) {
        cout << s[i] << " ";
    }
    cout << endl ;
    //使用erase删除
    s.erase(end_unique,s.end());
    cout << endl << "erase删除后：" ;
    for(int i=0;i<s.size();++i) {
        cout << s[i] << " ";
    }
    cout << endl;
}
int main() {
    vector<string> vec{"kendall","C++","primer","primer","kendall","kendall","kendall"};
    elimDups(vec);
    cout << endl << "stable_sort删除后：" ;
    stable_sort(vec.begin(),vec.end(),isSorter);  //先按照字典排序再按照长度排序
    for(int i=0;i<vec.size();++i) {
        cout << vec[i] << " ";
    }
    cout << endl;
    return 0;
}
```
结果：
```cpp
排序前：kendall C++ primer primer kendall kendall kendall 
排序后：C++ kendall kendall kendall kendall primer primer 

unique后：C++ kendall primer kendall kendall  primer 

erase删除后：C++ kendall primer 

stable_sort删除后：C++ primer kendall 
```

### 10.13
```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
using namespace std;

bool compareIsbn(const string &s) {
    if(s.size() > 5) {
        return true;
    }
    else {
        return false;
    }
}
int main() {

    string a[10] = {"diuwudh","udh","diudh","wudh","diuwu","h","diuw","diuwudhg257","h","d"};
    vector<string> vec1(a,a+10);
    vector<string>::iterator it1 = vec1.begin();
    vector<string>::iterator it2;
    it2 = partition(vec1.begin(),vec1.end(),compareIsbn); //排序
    cout<<"排序后的vector中大于5的元素:";
	for(; it1 != it2; ++it1)
	{
		cout<<*it1<<" ";
	}
    cout << endl;
    return 0;
}
```

### 10.14

上一题中使用`lambda`表达式
```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
using namespace std;

int main() {

    string a[10] = {"diuwudh","udh","diudh","wudh","diuwu","h","diuw","diuwudhg257","h","d"};
    vector<string> vec1(a,a+10);
    vector<string>::iterator it1 = vec1.begin();
    vector<string>::iterator it2;
    // it2 = partition(vec1.begin(),vec1.end(),compareIsbn); //排序
    it2 = partition(vec1.begin(),vec1.end(),[](const string &s){return s.size() > 5 ; });
    cout<<"排序后的vector中大于5的元素:";
	for(; it1 != it2; ++it1)
	{
		cout<<*it1<<" ";
	}
    cout << endl;
    return 0;
}
```

本题题解：
```cpp
[](int &a,int &b){cout<<a+b;}
```

### 10.15
```
[a](const int &b){return a+ b;}
```

### 10.16
```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
using namespace std;

void elimDups(vector<string> &s) {
    sort(s.begin(),s.end());
    auto end_unique = unique(s.begin(),s.end()); //unique排序
    s.erase(end_unique,s.end());
}
void biggies(vector<string> &word,vector<string>::size_type sz) {
    elimDups(word);  //字典排序，删除重复
    //按照长度排序
    stable_sort(word.begin(),word.end(),[](const string &a,const string &b){return a.size() > b.size() ;});
    //排序后大于sz的数
    vector<string>::iterator it1 = partition(word.begin(),word.end(),[sz](const string &s){return s.size() <=sz;});
    for(;it1!=word.end();++it1) {
        cout << *it1 << " ";
    }
}

int main() {
    string a[10] = {"diuwudh","udh","diudh","wudh","diuwu","h","diuw","diuwudhg257","h","d"};
	vector<string> vec1(a,a+10);//利用数组初始化vector
	biggies(vec1,4);//找出长度大于4的字符串
    cout << endl;
    return 0;
}   
```

### 10.19
```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
using namespace std;

void elimDups(vector<string> &s) {
    sort(s.begin(),s.end());
    auto end_unique = unique(s.begin(),s.end()); //unique排序
    s.erase(end_unique,s.end());
}
void biggies(vector<string> &word,vector<string>::size_type sz) {
    elimDups(word);  //字典排序，删除重复
    //按照长度排序
    stable_sort(word.begin(),word.end(),[](const string &a,const string &b){return a.size() > b.size() ;});
    //排序后大于sz的数
    // vector<string>::iterator it1 = partition(word.begin(),word.end(),[sz](const string &s){return s.size() <=sz;});
    auto it1 = stable_partition(word.begin(),word.end(),[sz](const string & s){return s.size() <= sz;});
    for(;it1!=word.end();++it1) {
        cout << *it1 << " ";
    }
}

int main() {
    string a[10] = {"diuwudh","udh","diudh","wudh","diuwu","h","diuw","diuwudhg257","h","d"};
	vector<string> vec1(a,a+10);//利用数组初始化vector
	biggies(vec1,4);//找出长度大于4的字符串
    cout << endl;
    return 0;
}   
```

### 10.20
```cpp
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <numeric>
using namespace std;

int main() {
	string a[10] = {"diuwudh","udh","dewiudh","wudh","diutrwu","h","diuw","diuwudhg257","h","d"};
    vector<string> vec(a,a+10);
    cout << "长度大于6的字符串有" << count_if(vec.begin(),vec.end(),[](const string &s){return s.size() > 6;});
    cout << endl;
    return 0;
}
```

### 10.21
```cpp
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <numeric>
using namespace std;
int main() {
    int i = 10;
    auto f = [&i]()->bool {
        if(i==0) {
            return true;
        }else{
            --i;
            return false;
        }
    };//引用捕获、尾置返回类型
    int j = f();
    cout << j << endl;
    return 0;
}
```