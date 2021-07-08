

---

## 实习介绍

在地平线上实习了三个月，所在部门主要负责 ADAS ，也就是智能辅助驾驶业务的研发，我在期间整个团队主要完成 车道偏离告警（LDW）相关实现。这个项目主要是对公司内部底层框架 Hobot 进行二次开发。这个框架提供了一个通用的有向图形式，将基础代码功能模块组织成较复杂功能模块，提供一套具有模块化的管理机制。

车道偏离预警系统主要由 HUD 抬头显示器、摄像头、控制器以及传感器组成，当车道偏离系统开启时，摄像头（一般安置在车身侧面或后视镜位置）会时刻采集行驶车道的标识线，通过图像处理获得汽车在当前车道中的位置参数，当检测到汽车偏离车道时，传感器会及时收集车辆数据和驾驶员的操作状态，之后由控制器发出警报信号，整个过程大约在 0.5 秒完成，为驾驶者提供更多的反应时间。而如果驾驶者打开转向灯，正常进行变线行驶，那么车道偏离预警系统不会做出任何提示。

在实习期间我主要负责辅助团队正式员工的研发工作。当时较多的是负责对功能函数进行单元测试。用比较多的工具是公司内部的工具 gtestX, 然后会根据不同的业务需求对 gtestX 进行扩展开发，比如当时参考 google test 源码实现了自动调度机制，比如测试特例的自动保存等。

实习期间遇到了很多难题，毕竟第一次上手开发这种企业级的项目，，真的，不过那段时间真的可以说是我编程能力提升最快的三个月，每天干到十二点，还满满的激情。也学到了很多知识比如 C++11 的新特性，尤其是并发和多线程相关的。因为这个项目都是基于 C++11 实现的。当然还有其他很多，比如智能指针的使用，内存管理等等。

## 怎么使用静态变量

> https://cloud.tencent.com/developer/inventory/9092/article/1383691


在实现测试用例的自动保存的时候，使用了一个宏函数[`GTEST_TEST_CLASS_NAME_`]生成类名，这个类暴露了一个空的默认构造函数，一个私有的虚函数 TestBody、一个静态变量 `test_info_` 和一个私有的赋值运算符(将运算符=私有化，限制类对象的赋值和拷贝行为)。

这里静态变量 test_info ，它利用”静态变量在程序运行前被初始化“的特性，抢在 main 函数执行之前，执行一段代码，从而有机会将测试用例放置于一个固定的位置。这个是”自动“保存测试用例的本质所在。

```cpp
::testing::TestInfo* const GTEST_TEST_CLASS_NAME_(test_case_name, test_name)\
  ::test_info_ =\
    ::testing::internal::MakeAndRegisterTestInfo(\
        #test_case_name, #test_name, NULL, NULL, \
        ::testing::internal::CodeLocation(__FILE__, __LINE__), \
        (parent_id), \
        parent_class::SetUpTestCase, \
        parent_class::TearDownTestCase, \
        new ::testing::internal::TestFactoryImpl<\
            GTEST_TEST_CLASS_NAME_(test_case_name, test_name)>);\
```

我们是使用一个 TEST 宏实现了测试的实体，然后调用测试用例的 Run 方法。 测试特例的 Run 方法其核心是

```cpp
Test* const test = internal::HandleExceptionsInMethodIfSupported(
      factory_, &internal::TestFactoryBase::CreateTest,
      "the test fixture's constructor");

  if ((test != NULL) && !Test::HasFatalFailure()) {
    test->Run();
  }
```

它通过构造函数传入的**工厂模式的类**对象指针调用它重载的 CreateTest 方法，new 出 TEST 宏中定义的使用 GTEST_TEST_CLASS_NAME_ 命名（用例名_实例名_TEST）的类（之后称**测试用例特例类**）的对象指针，然后调用测试用例特例类的父类中的 Run 方法。

### 介绍一下工厂模式

> https://www.cnblogs.com/xiaolincoding/p/11524376.html

- 这种类型的设计模式属于创建型模式，它提供了一种创建对象的最佳方式。
- 在工厂模式中，我们在创建对象时不会对客户端暴露创建逻辑，并且是通过使用一个共同的接口来指向新创建的对象。

简单来说，使用了C++多态的特性，将存在继承关系的类，通过一个工厂类创建对应的子类（派生类）对象。在项目复杂的情况下，可以便于子类对象的创建。

工厂模式的实现方式可分别简单工厂模式、工厂方法模式、抽象工厂模式，每个实现方式都存在优和劣。

以鞋厂为例分析

#### 简单工厂模式

鞋厂可以指定生产耐克、阿迪达斯和李宁牌子的鞋子。哪个鞋炒的火爆，老板就生产哪个，看形势生产。

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/工厂模式01.5dzo9gqbwi00.png)

简单工厂模式的结构组成：

- 工厂类(ShoesFactory)：工厂模式的核心类，会定义一个用于创建指定的具体实例对象的接口。
- 抽象产品类(Shoes)：是具体产品类的继承的父类或实现的接口。
- 具体产品类(NiKeShoes\AdidasShoes\LiNingShoes)：工厂类所创建的对象就是此具体产品实例。

**简单工厂模式的特点**：

工厂类封装了创建具体产品对象的函数。

**简单工厂模式的缺陷**：

扩展性非常差，新增产品的时候，需要去修改工厂类。

#### 工厂方法模式

