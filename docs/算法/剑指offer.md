## 链表


### 反转链表
[题目来源](https://leetcode-cn.com/problems/fan-zhuan-lian-biao-lcof/)

定义一个函数，输入一个链表的头节点，反转该链表并输出反转后链表的头节点。

实例：
```
输入: 1->2->3->4->5->NULL
输出: 5->4->3->2->1->NULL
```
使用头接法对链表进行反转
```js
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        //头结点指向的第一个元素
        // ListNode * pre = nullptr;
        ListNode * cur = head;
        head = nullptr;
        while(cur) {
            ListNode * next = cur -> next;
            cur->next = head;
            head = cur;
            cur = next;
        }

        return head;
    }
};
```
### 反转链表2
[题目来源](https://leetcode-cn.com/problems/reverse-linked-list-ii/)

反转从位置 m 到 n 的链表。请使用一趟扫描完成反转。

说明:       
1 ≤ m ≤ n ≤ 链表长度。

示例：
```
输入: 1->2->3->4->5->NULL, m = 2, n = 4
输出: 1->4->3->2->5->NULL
```
```js
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    ListNode* reverseBetween(ListNode* head, int m, int n) {
       if(m==n) return head;
        auto dummy=new ListNode(-1);
        dummy->next=head;
        auto a=dummy,d=dummy;
        for(int i=0;i<m-1;i++) a=a->next;
        for(int i=0;i<n;i++) d=d->next;
        auto b=a->next,c=d->next;
        for(auto p=b,q=p->next;q!=c;){
            auto o=q->next;
            q->next=p;
            p=q;q=o;
        }
        a->next=d;
        b->next=c;
        return dummy->next;
    }
};
```


## 二叉树

### 二叉树的镜像
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


### 重建二叉树
[题目来源](https://leetcode-cn.com/problems/zhong-jian-er-cha-shu-lcof/)

输入某二叉树的前序遍历和中序遍历的结果，请重建该二叉树。假设输入的前序遍历和中序遍历的结果中都不含重复的数字。

例如，给出
```
前序遍历 preorder = [3,9,20,15,7]
中序遍历 inorder = [9,3,15,20,7]
```
返回如下的二叉树：
```
    3
   / \
  9  20
    /  \
   15   7
```

思路：不断找根节点，不断划分左子树和右子树。
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
    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        if(preorder.size() == 0 || inorder.size() == 0) return NULL;
        //先找到根节点，再找到中序遍历中根节点的索引
        TreeNode *root = new TreeNode(preorder[0]);
        TreeNode *p = root;
        int index = 0;
        //找出中序遍历中根节点的索引
        for(int i = 0;i<inorder.size();++i) {
            if(root->val == inorder[i]) {
                index = i;
                break;
            }
        }
        //使用递归进行构建
        //左子树的前序遍历和右子树的前序遍历，左子树的中序遍历和右子树的中序遍历 数组
        vector<int> preleft,preright,inleft,inright;  
        //左子树的前序遍历 放到数组中
        for(int i=1;i<=index;++i) {
            preleft.push_back(preorder[i]);
        }
        //右子树的前序遍历
        for(int i=index + 1;i<preorder.size();++i) {
            preright.push_back(preorder[i]);
        }
        //左子树的中序遍历
        for(int i=0;i<=index;++i) {
            inleft.push_back(inorder[i]);
        }
        //右子树的中序遍历
        for(int i=index+1;i<inorder.size();++i) {
            inright.push_back(inorder[i]);
        }
        p -> left = buildTree(preleft,inleft);
        p -> right = buildTree(preright,inright);
        return root;
    }
};
```
优化待补充...

### 树的子结构
[题目来源](https://leetcode-cn.com/problems/shu-de-zi-jie-gou-lcof/)
输入两棵二叉树A和B，判断B是不是A的子结构。(约定空树不是任意一个树的子结构)

B是A的子结构， 即 A中有出现和B相同的结构和节点值。

例如:
给定的树 A:
```
     3
    / \
   4   5
  / \
 1   2
给定的树 B：

   4 
  /
 1
```
返回 true，因为 B 与 A 的一个子树拥有相同的结构和节点值。

实例：
```
输入：A = [1,2,3], B = [3,1]
输出：false

输入：A = [3,4,5,1,2], B = [4,1]
输出：true
```
方法一：层次遍历+深度优先搜索
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
    bool isSubStructure(TreeNode* A, TreeNode* B) {
        if(!A || !B) {
            return false;
        }
        bool res = false;
        //A的根节点与B的根节点相等，就开始递归遍历
        if(A->val == B->val) {
            res = treeAhasB(A,B);
        }
        //如果不相等，A就递归往左走
        if(!res) res = isSubStructure(A->left,B);
        //如果还是匹配不到就A就往右子树匹配右子树
        if(!res) res = isSubStructure(A->right,B);
        return res;
    }
    //深度优先搜索思想
    bool treeAhasB(TreeNode * A,TreeNode * B) {
        //如果B已经遍历完了，就返回true
        if(!B) return true;
        //如果A已经遍历完，但是B还有，则就返回false
        if(!A) return false;
        //如果A与B的值不相等了就返回false
        if(A->val != B -> val) return false;
        return treeAhasB(A->left,B->left) && treeAhasB(A->right,B->right);
    }
};
```
方法二：代码冗余优化
```js
class Solution {
public:
    bool isSubStructure(TreeNode* A, TreeNode* B) {
        if(!A || !B) {
            return false;
        }
        bool res = false;
        if(treeAhasB(A,B)) return true;
        //如果不相等，A就递归往左走
        return isSubStructure(A->left,B) || isSubStructure(A->right,B);
    }
    bool treeAhasB(TreeNode * A,TreeNode * B) {
        //如果B已经遍历完了，就返回true
        if(!B) return true;
        //如果A已经遍历完，但是B还有，则就返回false
        if(!A) return false;
        //如果A与B的值不相等了就返回false
        if(A->val != B -> val) return false;
        return treeAhasB(A->left,B->left) && treeAhasB(A->right,B->right);
    }
};
```

### 对称的二叉树
[题目来源](https://leetcode-cn.com/problems/dui-cheng-de-er-cha-shu-lcof/)

请实现一个函数，用来判断一棵二叉树是不是对称的。如果一棵二叉树和它的镜像一样，那么它是对称的。
```
例如，二叉树 [1,2,2,3,4,4,3] 是对称的。

    1
   / \
  2   2
 / \ / \
3  4 4  3
但是下面这个 [1,2,2,null,3,null,3] 则不是镜像对称的:

    1
   / \
  2   2
   \   \
   3    3
```
示例：
```
输入：root = [1,2,2,3,4,4,3]
输出：true

输入：root = [1,2,2,null,3,null,3]
输出：false
```
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
    bool isSymmetric(TreeNode* root) {
        if(!root) return true;
        return compare(root->left,root->right);
    }
    bool compare(TreeNode * tleft,TreeNode * tright) {
        //排除一下特殊星空
        //如果左子树为空右子树不空，直接返回false
        if(tleft == NULL && tright != NULL) return false;
        //如果左子树不为空右子树空，直接返回false
        if(tleft != NULL && tright == NULL) return false;
        //如果左右子树都为空，就直接返回true
        if(tleft == NULL && tright == NULL) return true;

        //如果左右子树的值不相等也返回false
        if(tleft->val != tright->val) return false;

        //进行递归 左子树的左子树，右子树的右子树
        // 外围   内围
        return compare(tleft->left,tright->right) && compare(tleft -> right,tright -> left);
    }
    
};
```

## 从上到下打印二叉树
[题目来源](https://leetcode-cn.com/problems/cong-shang-dao-xia-da-yin-er-cha-shu-lcof/)

从上到下打印出二叉树的每个节点，同一层的节点按照从左到右的顺序打印。

例如:
给定二叉树: `[3,9,20,null,null,15,7]`,
```
    3
   / \
  9  20
    /  \
   15   7
返回
[3,9,20,15,7]
```

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
    vector<int> levelOrder(TreeNode* root) {
        if(root == NULL) return {};
        vector<int> res;  //存放结果的值
        queue<TreeNode *> que;
        que.push(root);
        // 广度优先搜索
        while(!que.empty()) {
            TreeNode * node = que.front();
            que.pop();
            if(node->left)
                que.push(node->left);
            if(node->right)
                que.push(node->right);
            //这值存入返回的数组中
            res.push_back(node->val);
        }
        return res;
    }
};
```
### 从上到下打印二叉树 II
[题目来演](https://leetcode-cn.com/problems/cong-shang-dao-xia-da-yin-er-cha-shu-ii-lcof/)

从上到下按层打印二叉树，同一层的节点按从左到右的顺序打印，每一层打印到一行。

例如:
给定二叉树: [3,9,20,null,null,15,7],
```
    3
   / \
  9  20
    /  \
   15   7
```
返回层次遍历结果
```
[
  [3],
  [9,20],
  [15,7]
]
```
解题思路
两个思路，一个BFS，一个DFS，很经典的层序遍历题。

唯一注意的是要把每一层放到一起，需要维护一个level进行保存。

DFS记得使用引用`&`，不然就得维护一个全局变量了。

BFS的模板如下：

```js
vector<vector<int>> levelOrder(TreeNode* root) {
    queue<TreeNode*> q;
    q.push(root);
    //...
    while(q.size())
    {
        int size=q.size();
        //...
        for(int i=0;i<size;i++)
        {
            TreeNode* rt=q.front();
            q.pop();
            //...
            if(rt->left) 
                q.push(rt->left);
            if(rt->right) 
                q.push(rt->right);
        }
    }
    //return ...
}
```
DFS:
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
    vector<vector<int>> levelOrder(TreeNode* root) {
        vector<vector<int>>res;
        dfs(root,res,0);
        return res;
    }
    void dfs(TreeNode * root,vector<vector<int>>& res,int level) {
        if(!root) return;
        if(level>=res.size()) res.emplace_back(vector<int>());
        res[level].emplace_back(root->val);
        dfs(root->left,res,level+1);
        dfs(root->right,res,level+1);
    }
};
```
BFS:
```js
class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        queue<TreeNode*> q;
        q.push(root);
        vector<vector<int>> res;
        while(q.size())
        {
            int size=q.size();
            vector<int> level;
            for(int i=0;i<size;i++)
            {
                TreeNode* rt=q.front();q.pop();
                if(!rt) continue;
                level.push_back(rt->val);
                if(rt->left) q.push(rt->left);
                if(rt->right) q.push(rt->right);
            }
            if(level.size()!=NULL) res.push_back(level);
        }
        return res;
    }
};
```

## 栈
 栈的
### 压入、弹出序列
输入两个整数序列，第一个序列表示栈的压入顺序，请判断第二个序列是否为该栈的弹出顺序。假设压入栈的所有数字均不相等。例如，序列 {1,2,3,4,5} 是某栈的压栈序列，序列 {4,5,3,2,1} 是该压栈序列对应的一个弹出序列，但 {4,3,5,1,2} 就不可能是该压栈序列的弹出序列。

示例：
```
输入：pushed = [1,2,3,4,5], popped = [4,5,3,2,1]
输出：true
解释：我们可以按以下顺序执行：
push(1), push(2), push(3), push(4), pop() -> 4,
push(5), pop() -> 5, pop() -> 3, pop() -> 2, pop() -> 1


