<font color="green" size=4>更多读书笔记关注公众号:**零K同学**</font>



- [STL的介绍](#stl的介绍)
- [STL中hashTable的实现](#stl中hashtable的实现)
- [解决哈希冲突的方式](#解决哈希冲突的方式)
- [STL中unordered_map和map的区别](#stl中unordered_map和map的区别)
- [STL中hash_map扩容发生什么？](#stl中hash_map扩容发生什么)
- [STL中map的实现](#stl中map的实现)
- [map、set是怎么实现的，红黑树是怎么能够同时实现这两种容器,为什么使用红黑树](#mapset是怎么实现的红黑树是怎么能够同时实现这两种容器为什么使用红黑树)
- [STL中vector的实现](#stl中vector的实现)
  - [vector频繁对vector调用push_back对性能的影响和原因。](#vector频繁对vector调用push_back对性能的影响和原因)
  - [C++中vector和list的区别](#c中vector和list的区别)
  - [resize 和 reserve 的区别](#resize-和-reserve-的区别)
  - [迭代器失效的情况](#迭代器失效的情况)
    - [vector会迭代器失效吗？什么情况下会迭代器失效？](#vector会迭代器失效吗什么情况下会迭代器失效)
    - [其他迭代器失效情况](#其他迭代器失效情况)
  - [vector的增加删除都是怎么做的？为什么是1.5或者是2倍？](#vector的增加删除都是怎么做的为什么是15或者是2倍)
- [map 、set、multiset、multimap的底层原理](#map-setmultisetmultimap的底层原理)
  - [红黑树的特性](#红黑树的特性)
  - [map 、set、multiset、multimap的特点](#map-setmultisetmultimap的特点)
- [迭代器的底层原理](#迭代器的底层原理)

-------

## STL的介绍
  Standard Template Library，标准模板库，是C++的标准库之一，一套基于模板的容器类库，还包括许多常用的算法，提高了程序开发效率和复用性。STL包含6大部件：容器、迭代器、算法、仿函数、适配器和空间配置器。

- 容器：容纳一组元素的对象。

- 迭代器：提供一种访问容器中每个元素的方法。

- 函数对象：一个行为类似函数的对象，调用它就像调用函数一样。

- 算法：包括查找算法、排序算法等等。

- 适配器：用来修饰容器等，比如`queue`和`stack`，底层借助了`deque`。

- 空间配置器：负责空间配置和管理。


## STL中hashTable的实现

STL中的`hashtable`使用的是**开链法**解决`hash`冲突问题，`hashtable`表内的元素称为桶（`bucket`),而由桶所链接的元素称为节点（`node`), 如下图所示。

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/哈希表01.2oeu7i4l7fo.png)

`HashTable` 中的 `bucket` 维护的 列表不是`list`，也不是 `slist`，而是自己定义的 `hashtable_node` 数据结构组成的`linked-list`,并使用`vector`存放桶元素。`hashtable`的迭代器只提供前进操作，不提供后退操作.

`hashTable` 中的 `bucket` 是由28个质数`[53, 97, 193,...,429496729]`实现的，在创建`hashtable`时，会根据存入的元素个数选择大于等于元素个数的质数作为`hashtable`的容量（也就是`vector`的长度），其中每个`bucket`所维护的`linked-list`长度也等于`hashtable`的容量。如果插入`hashtable`的元素个数超过了`bucket`的容量，就要进行重建`table`操作，也就是找出下一个质数，创建新的`buckets vector`，重新计算元素在新`hashtable`的位置。

## 解决哈希冲突的方式

1. 线性探查。该元素的哈希值对应的桶不能存放元素时，循序往后一一查找，直到找到一个空桶为止，在查找时也一样，当哈希值对应位置上的元素与所要寻找的元素不同时，就往后一一查找，直到找到吻合的元素，或者空桶。
2. 二次探查。该元素的哈希值对应的桶不能存放元素时，就往后寻找`1^2,2^2,3^2,4^2.....i^2`个位置。
3. 双散列函数法。当第一个散列函数发生冲突的时候，使用第二个散列函数进行哈希，作为步长。
4. 开链法。在每一个桶中维护一个链表，由元素哈希值寻找到这个桶，然后将元素插入到对应的链表中，STL 的`hashtable`就是采用这种实现方式。
5. 建立公共溢出区。当发生冲突时，将所有冲突的数据放在公共溢出区。

## STL中unordered_map和map的区别

* `unordered_map`是C++ 11新添加的容器,底层使用**哈希表**实现的，占用内存比较多，查询速度比较快，其查询时间复杂度为`O(1)`。它内部是**无序**的，需要实现`==`操作符。
* `map`底层是采用**红黑树**实现的，插入删除查询时间复杂度都是`O(log(n))`，它的内部是**有序**的，因此需要实现比较操作符(`<`)。

如果你考虑效率，特别是在元素达到一定数量级时，可以考虑使用`unordered_map` 。但若你对内存使用特别严格，希望程序尽可能少消耗内存，那么就要谨慎使用`unordered_map`，因为它占用内存比较大，而且`unordered_map` 的构造速度较慢。


`map`适用于有序数据的应用场景，`unordered_map`适用于高效查询的应用场景

## STL中hash_map扩容发生什么？ 

1)   `hash table`表格内的元素称为桶（`bucket`),而由桶所链接的元素称为节点（node),其中存入桶元素的容器为 STL 本身很重要的一种序列式容器——`vector`容器。之所以选择`vector`为存放桶元素的基础容器，主要是因为`vector`容器本身具有动态扩容能力，无需人工干预。

2)   向前操作：首先尝试从目前所指的节点出发，前进一个位置（节点），由于节点被安置于`list`内，所以利用节点的`next`指针即可轻易完成前进操作，如果目前正巧是`list`的尾端，就跳至下一个`bucket`身上，那正是指向下一个`list`的头部节点。

## STL中map的实现

`map`的特性是所有元素会根据键值进行自动排序。`map`中所有的元素都是`pair`，拥有键值(`key`)和实值(`value`)两个部分，并且不允许元素有相同的`key`

一旦`map`的`key`确定了，那么是无法修改的，但是可以修改这个`key`对应的`value`，因此`map`的迭代器既不是常量迭代器`constant iterator`，也不是可变迭代器`mutable iterator`

标准STL `map`的底层机制是`RB-tree`（红黑树)

`map`的在构造时缺省采用递增排序`key`，也使用`alloc`配置器配置空间大小，需要注意的是在插入元素时，调用的是红黑树中的`insert_unique()`方法，而非`insert_euqal()`（`multimap`使用）

## map、set是怎么实现的，红黑树是怎么能够同时实现这两种容器,为什么使用红黑树

1)  他们的底层都是以红黑树的结构实现，因此插入删除等操作都在`O(logn）`时间内完成，因此可以完成高效的插入删除；

2)  在这里我们定义了一个模版参数，如果它是`key`那么它就是`set`，如果它是`map`，那么它就是`map`；底层是红黑树，实现`map`的红黑树的节点数据类型是`key+value`，而实现`set`的节点数据类型是`value`

3)  **因为`map`和`set`要求是自动排序的，红黑树能够实现这一功能，而且时间复杂度比较低**。

## STL中vector的实现

STL中的`vector`是封装了动态数组的顺序容器。不过与动态数组不同的是，`vector`可以根据需要自动扩大容器的大小。具体策略是每次容量不够用时重新申请一块大小为原来容量两倍的内存，将原容器的元素拷贝至新容器，并释放原空间，返回新空间的指针。

在原来空间不够存储新值时，每次调用`push_back`方法都会重新分配新的空间以满足新数据的添加操作。如果在程序中频繁进行这种操作，还是比较消耗性能的。

### vector频繁对vector调用push_back对性能的影响和原因。

如果需要频繁插入，最好先指定`vector`的大小，因为`vector`在容器大小不够用的时候会重新申请一块大小为原容器两倍的空间，并将原容器的元素拷贝到新容器中，并释放原空间，这个过程是十分耗时和耗内存的。频繁调用`push_back()`会使得程序花费很多时间在`vector`扩容上，会变得很慢。这种情况可以考虑使用`list`。

### C++中vector和list的区别

`vector`和数组类似，拥有一段连续的内存空间。`vector`申请的是一段连续的内存，当插入新的元素内存不够时，通常以2倍重新申请更大的一块内存，将原来的元素拷贝过去，释放旧空间。因为内存空间是连续的，所以在进行插入和删除操作时，会造成内存块的拷贝，时间复杂度为`o(n)`。

`list`是由双向链表实现的，因此内存空间是不连续的。只能通过指针访问数据，所以`list`的随机存取非常没有效率，时间复杂度为`o(n)`; 但由于链表的特点，能高效地进行插入和删除。

`vector`拥有一段连续的内存空间，能很好的支持随机存取，因此`vector::iterator`支持“+”，“+=”，“<”等操作符。

list的内存空间可以是不连续，它不支持随机访问，因此`list::iterator`则不支持“+”、“+=”、“<”等

`vector::iterator`和`list::iterator`都重载了“`++`”运算符。

总之，如果需要高效的随机存取，而不在乎插入和删除的效率，使用`vector`;

如果需要大量的插入和删除，而不关心随机存取，则应使用`list`。

### resize 和 reserve 的区别

首先分清楚两个概念：

> - `capacity`: 「`[kəˈpæsəti]`」该值在容器初始化时赋值，指的是容器能够容纳的最大的元素的个数。还不能通过下标等访问，因为此时容器中还没有创建任何对象。
>
> - `size`: 指的是此时容器中实际的元素个数。可以通过下标访问`0-(size-1)`范围内的对象。

`reserve`是设置了`capacity`的值，比如`reserve(20)`，表示该容器最大容量为 20，但此时容器内还没有任何对象，也不能通过下标访问。

`resize`既分配了空间，也创建了对象，可以通过下标访问

`reserve`只修改`capacity`大小，不修改`size`大小，`resize`既修改`capacity`大小，也修改`size`大小。

`reserve`是容器预留空间，但并不真正创建元素对象，在创建对象之前，不能引用容器内的元素，因此当加入新的元素时，需要用`push_back()/insert()`函数。

`resize`是改变容器的大小，**并且创建对象**，因此，调用这个函数之后，就可以引用容器内的对象了，因此当加入新的元素时，用`operator[]`操作符，或者用迭代器来引用元素对象。

> `reverse` 不创建对象，只修改`capacity`大小，不修改 `size`             
> `resize`既分配了空间，也创建了对象，可以通过下标访问，修改了`capacity`和 `size`




### 迭代器失效的情况

以`vector`为例：

#### vector会迭代器失效吗？什么情况下会迭代器失效？

* 会
* 当`vector`在插入的时候，如果原来的空间不够，会将申请新的内存并将原来的元素移动到新的内存，此时指向原内存地址的迭代器就失效了，`first`和`end`迭代器都失效
* 当`vector`在插入的时候，`end`迭代器肯定会失效
* 当`vector`在删除的时候，被删除元素以及它后面的所有元素迭代器都失效。

> `erase函数：返回下一个迭代器。`
>
> 记住，该函数是迭代器失效，返回下一个迭代器。
> 
> `it = arr.erase(it); //不能写成arr.erase(it);`

#### 其他迭代器失效情况

-  `deque` 和 `vector` 的情况类似,

- 而`list`双向链表每一个节点内存不连续, 删除节点仅当前迭代器失效,`erase`返回下一个有效迭代器; 

- `map/set`等关联容器底层是红黑树删除节点不会影响其他节点的迭代器, 使用递增方法获取下一个迭代器 `map.erase(iter++); `

`unordered_(hash)` 迭代器意义不大, `rehash`之后, 迭代器应该也是全部失效.

### vector的增加删除都是怎么做的？为什么是1.5或者是2倍？

1)  新增元素：`vector`通过一个连续的数组存放元素，如果集合已满，在新增数据的时候，就要分配一块更大的内存，将原来的数据复制过来，释放之前的内存，在插入新增的元素；

2)  对`vector`的任何操作，一旦引起空间重新配置，指向原`vector`的所有迭代器就都失效了 ；

3)  初始时刻`vector`的`capacity`为0，塞入第一个元素后`capacity`增加为1；

4)  不同的编译器实现的扩容方式不一样，`VS2015`中以1.5倍扩容，`GCC`以2倍扩容。

 

对比可以发现采用采用成倍方式扩容，可以保证常数的时间复杂度，而增加指定大小的容量只能达到`O(n)`的时间复杂度，因此，使用成倍的方式扩容。

1)  考虑可能产生的堆空间浪费，成倍增长倍数不能太大，使用较为广泛的扩容方式有两种，以2二倍的方式扩容，或者以1.5倍的方式扩容。

2)  以2倍的方式扩容，导致下一次申请的内存必然大于之前分配内存的总和，导致之前分配的内存不能再被使用，所以最好倍增长因子设置为`(1,2)`之间： 

3)  向量容器`vector`的成员函数`pop_back()`可以删除最后一个元素.

4)  而函数`erase()`可以删除由一个`iterator`指出的元素，也可以删除一个指定范围的元素。

