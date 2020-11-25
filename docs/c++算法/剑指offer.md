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

## 反转链表
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
## 反转链表2
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

## 替换空格
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

## 从尾到头打印链表

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





