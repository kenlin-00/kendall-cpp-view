## 下厨房

[题目来源](https://www.nowcoder.com/practice/ca5c9ba9ebac4fd5ae9ba46114b0f476?tpId=182&tqId=34282&rp=1&ru=%2Fta%2Fexam-all&qru=%2Fta%2Fexam-all%2Fquestion-ranking&tab=answerKey)

```cpp
#include <iostream>
#include <set>  //不重复
#include <string>
using namespace std;

int main() {
    set<string> set_s;
    string s;
    while(cin >> s) {
        set_s.insert(s);  //插入
    }
    cout << set_s.size();
    return 0;
}
```

## 字符串排序

[题目来源](https://www.nowcoder.com/practice/0425aa0df74646209d3f56f627298ab2?tpId=131&tqId=33826&rp=1&ru=%2Fta%2Fexam-kuaishou&qru=%2Fta%2Fexam-kuaishou%2Fquestion-ranking&tab=answerKey)

> 熟悉使用字符串

```cpp
// 字符串转成数字
#include <string>     // std::string, std::stoi
std::stoi("100");

#include <stdlib.h>     /* atoi */
cout << atoi(str.c_str()) << endl;

//数字转成字符串
#include  <sstream>
#include  <string>
stringstream ss;
ss<<i;
string str = ss.str();

// 使用标准C语言将int类型转为字符串方法?为：
int a = 10;
char *intStr = itoa(a);
string s= string(intStr) ；  //char* 转为string
```

> `atoi()`的参数是 `const char*` ,因此对于一个字符串str我们必须调用 `c_str()`的方法把这个`string`转换成 `const char*`类型的,而`stoi()`的参数是`const string*`,不需要转化为 `const char*`；

```cpp
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n;
    cin >> n;
    string s;
    vector<int> vec;
   while(n--) {
       cin >> s;
       string temp = s.substr(s.length()-6,6);  //从第一个参数开始的n个字符串
       vec.push_back(stoi(temp));  //字符串转成int型
   }
    sort(vec.begin(),vec.end());
    //使用迭代器
    vector<int>::iterator ita = vec.begin();
    for(;ita!=vec.end();++ita) {
        cout << *ita << endl;
    }
    return 0;
}
```