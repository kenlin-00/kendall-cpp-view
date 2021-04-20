## 反转链表(重点)
[题目来源](https://www.nowcoder.com/practice/75e878df47f24fdc9dc3e400ec6058ca?tpId=190&tqId=35203&rp=1&ru=%2Factivity%2Foj&qru=%2Fta%2Fjob-code-high-rd%2Fquestion-ranking&tab=answerKey)

输入一个链表，反转链表后，输出新链表的表头。

示例：
```
输入：
{1,2,3}
输出：
{3,2,1}
```

题解：使用尾插法

```cpp
class Solution {
public:
    ListNode* ReverseList(ListNode* pHead) {
        ListNode * p = pHead;
        ListNode * q = p;
        pHead = nullptr;
        while(q) {
            q = p->next;
            p->next = pHead;
            pHead = p;
            p = q;
        }
        return pHead;
    }
};   
```

## 两数之和

[题目来源](https://www.nowcoder.com/practice/20ef0972485e41019e39543e8e895b7f?tpId=188&tqId=38285&rp=1&ru=%2Factivity%2Foj&qru=%2Fta%2Fjob-code-high-week%2Fquestion-ranking&tab=answerKey)


给出一个整数数组，请在数组中找出两个加起来等于目标值的数，
你给出的函数twoSum 需要返回这两个数字的下标（index1，index2），需要满足 index1 小于index2.。注意：下标是从1开始的
假设给出的数组中只存在唯一解
例如：
给出的数组为 `{20, 70, 110, 150}`,目标值为`90`

输出 `index1=1, index2=2`


示例1
```
输入
[3,2,4],6

返回值
[2,3]
```

思路：

使用一个`map`,用目标值减去当前值判断是否在`map`中

```cpp
class Solution {
public:
    /**
     * 
     * @param numbers int整型vector 
     * @param target int整型 
     * @return int整型vector
     */
    vector<int> twoSum(vector<int>& numbers, int target) {
        // write code here
        vector<int> res;
        map<int,int> mp;
        for(int i=0;i<numbers.size();++i) {
            mp[numbers[i]] = i;
        }
        for(int i=0;i<numbers.size();++i) {
            if(mp.find(target - numbers[i]) != mp.end() && i != mp[target - numbers[i]]) {
                res.push_back(i+1);
                res.push_back(mp[target - numbers[i]]+1);
                return res;
            }
        }
        return res;
    }
};
```

## 求二叉树的层次遍历

[题目来源](https://www.nowcoder.com/practice/04a5560e43e24e9db4595865dc9c63a3?tpId=190&tqId=35337&rp=1&ru=%2Factivity%2Foj&qru=%2Fta%2Fjob-code-high-rd%2Fquestion-ranking&tab=answerKey)

题解：

使用队列是实现，`while`循环里面先去当前队列的长度，也就是每一层的节点数，再进入`for`循环。

```cpp

class Solution {
public:
    /**
     * 
     * @param root TreeNode类 
     * @return int整型vector<vector<>>
     */
    vector<vector<int> > levelOrder(TreeNode* root) {
        vector<vector<int> > result;
        if(root == nullptr) return result;
        vector<int> resTemp;
        queue<TreeNode *> que;
        que.push(root);
        while(!que.empty()) {
            int size = que.size();
            resTemp = {};
            for(int i=0;i<size;++i) {
                TreeNode * node = que.front();
                resTemp.push_back(node->val);
                que.pop();
                if(node->left) que.push(node->left);
                if(node->right) que.push(node->right);
            }
            //遍历完一层
            result.push_back(resTemp);
        }
        return result;
    }
};
```


## 寻找第 K 大

[题目来源](https://www.nowcoder.com/practice/e016ad9b7f0b45048c58a9f27ba618bf?tpId=190&tqId=35209&rp=1&ru=%2Factivity%2Foj&qru=%2Fta%2Fjob-code-high-rd%2Fquestion-ranking&tab=answerKey)

有一个整数数组，请你根据快速排序的思路，找出数组中第K大的数。

给定一个整数数组a,同时给定它的大小n和要找的K(K在1到n之间)，请返回第K大的数，保证答案存在。

示例

```
输入
[1,3,5,2,2],5,3
返回值
2
```

## 合并有序链表

[题目来源](https://www.nowcoder.com/practice/a479a3f0c4554867b35356e0d57cf03d?tpId=190&tqId=35188&rp=1&ru=%2Factivity%2Foj&qru=%2Fta%2Fjob-code-high-rd%2Fquestion-ranking&tab=answerKey)

将两个有序的链表合并为一个新链表，要求新的链表是通过拼接两个链表的节点来生成的，且合并后新链表依然有序。
```
示例1
输入
{1},{2}

返回值
{1,2}
```

```cpp
 ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {
        if(l1 == nullptr) return l2;
        if(l2 == nullptr) return l1;
        ///////
        ListNode* head = new ListNode(-1);
        ListNode* pre = head;
        while(l1 && l2) {
            if(l1->val < l2->val) {
                pre->next = l1;
                l1 = l1->next;
            }
            else {
                pre->next = l2;
                l2 = l2->next;          
            }
             pre = pre->next;
        }
        pre->next = l1 ? l1 : l2;
        return head->next;
    }
```

## 用两个栈实现队列

[题目来源](https://www.nowcoder.com/practice/54275ddae22f475981afa2244dd448c6?tpId=117&tqId=37774&rp=1&ru=%2Fta%2Fjob-code-high&qru=%2Fta%2Fjob-code-high%2Fquestion-ranking&tab=answerKey)

思路：

进队的时候，直接让栈1进栈就好

出队的时候，先判断栈2是否为空，如果不空就从栈1中把元素灌到栈2中

最后栈2出栈就是队列出队的元素

[查看这里的动图，立马可以写出来了](https://mp.weixin.qq.com/s?__biz=MzUxNjY5NTYxNA==&mid=2247484505&idx=1&sn=1cd88bacb0c4df18bc1cbed5434c632d&scene=21#wechat_redirect)

```cpp
class Solution
{
public:
    void push(int node) {
        stack1.push(node);
    }

    int pop() {
        if(stack2.empty()) {
            while(!stack1.empty()) {
                stack2.push(stack1.top());
                //栈1出栈
                stack1.pop();
            }
        }
        int res = stack2.top();
        stack2.pop();
        return res;
    }

private:
    stack<int> stack1;
    stack<int> stack2;
};
```

## 跳台阶

[题目来源](https://www.nowcoder.com/practice/8c82a5b80378478f9484d87d1c5f12a4?tpId=117&tqId=37764&rp=1&ru=%2Fta%2Fjob-code-high&qru=%2Fta%2Fjob-code-high%2Fquestion-ranking&tab=answerKey)

一只青蛙一次可以跳上1级台阶，也可以跳上2级。求该青蛙跳上一个n级的台阶总共有多少种跳法（先后次序不同算不同的结果）。

- 题解一：递推

1 -- 1
2 -- 2
3 -- 3
4 -- 2 + 3 = 4
5 -- 3 + 4 = 7

```cpp
class Solution {
public:
    int jumpFloor(int number) {
        if(number == 1) return 1;
        if(number == 2) return 2;
        return jumpFloor(number - 1) + jumpFloor(number - 2);
    }
};
```

题解二：动态规划



