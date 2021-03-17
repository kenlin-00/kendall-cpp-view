## 1 怎么用程序判断一个系统是大端字节序还是小端字节序

- 高位字节在低地址，低位字节在高地址，*（从低到高）*大端字节序。
- 高位字节在高地址，低位字节在低地址，*（从高到低）*小端字节序。

思路：网络字节序是大端的，也就是高位字节先传输。而`int--char`的强制转换，是将低地址的数值强制赋给`char`，利用这个准则可以判断系统是大端序还是小端序.

```cpp
#include <iostream>
using namespace std;

int main() {
	
	int a = 0x1234;
	char c = static_cast<char>(a);  //强制转并赋值给c
	if(c == 0x12)
		 cout << "big endian" << endl;
	if(c == 0x34)
		cout << "little endian" << endl;

	return 0;
}
```

此外，**利用union函数也可以做出判断**

> 内联函数详细介绍参考：https://blog.csdn.net/hhmy77/article/details/104114080

`union`有一个特点，联合(union)变量的所有成员共享同一块存储区/内存，因此联合变量每个时刻里只能保存它的某一个成员的值。就是因为这个特点，`union`的长度就是它最大变量的长度。

```cpp
void test2() {
	union {
		char c;
		int n;
	}un;
	un.n = 0x01000002;
	//以十六进制输出
	printf("%X\n",un.c);
}
```
`un`的长度是4个字节，也就是最大成员n的长度，这一点可以用`sizeof`去验证。        
然后我们赋值给`un.n`令它的值是`0x010000002`，此时union的内存地址中只存有`un.n`的值，`un.c`并没有赋值，但是un.n和un.c的起始地址是一样的。      
我们用`printf`以`16`进制的格式输出`s.c`，这个时候就是s的起始地址的第一个字节的内容，在我的平台上输出结果是2，表示低地址存的是整数值的低位，那么我的平台字节序是小端表示的。

