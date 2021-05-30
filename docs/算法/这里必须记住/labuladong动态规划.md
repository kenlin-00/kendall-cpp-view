动态规划可以解决的问题：

- 字符串匹配
  - [正则表达式匹配](https://leetcode-cn.com/problems/zheng-ze-biao-da-shi-pi-pei-lcof/)
- 求最值问题

**明确「状态」 -> 定义 dp 数组/函数的含义 -> 明确「选择」-> 明确 base case**。

**求解动态规划的核心问题是穷举**，因为要求最值，肯定要把可行的答案穷举出来。

动态规划的穷举存在**重叠子问题**，如果暴力穷举的话效率会非常低，所以需要「**备忘录**」或者「**DP table**」来优化穷举过程，避免不必要的计算。

而且，动态规划问题一定会具备「**最优子结构**」，才能通过子问题的最值得到原问题的最值。

只有列出正确的「**状态转移方程**」才能正确地穷举。

------

- [剑指 Offer 10- I.斐波那契数列](#剑指-offer-10--i斐波那契数列)
- [凑零钱问题](#凑零钱问题)
  - [暴力递归](#暴力递归)
  - [带备忘录的递归](#带备忘录的递归)
  - [dp 数组的迭代解法](#dp-数组的迭代解法)
- [494.目标和](#494目标和)
  - [回溯思路](#回溯思路)
  - [消除重叠子问题](#消除重叠子问题)
  - [动态规划](#动态规划)
- [股票问题](#股票问题)
  - [121. 买卖股票的最佳时机](#121-买卖股票的最佳时机)
  - [122.买卖股票的最佳时机 II](#122买卖股票的最佳时机-ii)
  - [123.买卖股票的最佳时机 III](#123买卖股票的最佳时机-iii)
  - [188.买卖股票的最佳时机 IV](#188买卖股票的最佳时机-iv)
  - [309. 最佳买卖股票时机含冷冻期](#309-最佳买卖股票时机含冷冻期)
  - [714. 买卖股票的最佳时机含手续费](#714-买卖股票的最佳时机含手续费)
- [打家劫舍系列问题](#打家劫舍系列问题)
  - [198. 打家劫舍](#198-打家劫舍)
  - [213. 打家劫舍 II](#213-打家劫舍-ii)

-------

## 剑指 Offer 10- I.斐波那契数列

[题目来源](https://leetcode-cn.com/problems/fei-bo-na-qi-shu-lie-lcof/)

[labuladong](https://mp.weixin.qq.com/s?__biz=MzAxODQxMDM0Mw==&mid=2247484731&idx=1&sn=f1db6dee2c8e70c42240aead9fd224e6&chksm=9bd7fb33aca07225bee0b23a911c30295e0b90f393af75eca377caa4598ffb203549e1768336&scene=21#wechat_redirect)

这就是动态规划问题的第一个性质：**重叠子问题**

**带备忘录的递归解法**

也就是用一个动态数组来保存每一次的状态。也即是 `DP table`。

```cpp
class Solution {
public:
    int fib(int n) {
        //需要考虑n==0的时候，初始化dp[1]越界
        if(n == 0 || n== 1) return n;
        
        vector<int> dp(n + 1);
        dp[0] = 0;
        dp[1] = 1;
        for(int i=2;i<=n;++i) {
            dp[i] = (dp[i-1] + dp[i-2]) % 1000000007;
        }
        return dp[n];
    }
};
```

优化只维护两个数

```cpp
class Solution {
public:
    int fib(int n) {
        if(n == 0) return 0;
        if (n == 2 || n == 1) 
            return 1;
        int prev = 1,curr = 1;
        for (int i = 3; i <= n; i++)  {
            int sum = (prev + curr) % 1000000007;
            prev = curr;
            curr = sum;
        }
        return curr;
    }

};
```

## 凑零钱问题

[题目来源](https://leetcode-cn.com/problems/coin-change/)

给定不同面额的硬币 `coins` 和一个总金额 `amount`。编写一个函数来计算可以凑成总金额所需的最少的硬币个数。如果没有任何一种硬币组合能组成总金额，返回 -1。

你可以认为每种硬币的数量是无限的。

### 暴力递归

首先，这个问题是动态规划问题，因为它具有「**最优子结构**」。要符合「**最优子结构**」，**子问题间必须互相独立**。

回到凑零钱问题，为什么说它符合最优子结构呢？比如你想求`amount = 11`时的最少硬币数（原问题），如果你知道凑出`amount = 10`的最少硬币数（子问题），你只需要把子问题的答案加一（再选一枚面值为 1 的硬币）就是原问题的答案，因为硬币的数量是没有限制的，子问题之间没有相互制，是互相独立的。

首先需要列出**状态转移方程**

**先确定「状态」**，也就是原问题和子问题中变化的变量。由于硬币数量无限，所以唯一的状态就是目标金额`amount`。

**然后确定dp函数的定义**：函数 `dp(n)`表示，当前的目标金额是`n`，至少需要`dp(n)`个硬币凑出该金额。

**然后确定「选择」并择优**：也就是对于每个状态，可以做出什么选择改变当前状态。具体到这个问题，无论当的目标金额是多少，选择就是从面额列表`coins`中选择一个硬币，然后目标金额就会减少：

```cpp
// 伪代码框架
int coinChange(vector<int>& coins, int amount) {
    return dp(coins,amount);
}
// 定义：要凑出金额 n，至少要 dp(n) 个硬币
int dp(vector<int>& coins, int amount) {
    // 做选择，需要硬币最少的那个结果就是答案
    for(auto coin : coins) {
        // 算出前一个cois有几种(子问题)
        res = min(res,dp(coins,amount - coin) + 1 ); // 先计算cois前一个硬币
    }
    return res;
}
```

**最后明确 base case**，显然目标金额为 0 时，所需硬币数量为 0；当目标金额小于 0 时，无解，返回 -1：

```cpp
class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        return dp(coins,amount);
    }
    int dp(vector<int>& coins, int amount) {
        if(amount == 0) return 0; //如果总额为0，那么需要0个货币
        if(amount < 0) return -1;

        int res = INT_MAX;
        for(auto coin : coins) {
            // 算出前一个cois有几种(子问题)
            int subProblem = dp(coins,amount - coin);
            //子问题无解，跳过
            if( subProblem == -1 ) 
                continue;
            res = min(res,subProblem + 1); //最少种
        }
        return res == INT_MAX ? -1 : res;
    }
};
```

超时时间限制

### 带备忘录的递归

**怎么消除重叠子问题**？

使用备忘录来解决，这里使用`unordered_map`数据结构。

```cpp
class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        // vector<int> memo(amount + 1,0);
        unordered_map<int,int> memo;
        return dp(coins,amount,memo);
    }
    int dp(vector<int>& coins, int amount,unordered_map<int,int> &memo) {

        //如果备忘录已经记录过，就直接返回备忘录的值
        auto it = memo.find(amount);
        if(it != memo.end()) return memo[amount];

        if(amount == 0) return 0; //如果总额为0，那么需要0个货币
        if(amount < 0) return -1;

        int res = INT_MAX;
        for(auto coin : coins) {
            // 算出前一个cois有几种(子问题)
            int subProblem = dp(coins,amount - coin,memo);
            //子问题无解，跳过
            if( subProblem == -1 ) 
                continue;
            res = min(res,subProblem + 1); //最少种
        }
        memo[amount] = (res == INT_MAX) ? -1 : res;
        return memo[amount];
    }
};
```

很显然「备忘录」大大减小了子问题数目，完全消除了子问题的冗余，所以子问题总数不会超过金额数 n，即子问题数目为 $O(n)$。处理一个子问题的时间不变，仍是 $O(k)$，所以总的时间复杂度是 $O(kn)$。

### dp 数组的迭代解法

我们也可以自底向上使用 `dp table` 来消除重叠子问题，`dp`数组的定义和刚才`dp`函数类似，定义也是一样的：

`dp[i] = x`表示，当目标金额为i时，至少需要x枚硬币。

```cpp
class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        if(amount == 0) return 0;
        if(amount < 0) return -1;
        // dp[i] = x表示，当目标金额为i时，至少需要x枚硬币
        vector<int> dp(amount + 1,amount + 1);

        dp[0] = 0;
        for(int i=0;i<amount;++i) {
            // 内层 for 在求所有子问题 + 1 的最小值
            for(auto coin : coins) {
                // 子问题无解，跳过  总面值比每个值还小，肯定不要这个值了
                if(i - coin < 0) continue;
                dp[i] = min(dp[i],dp[i - coin] + 1);
            }
        }
        return (dp[amount] == amount + 1) ? -1 : dp[amount];
    }
};
```

> PS：为啥dp数组初始化为amount + 1呢，因为凑成amount金额的硬币数最多只可能等于amount（全用 1 元面值的硬币），所以初始化为amount + 1就相当于初始化为正无穷，便于后续取最小值。

## 股票问题

给定一个整数数组 prices ，它的第 i 个元素 prices[i] 是一支给定的股票在第 i 天的价格。

设计一个算法来计算你所能获取的最大利润。你最多可以完成 k 笔交易。

注意：你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。

示例 1：

```
输入：k = 2, prices = [2,4,1]
输出：2
解释：在第 1 天 (股票价格 = 2) 的时候买入，在第 2 天 (股票价格 = 4) 的时候卖出，这笔交易所能获得利润 = 4-2 = 2 。
```

题解：

这道题的状态有三个：

- 天数
- 当天允许交易的最大次数
- 当前的持有状态（即之前说的 rest 的状态，我们不妨用 1 表示持有，0 表示没有持有）

> dp -- 最大利润

比如说 `dp[3][2][1]` 的含义就是：今天是第三天，我现在手上持有着股票，至今最多进行 2 次交易。再比如 `dp[2][3][0]` 的含义：今天是第二天，我现在手上没有持有股票，至今最多进行 3 次交易。

天数：0 <= i <= n-1

最大交易次数：k

持有状态：0 / 1

我们想求的最终答案是 `dp[n - 1][K][0]`，即最后一天，最多允许 K 次交易，所能获取的最大利润。读者可能问为什么不是 `dp[n - 1][K][1]`？因为 [1] 代表手上还持有股票，[0] 表示手上的股票已经卖出去了，很显然后者得到的利润一定大于前者。

我们的选择是 buy, sell, rest，而这些选择是和「持有状态」相关的，所以只看「持有状态」

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/188-01.4yiyi51d2w80.jpeg)

通过这个图可以很清楚地看到，每种状态（0 和 1）是如何转移而来的。根据这个图，我们来写一下状态转移方程：

```
dp[i][k][0] = max( dp[i-1][k][0] + dp[i-1][k-1][1] + prices[i] )
              max(      选择 rest      选择 sell  )

今天没有持有股票，有两种可能：
1.昨天就没有持有，今天选择误操作 rest ,所以今天也是不持有
2.昨天持有，今天卖出了，所以不持有了，价值也增加了


dp[i][k][1] = max( dp[i-1][k][1] + dp[i-1][k-1][0] - prices[i] )
              max(      选择 rest      选择 buy  )
今天持有，有两种可能：
1.昨天就持有了，今天无操作，所以今天依然持有
2.昨天没有持有，今天买入了，今天就持有了，价值也减少了
```

**而且注意 k 的限制，我们在选择 buy 的时候，把最大交易数 k 减小了 1，很好理解吧，当然你也可以在 sell 的时候减 1，一样的**

现在，我们已经完成了动态规划中最困难的一步：**状态转移方程**

接下来就是初始化，就是**定义 base case**

```
dp[-1][k][0] = 0
天数从0开始的，-1意味着还没开始，所以这时候的利润也是0

dp[-1][k][1] = -INT_MAX
还没开始，是不可能有股票的，所以只能为负无穷


第 i 天

dp[i][0][0] = 0
第 i 天，k = 0,然后一次都不能交易，固然利润也是0

dp[i][0][1] = - INT_MAX
第 i 天，一次都不能交易，是不可能持有的，因此只能是负无穷
```

**开始解题**：

### 121. 买卖股票的最佳时机

第一题，当 k = 1

[题目来源](https://leetcode-cn.com/problems/best-time-to-buy-and-sell-stock/)

直接套状态转移方程，根据 base case，可以做一些化简：

```cpp
//今天不持有  无操作或者卖出
dp[i][1][0] = max( dp[i-1][1][0], dp[i-1][1][1] + prices[i] )

//今天持有  无操作或者买入
dp[i][1][1] = max( dp[[i-1][1][1], dp[i-1][1][0] - prices[i] ) 

//k = 0 的 base bace，dp[i-1][0][0] = 0
//第 i 天，k = 0,然后一次都不能交易，固然利润也是0

// 现在 k =1,所以k并不会影响状态转移方程
dp[i][0] = max( dp[i-1][0], dp[i-1][1] + prices[i] )
dp[i][1] = max( dp[i-1][1], -prices[i] )
```

转化成代码：

```cpp
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int n = prices.size() ;  //天数
        // base bace
        vector<vector<int>> dp(n,vector<int>(2));
        for(int i=0;i<n;++i) {
            if(i-1 < 0) {
                dp[i][0] = 0;
                dp[i][1] = -prices[i];
                //    dp[i][1] = max( dp[-1][1], dp[-1][0] - prices[i] )
                //  = dp[i][1] = max( -INT_MAX, 0-prices[i] )  
                //  = -prices[i]
                continue;

            }
            //今天不持有
            dp[i][0] = max( dp[i-1][0], dp[i-1][1] + prices[i] );
            //今天持有，卖出了，说明一次交易完成，k-1,所以dp[i-1][k-1][0] = dp[i-1][0][0] = 0
            dp[i][1] = max( dp[i-1][1], -prices[i] );
        }
        return dp[n-1][0];
    }
};
```

第一题就解决了，但是这样处理 base case 很麻烦，而且注意一下状态转移方程，新状态只和相邻的一个状态有关，其实不用整个 dp 数组，只需要两个变量储存所需的状态就足够了，这样可以把空间复杂度降到 $O(1)$:

```cpp
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int n = prices.size() ;  //天数
        // base bace
        // vector<vector<int>> dp(n,vector<int>(2));
        int dp_i_1 = INT_MIN,dp_i_0 = 0;
        for(int i=0;i<n;++i) {

            //今天不持有
            dp_i_0 = max(dp_i_0,dp_i_1 + prices[i]);
            //今天持有
            dp_i_1 = max(dp_i_1 , -prices[i]);

        }
        return dp_i_0;
    }
};
```

### 122.买卖股票的最佳时机 II

[题目来源](https://leetcode-cn.com/problems/best-time-to-buy-and-sell-stock-ii)

给定一个数组 prices ，其中 prices[i] 是一支给定股票第 i 天的价格。

设计一个算法来计算你所能获取的最大利润。你可以尽可能地完成更多的交易（多次买卖一支股票）。

注意：你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。

示例 1:

```
输入: prices = [7,1,5,3,6,4]
输出: 7
解释: 在第 2 天（股票价格 = 1）的时候买入，在第 3 天（股票价格 = 5）的时候卖出, 这笔交易所能获得利润 = 5-1 = 4 。
     随后，在第 4 天（股票价格 = 3）的时候买入，在第 5 天（股票价格 = 6）的时候卖出, 这笔交易所能获得利润 = 6-3 = 3 。
```

**这题 k 为正无穷**，可以进行无穷次交易。

那么就可以认为 k 和 k - 1 是一样的。可以这样改写框架：

```
dp[i][k][0] = max( dp[i-1][k][0] + dp[i-1][k-1][1] + prices[i] )
              max(      选择 rest      选择 sell  )

dp[i][k][1] = max( dp[i-1][k][1] + dp[i-1][k-1][0] - prices[i] )
              max(      选择 rest      选择 buy  )

我们可以看出 k 已经不会变了，所以 k 不会影响状态转移方程

dp[i][0] = max( dp[i-1][0] + dp[i-1][1] + prices[i] )

dp[i][1] = max( dp[i-1][1] + dp[i-1][0] - prices[i] )
```

题解：

```cpp
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int day = prices.size();
        vector<vector<int>> dp(day, vector<int>(2));
        for(int i=0;i<day;++i) {
            if(i-1 < 0) {
                dp[i][0] = 0;
                dp[i][1] = -prices[i];
                continue;
            }

            dp[i][0] = max(dp[i-1][0], dp[i-1][1] + prices[i]);
            dp[i][1] = max(dp[i-1][1], dp[i-1][0] - prices[i]);
        }
        return dp[day-1][0];
    }
};
```

维护两个数即可

```cpp
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int day = prices.size();
        int dp_i_0 = 0, dp_i_1 = INT_MIN;
        for(int i=0;i<day;++i) {
            int temp = dp_i_0;
            dp_i_0 = max(dp_i_0,dp_i_1 + prices[i]);
            dp_i_1 = max(dp_i_1,temp - prices[i]);
        }
        return dp_i_0;
    }
};
```

### 123.买卖股票的最佳时机 III

[题目来源](https://leetcode-cn.com/problems/best-time-to-buy-and-sell-stock-iii)

给定一个数组，它的第 i 个元素是一支给定的股票在第 i 天的价格。

设计一个算法来计算你所能获取的最大利润。你最多可以完成 两笔 交易。

注意：你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。

示例 1:

```
输入：prices = [3,3,5,0,0,3,1,4]
输出：6
解释：在第 4 天（股票价格 = 0）的时候买入，在第 6 天（股票价格 = 3）的时候卖出，这笔交易所能获得利润 = 3-0 = 3 。
     随后，在第 7 天（股票价格 = 1）的时候买入，在第 8 天 （股票价格 = 4）的时候卖出，这笔交易所能获得利润 = 4-1 = 3 。
```

**这题 k = 2**

```
原始的状态转移，没有化简的地方
dp[i][k][0] = max( dp[i-1][k][0] + dp[i-1][k-1][1] + prices[i] )
              max(      选择 rest      选择 sell  )

dp[i][k][1] = max( dp[i-1][k][1] + dp[i-1][k-1][0] - prices[i] )
              max(      选择 rest      选择 buy  )
```

按照之前的代码，我们可能想当然这样写代码（错误的）

```cpp
int maxProfit(vector<int>& prices) {
    int day = prices.size();
    vector<vector<vector>>> dp(day,vector<vector>>(k+1,vector<int>(2)));
    for(int i=0;i<day;++i) {
        if(i-1<0) { /* 处理base case */}
        dp[i][k][0] = max( dp[i][k][0],  dp[i][k][1] + prices[i] );
        dp[i][k][1] = max( dp[i][k][1],  dp[i][k-1][0] - prices[i] );
    }
    return dp[day][k][0];
}
```

为什么错误？我这不是照着状态转移方程写的吗？

还记得前面总结的「穷举框架」吗？就在强调必须穷举所有状态。其实我们之前的解法，都在穷举所有状态，只是之前的题目中 k 都被化简掉了，所以没有对 k 的穷举。比如说第一题，k = 1：

```cpp
for(int i=0;i<day;++i)  //穷举天数

//穷举持有状态
dp[i][0]
dp[i][1]
```

这道题由于没有消掉 k 的影响，所以必须要用 for 循环对 k 进行穷举才是正确的：

```cpp
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int day = prices.size();
        int max_k = 2;
        vector< vector< vector<int> > > dp(day,vector< vector<int> >(max_k + 1,vector<int>(2)));
        for(int i=0;i<day;++i) {
            for(int k=max_k;k>0;--k) {
                if(i-1<0) { 
                    dp[i][k][0] = 0;
                    dp[i][k][1] = -prices[i];
                    continue;
                }
                dp[i][k][0] = max( dp[i-1][k][0],  dp[i-1][k][1] + prices[i] );
                dp[i][k][1] = max( dp[i-1][k][1],  dp[i-1][k-1][0] - prices[i] );
            }

        }
        return dp[day-1][max_k][0];
    }
};
```

第二种解法：因为这里 k 取值范围比较小，所以也可以不用 for 循环，直接把 k = 1 和 2 的情况手动列举出来也是一样的。

```cpp
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int day = prices.size();
        int dp_i10 = 0,dp_i11 = INT_MIN;
        int dp_i20 = 0,dp_i21 = INT_MIN;
        for(int i=0;i<day;++i) {
            dp_i20 = max(dp_i20,dp_i21 + prices[i]);
            dp_i21 = max(dp_i21,dp_i10 - prices[i]);  //k-1
            dp_i10 = max(dp_i10,dp_i11 + prices[i]);
            dp_i11 = max(dp_i11,- prices[i]);  //k-1
        }
        return dp_i20;
    }
};
```

### 188.买卖股票的最佳时机 IV

[题目来源](https://leetcode-cn.com/problems/best-time-to-buy-and-sell-stock-iv/)

给定一个整数数组 prices ，它的第 i 个元素 prices[i] 是一支给定的股票在第 i 天的价格。

设计一个算法来计算你所能获取的最大利润。你最多可以完成 k 笔交易。

注意：你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。

 
示例 1：

```
输入：k = 2, prices = [2,4,1]
输出：2
解释：在第 1 天 (股票价格 = 2) 的时候买入，在第 2 天 (股票价格 = 4) 的时候卖出，这笔交易所能获得利润 = 4-2 = 2 。
```

**k 是任意数**

思路：

一次交易由买入和卖出构成，至少需要两天。所以说有效的限制次数 k 应该不超过 `day/2`，如果超过，就没有约束作用了，相当于 `k = +infinity`。这种情况是之前解决过的

```cpp
class Solution {
public:
    int maxProfit(int k, vector<int>& prices) {
        int day = prices.size();
        //相当于k是正无穷
        if(k > day / 2) {
            return maxProfit_k_inf(prices);
        }
        vector<vector<vector<int>>> dp(day,vector<vector<int>> (k+1,vector<int>(2)));
        for(int i=0;i<day;++i) {
            for(int ki = k;ki>0;--ki ) {
                if(i-1<0) {
                    dp[i][ki][0] = 0;
                    dp[i][ki][1] = -prices[i];
                    continue;
                }
                dp[i][ki][0] = max(dp[i-1][ki][0],dp[i-1][ki][1] + prices[i]);
                dp[i][ki][1] = max(dp[i-1][ki][1],dp[i-1][ki-1][0] - prices[i]);
            }
        }
        return dp[day-1][k][0];
    }

    int maxProfit_k_inf(const vector<int> &prices) {
        int day = prices.size();
        int dp_i_0 = 0,dp_i_1 = INT_MIN;
        for(int i=0;i<day;++i) {
            int temp = dp_i_0;
            dp_i_0 = max(dp_i_0,dp_i_1 + prices[i]);
            dp_i_1 = max( dp_i_1, temp - prices[i] );
        }
        return dp_i_0;
    }
};
```

### 309. 最佳买卖股票时机含冷冻期

[题目来源](https://leetcode-cn.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/)

给定一个整数数组，其中第 i 个元素代表了第 i 天的股票价格 。​

设计一个算法计算出最大利润。在满足以下约束条件下，你可以尽可能地完成更多的交易（多次买卖一支股票）:

你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。
卖出股票后，你无法在第二天买入股票 (即冷冻期为 1 天)。
示例:

```
输入: [1,2,3,0,2]
输出: 3 
解释: 对应的交易状态为: [买入, 卖出, 冷冻期, 买入, 卖出]
```

**K 无穷次，并且有冷冻期**

```cpp
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int day = prices.size();
        if(day <= 1) return 0;
        int dp_i_0 = 0,dp_i_1 = INT_MIN;
        int dp_pre_0 = 0;
        for(int i=0;i<day;++i) {
            int temp = dp_i_0;
            dp_i_0 = max( dp_i_0,dp_i_1 + prices[i] );
            dp_i_1 = max( dp_i_1,dp_pre_0 - prices[i] );
            dp_pre_0 = temp;
        }
        return dp_i_0;
    }
};
```

### 714. 买卖股票的最佳时机含手续费

[题目来源](https://leetcode-cn.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/)

给定一个整数数组 prices，其中第 i 个元素代表了第 i 天的股票价格 ；非负整数 fee 代表了交易股票的手续费用。

你可以无限次地完成交易，但是你每笔交易都需要付手续费。如果你已经购买了一个股票，在卖出它之前你就不能再继续购买股票了。

返回获得利润的最大值。

注意：这里的一笔交易指买入持有并卖出股票的整个过程，每笔交易你只需要为支付一次手续费。

示例 1:

```
输入: prices = [1, 3, 2, 8, 4, 9], fee = 2
输出: 8
解释: 能够达到的最大利润:  
在此处买入 prices[0] = 1
在此处卖出 prices[3] = 8
在此处买入 prices[4] = 4
在此处卖出 prices[5] = 9
总利润: ((8 - 1) - 2) + ((9 - 4) - 2) = 8.
```

**k 无穷次，并且有手续费**

```cpp
class Solution {
public:
    int maxProfit(vector<int>& prices, int fee) {
        int day = prices.size();
        if(day <= 1) return 0;
        int dp_i_0 = 0,dp_i_1 = INT_MIN;
        for(int i=0;i<day;++i) {
            int temp = dp_i_0;
            dp_i_0 = max( dp_i_0, dp_i_1 + prices[i] );
            //这里还需要支付手续费
            dp_i_1 = max( dp_i_1,temp - prices[i] - fee );
        }
        return dp_i_0;
    }
};
```

------

## 打家劫舍系列问题

### 198. 打家劫舍

[题目来源](https://leetcode-cn.com/problems/house-robber/)

你是一个专业的小偷，计划偷窃沿街的房屋。每间房内都藏有一定的现金，影响你偷窃的唯一制约因素就是相邻的房屋装有相互连通的防盗系统，如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警。

给定一个代表每个房屋存放金额的非负整数数组，计算你 不触动警报装置的情况下 ，一夜之内能够偷窃到的最高金额。

[我写的题解](https://leetcode-cn.com/problems/house-robber/solution/lian-wo-du-neng-kan-dong-de-dong-tai-gui-k9rt/?)

示例 1：
```
输入：[1,2,3,1]
输出：4
解释：偷窃 1 号房屋 (金额 = 1) ，然后偷窃 3 号房屋 (金额 = 3)。
     偷窃到的最高金额 = 1 + 3 = 4 。
```

- 使用动态数组 dp

```cpp
class Solution {
public:
    int rob(vector<int>& nums) {
        if(nums.size() == 1) return nums[0];
        vector<vector<int>> dp(nums.size() + 1,vector<int>(2));
        //0代表0号房间，并不是1号房间
        dp[0][0] = 0;
        dp[0][1] = INT_MIN;
        for(int i=1;i<=nums.size();++i) {
            dp[i][0] = max( dp[i-1][1],dp[i-1][0] );
            dp[i][1] = dp[i-1][0] + nums[i-1];  //num是从0开始的
        }

        return max(dp[nums.size() ][0],dp[nums.size()][1]);
    }
};
```

时间复杂度是：O(n)

空间复杂度是：O(2n)

- 维护两个数

```cpp
class Solution {
public:
    int rob(vector<int>& nums) {
        if(nums.size() == 1) return nums[0];

        int dp_i_0 = 0;
        int dp_i_1 = INT_MIN;
        for(int i=1;i<=nums.size();++i) {
            int temp = dp_i_0; 
            dp_i_0 = max( dp_i_1,dp_i_0 );
            dp_i_1 = temp + nums[i-1];  //num是从0开始的
        }

        return max(dp_i_0,dp_i_1);
    }
};
```

时间复杂度是：O(n)

空间复杂度是：O(1)

- [参考`labuladong`的解法](https://mp.weixin.qq.com/s?__biz=MzAxODQxMDM0Mw==&mid=2247484800&idx=1&sn=1016975b9e8df0b8f6df996a5fded0af&chksm=9bd7fb88aca0729eb2d450cca8111abd8f861236b04125ce556171cb520e298ddec4d90823b3&scene=21#wechat_redirect)

使用动态规划函数来做，取 偷 和 不偷 的最大值


```cpp
class Solution {
public:
    int rob(vector<int>& nums) {
        return dp(nums,0);
    }
    int dp(vector<int> &nums,int start) {
        if(start >= nums.size()) {
            return 0;
        }
        // 偷或者不偷的最大值
        int ret = max( 
            dp(nums,start+1),  //不偷，去下家
            nums[start] + dp(nums,start+2)  //偷，去下下家，下家肯定不能再偷了
            );
        return ret;
    }
};
```

有重叠子问题，超时

使用哈希表来做备忘录，当然也可以使用数组。

```cpp
class Solution {
public:
    unordered_map<int,int> mp;

    int rob(vector<int>& nums) {
        return dp(nums,0);
    }
    int dp(vector<int> &nums,int start) {
        if(start >= nums.size()) {
            return 0;
        }

        //消除重叠子问题
        if(mp.find( start ) != mp.end() ) return mp[start];
        // 偷或者不偷的最大值
        int ret = max( 
            dp(nums,start+1),  //不偷，去下家
            nums[start] + dp(nums,start+2)  //偷，去下下家，下家肯定不能再偷了
            );
        
        //记入备忘录
        mp[start] = ret;
        return ret;
    }
};
```

### 213. 打家劫舍 II

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/213.3nts842w34o0.png)

但是情况一明显取到的钱比情况二和三少。

```cpp
class Solution {
public:
    int rob(vector<int>& nums) {
        if(nums.size() == 1) return nums[0];
        if(nums.size() == 2) return max( nums[0],nums[1] );

        int dp_i_0 = 0;
        int dp_i_1 = INT_MIN;

        int dp_j_0 = 0;
        int dp_j_1 = INT_MIN;

        for(int i=0,j=1;i<nums.size() - 1 && j < nums.size();++i,++j) {

            // 算的是第一种情况
            int temp = dp_i_0; 
            dp_i_0 = max( dp_i_1,dp_i_0 );
            dp_i_1 = temp + nums[i];  //num是从0开始的

            //算的是第二种情况
            int temp1 = dp_j_0; 
            dp_j_0 = max( dp_j_1,dp_j_0 );
            dp_j_1 = temp1 + nums[j];  //num是从0开始的
        }
        return max(max(dp_i_0,dp_i_1),max(dp_j_0,dp_j_1));
    }
};
```
