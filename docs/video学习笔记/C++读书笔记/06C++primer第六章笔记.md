## 第六章
### 含有可变参数的函数

C++11新标准提供两种主要的方法：
- 如果所有实参类型相同，可以传递一个名为`initializer_list`的标准库类型
- 如果所有参数类型不同，编写一个可变参数模板函数

`initializer_list` 是一个模板类型，必须说明列表中所含元素的类型。`initializer_list` **对象中的元素永远是常量值**
```js
initializer_list<string> ls;  //initializer_list 的元素类型是string
initializer_list<int> li;     //initializer_list的元素类型是int
```

