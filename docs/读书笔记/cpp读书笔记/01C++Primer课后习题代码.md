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







