
- [剑指 Offer 03.数组中重复的数字](#剑指-offer-03数组中重复的数字)
- [剑指 Offer 04. 二维数组中的查找](#剑指-offer-04-二维数组中的查找)
- [剑指 Offer 05. 替换空格](#剑指-offer-05-替换空格)
- [剑指 Offer 06. 从尾到头打印链表](#剑指-offer-06-从尾到头打印链表)
- [剑指 Offer 07. 重建二叉树](#剑指-offer-07-重建二叉树)
  - [106.从中序与后序遍历序列构造二叉树](#106从中序与后序遍历序列构造二叉树)
- [剑指 Offer 09. 用两个栈实现队列](#剑指-offer-09-用两个栈实现队列)
- [剑指 Offer 10- I. 斐波那契数列](#剑指-offer-10--i-斐波那契数列)
- [剑指 Offer 10- II. 青蛙跳台阶问题](#剑指-offer-10--ii-青蛙跳台阶问题)
- [剑指 Offer 11. 旋转数组的最小数字](#剑指-offer-11-旋转数组的最小数字)
  - [153.寻找旋转排序数组中的最小值](#153寻找旋转排序数组中的最小值)
  - [154.寻找旋转排序数组中的最小值 II](#154寻找旋转排序数组中的最小值-ii)
- [剑指 Offer 12.矩阵中的路径](#剑指-offer-12矩阵中的路径)
- [剑指 Offer 13. 机器人的运动范围](#剑指-offer-13-机器人的运动范围)
- [剑指 Offer 14- I. 剪绳子](#剑指-offer-14--i-剪绳子)
  - [剑指 Offer 14- II. 剪绳子 II](#剑指-offer-14--ii-剪绳子-ii)
- [剑指 Offer 15. 二进制中1的个数](#剑指-offer-15-二进制中1的个数)
- [剑指 Offer 16. 数值的整数次方](#剑指-offer-16-数值的整数次方)
- [剑指 Offer 58 - I. 翻转单词顺序](#剑指-offer-58---i-翻转单词顺序)

### 剑指 Offer 03.数组中重复的数字

[题目来源](https://leetcode-cn.com/problems/shu-zu-zhong-zhong-fu-de-shu-zi-lcof/)

- 使用哈希表来解决

```cpp
class Solution {
public:
    int findRepeatNumber(vector<int>& nums) {
        if(nums.size() == 0 || nums.size() == 1) return -1;
        unordered_map<int,int> mp;
        for(int i=0;i<nums.size();++i) {
            if(mp.find(nums[i]) != mp.end()) {  //存在
                return nums[i];
            }
            else {
                mp.emplace(nums[i],nums[i]);
            }
        }
        return -1;
    }
};
```

时间复杂度是 $O(n)$

空间复杂度是 $O(n)$

- 原地置换

这种原地置换的想法确实挺精妙的。

1、题目明确说明了数组长度为n，范围为 n-1，也就是若无重复元素排序后下标0123对应的数字就应该是0123；

2、对数组排序，其实也就是让萝卜归位，1号坑要放1号萝卜，2号坑要放2号萝卜......排序过程中查找有无重复元素。先考虑没有重复元素的情况：
```
 nums[i]     3  1  0  2   萝卜   
     i       0  1  2  3   坑  
```
0号坑说我要的是0号萝卜，不要3号萝卜，所以会去和3号坑的萝卜交换，因为如果0号坑拿了3号坑的3号萝卜，那说明3号坑装的也肯定是别人家的萝卜，所以要跟3号坑换，换完是这样的：
```
 nums[i]     2  1  0  3   萝卜  
     i       0  1  2  3   坑 
```
然而0号坑还没找到自己的萝卜，它不要2号萝卜，又去和2号坑的萝卜交换，换完是这样的：
```
 nums[i]     0  1  2  3   萝卜 
     i       0  1  2  3   坑 
``` 
这时候刚好就是一一对应的，交换过程也不会出现不同坑有相同编号的萝卜。要注意交换用的是while，也就是0号坑只有拿到0号萝卜，1号坑才能开始找自己的萝卜。

3、如果有重复元素，例如：
```
 nums[i]     1  2  3  2    萝卜
     i       0  1  2  3    坑
```
同样的，0号坑不要1号，先和1号坑交换，交换完这样的：
```
 nums[i]     2  1  3  2    萝卜
     i       0  1  2  3    坑
```     
0号坑不要2号萝卜，去和2号坑交换，交换完这样的：
```
 nums[i]     3  1  2  2    萝卜
     i       0  1  2  3    坑
```    
0号坑不要3号萝卜，去和3号坑交换，交换完这样的：
```
 nums[i]     2  1  2  3    萝卜
     i       0  1  2  3    坑
```
0号坑不要2号萝卜，去和2号坑交换，结果发现你2号坑也是2号萝卜，那我还换个锤子，同时也说明有重复元素出现。

4、总结

其实这种原地交换就是为了降低空间复杂度，只需多要1个坑来周转交换的萝卜就好了，空间复杂度$O(1)$。时间复杂度是 $O(n)$

```cpp
class Solution {
public:
    int findRepeatNumber(vector<int>& nums) {
        for(int i=0;i<nums.size();++i) {
            while(i != nums[i]) {
                if(nums[i] == nums[nums[i]]) {
                    return nums[i];
                }
                else 
                    swap(nums[i],nums[nums[i]]);  //交换之后就0号萝卜对应0号坑
            }
        }
        return -1;
    }
};
```

### 剑指 Offer 04. 二维数组中的查找

[题目来源](https://leetcode-cn.com/problems/er-wei-shu-zu-zhong-de-cha-zhao-lcof/)

题解：

从左下角开始找

```cpp
class Solution {
public:
    bool findNumberIn2DArray(vector<vector<int>>& matrix, int target) {
        if(matrix.size() == 0) return false;
        int i = matrix.size() - 1;
        int j = 0;

        while(i >= 0 && j < matrix[0].size()) {
            if(matrix[i][j] == target) return true;
            if(matrix[i][j] > target) --i;
            else ++j;
        }
        return false;
    }
};
```

### 剑指 Offer 05. 替换空格

[题目来源](https://leetcode-cn.com/problems/ti-huan-kong-ge-lcof/)

题解：

先算出有多少个空格，然后使用`s += string(count * 2,' ');`补充长度。最后从后面开始放置。

```cpp
class Solution {
public:
    string replaceSpace(string s) {
        int len1 = s.size();
        if(len1 == 0) return  s;

        string ret;
        
        //先要算出有多少个空格
        int count = 0;
        for(int i=0;i<len1;++i) {
            if(s[i] == ' ') ++count;
        }
        //如果没有空格直接返回
        if(count == 0) return s;

        //扩充长度
        s += string(count * 2,' ');
        int len2 = s.size();
        int index = len2 - 1;
        for(int i=len1 - 1;i>=0;--i) {
            if(s[i] != ' ') s[index--] = s[i];
            else {
                s[index--] = '0';
                s[index--] = '2';
                s[index--] = '%';
            }
        }
        return s;
    }
};
```

时间复杂度：$O(n)$。遍历字符串 s 一遍。

空间复杂度：$O(n)$。额外创建字符数组，长度为 s 的长度的 3 倍。

- 新开辟一个数组，然后使用`push_back`也行
  
> 先不自己写了

```cpp
class Solution {
public:
    string replaceSpace(string s) {     //字符数组
        string array;   //存储结果
        
        for(auto &c : s){   //遍历原字符串
            if(c == ' '){
                array.push_back('%');
                array.push_back('2');
                array.push_back('0');
            }
            else{
                array.push_back(c);
            }
        }
        return array;
    }
};
```
###  剑指 Offer 06. 从尾到头打印链表

[题目来源](https://leetcode-cn.com/problems/cong-wei-dao-tou-da-yin-lian-biao-lcof/)


题解：

- 存入数组再翻转

```cpp
class Solution {
public:
    vector<int> reversePrint(ListNode* head) {
        if(head == nullptr) return {};
        if(head->next == nullptr) return {head->val};

        ListNode* p = head;
         vector<int> res;
        while(p) {
            res.push_back(p->val);
            p = p->next;
        }
        reverse(res.begin(),res.end());
 
        return res;
    }
};
```

- 使用递归，直接跑到底，再逆回来

```cpp
class Solution {
public:
    vector<int> reversePrint(ListNode* head) {
        if(head == nullptr) return {};
        vector<int> res = reversePrint(head->next);
        res.push_back(head->val);
        return res;
    }
};
```

### 剑指 Offer 07. 重建二叉树

[题目来源](https://leetcode-cn.com/problems/zhong-jian-er-cha-shu-lcof/)

> [参考](https://mp.weixin.qq.com/s?__biz=MzUxNjY5NTYxNA==&mid=2247484950&idx=1&sn=3900f9433d36dd5406fc1ccb1df07703&scene=21#wechat_redirect)

```cpp
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
    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        if(preorder.size() == 0) return NULL;

        int rootVale = preorder[0];
        TreeNode* root = new TreeNode(rootVale);

        //如果只有一个节点
        if(preorder.size() == 1) return root;

        //找到前序遍历在中序遍历的位置
        int index = 0;
        for(;index<inorder.size();++index) {
            if(inorder[index] == rootVale) break;
        }

        //切割中序遍历
        vector<int> leftInorder(inorder.begin(),inorder.begin() + index);
        vector<int> rightInorder(inorder.begin() + index + 1,inorder.end());

        preorder.erase(preorder.begin());

        // 切割前序
        vector<int> leftPreorder(preorder.begin(),preorder.begin()+leftInorder.size());
        vector<int> rightPreorder(preorder.begin()+leftInorder.size(),preorder.end());

        root->left = buildTree(leftPreorder,leftInorder);
        root->right = buildTree(rightPreorder,rightInorder);

        return root;
    }
};
```

#### 106.从中序与后序遍历序列构造二叉树

[题目来源](https://leetcode-cn.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/)

> [参考](https://mp.weixin.qq.com/s?__biz=MzUxNjY5NTYxNA==&mid=2247484950&idx=1&sn=3900f9433d36dd5406fc1ccb1df07703&scene=21#wechat_redirect)

```cpp
class Solution {
public:
    TreeNode* buildTree(vector<int>& inorder, vector<int>& postorder) {

        //终止条件
        if(postorder.size() == 0) return nullptr;

        // 找到根节点,也就是后续遍历的最后一个
        int len =  postorder.size() - 1;
        int rootValue = postorder[len];
        // 创建二叉树
        TreeNode* root = new TreeNode(rootValue);

        //如果只有一个节点
        if(postorder.size() == 1) return root;

        // 找到后续的节点在中序遍历中的位置
        int index;
        for(index = 0;index < inorder.size();++index) {
            if(inorder[index] == rootValue) break;
        }
        
        //切割中序数组
        // [0,inorderIndex)
        vector<int> leftInorder(inorder.begin(),inorder.begin() + index);
         // [inorderIndex+1,end)
        vector<int> rightInorder(inorder.begin()+index + 1,inorder.end());

        //后序遍历舍去根节点
        postorder.resize(postorder.size() - 1);//调整容器大小，如果小于当前长度会删掉后面的

        //切割后续遍历
        // [0,inorderLeft)
        vector<int> leftPostorder(postorder.begin(),postorder.begin() + leftInorder.size());
        // [inorderLeft,end)
        vector<int> rightPostorder(postorder.begin() + leftInorder.size(),postorder.end());//注意这里没有+1，因为已经删除了根节点了

        root->left = buildTree(leftInorder,leftPostorder);
        root->right = buildTree(rightInorder,rightPostorder);

        return root;
    }
};
```

### 剑指 Offer 09. 用两个栈实现队列

[题目来源](https://leetcode-cn.com/problems/yong-liang-ge-zhan-shi-xian-dui-lie-lcof/)

```cpp
class CQueue {
public:


    CQueue() {

    }
    
    void appendTail(int value) {
        stack1.push(value);
    }
    
    int deleteHead() {
        //如果栈2为空，就先把栈1的数据全部放入到栈2中，再出栈2
        //如果栈2不空，那就直接出栈2的数据
        if(stack2.empty()) {  //如果栈2为空
            while(!stack1.empty()) {
                stack2.push(stack1.top());
                stack1.pop();
            }
        }
        //入栈之后如果栈2还是为空就返回-1
        if(stack2.empty()) {
            return -1;
        }
        else{
            int res = stack2.top();
            stack2.pop();
            return res;
        }
    }
    
 
private:
    stack<int> stack1;
    stack<int> stack2;
};

```

### 剑指 Offer 10- I. 斐波那契数列

[题目来源](https://leetcode-cn.com/problems/fei-bo-na-qi-shu-lie-lcof/)

只维护好两个数

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
```

### 剑指 Offer 10- II. 青蛙跳台阶问题

[题目来源](https://leetcode-cn.com/problems/qing-wa-tiao-tai-jie-wen-ti-lcof/)

第n级台阶可以从第 n-1 级跳上来，也可以从第 n-2 级跳上来。所以直接算出 n-1 和 n-2 有多少种再相加即可。

```cpp
class Solution {
public:
    int numWays(int n) {
        if(n == 0 || n == 1) return 1;
        int one = 1;
        int two = 1;
        int res = 0;
        for(int i=2;i<=n;++i) {
            res = (one + two) % 1000000007;
            one = two;
            two = res;
        }
        return res;
    }
};
```

### 剑指 Offer 11. 旋转数组的最小数字

[题目来源](https://leetcode-cn.com/problems/xuan-zhuan-shu-zu-de-zui-xiao-shu-zi-lcof/)

看到旋转数组首先想到二叉查找,先看下面两题再做这题

```cpp
class Solution {
public:
    int minArray(vector<int>& nums) {

        int left = 0,right = nums.size() - 1;
        //如果相同就，舍去后面的直到满足二段性
        while(left < right && nums[0] == nums[right]) {
            --right;
        }
        //进行二分查找
        while(left < right) {
            int mid = left + (right - left) / 2;
            if(nums[mid] > nums[right]) //最小值在右边
            {
                left = mid + 1;
            }else {
                right = mid;
            }
        }
        return nums[left];
        
    }
};
```

#### 153.寻找旋转排序数组中的最小值

[题目来源](https://leetcode-cn.com/problems/find-minimum-in-rotated-sorted-array/)

我们可以用中间的和**最右**的数进行对比，注意等号，如果：

- `nums[mid] > nums[right]` 说明最小数在右边，有`left = mid + 1`
- `nums[mid] <= nums[right]`说明最小数在左边, 有`right = mid`

> 注意返回的是`num[left]`,当输入为[1]的时候，直接返回。

```cpp
class Solution {
public:
    int findMin(vector<int>& nums) {
        int left = 0;
        int right = nums.size() - 1;
        while(left < right) {
            int mid = left + (right - left) / 2;
            //如果中间的数大于右边的数，那么最小数肯定在右边
            if(nums[mid] > nums[right]){
                left = mid + 1;
            }
            //如果中间的数不大于最右边的数，那么最小数就不在右边
            else {
                right = mid;  //也可能在中间
            }
        }
        return nums[left];
    }
};
```

#### 154.寻找旋转排序数组中的最小值 II

[题目来源](https://leetcode-cn.com/problems/find-minimum-in-rotated-sorted-array-ii/)

如果旋转点使得不同元素进行分裂，也就是最前面和最后面不同，这样就满足二段性，就可以用二分法

如果旋转点使得相同元素进行分裂，也就是最前面和最后面相同，这样就要舍去最后的直到满足二段性，再进行二分。

满足二段性之后就可以用上题的思路了。

[思路参考](https://leetcode-cn.com/problems/find-minimum-in-rotated-sorted-array-ii/solution/gong-shui-san-xie-xiang-jie-wei-he-yuan-7xbty/)

```cpp
class Solution {
public:
    int findMin(vector<int>& nums) {
        int left = 0,right = nums.size() - 1;
        //如果相同就，舍去后面的直到满足二段性
        while(left < right && nums[0] == nums[right]) {
            --right;
        }
        //进行二分查找
        while(left < right) {
            int mid = left + (right - left) / 2;
            if(nums[mid] > nums[right]) //最小值在右边
            {
                left = mid + 1;
            }else {
                right = mid;
            }
        }
        return nums[left];
    }
};
```

时间复杂度：恢复二段性处理中，最坏的情况下（考虑整个数组都是同一个数）复杂度是 $O(n)$，而之后的找旋转点是「二分」，复杂度为 $O(log{n})$。整体复杂度为 $O(n)$ 的。

空间复杂度：$O(1)$。

### 剑指 Offer 12.矩阵中的路径

[题目来源](https://leetcode-cn.com/problems/ju-zhen-zhong-de-lu-jing-lcof/)

使用回溯法

首先遍历行和列，

**递归终止条件**

- 失败退出
  - 回溯到开始了，小于0就退出
  - 越界了退出
  - 如果当前格子的字符已经不等于 word 了，就退出
  - 如果当前各自已经访问过了就退出
- 成功退出
  - 如果已经匹配到 word 结尾了，就表明成功了，返回 true

**然后开始使用回溯模板进行递归回溯**



```cpp
class Solution {
public:
    vector<char> path;
    bool exist(vector<vector<char>>& board, string word) {
        if(word.size() == 0) return false;
        int low = board.size();
        int col = board[0].size();
        int id = 0;
        //这个属于排列问题，需要用used来记录已经访问过得
        vector<vector<bool>> used(low,vector<bool>(col,false));
        for(int i=0;i<low;++i) {
            for(int j=0;j<col;++j) {
                if(backtracking(board,i,j,word,id,used) ) {
                    return true;
                }
            }
        }
        return  false;
    }
    bool backtracking(vector<vector<char>> &board,int i,int j,string word,int id,vector<vector<bool>> &used) {
        //结束条件
        // 回溯有成功推出和失败退出，如果越界会退出，如果回溯到小于0了也会退出,
        //或者已经出现和word不相等了
        //如果已经访问过了也退出
        int low = board.size();
        int col = board[0].size();
        if(    i < 0 || i >= low 
            || j < 0 || j >= col 
            || board[i][j] != word[id] 
            || used[i][j] == true
            ) {
            return false;
        }
        //成功退出,遍历完了
        if(id == word.size() - 1) return true;
        //选择
        used[i][j] = true;  //遍历过了

        //主要有一个返回true就可以了,遍历到这里说明前面都是对的 ，所以id+1
        int flag = backtracking(board,i+1,j,word,id+1,used)
            || backtracking(board,i-1,j,word,id+1,used)
            || backtracking(board,i,j+1,word,id+1,used)
            || backtracking(board,i,j-1,word,id+1,used);
        //撤销
        used[i][j] = false;  
        return flag;
    }
};
```

### 剑指 Offer 13. 机器人的运动范围

[题目来源](https://leetcode-cn.com/problems/ji-qi-ren-de-yun-dong-fan-wei-lcof/)


地上有一个m行n列的方格，从坐标 [0,0] 到坐标 [m-1,n-1] 。一个机器人从坐标 [0, 0] 的格子开始移动，它每次可以向左、右、上、下移动一格（不能移动到方格外），也不能进入行坐标和列坐标的数位之和大于k的格子。例如，当k为18时，机器人能够进入方格 [35, 37] ，因为3+5+3+7=18。但它不能进入方格 [35, 38]，因为3+5+3+8=19。请问该机器人能够到达多少个格子？

示例 1：
```
输入：m = 2, n = 3, k = 1
输出：3
```

> 参考：https://www.bilibili.com/video/BV1B5411s7tF?from=search&seid=3247245939495863812

```cpp
class Solution {
public:
    int dfs(vector<vector<bool>> &visited, int m, int n, int cur_m, int cur_n, int k)
    {
        int count = 0;
        if (check(visited, m, n, cur_m, cur_n, k))
        {
            visited[cur_m][cur_n] = true;
            count = 1 + dfs(visited, m, n, cur_m + 1, cur_n, k) 
                    + dfs(visited, m, n, cur_m, cur_n + 1, k)
                    + dfs(visited, m, n, cur_m - 1, cur_n, k) 
                    + dfs(visited, m, n, cur_m, cur_n - 1, k);
        }
        return count;
    }

    //判断当前坐标是否符合条件
    bool check(vector<vector<bool>> &visited, int m, int n, int cur_m, int cur_n, int k)
    {
        if (cur_m < m && cur_m >= 0 
            && cur_n < n && cur_n >= 0 
            && !visited[cur_m][cur_n]   // 房钱节点没有被访问过
            && (checkSum(cur_m) + checkSum(cur_n) <= k))  //各位数的和小于等于k
            return true;
        return false;
    }

    //累加一个数的各位数值
    int checkSum(int num)
    {
        int sum = 0;
        while (num)
        {
            sum += num % 10;
            num /= 10;
        }
        return sum;
    }

    //主函数
    int movingCount(int m, int n, int k) {
        if (m <= 0 || n <= 0 || k < 0) return 0;

        vector<vector<bool>> visited(m, vector<bool>(n, false));    //布尔矩阵初始化
        
        // 0,0表示开始的位置
        int count = dfs(visited, m, n, 0, 0, k);

        return count;
    }
};
```

### 剑指 Offer 14- I. 剪绳子

[题目来源](https://leetcode-cn.com/problems/jian-sheng-zi-lcof/)

给你一根长度为 n 的绳子，请把绳子剪成整数长度的 m 段（m、n都是整数，`n>1`并且`m>1`），每段绳子的长度记为 `k[0],k[1]...k[m-1]` 。请问 `k[0]*k[1]*...*k[m-1]` 可能的最大乘积是多少？例如，当绳子的长度是8时，我们把它剪成长度分别为2、3、3的三段，此时得到的最大乘积是18。

示例 1：
```
输入: 2
输出: 1
解释: 2 = 1 + 1, 1 × 1 = 1
```

> 和[343. 整数拆分](https://leetcode-cn.com/problems/integer-break/)一样

> 参考：https://leetcode-cn.com/problems/integer-break/solution/343-zheng-shu-chai-fen-dong-tai-gui-hua-xiang-jie-/


```cpp
class Solution {
public:
    int cuttingRope(int n) {
        vector<int> dp(n+1);
        dp[2] = 1;
        // 遍历 和 为 你
        for(int i=0;i<=n;++i) {
            for(int j=1;j<=i/2;++j) {  // 遍历到一半就行了，不用重复遍历
                dp[i] = max(dp[i], max( j * (i-j),j * dp[i-j] ));  //i 和 j 可以拆也可以不拆，取最大值
                //j是从1开始遍历，拆分j的情况，在遍历j的过程中其实都计算过了。所以 j  不用拆分了
            }
        }
        return dp[n];
    }
};
```

#### 剑指 Offer 14- II. 剪绳子 II

给你一根长度为 n 的绳子，请把绳子剪成整数长度的 m 段（m、n都是整数，n>1并且m>1），每段绳子的长度记为 k[0],k[1]...k[m - 1] 。请问 k[0]*k[1]*...*k[m - 1] 可能的最大乘积是多少？例如，当绳子的长度是8时，我们把它剪成长度分别为2、3、3的三段，此时得到的最大乘积是18。

答案需要取模 `1e9+7（1000000007）`，如计算初始结果为：`1000000008`，请返回 `1`。 

示例 1：
```
输入: 2
输出: 1
解释: 2 = 1 + 1, 1 × 1 = 1
```

> 和 [343. 整数拆分](https://leetcode-cn.com/problems/integer-break/) 相同

这题和上题基本相同，唯一不同在于本题目涉及 “大数越界情况下的求余问题” 

**DP会溢出，只能用上述规律这一种方法来做了**

```cpp
class Solution {
public:
    int cuttingRope(int n) {
        if(n <= 3) return n-1;
        if(n == 4) return n;
        long res = 1;
        while( n > 4) {
            res *= 3;
            res %=  1000000007;
            n -= 3;
        }
        // 最后n的值只有可能是：2、3、4。而2、3、4能得到的最大乘积恰恰就是自身值
        // 因为2、3不需要再剪了（剪了反而变小）；4剪成2x2是最大的，2x2恰巧等于4
        return res * n %  1000000007;
    }
};
```

### 剑指 Offer 15. 二进制中1的个数

[题目来源](https://leetcode-cn.com/problems/er-jin-zhi-zhong-1de-ge-shu-lcof/)

- `bitset`的运用

主要是将 `n` 转化为 `32` 位表示，`int` 最大也就是 `2^32`次方，然后利用`bitset`。`count()`函数，返回 其中 `1` 的数量。


```cpp
class Solution {
public:
    int hammingWeight(uint32_t n) {
        return bitset<32>(n).count();
    }
}
```


- 解法二

如果一个整数不为`0`，那么这个整数至少有一位是`1`。如果我们把这个整数减1，那么原来处在整数 最右边的`1`就会变为`0`，原来在`1`后面的所有的`0`都会变成`1`(如果最右边的`1`后面还有`0`的话)。其余所有位 将不会受到影响。

举个例子:一个二进制数`1100`，从右边数起第三位是处于最右边的一个`1`。减去`1`后，第三位变成 `0`，它后面的两位`0`变成了`1`，而前面的`1`保持不变，因此得到的结果是`1011`.我们发现减`1`的结果是把最 右边的第一个`1`开始的所有位都取反了。

这个时候如果我们再把原来的整数和减去`1`之后的结果做 **与** 运算， 从原来整数最右边一个`1`那一位开始所有位都会变成`0`。如`1100&1011=1000`.也就是说，把一个整数减 去`1`，**再和原整数做 与 运算**，会把该整数最右边一个`1`变成`0`.那么一个整数的二进制有多少个`1`，就可以 进行多少次这样的操作

```cpp
class Solution {
public:
    int hammingWeight(uint32_t n) {
        int res = 0;
        while( n != 0) {
            n = n & (n -1);  //一直到 n==0
            ++res;
        }
        return res;
    }
};
```

### 剑指 Offer 16. 数值的整数次方

[题目来源](https://leetcode-cn.com/problems/shu-zhi-de-zheng-shu-ci-fang-lcof/)

实现 `pow(x, n)` ，即计算 x 的 n 次幂函数（即，$x^n$）。不得使用库函数，同时不需要考虑大数问题。



### 剑指 Offer 58 - I. 翻转单词顺序

[题目来源](https://leetcode-cn.com/problems/fan-zhuan-dan-ci-shun-xu-lcof/)

输入一个英文句子，翻转句子中单词的顺序，但单词内字符的顺序不变。为简单起见，标点符号和普通字母一样处理。例如输入字符串"I am a student. "，则输出"student. a am I"。

示例 ：
```
输入: "the sky is blue"
输出: "blue is sky the"


输入: "  hello world!  "
输出: "world! hello"
解释: 输入字符串可以在前面或者后面包含多余的空格，但是反转后的字符不能包括。
```

- 我们使用两个指针`l`、`r`来帮助选择每一个单词
- 在每次循环时，先去除所有单词右侧空格，获取某个单词的最右下标`r`，再获取单词的最左下标`l`
- 然后把单词`s.substr(l + 1, r - l)`加入`ret`，别忘了加空格哦
- 最后要把多余的空格去除`ret.pop_back()`

```cpp
class Solution {
public:
    string reverseWords(string s) {
        if(s.size() == 0) return s;
        string res = "";

        int len = s.size() - 1;
        int r = len,l;
        while(r >= 0) {
            //去掉多余的空格
            while(r >= 0 && s[r] == ' ') --r;
            //这时候如果r已经小于0了。就直接结束循环
            if(r < 0) break;

            // 将l移动到一个单词的开始
            for(l = r, l >= 0; l >= 0 && s[l] != ' ' ;--l);
            //这时候 s[l] == ' '
            res += (s.substr(l+1,r-l) + " ");  // substr(index,num)
            r = l;  
        }
        //去掉res最后的空格
        if(res.size()) res.pop_back();
        return res;
    }
};
```

时间复杂度： `O(n)`

空间复杂度： `O(n)`


