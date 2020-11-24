## 旋转数组的最小数字
[题目来源](https://leetcode-cn.com/problems/xuan-zhuan-shu-zu-de-zui-xiao-shu-zi-lcof/)

题目描述

把一个数组最开始的若干个元素搬到数组的末尾，我们称之为数组的旋转。

输入一个非递减排序的数组的一个旋转，输出旋转数组的最小元素。

NOTE：给出的所有元素都大于0，若数组大小为0，请返回0。

实例：
```
输入：[3,4,5,1,2]
输出：1

输入：[2,2,2,0,1]
输出：0
```
**题解：使用二分查找**
```js
class Solution {
public:
    int minArray(vector<int>& numbers) {
        if(numbers.empty()) {
            return 0;
        }
       int start = 0,end = numbers.size() - 1;
       while(start + 1 < end) {
           int mid = start + (end - start) / 2;
            if(numbers[mid] > numbers[end]) {
                start = mid;
            }else if(numbers[mid] < numbers[end]) {
                end = mid;
            }else {
                -- end;
            }
       }
       return numbers[start] < numbers[end] ? numbers[start] : numbers[end];
    }
};
```
改一下
```js
class Solution {
public:
    int minArray(vector<int>& numbers) {
        if(numbers.size() == 0) {
            return 0;
        }
        int start = 0,end = numbers.size() - 1;
        while(start < end) {
            if(numbers[start] < numbers[end]) {//确认子数组是否是类似1,1,2,4,5,..,7的非递减数组
                return numbers[start];
            }
            int mid = start + (end - start) /2;
            if(numbers[mid] > numbers[start]) {
                start = mid + 1;
            }else if(numbers[mid] < numbers[end]) {
                end = mid;
            }else {
                ++ start;  //这是是start++，return start
            }
        }
        return numbers[start];
    }
};
```

## 青蛙跳台阶问题
[题目来源](https://leetcode-cn.com/problems/qing-wa-tiao-tai-jie-wen-ti-lcof/)

一只青蛙一次可以跳上1级台阶，也可以跳上2级台阶。求该青蛙跳上一个 n 级的台阶总共有多少种跳法。

答案需要取模 1e9+7（1000000007），如计算初始结果为：1000000008，请返回 1。

示例：
```
输入：n = 2
输出：2

输入：n = 0
输出：1

```
提示：      
0 <= n <= 100

思路：

1.第0级台阶到第1级台 只有一种方法 上1级台阶

2.第0级台阶到第2级台 有两种方法 一种是0-2 上2级台阶 一种是上到1级台阶 再上2级台阶

3.第0级台阶到第3级台 有两种方法 一种是0-2 再2-3 一种是0-1 1-3 (其中0-1 1-2 2-3已经包含在前面的方法中了)

4.逆向来看就是 n台阶的方案数量 = n-1台阶方案数量 + n-2的方案数量

总结斐波那契数列：f(n) = f(n - 1) + f(n - 2)

```js
class Solution {
public:
    int numWays(int n) {
        if(n == 0) 
            return 1;
        if(n <=2) 
            return n;
        long one = 1,two = 2;
        long res;
        for(int i = 3;i<=n;++i) {
            res = (one + two) % 1000000007;
            one = two;
            two = res;
        }
        return res;
    }
};
```
使用动态规划
```js
class Solution {
public:
    int numWays(int n) {
        vector<int> v(n+1,1);
        for(int i=2;i <= n;i++) {
            v[i] = (v[i-1] + v[i-2]) % 1000000007;
        }
        return v[n];
    }
};
```

## 二叉树的镜像
[题目来源](https://leetcode-cn.com/problems/er-cha-shu-de-jing-xiang-lcof/)
请完成一个函数，输入一个二叉树，该函数输出它的镜像。

例如输入：
```
     4
   /   \
  2     7
 / \   / \
1   3 6   9

镜像输出：

     4
   /   \
  7     2
 / \   / \
9   6 3   1
```
示例：
```
输入：root = [4,2,7,1,3,6,9]
输出：[4,7,2,9,6,3,1]
```
递归交换左右子树
```js
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode(int x) : val(x), left(NULL), right(NULL) {}
 * };
 */
class Solution {
public:
    TreeNode* mirrorTree(TreeNode* root) {
        //吐过根节点为空或者左右子树都为空，直接返回root
        if(!root || (!root -> right && !root -> left) ) {
            return root;
        } 
        swap(root);
        mirrorTree(root -> left);
        mirrorTree(root -> right);
        return root;

    }
    //写一个交换左右子树的函数
    void swap(TreeNode * node) {
        if(!node || (!node -> left && !node -> right)) {
            return;
        }
        TreeNode * temp = node -> left;
        node -> left = node -> right;
        node -> right = temp;
    }
};
```
使用栈迭代实现
```js
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode(int x) : val(x), left(NULL), right(NULL) {}
 * };
 */
class Solution {
public:
    TreeNode* mirrorTree(TreeNode* root) {
        stack<TreeNode*> stk;
        //如果根节点为空，就直接返回根节点
        if(root) stk.push(root);
        while(stk.size()) { //如果栈不空
            //取出栈顶元素
            TreeNode *tr = stk.top();
            //栈顶元素出栈
            stk.pop();
            swap(tr->left,tr->right);
            if(tr -> left) stk.push(tr->left);
            if(tr -> right) stk.push(tr->right);
        }
        return root;
    }
};
```







