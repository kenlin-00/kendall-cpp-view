


---------

## 如何使用 gtest 进行测试

先编写一个测试函数

```cpp
int Foo(int a, int b){

}
```

接着可以使用 TEST 这个宏来进行测试，它有两个参数，分别是`[TestCaseName，TestName]`,也可以定义为`[TestSuiteName，TestCaseName]`,「TestCase 事件」

> TEST 宏是一个很重要的宏，它构成一个测试特例。TEST 宏的第一个参数是“测试用例名”，第二个参数是“测试特例名”。测试用例（Test Case）是为某个特殊目标而编制的一组测试输入、执行条件以及预期结果，以便测试某个程序路径或核实是否满足某个特定需求

```cpp
#include <gtest/gtest.h>

TEST(FooTest, HandleNoneZeroInput)
{
    EXPECT_EQ(2, Foo(4, 10)); //期望值：2，实际值：Foo(4, 10)
    EXPECT_EQ(6, Foo(30, 18));
}
```

然后使用 EXPECT_EQ 这个宏 在检查点进行检查，这个宏用来比较两个数字是否相等，Google 还包装了一系列`EXPECT_*` 和`ASSERT_*`的宏「**两类断言的宏**」，而 EXPECT 系列和ASSERT 系列的区别是：

- 1. `EXPECT_*`  失败时，案例继续往下执行。

- 2. `ASSERT_*` 失败时，直接在当前函数中返回，当前函数中 `ASSERT_*` 后面的语句将不会执行。

## gtest 的事件机制

如果是使用 TEST 宏进行测试，那么在有很多测试用例的时候（被测函数传入不同的值的情况），就需要重复写很多测试用例测试，比如下面：

```cpp
//IsPrime() 判断一个数是不是素数
TEST(IsPrimeTest, Trivial) {
  EXPECT_FALSE(IsPrime(0));   
  EXPECT_FALSE(IsPrime(1));
  EXPECT_TRUE(IsPrime(2));
  EXPECT_TRUE(IsPrime(3));
}
```

gtest 提供了 **获取参数化** 的方式解决这个问题。

- 也就是先声明一个类，这个类继承 `testing::TestWithParam<int>`，
```cpp
class IsPrimeParamTest : public::testing::TestWithParam<int>
{};
```

- 然后通过获取参数并调试

```cpp
TEST_P(IsPrimeParamTest,ExpectTrueReturn)
{
    int n = GetParam();
    EXPECT_TRUE(IsPrime(n));
}
```

- 接着使用枚举，用这几个数同时作为参数传入 判断素数 这个方法

```cpp
INSTANTATE_TEST_CASE_P(TrueReturn,IsPrimeParamTest,testing::Values(3,4,11,23,17));
// 第一个参数是测试案例的前缀，可以任意取。

// 第二个参数是测试案例的名称，需要和之前定义的参数化的类的名称相同，如：IsPrimeParamTest

// 第三个参数是可以理解为参数生成器，上面的例子使用 test::Values 表示使用括号内的参数。Google 提供了一系列的参数生成的函数
```

但是很明显，什么方法只能测试函数，或者只是少量函数测试是没有问题的，多个函数的时候是不方便了

如果函数之间变量需要重用，比如辅助函数需要对 string 操作（如：大小写转换），那么使用上面的方式就不方便了，

gtest 使用了 **事件机制** 来解决这个问题。

### 3 种事件机制怎么使用

gtest提供了多种事件机制，非常方便我们在案例之前或之后做一些操作。总结一下gtest的事件一共有3种：

- 1. Global，全局的，所有案例执行前后。经常用于组合类行为测试
- 2. TestSuite 级别的，在某一批案例中第一个案例前，最后一个案例执行后。一般用用于类的行为测试，或者有联系的多个方法进行测试。
- 3. TestCase 级别的，每个 TestCase 前后。

#### 全局事件

要实现全局事件，必须写一个类，继承testing::Environment类，实现里面的SetUp和TearDown方法。

1. `SetUp()`方法在所有案例执行前执行

2. `TearDown()`方法在所有案例执行后执行

