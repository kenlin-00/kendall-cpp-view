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