5)  还可以采用通用算法`remove()`来删除`vector`容器中的元素.

6)  不同的是：采用`remove`一般情况下不会改变容器的大小，而`pop_back()`与`erase()`等成员函数会改变容器的大小。


## map 、set、multiset、multimap的底层原理

`map` 、`set`、`multiset`、`multimap`的底层实现都是红黑树，`epoll`模型的底层数据结构也是红黑树，`linux`系统中CFS进程调度算法，也用到红黑树。

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/红黑树.4ps9mmqenhc0.jpeg)

### 红黑树的特性

1. 每个结点或是红色或是黑色；

2. 根结点是黑色；

3. 每个叶结点是黑的；

4. 如果一个结点是红的，则它的两个儿子均是黑色；

5. 每个结点到其子孙结点的所有路径上包含相同数目的黑色结点。

  对于STL里的`map`容器，`count`方法与`find`方法，都可以用来判断一个`key`是否出现，`mp.count(key) > 0`统计的是`key`出现的次数，因此只能为`0/1`，而`mp.find(key) != mp.end()`则表示key存在。

### map 、set、multiset、multimap的特点

- `set`和`multiset`会根据特定的排序准则自动将元素排序，`set`中元素不允许重复，`multiset`可以重复。

- `map`和m`ultimap`将`key`和`value`组成的`pair`作为元素，根据key的排序准则自动将元素排序（因为红黑树也是二叉搜索树，所以`map`默认是按`key`排序的），`map`中元素的`key`不允许重复，`multimap`可以重复。

