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
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
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
