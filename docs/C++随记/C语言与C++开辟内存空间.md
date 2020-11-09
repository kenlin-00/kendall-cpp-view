## C语言中开辟内存空间

```js
void test0() {
    int * p = (int *)malloc(sizeof(int)); //开辟堆空间
    *p = 10;
    cout << *p << endl;

//    开辟一个数组空间
    int *p2 = (int *)malloc(sizeof(int) * 10);
    for(int idx=0;idx<10;idx++)
        p2[idx] = idx;

    //释放空间
    free(p);
    free(p2);
}
```

## C++中开辟内存空间

```js
void test1() {
    int *p1 = new int(11);
    cout << *p1 << endl;

    //开辟数组空间
    int *p2 = new int[10]();
    for(int idx = 0; idx < 10; ++idx)
        p2[idx] = idx;
    // 释放空间
    delete p1;
    delete [] p2;
}
```

**`malloc/free`与`new/delete`的差别是什么?**

- 1. malloc/free是标准库函数, new/delete 是表达式
- 2. malloc只负责开辟空间，但并不会进行初始化;          
    new表达式开辟空间之后，也会进行初始化