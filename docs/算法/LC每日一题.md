> 看我能检查打卡多少天，今天是2021年3月28

## 173. 二叉搜索树迭代器

[题目来源](https://leetcode-cn.com/problems/binary-search-tree-iterator/)

实现一个二叉搜索树迭代器类`BSTIterator` ，表示一个按中序遍历二叉搜索树（`BST`）的迭代器：
`BSTIterator(TreeNode root)` 初始化 `BSTIterator` 类的一个对象。`BST` 的根节点 root 会作为构造函数的一部分给出。指针应初始化为一个不存在于 `BST` 中的数字，且该数字小于 `BST` 中的任何元素。

`boolean hasNext()` 如果向指针右侧遍历存在数字，则返回 `true` ；否则返回 `false` 。
`int next()`将指针向右移动，然后返回指针处的数字。
注意，指针初始化为一个不存在于 `BST` 中的数字，所以对 `next()` 的首次调用将返回 `BST` 中的最小元素。

你可以假设 `next()` 调用总是有效的，也就是说，当调用 `next()` 时，`BST` 的中序遍历中至少存在一个下一个数字。

示例：

![](./img/LC每日一题/bst-tree.png)

```cpp
输入
["BSTIterator", "next", "next", "hasNext", "next", "hasNext", "next", "hasNext", "next", "hasNext"]
[[[7, 3, 15, null, null, 9, 20]], [], [], [], [], [], [], [], [], []]
输出
[null, 3, 7, true, 9, true, 15, true, 20, false]

解释
BSTIterator bSTIterator = new BSTIterator([7, 3, 15, null, null, 9, 20]);
bSTIterator.next();    // 返回 3
bSTIterator.next();    // 返回 7
bSTIterator.hasNext(); // 返回 True
bSTIterator.next();    // 返回 9
bSTIterator.hasNext(); // 返回 True
bSTIterator.next();    // 返回 15
bSTIterator.hasNext(); // 返回 True
bSTIterator.next();    // 返回 20
bSTIterator.hasNext(); // 返回 False
```

题解：

实际上就是写中序遍历，首先构造函数进程初始化，然后调用`next()`并返回中序遍历到的各个节点的值，如果不是左后一个元素`hasNext`返回`true`。

```cpp
class BSTIterator {
private:
    TreeNode* cur;
    stack<TreeNode*> st;
public:
    BSTIterator(TreeNode* root):cur(root){

    }
    
    int next() {
        //先跑到最左边
        while(cur != nullptr) {
            st.push(cur);
            cur = cur->left;
        }
        cur = st.top();
        st.pop();
        int ret = cur->val;
        cur = cur->right;
        return ret;
    }
    
    bool hasNext() {
        // 这时候cur已经指向right节点了，
        //这个判断和普通中序遍历判断条件一样
        if(cur != nullptr || !st.empty()) return true;
        else return false;
    }
};

/**
 * Your BSTIterator object will be instantiated and called as such:
 * BSTIterator* obj = new BSTIterator(root);
 * int param_1 = obj->next();
 * bool param_2 = obj->hasNext();
 */
```

时间复杂度：显然，初始化和调用 `hasNext()` 都只需要 `O(1)` 的时间。每次调用 `next()` 函数最坏情况下需要 `O(n)` 的时间；但考虑到 `n` 次调用 `next()` 函数总共会遍历全部的 `n` 个节点，因此总的时间复杂度为 `O(n)`，因此单次调用平均下来的均摊复杂度为 `O(1)`。

空间复杂度：`O(n)`，其中 `n` 是二叉树的节点数量。空间复杂度取决于栈深度，而栈深度在二叉树为一条链的情况下会达到 `O(n)` 的级别。

## 190. 颠倒二进制位

[题目来源](https://leetcode-cn.com/problems/reverse-bits/)

颠倒给定的 32 位无符号整数的二进制位。

示例
```
输入: 00000010100101000001111010011100
输出: 00111001011110000010100101000000
解释: 输入的二进制串 00000010100101000001111010011100 表示无符号整数 43261596，
     因此返回 964176192，其二进制表示形式为 00111001011110000010100101000000。
```

```cpp
class Solution {
public:
    uint32_t reverseBits(uint32_t n) {
        uint32_t result = 0;
        for (int i = 0; i < 32; ++i)
            result = (result << 1) + (n >> i & 1);
        return result;
    }
};
```

## 74. 搜索二维矩阵

[题目来源](https://leetcode-cn.com/problems/search-a-2d-matrix/)

编写一个高效的算法来判断 `m x n` 矩阵中，是否存在一个目标值。该矩阵具有如下特性：

- 每行中的整数从左到右按升序排列。
- 每行的第一个整数大于前一行的最后一个整数。

示例1：

![](./img/LC每日一题/74-01.jpeg)

```
输入：matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3
输出：true
```

示例2：

![](./img/LC每日一题/74-02.jpeg)

```
输入：matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13
输出：false
```

题解：从左下角开始

```cpp
class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        int i = matrix.size() - 1; //行
        int j = 0;  //列
        while(i >= 0 && j < matrix[0].size()) {
            if(matrix[i][j] == target) return true;
            else if(matrix[i][j] > target) --i;
            else ++j; 
        }
        return false;
    }
};
```

时间复杂度：`O(logmn)`，其中 `m` 和 `n` 分别是矩阵的行数和列数。

空间复杂度：`O(1)`。

## 90.子集 II

给你一个整数数组 nums ，其中可能包含重复元素，请你返回该数组所有可能的子集（幂集）。

解集 不能 包含重复的子集。返回的解集中，子集可以按 任意顺序 排列。

示例 1：
```
输入：nums = [1,2,2]
输出：[[],[1],[1,2],[1,2,2],[2],[2,2]]
```

## 1006. 笨阶乘

[题目来源](https://leetcode-cn.com/problems/clumsy-factorial/)

通常，正整数 `n` 的阶乘是所有小于或等于 `n` 的正整数的乘积。例如，`factorial(10) = 10 * 9 * 8 * 7 * 6 * 5 * 4 * 3 * 2 * 1`。

相反，我们设计了一个笨阶乘 `clumsy`：在整数的递减序列中，我们以一个固定顺序的操作符序列来依次替换原有的乘法操作符：乘法`(*)`，除法`(/)`，加法`(+)`和减法`(-)`。

例如，`clumsy(10) = 10 * 9 / 8 + 7 - 6 * 5 / 4 + 3 - 2 * 1`。然而，这些运算仍然使用通常的算术运算顺序：我们在任何加、减步骤之前执行所有的乘法和除法步骤，并且按从左到右处理乘法和除法步骤。

另外，我们使用的除法是地板除法`（floor division）`，所以 `10 * 9 / 8` 等于 `11`。这保证结果是一个整数。

实现上面定义的笨函数：给定一个整数 `N`，它返回 `N` 的笨阶乘。

```
输入：4
输出：7
解释：7 = 4 * 3 / 2 + 1

输入：10
输出：12
解释：12 = 10 * 9 / 8 + 7 - 6 * 5 / 4 + 3 - 2 * 1
```

```cpp
class Solution {
public:
    int clumsy(int N) {
        stack<int> stk;
        stk.push(N);
        N--;

        int index = 0; // 用于控制乘、除、加、减
        while (N > 0) {
            if (index % 4 == 0) {
                stk.top() *= N;
            } else if (index % 4 == 1) {
                stk.top() /= N;
            } else if (index % 4 == 2) {
                stk.push(N);
            } else {
                stk.push(-N);
            }
            index++;
            N--;
        }

        // 把栈中所有的数字依次弹出求和
        int sum = 0;
        while (!stk.empty()) {
            sum += stk.top();
            stk.pop();
        }
        return sum;
    }
};
```

## 面试题 17.21. 直方图的水量

[题目来源](https://leetcode-cn.com/problems/volume-of-histogram-lcci/)

给定一个直方图(也称柱状图)，假设有人从上面源源不断地倒水，最后直方图能存多少水量?直方图的宽度为 1。

![](./img/LC每日一题/面试题17-21-01.png)

上面是由数组 `[0,1,0,2,1,0,1,3,2,1,2,1]` 表示的直方图，在这种情况下，可以接 6 个单位的水（蓝色部分表示水）
```
输入: [0,1,0,2,1,0,1,3,2,1,2,1]
输出: 6
```

## 1143.最长公共子序列
给

给定两个字符串 `text1` 和 `text2`，返回这两个字符串的最长 公共子序列 的长度。如果不存在 公共子序列 ，返回 `0` 。

一个字符串的 子序列 是指这样一个新的字符串：它是由原字符串在不改变字符的相对顺序的情况下删除某些字符（也可以不删除任何字符）后组成的新字符串。

例如，`"ace"` 是 `"abcde"` 的子序列，但 `"aec"` 不是 `"abcde"` 的子序列。

两个字符串的 公共子序列 是这两个字符串所共同拥有的子序列。

```
输入：text1 = "abcde", text2 = "ace" 
输出：3  
解释：最长公共子序列是 "ace" ，它的长度为 3 。

输入：text1 = "abc", text2 = "abc"
输出：3
解释：最长公共子序列是 "abc" ，它的长度为 3 。
```

## 781. 森林中的兔子

## 88.合并两个有序数组
[题目来源](https://leetcode-cn.com/problems/merge-sorted-array/)

给你两个有序整数数组 `nums1` 和 `nums2`，请你将 `nums2` 合并到 `nums1` 中，使 `nums1` 成为一个有序数组。

初始化 `nums1` 和 `nums2` 的元素数量分别为 `m` 和 `n` 。你可以假设 `nums1` 的空间大小等于 `m + n`，这样它就有足够的空间保存来自 `nums2` 的元素。

 

示例 1：
```
输入：nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3
输出：[1,2,2,3,5,6]

输入：nums1 = [1], m = 1, nums2 = [], n = 0
输出：[1]
```

题解：

第一种方法，合并后后再排序，第二种方法，第二种方法，用一个新的数组来保存排序后的序列，最后再替换会`num1`.

第三种方法，采用逆向指针，从后往前比较和存储。

```cpp
class Solution {
public:
    void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {
        int pos = m + n -1;
        --m;
        --n;
        while(m >= 0 && n >= 0) {
            if(nums1[m] > nums2[n]) nums1[pos] = nums1[m--];
            else nums1[pos] = nums2[n--];
            --pos;
        }
        while(n >= 0) {
            nums1[pos--] = nums2[n--];
        }
    }
};
```
时间复杂度：$O(m+n)$。

指针移动单调递减，最多移动 $m+n$ 次，因此时间复杂度为 $O(m+n)$。

空间复杂度：$O(1)$