- `map`和`set`的增删改查速度为都是`O(logN)`，是比较高效的。


## 迭代器的底层原理

迭代器是连接容器和算法的一种重要桥梁，通过迭代器可以在不了解容器内部原理的情况下遍历容器。它的底层实现包含两个重要的部分：**萃取技术**和**模板偏特化**。

- **萃取技术**（`traits`）可以进行类型推导，根据不同类型可以执行不同的处理流程，比如容器是`vector`，那么`traits`必须推导出其迭代器类型为随机访问迭代器，而list则为双向迭代器。

> 例如STL算法库中的`distance`函数，`distance`函数接受两个迭代器参数，然后计算他们两者之间的距离。显然对于不同的迭代器计算效率差别很大。比如对于`vector`容器来说，由于内存是连续分配的，因此指针直接相减即可获得两者的距离；而`list`容器是链式表，内存一般都不是连续分配，因此只能通过一级一级调用next()或其他函数，每调用一次再判断迭代器是否相等来计算距离。`vector`迭代器计算`distance`的效率为`O(1)`,而`list`则为`O(n)`,`n`为距离的大小。

使用萃取技术（`traits`）进行类型推导的过程中会使用到模板偏特化。模板偏特化可以用来推导参数，如果我们自定义了多个类型，除非我们把这些自定义类型的特化版本写出来，否则我们只能判断他们是内置类型，并不能判断他们具体属于是个类型。

```cpp
template <typename T>
struct TraitsHelper {
     static const bool isPointer = false;
};
template <typename T>
struct TraitsHelper<T*> {
     static const bool isPointer = true;
};

if (TraitsHelper<T>::isPointer)
     ...... // 可以得出当前类型int*为指针类型
else
     ...... // 可以得出当前类型int非指针类型
```

**一个理解traits的例子**

```cpp
// 需要在T为int类型时，Compute方法的参数为int，返回类型也为int，
// 当T为float时，Compute方法的参数为float，返回类型为int
template <typename T>
class Test {
public:
     TraitsHelper<T>::ret_type Compute(TraitsHelper<T>::par_type d);
private:
     T mData;
};

template <typename T>
struct TraitsHelper {
     typedef T ret_type;
     typedef T par_type;
};

// 模板偏特化，处理int类型
template <>
struct TraitsHelper<int> {
     typedef int ret_type;
     typedef int par_type;
};

// 模板偏特化，处理float类型
template <>
struct TraitsHelper<float> {
     typedef float ret_type;
     typedef int par_type;
};
```
当函数，类或者一些封装的通用算法中的某些部分会因为数据类型不同而导致处理或逻辑不同时，`traits`会是一种很好的解决方案。