输入：pushed = [1,2,3,4,5], popped = [4,3,5,1,2]
输出：false
解释：1 不能在 2 之前弹出。
```
```js
class Solution {
public:
    bool validateStackSequences(vector<int>& pushed, vector<int>& popped) {

        stack<int> sta;
        int poid = 0;
        for(int i=0;i<pushed.size();++i) {
            sta.push(pushed[i]);
            while(!sta.empty() && poid < popped.size() && sta.top() == popped[poid] ) {
                sta.pop();
                ++poid;
            }
        }
        return sta.empty();
    }
};
```

### 最小的k个数
输入整数数组 arr ，找出其中最小的 k 个数。例如，输入4、5、1、6、2、7、3、8这8个数字，则最小的4个数字是1、2、3、4。

示例：
```
输入：arr = [3,2,1], k = 2
输出：[1,2] 或者 [2,1]
```

方法一：排序
```js
class Solution {
public:
    vector<int> getLeastNumbers(vector<int>& arr, int k) {
        vector<int> vec(k,0);
        sort(arr.begin(),arr.end());
        for(int i=0;i<k;++i) {
            vec[i] = arr[i];
        }
        return vec;
     }
};
```
复杂度分析

- 时间复杂度：`O(nlogn)`，其中 nn 是数组 arr 的长度。算法的时间复杂度即排序的时间复杂度。

- 空间复杂度：`O(log n)`，排序所需额外的空间复杂度为 O(\log n)O(logn)。

方法二：使用推

我们用一个大根堆实时维护数组的前 `kk` 小值。首先将前 `kk` 个数插入大根堆中，随后从第 `k+1k+1` 个数开始遍历，如果当前遍历到的数比大根堆的堆顶的数要小，就把堆顶的数弹出，再插入当前遍历到的数。最后将大根堆里的数存入数组返回即可。在下面的代码中，由于 C++ 语言中的堆（即优先队列）为大根堆，我们可以这么做。
```js
class Solution {
public:
    vector<int> getLeastNumbers(vector<int>& arr, int k) {
        vector<int>vec(k, 0);
        if (k == 0) { // 排除 0 的情况
            return vec;
        }
        priority_queue<int> Q;
        for (int i = 0; i < k; ++i) {
            Q.push(arr[i]);
        }
        for (int i = k; i < (int)arr.size(); ++i) {
            if (Q.top() > arr[i]) {
                Q.pop();
                Q.push(arr[i]);
            }
        }
        for (int i = 0; i < k; ++i) {
            vec[i] = Q.top();
            Q.pop();
        }
        return vec;
    }
};
```
**复杂度分析：**

时间复杂度：OO(nlog k)，其中 nn 是数组 arr 的长度。由于大根堆实时维护前 kk 小值，所以插入删除都是O(\log k)`O(log k)` 的时间复杂度，最坏情况下数组里 nn 个数都会插入，所以一共需要 `O(nlog k)` 的时间复杂度。

空间复杂度：`O(k)`，因为大根堆里最多 `kk` 个数。







## 其他
### 旋转数组的最小数字
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

### 青蛙跳台阶问题
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


### 替换空格
[题目来源](https://leetcode-cn.com/problems/ti-huan-kong-ge-lcof/)

请实现一个函数，把字符串 s 中的每个空格替换成"%20"。

示例：
```
输入：s = "We are happy."
输出："We%20are%20happy."
```
方法一：20%占三个字符，空格只是占一个字符，所以先在后面补0以增加长度。
```js
class Solution {
public:
    string replaceSpace(string s) {
        int length1 = s.length() - 1;
        for(int i=0;i<=length1;i++) {
            if(s[i] == ' ') {
                s += "00";
            }
        }
        int length2 = s.length()-1;
        if(length1 == length2) return s;  //没有空格
        //从后向前
        for(int i=length1;i>=0;--i) {
            char c = s[i];
            if(c == ' ') {
                s[length2--] = '0';
                s[length2--] = '2';
                s[length2--] = '%';
            }else {
                s[length2--] = c;
            }
        }
        return s;

    }
};
```
方法二：统计空格数
```
class Solution {
public:
    string replaceSpace(string s) {
        int len = s.length()-1;
        int count = 0;
        for(int i=0;i<=len;++i) {
            if(s[i] == ' ') ++count;
        }
        if(count == 0) return s;
        //需要加上字符，让s的长度为len2
        s += string(count * 2,' ');

        int len2 = len + count * 2;
        for(int i = len;i>=0;--i) {
            if(s[i] == ' ') {
                s[len2--] = '0';
                s[len2--] = '2';
                s[len2--] = '%';
            }else {
                s[len2--] =  s[i];
            }
        }
        return s;
    }
};
```

### 从尾到头打印链表

[题目来源](https://leetcode-cn.com/problems/cong-wei-dao-tou-da-yin-lian-biao-lcof/)

输入一个链表的头节点，从尾到头反过来返回每个节点的值（用数组返回）。
示例：
```
输入：head = [1,3,2]
输出：[2,3,1]
```

方法一：使用递归
```js
class Solution {
public:
    vector<int> reversePrint(ListNode* head) {
        if(!head) return{};
        vector<int> res = reversePrint(head->next);
        res.push_back(head->val);
        return res;
    }
};
```
方法二：使用数组
```js
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    vector<int> reversePrint(ListNode* head) {
        vector<int> vec;
        ListNode *p = head;
        while(p) {
            vec.push_back(p->val);
            p = p->next;
        }
        reverse(vec.begin(),vec.end());
        // 两个字符串反转函数
        //1.strrev函数只对字符数组有效，对string类型是无效的。
        //2.reverse函数是反转容器中的内容，对字符数组无效。
        return vec;
    }
};
```

方法三：使用栈
```js
class Solution {
public:
    vector<int> reversePrint(ListNode* head) {
        stack<int> sta;
        vector<int> res;
        while(head) {
            sta.push(head->val);
            head = head->next;
        }
        while(!sta.empty()) {
            res.push_back(sta.top());
            sta.pop();
        }
        return res;
    }
};
```
### 斐波那契数
[题目来源](https://leetcode-cn.com/problems/fibonacci-number/)

斐波那契数，通常用 F(n) 表示，形成的序列称为斐波那契数列。该数列由 0 和 1 开始，后面的每一项数字都是前面两项数字的和。也就是：
```
F(0) = 0,   F(1) = 1
F(N) = F(N - 1) + F(N - 2), 其中 N > 1.
```
示例：
```
输入：2
输出：1
解释：F(2) = F(1) + F(0) = 1 + 0 = 1.

