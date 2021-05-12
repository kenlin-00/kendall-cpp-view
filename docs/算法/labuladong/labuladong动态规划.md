**明确「状态」 -> 定义 dp 数组/函数的含义 -> 明确「选择」-> 明确 base case**。

**求解动态规划的核心问题是穷举**，因为要求最值，肯定要把可行的答案穷举出来。

动态规划的穷举存在**重叠子问题**，如果暴力穷举的话效率会非常低，所以需要「**备忘录**」或者「**DP table**」来优化穷举过程，避免不必要的计算。

而且，动态规划问题一定会具备「**最优子结构**」，才能通过子问题的最值得到原问题的最值。

只有列出正确的「**状态转移方程**」才能正确地穷举。


## 剑指 Offer 10- I.斐波那契数列

[题目来源](https://leetcode-cn.com/problems/fei-bo-na-qi-shu-lie-lcof/)

[labuladong](https://mp.weixin.qq.com/s?__biz=MzAxODQxMDM0Mw==&mid=2247484731&idx=1&sn=f1db6dee2c8e70c42240aead9fd224e6&chksm=9bd7fb33aca07225bee0b23a911c30295e0b90f393af75eca377caa4598ffb203549e1768336&scene=21#wechat_redirect)

这就是动态规划问题的第一个性质：**重叠子问题**


**带备忘录的递归解法**

也就是用一个动态数组来保存每一次的状态。也即是 `DP table`。

```cpp
int fib(int N) {
    vector<int> dp(N + 1, 0);
    // base case
    dp[1] = dp[2] = 1;
    for (int i = 3; i <= N; i++)
        dp[i] = dp[i - 1] + dp[i - 2];
    return dp[N];
}
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
        for(int i=0;i<dp.size();++i) {
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

## 494.目标和

[题目来源](https://leetcode-cn.com/problems/target-sum/)


给定一个非负整数数组，a1, a2, ..., an, 和一个目标数，S。现在你有两个符号 + 和 -。对于数组中的任意一个整数，你都可以从 + 或 -中选择一个符号添加在前面。

返回可以使最终数组和为目标数 S 的所有添加符号的方法数。


示例：
```
输入：nums: [1, 1, 1, 1, 1], S: 3
输出：5
解释：

-1+1+1+1+1 = 3
+1-1+1+1+1 = 3
+1+1-1+1+1 = 3
+1+1+1-1+1 = 3
+1+1+1+1-1 = 3

一共有5种方法让最终目标和为3。
```

[参考](https://mp.weixin.qq.com/s?__biz=MzAxODQxMDM0Mw==&mid=2247485700&idx=1&sn=433fc5ec5e03a86064d458320332a688&chksm=9bd7f70caca07e1aad658333ac05df501796862a418d8f856b12bb6ca73a924552901ec86d9b&scene=21#wechat_redirect)


### 回溯思路

回溯算法框架：

```
def backtrack(路径, 选择列表):
    if 满足结束条件:
        result.add(路径)
        return

    for 选择 in 选择列表:
        做选择
        backtrack(路径, 选择列表)
        撤销选择
```

关键就是搞清楚什么是「选择」，而对于这道题，**对于每个数字 `nums[i]`，我们可以选择给一个正号 `+` 或者一个负号 `-`**，然后利用回溯模板穷举出来所有可能的结果，数一数到底有几种组合能够凑出 `target` 不就行了嘛？

```cpp
class Solution {
public:
    int result = 0;  //记录了几种方法
    int findTargetSumWays(vector<int>& nums, int target) {
        if(nums.size() == 0) return 0;
        backtrack(nums,0,target);
        return result;
    }
    void backtrack(vector<int> &nums,int index,int target) {
        //如果满足条件就退出
        if(index == nums.size()) {
            if(target == 0) {  //将target减到0了，说明就是组成target了
                ++result;
            }
            return;
        }
        // for 选择 in 选择列表
        // 选择
        // 回溯
        // 撤销选择
        // 选择 - 号
        target += nums[index];
        //回溯
        backtrack(nums,index + 1,target);
        //选择撤销
        target -= nums[index];

        //选择 + 号
        target -= nums[index];
        backtrack(nums,index + 1,target);
        target += nums[index];
    }
};
```


超出时间限制

选择 - 的时候，为什么是 `rest += nums[i]`，选择 + 的时候，为什么是 `rest -= nums[i]` 呢，是不是写反了？

不是的，「如何凑出 `target`」和「如何把 `target` 减到 0」其实是一样的。我们这里选择后者，因为前者必须给 `backtrack` 函数多加一个参数，我觉得不美观：



### 消除重叠子问题

如何发现重叠子问题？看否可能出现重复的「状态」。对于递归函数来说，函数参数中会变的参数就是「状态」，对于 backtrack 函数来说，会变的参数为 i 和 rest。

**有一种一眼看出重叠子问题的方法**，先抽象出递归框架：

```cpp
void backtrack(int i, int rest) {
    backtrack(i + 1, rest - nums[i]);
    backtrack(i + 1, rest + nums[i]);
}
```

举个简单的例子，如果 `nums[i] = 0`，会发生什么？

```cpp
void backtrack(int i, int rest) {
    backtrack(i + 1, rest);
    backtrack(i + 1, rest);
}
```

你看，这样就出现了两个「状态」完全相同的递归函数，无疑这样的递归计算就是重复的。**这就是重叠子问题，而且只要我们能够找到一个重叠子问题，那一定还存在很多的重叠子问题**。

因此，状态 `(i, rest) `是可以用备忘录技巧进行优化的：

```cpp
class Solution {
public:
    // int result = 0;  //记录了几种方法
    //备忘录
    unordered_map<string,int> memo;
    int findTargetSumWays(vector<int>& nums, int target) {
        if(nums.size() == 0) return 0;
        return dp(nums,0,target);
    }
    
    int dp(vector<int> &nums,int index,int target) {
        //如果满足条件就退出
        if(index == nums.size()) {
            if(target == 0) {  //将target减到0了，说明就是组成target了
                return 1;
            }
            return 0;
        }
        ostringstream s;
        s << index << "," << target;
        string key = s.str();
        // string key = index + "," + target;
        auto it = memo.find(key);
        if(it != memo.end()) {  //如果存在，就直接返回这里的值
            return memo[key];
        }
        
        //穷举 正号 + 负号
        int result = dp(nums,index+1,target - nums[index]) + dp(nums,index+1,target+nums[index]);

        //装入备忘录
        memo.emplace(key,result);
        return result;
    }
};
```

时间复杂度依然是：$O(2^n)$

### 动态规划

其实，这个问题可以转化为一个子集划分问题，而子集划分问题又是一个典型的背包问题。动态规划总是这么玄学，让人摸不着头脑……

首先，如果我们把 nums 划分成两个子集 A 和 B，分别代表分配 + 的数和分配 - 的数，那么他们和 target 存在如下关系：

```
sum(A) - sum(B) = target
sum(A) = target + sum(B)
sum(A) + sum(A) = target + sum(B) + sum(A)
2 * sum(A) = target + sum(nums)
```

综上，可以推出 `sum(A) = (target + sum(nums)) / 2`，也就是把原问题转化成：**nums 中存在几个子集 A，使得 A 中元素的和为 `(target + sum(nums)) / 2` ？**

现在实现这么一个函数：
```cpp
/* 计算 nums 中有几个子集的和为 sum */
int subsets(int[] nums, int sum) {}
```

然后，可以这样调用这个函数：

```cpp
int findTargetSumWays(int[] nums, int target) {
    int sum = 0;
    for (int n : nums) sum += n;
    // 这两种情况，不可能存在合法的子集划分
    //sum < target 就算全部是加号也不能组成target，
    if (sum < target || (sum + target) % 2 == 1) {
        return 0;
    }
    return subsets(nums, (sum + target) / 2);
}
```

好的，变成背包问题的标准形式：

有一个背包，容量为 sum，现在给你 `N` 个物品，第 i 个物品的重量为 `nums[i - 1]`（注意 `1 <= i <= N`），每个物品只有一个，请问你有几种不同的方法能够恰好装满这个背包？

**第一步要明确两点，「状态」和「选择」。**

对于背包问题，这个都是一样的，状态就是「背包的容量」和「可选择的物品」，选择就是「装进背包」或者「不装进背包」。

**第二步要明确 dp 数组的定义。**

按照背包问题的套路，可以给出如下定义：

`dp[i][j] = x` 表示，若只在前 `i` 个物品中选择，若当前背包的容量为 `j`，则最多有 `x` 种方法可以恰好装满背包。

翻译成我们探讨的子集问题就是，若只在 `nums` 的前 `i` 个元素中选择，若目标和为 `j`，则最多有 `x` 种方法划分子集。

根据这个定义，显然 `dp[0][..] = 0`，因为没有物品的话，根本没办法装背包；`dp[..][0] = 1`，因为如果背包的最大载重为 0，「什么都不装」就是唯一的一种装法。

我们所求的答案就是 `dp[N][sum]`，即使用所有 `N`个物品，有几种方法可以装满容量为 `sum` 的背包。

**第三步，根据「选择」，思考状态转移的逻辑。**

回想刚才的 `dp` 数组含义，可以根据「选择」对 `dp[i][j]` 得到以下状态转移：

如果不把 `nums[i]` 算入子集，**或者说你不把这第 i 个物品装入背包**，那么恰好装满背包的方法数就取决于上一个状态 `dp[i-1][j]`，继承之前的结果。

如果把 `nums[i]` 算入子集，**或者说你把这第 `i` 个物品装入了背包**，那么只要看前 `i - 1` 个物品有几种方法可以装满 `j - nums[i-1]` 的重量就行了，所以取决于状态 `dp[i-1][j-nums[i-1]]`。

PS：注意我们说的 `i` 是从 `1` 开始算的，而数组 `nums` 的索引时从 `0` 开始算的，所以 `nums[i-1]` 代表的是第 i 个物品的重量，`j - nums[i-1]` 就是背包装入物品 i 之后还剩下的容量。

**由于 `dp[i][j]` 为装满背包的总方法数，所以应该以上两种选择的结果求和，得到状态转移方程**：

```cpp
dp[i][j] = dp[i-1][j] + dp[i-1][j-nums[i-1]];
```

## 股票问题

给定一个整数数组 prices ，它的第 i 个元素 prices[i] 是一支给定的股票在第 i 天的价格。

设计一个算法来计算你所能获取的最大利润。你最多可以完成 k 笔交易。

注意：你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。

示例 1：
```
输入：k = 2, prices = [2,4,1]
输出：2
解释：在第 1 天 (股票价格 = 2) 的时候买入，在第 2 天 (股票价格 = 4) 的时候卖出，这笔交易所能获得利润 = 4-2 = 2 。
````

题解：

这道题的状态有三个：

- 天数
- 当天允许交易的最大次数
- 当前的持有状态（即之前说的 rest 的状态，我们不妨用 1 表示持有，0 表示没有持有）

dp -- 最大利润

比如说 `dp[3][2][1]` 的含义就是：今天是第三天，我现在手上持有着股票，至今最多进行 2 次交易。再比如 `dp[2][3][0]` 的含义：今天是第二天，我现在手上没有持有股票，至今最多进行 3 次交易。

天数：0 <= i <= n-1

最大交易次数：k

持有状态：0 / 1

我们想求的最终答案是 `dp[n - 1][K][0]`，即最后一天，最多允许 K 次交易，所能获取的最大利润。读者可能问为什么不是 `dp[n - 1][K][1]`？因为 [1] 代表手上还持有股票，[0] 表示手上的股票已经卖出去了，很显然后者得到的利润一定大于前者。

我们的选择是 buy, sell, rest，而这些选择是和「持有状态」相关的，所以只看「持有状态」

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/188-01.4yiyi51d2w80.jpeg)

通过这个图可以很清楚地看到，每种状态（0 和 1）是如何转移而来的。根据这个图，我们来写一下状态转移方程：

```
dp[i][k][0] = max( dp[i-1][k][0] + dp[i-1][k][1] + prices[i] )
              max(      选择 rest      选择 sell  )

今天没有持有股票，有两种可能：
1.昨天就没有持有，今天选择误操作 rest ,所以今天也是不持有
2.昨天持有，今天卖出了，所以不持有了，价值也增加了

dp[i][k][1] = max( dp[i-1][k][1] + dp[i-1][k][0] - prices[i] )
              max(      选择 rest      选择 buy  )
今天持有，有两种可能：
1.昨天就持有了，今天无操作，所以今天依然持有
2.昨天没有持有，今天买入了，今天就持有了，价值也减少了
```

现在，我们已经完成了动态规划中最困难的一步：**状态转移方程**

接下来就是初始化，就是**定义 base case**

```
dp[-1][k][0] = 0
天数从0开始的，-1意味着还没开始，所以这时候的利润也是0

dp[-1][k][1] = -INT_MAX
还没开始，是不可能有股票的，所以只能为负无穷

dp[1][0][0] = 0
开始第一天，然后一次都不能交易，固然利润也是0

dp[1][0][1] = - INT_MAX
开始第一天，一次都不能交易，是不可能持有的，因此只能是负无穷
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
            //今天持有
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
            if(i-1 < 0) {
                dp_i_0 = 0;
                dp_i_1 = -prices[i];
                //    dp[i][1] = max( dp[-1][1], dp[-1][0] - prices[i] )
                //  = dp[i][1] = max( -INT_MAX, 0-prices[i] )  
                //  = -prices[i]
                continue;

            }
            //今天不持有
            dp_i_0 = max(dp_i_0,dp_i_1 + prices[i]);
            //今天持有
            dp_i_1 = max(dp_i_1 , -prices[i]);

        }
        return dp_i_0;
    }
};
```