```cpp
class FooEnvironment : public testing::Environment
{
public:
    virtual void SetUp()
    {
        std::cout << "Foo FooEnvironment SetUP" << std::endl;
    }
    virtual void TearDown()
    {
        std::cout << "Foo FooEnvironment TearDown" << std::endl;
    }
};
```
然后我们需要在 main 函数中通过 `testing::AddGlobalTestEnvironment` 方法将事件挂进来，也就是说，我们可以写很多个这样的类，然后将他们的事件都挂上去。就是这样告诉 gtest 添加这个全局事件。

```cpp
int _tmain(int argc, _TCHAR* argv[])
{
    testing::AddGlobalTestEnvironment(new FooEnvironment);
    testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
```

#### TestSuite事件

我们需要写一个类，继承 `testing::Test`，然后实现两个静态方法

1. `SetUpTestCase()` 方法在第一个 TestCase 之前执行

2. `TearDownTestCase()` 方法在最后一个 TestCase 之后执行

```cpp
class FooTest : public testing::Test {
 protected:
  static void SetUpTestCase() {
    shared_resource_ = new ;
  }
  static void TearDownTestCase() {
    delete shared_resource_;
    shared_resource_ = NULL;
  }
  // Some expensive resource shared by all tests.
  static T* shared_resource_;
};
```

在编写测试案例时，我们需要使用 `TEST_F` 这个宏，第一个参数必须是我们上面类的名字，代表一个 TestSuite。

```cpp
TEST_F(FooTest, Test1)
 {
    // you can refer to shared_resource here 
}
TEST_F(FooTest, Test2)
 {
    // you can refer to shared_resource here 
}
```

#### TestCase事件

TestCase 事件是挂在每个案例执行前后的，实现方式和上面的几乎一样，不过需要实现的是 SetUp 方法和 TearDown 方法：

1. `SetUp()`方法在每个 TestCase 之前执行

2. `TearDown()` 方法在每个TestCase 之后执行

```cpp
class FooCalcTest:public testing::Test
{
protected:
    virtual void SetUp()
    {
        m_foo.Init();
    }
    virtual void TearDown()
    {
        m_foo.Finalize();
    }

    FooCalc m_foo;
};

TEST_F(FooCalcTest, HandleNoneZeroInput)
{
    EXPECT_EQ(4, m_foo.Calc(12, 16));
}

TEST_F(FooCalcTest, HandleNoneZeroInput_Error)
{
    EXPECT_EQ(5, m_foo.Calc(12, 16));
}
```

## 测试用例

有很多测试用例的时候

如果很多函数的话就得写很多这样的测试，gtest 怎么解决的？



通过获取参数化的方式解决，也就是声明一个类，这个类继承 `public::testing::TestWithParam<int>`，通过获取参数来进行测试，
```cpp
class IsPrimeParamTest : public::testing::TestWithParam<int>
{};
```










只能测试函数，或者只是少量函数测试是没有问题的，多个函数的时候是不方便的

如果函数之间变量需要重用，比如辅助函数需要对 string 操作（大小写转换）那么使用上面的方式就不明显，


gtest提供了**事件机制**。

- testcast事件

每个案例执行前后，多次对类初始使用测试，也就是会调用 SetUp 和 TearDown

```cpp
class CaseTestSmpl : public testing::Test
{
protected:
    virtual void SetUp() {
        temp_.Init();
    }
    virtual void TearDown() {
        temp_.Finalize();
    }
    T temp_;
};

TEST_F(CaseTestSmpl,test_1th)
{
    temp_.Init();
    // 在这里可以执行使用，T 以及它的内部方法
    this->temp.calc();  //这个this指针就是类的实例
    temp_.Finalize();
}
```

比如说我们要测试一个类，我们需要将类的值保存起来，每一次测试一个用例都会调用一个隐含的Init，销毁的时候调用 Finalize 

- testsuit 事件

同样继承 TEST

在某一批案例中，第一个执行前到最后一个执行后只会调用一次，

一般用用于类的行为测试，或者有联系的多个方法进行测试。

- 全局Global事件

所有案例执行前后，经常用于组合类行为测试

继承    Environment 
