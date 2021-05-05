**明确「状态」 -> 定义 dp 数组/函数的含义 -> 明确「选择」-> 明确 base case**。

## 剑指 Offer 10- I.斐波那契数列

[题目来源](https://leetcode-cn.com/problems/fei-bo-na-qi-shu-lie-lcof/)


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

优化只维护看个数

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

## 凑零钱为题

[题目来源](https://leetcode-cn.com/problems/coin-change/)

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