输入：3
输出：2
解释：F(3) = F(2) + F(1) = 1 + 1 = 2.
```
**递归法**

时间复杂度：O(2<sup>n</sup>)

空间复杂度：O(1)

```js
class Solution {
public:
    int fib(int N) {
        if(N <= 1) {
            return N;
        }
        return fib(N-1) + fib(N-2);
    }
};
```
**优化递归**

递归会重复计算大量相同数据，我们可以用个数组把结果存起来

```js
class Solution {
public:
    int fib(int N) {
        int ans[31]; 
        ans[0] = 0;
        ans[1] = 1;
        for(int i = 2;i<=N;i++) {
            ans[i] = ans[i - 1] + ans[i - 2];
        }
        return ans[N];
    }
};
```
时间复杂度：O(n)

空间复杂度：O(n)

**优化存储**
其实我们可以发现每次就用到了最近的两个数，所以我们可以只存储最近的两个数
- sum 存储第 n 项的值
- one 存储第 n-1 项的值
- two 存储第 n-2 项的值

```js
class Solution {
public:
    int fib(int N) {
        if(N == 0) return 0;
        if(N == 1) return 1;
        int sum = 0, one = 1,two = 0; //前一个，前两个
        for(int i=2;i<=N;++i) {
            sum = one + two;
            two = one;
            one = sum;
        }
        return sum;
    }
};
```

### 二维数组中的查找

在一个 n * m 的二维数组中，每一行都按照从左到右递增的顺序排序，每一列都按照从上到下递增的顺序排序。请完成一个高效的函数，输入这样的一个二维数组和一个整数，判断数组中是否含有该整数。

示例:

现有矩阵 matrix 如下：
```
[
  [1,   4,  7, 11, 15],
  [2,   5,  8, 12, 19],
  [3,   6,  9, 16, 22],
  [10, 13, 14, 17, 24],
  [18, 21, 23, 26, 30]
]
```
给定 target = 5，返回 true。

给定 target = 20，返回 false。
```js
class Solution {
public:
    bool findNumberIn2DArray(vector<vector<int>>& matrix, int target) {
        int i=matrix.size() - 1,j = 0;
        //判断的条件是越界,从左下角开始找
        while(i>=0&&j<matrix[0].size()) {
            if(target == matrix[i][j]) {
                return true;
            }else if(target > matrix[i][j]) {
                ++j;
            }else {
                --i;
            }
        }
        return false;
    }
};
```