现各类鞋子抄的非常火热，于是为了大量生产每种类型的鞋子，则要针对不同品牌的鞋子开设独立的生产线，那么每个生产线就只能生产同类型品牌的鞋。

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/工厂模式02.md22sc5xhkw.png)

工厂方法模式的结构组成：
- 抽象工厂类厂（ShoesFactory）：工厂方法模式的核心类，提供创建具体产品的接口，由具体工厂类实现。
- 具体工厂类（NiKeProducer\AdidasProducer\LiNingProducer）：继承于抽象工厂，实现创建对应具体产品对象的方式。
- 抽象产品类（Shoes）：它是具体产品继承的父类（基类）。
- 具体产品类（NiKeShoes\AdidasShoes\LiNingShoes）：具体工厂所创建的对象，就是此类。

**工厂方法模式的特点**：

- 工厂方法模式抽象出了工厂类，提供创建具体产品的接口，交由子类去实现。
- 工厂方法模式的应用并不只是为了封装具体产品对象的创建，而是要把具体产品对象的创建放到具体工厂类实现。

**工厂方法模式的缺陷**：

- 每新增一个产品，就需要增加一个对应的产品的具体工厂类。相比简单工厂模式而言，工厂方法模式需要更多的类定义。
- 一条生产线只能一个产品。

#### 抽象工厂模式

鞋厂为了扩大了业务，不仅只生产鞋子，把运动品牌的衣服也一起生产了。

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/工厂模式03.4kdzxh4jx5e0.png)

抽象工厂模式的结构组成（和工厂方法模式一样）：
- 抽象工厂类厂（ShoesFactory）：工厂方法模式的核心类，提供创建具体产品的接口，由具体工厂类实现。
- 具体工厂类（NiKeProducer）：继承于抽象工厂，实现创建对应具体产品对象的方式。
- 抽象产品类（Shoes\Clothe）：它是具体产品继承的父类（基类）。
- 具体产品类（NiKeShoes\NiKeClothe）：具体工厂所创建的对象，就是此类。

**抽象工厂模式的特点**：

提供一个接口，可以创建多个产品族中的产品对象。如创建耐克工厂，则可以创建耐克鞋子产品、衣服产品、裤子产品等。

**抽象工厂模式的缺陷**：

同工厂方法模式一样，新增产品时，都需要增加一个对应的产品的具体工厂类。

## 死亡测试

死亡测试是为了判断一段逻辑是否会导致进程退出而设计的。通常在测试过程中，我们需要考虑各种各样的输入，有的输入可能直接导致程序崩溃，这时我们就需要检查程序是否按照预期的方式挂掉，这也就是所谓的“**死亡测试**”。`gtestX`的死亡测试能做到在一个安全的环境下执行崩溃的测试案例，同时又对崩溃结果进行验证。

死亡测试 在 linux 上实现的过程

- 测试实体中准备启动新的进程，进程路径就是本进程可执行文件路径
- 通过 fork 创建子进程，fork 是标准的子进程和父进程分离执行，所以 threadsafe 对应的  ExecDeathTest 死亡测试类在底层调用的是 fork，从而可以保证是安全的。

> 使用 detach 分离父进程和子进程，会导致线程安全问题，当时使用的是 临时对象的方式解决的。

- 接着子进程传入了标准输入输出句柄
- 启动子进程时传入类型筛选，即指定执行该测试用例
- 监听子进程的输出
- 判断子进程退出模式

子进程的执行过程是：

- 执行父进程指定的测试特例
- 运行死亡测试宏中的表达式
- 如果没有 crash「崩溃」 ，则根据情况选择退出模式

### 死亡测试运行方式

- fast方式（默认的方式）

```cpp
testing::FLAGS_gtest_death_test_style = "fast";
```

- threadsafe方式

```cpp
testing::FLAGS_gtest_death_test_style = "threadsafe";
```

我们可以在 `main()` 里为所有的死亡测试设置测试形式，也可以为某次测试单独设置。Google Test 会在每次测试之前保存这个标记并在测试完成后恢复，所以你不需要去管这部分工作 。如：

```cpp
TEST(MyDeathTest, TestOne) {
  testing::FLAGS_gtest_death_test_style = "threadsafe";
  // This test is run in the "threadsafe" style:
  ASSERT_DEATH(ThisShouldDie(), "");
}

TEST(MyDeathTest, TestTwo) {
  // This test is run in the "fast" style:
  ASSERT_DEATH(ThisShouldDie(), "");
}

int main(int argc, char** argv) {
  testing::InitGoogleTest(&argc, argv);
  testing::FLAGS_gtest_death_test_style = "fast";
  return RUN_ALL_TESTS();
}
```

### detach 函数

如果创建了很多子线程，让主线程逐个等待子线程结束，这种方法就显得不是很好，所以需要引入 detach 这种写法，**让主线程和子线程分离**，主线程不必等待子进程运行结束。

```cpp
mytoobj.detach();
```
> 一旦调用了 detach，就不可再调用 join 了。当然可以使用 joinable 判断是否成功使用 join 或者 detach 。

但是使用 detach 时候会导致内存安全问题，就比如在线程中传递引用，指针之类的参数，这样的话形参的地址是原来主线程中分配的，一旦主线程退出后，子线程再使用这块内存肯定是不安全的。

所以需要使用值传递，在创建线程这一行就构造出**临时对象**，主要用这个临时构造的对象传递给线程入口函数，那么线程中的到的第二个参数就一定能够在主线程执行完毕之前构造出来。从而确保 detach 线程是安全的。

### 测试原因




