> [参考labuladong](https://labuladong.gitee.io/algo/%E5%8A%A8%E6%80%81%E8%A7%84%E5%88%92%E7%B3%BB%E5%88%97/%E5%8A%A8%E6%80%81%E8%A7%84%E5%88%92%E8%AF%A6%E8%A7%A3%E8%BF%9B%E9%98%B6/)


**首先，动态规划问题的一般形式就是求最值**。比如说让你求**最长**递增子序列呀，**最小**编辑距离呀等等。

**求解动态规划的核心问题是穷举**

首先，动态规划的穷举有点特别，因为这类问题**存在「重叠子问题」**，如果暴力穷举的话效率会极其低下，所以需要「备忘录」或者「DP table」来优化穷举过程，避免不必要的计算。

而且，动态规划问题一定会**具备「最优子结构」**，才能通过子问题的最值得到原问题的最值。

另外，虽然动态规划的核心思想就是穷举求最值，但是问题可以千变万化，穷举所有可行解其实并不是一件容易的事，只有列出**正确的「状态转移方程」**，才能正确地穷举。

以上提到的**重叠子问题、最优子结构、状态转移方程**就是动态规划三要素。具体什么意思等会会举例详解，但是在实际的算法问题中，写出状态转移方程是最困难的，这也就是为什么很多朋友觉得动态规划问题困难的原因，我来提供我研究出来的一个思维框架，辅助你思考状态转移方程：

**明确 base case -> 明确「状态」-> 明确「选择」 -> 定义 dp 数组/函数的含义**

按上面的套路走，最后的结果就可以套这个框架：
```cpp
# 初始化 base case
dp[0][0][...] = base
# 进行状态转移
for 状态1 in 状态1的所有取值：
    for 状态2 in 状态2的所有取值：
        for ...
            dp[状态1][状态2][...] = 求最值(选择1，选择2...)
```

## 509.斐波那契数
[题目来源](https://leetcode-cn.com/problems/fibonacci-number/)

斐波那契数，通常用 `F(n)` 表示，形成的序列称为 斐波那契数列 。该数列由 0 和 1 开始，后面的每一项数字都是前面两项数字的和。也就是：
```
F(0) = 0，F(1) = 1
F(n) = F(n - 1) + F(n - 2)，其中 n > 1

给你 n ，请计算 F(n) 。
```

题解：

详细见[这里](https://labuladong.gitee.io/algo/%E5%8A%A8%E6%80%81%E8%A7%84%E5%88%92%E7%B3%BB%E5%88%97/%E5%8A%A8%E6%80%81%E8%A7%84%E5%88%92%E8%AF%A6%E8%A7%A3%E8%BF%9B%E9%98%B6/#_3)

```cpp
class Solution {
public:
    int fib(int n) {
        if(n < 2) return n;
        vector<int> dp(3);
        dp[0] = 0;
        dp[1] = 1;
        for(int i=2;i<=n;++i) {
            dp[2] = dp[0] + dp[1];
            dp[0] = dp[1];
            dp[1] = dp[2];
        }
        return dp[2];
    }
};
```

## 322.零钱兑换

[题目来源](https://leetcode-cn.com/problems/coin-change/)

给定不同面额的硬币 `coins` 和一个总金额 `amount`。编写一个函数来计算可以凑成总金额所需的最少的硬币个数。如果没有任何一种硬币组合能组成总金额，返回 `-1`。

你可以认为每种硬币的数量是无限的。

 

示例 1：
```
输入：coins = [1, 2, 5], amount = 11
输出：3 
解释：11 = 5 + 5 + 1
```

题解：

- 1.确定base case（初始化）

目标金额为 0 时算法返回 0 ，因为不需要任何硬币凑出目标金额了。

- 2.确定「状态」，也就是原问题和子问题中会变化的变量

由于硬币数量无限，硬币的面额也是题目给定的，只有目标金额会不断地向 `base case` 靠近，所以唯一的「状态」就是目标金额 `amount`。

- 3.确定「选择」，也就是导致「状态」产生变化的行为
  
目标金额为什么变化呢，因为你在选择硬币，你每选择一枚硬币，就相当于减少了目标金额。所以说所有硬币的面值，就是你的「选择」。

- 4.明确 dp 函数/数组的定义

我们这里讲的是自顶向下的解法，所以会有一个递归的 dp 函数，一般来说函数的参数就是状态转移中会变化的量，也就是上面说到的「状态」；函数的返回值就是题目要求我们计算的量。就本题来说，状态只有一个，即「目标金额」，题目要求我们计算凑出目标金额所需的最少硬币数量。所以我们可以这样定义 `dp` 函数：

**`dp(n)` 的定义**：输入一个目标金额 n，返回凑出目标金额 n 的最少硬币数量。

搞清楚上面这几个关键点，解法的伪码就可以写出来了：

```cpp
# 伪码框架
def coinChange(coins: List[int], amount: int):

    # 定义：要凑出金额 n，至少要 dp(n) 个硬币
    def dp(n):
        # 做选择，选择需要硬币最少的那个结果
        for coin in coins:
            res = min(res, 1 + dp(n - coin))
        return res

    # 题目要求的最终结果是 dp(amount)
    return dp(amount)
```

根据伪码，我们加上 `base case` 即可得到最终的答案。显然目标金额为 0 时，所需硬币数量为 0；当目标金额小于 0 时，无解，返回 -1

```cpp
class Solution {
public:
//状态：目标金额 amount
//选择：coins 数组中列出的所有硬币面额
//函数定义：凑出总数 amount 至少需要coinChange(coin,amount)枚硬币
//base case: amount = 0 时，需要0枚硬币，amount < 0 时，不能凑出

//coinChange([1,2,5],11)
// 就是计算 1 + min( coinChange([1,2,5],10) , coinChange([1,2,5],9) ,  coinChange([1,2,5],6))
    int coinChange(vector<int>& coins, int amount) {
        //base case 
        if(amount == 0) return 0;
        if(amount < 0) return -1;

        //因为是求最小，所以定义一个很大的数
        int ret = INT_MAX;

        // 套用模板

        /*
            # 定义：要凑出金额 n，至少要 dp(n) 个硬币
            def dp(n):
                # 做选择，选择需要硬币最少的那个结果
                for coin in coins:
                    res = min(res, 1 + dp(n - coin))
                return res
        */
        for(auto coin: coins) {
            //计算子问题的结果
            int subProblem = coinChange(coins,amount - coin);
            //子问题无解的跳过
            if(subProblem == -1) continue;
            // 在子问题中选择最优解 然后+1
            ret = min(ret,subProblem + 1);
        }
        return ret == INT_MAX ? -1 : ret;
    }
};
```

以上解法会超时

依然可以使用备忘录来进行优化

```cpp

```      





