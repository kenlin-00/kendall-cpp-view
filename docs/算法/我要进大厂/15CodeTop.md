
- [206. 反转链表](#206-反转链表)
- [3.无重复字符的最长子串](#3无重复字符的最长子串)
- [设计一个 LRU 缓存机制](#设计一个-lru-缓存机制)
- [215. 数组中的第K个最大元素](#215-数组中的第k个最大元素)
- [25.K 个一组翻转链表](#25k-个一组翻转链表)
- [912. 排序数组](#912-排序数组)
- [1. 两数之和](#1-两数之和)
- [15. 三数之和](#15-三数之和)
- [141. 环形链表](#141-环形链表)
- [53. 最大子序和](#53-最大子序和)
- [21. 合并两个有序链表](#21-合并两个有序链表)
- [160. 相交链表](#160-相交链表)
- [102. 二叉树的层序遍历](#102-二叉树的层序遍历)
- [121. 买卖股票的最佳时机](#121-买卖股票的最佳时机)
- [103. 二叉树的锯齿形层序遍历](#103-二叉树的锯齿形层序遍历)

---- 

## 206. 反转链表

[题目链接](https://leetcode-cn.com/problems/reverse-linked-list/)

- 头插法

```cpp
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        if(head == nullptr) return nullptr;
        ListNode *cur = head;
        ListNode *curNext;
        head = nullptr;
        while(cur) {
            curNext = cur->next;
            cur->next = head;
            head = cur;
            cur = curNext;
        }
        return head;
    }
};
```

- 递归法

记住这个图吧

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/递归反转链表.6n35choke180.png)

```cpp
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        if(head == nullptr || head->next == nullptr ) return head;
        ListNode *newHead = reverseList(head->next);
        head->next->next = head;
        head->next = nullptr;
        return newHead;
    }
};
```

## 3.无重复字符的最长子串


[NC41 最长无重复子数组](https://www.nowcoder.com/practice/b56799ebfd684fb394bd315e89324fb4?tpId=188&&tqId=38553&rp=1&ru=/activity/oj&qru=/ta/job-code-high-week/question-ranking)

```cpp
class Solution {
public:
    int maxLength(vector<int>& arr) {
        if(arr.size() < 2) return arr.size();
        int left = 0,right = 0;
        unordered_map<int,int> window;
        int ans = 0;
        while(right < arr.size()) {
            int c = arr[right++];
       a     window[c]++;
            while(window[c] > 1) {
                int d = arr[left++];
                window[d]--;
            }
            ans = max(ans,right - left);
        }
        return ans;
    }
};
```

[Leetcode 题目来源](https://leetcode-cn.com/problems/longest-substring-without-repeating-characters/)

请从字符串中找出一个最长的不包含重复字符的子字符串，计算该最长子字符串的长度。

示例 1:
```
输入: "abcabcbb"
输出: 3 
解释: 因为无重复字符的最长子串是 "abc"，所以其长度为 3。
```

> **这题考察滑动窗口**，[这几道题得熟悉](/算法/我要进大厂/02滑动窗口)


```cpp
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        if(s.size() == 0) return 0;
        unordered_map<char,int> window;
        int left = 0,right = 0;
        int ans = 0;
        while(right < s.size() ) {
            char c = s[right++];
            window[c]++;
            while(window[c] > 1) {
                char d = s[left++];
                window[d]--;
            }
            ans = max(ans,right - left);
        }
        return ans;
    }
};
```


## 设计一个 LRU 缓存机制

[题目来源](https://leetcode-cn.com/problems/lru-cache/)

```cpp
class LRUCache {
public:
    LRUCache(int capacity):cap(capacity) {

    }
    
    int get(int key) {
        auto it = mp.find(key);
        if(it == mp.end()) {
            return -1;
        }
        list<pair<int,int>>::iterator target_it = it->second;
        pair<int,int> n {target_it->first,target_it->second};
        cache.push_front(n);
        cache.erase(target_it);
        mp.erase(key);
        mp.emplace(key,cache.begin());
        return n.second;
    }
    
    void put(int key, int value) {
        auto it = mp.find(key);
        if(it != mp.end()) {
            //这里删除顺序不能换，否则会导致迭代器失效
            cache.erase(it->second);
            mp.erase(key);
        }
        pair<int,int> n {key,value};
        cache.push_front(n);
        mp.emplace(key,cache.begin());

        if(cache.size() > cap) {
            mp.erase(cache.back().first);
            cache.pop_back();
        }
    }
private:
    int cap;
    list<pair<int,int>> cache;
    unordered_map<int,list<pair<int,int>>::iterator> mp;
};

```

## 215. 数组中的第K个最大元素

给定整数数组 nums 和整数 k，请返回数组中第 k 个最大的元素。

请注意，你需要找的是数组排序后的第 k 个最大的元素，而不是第 k 个不同的元素。

 
```
输入: [3,2,1,5,6,4] 和 k = 2
输出: 5
```

- 快排逆序

> 注意这里 left == right 也要判断


```cpp
class Solution {
public:
    int m_k;
    int ans;
    int findKthLargest(vector<int>& nums, int k) {
        m_k = k;
        ans = nums[0];
        quickSort(nums,0,nums.size() - 1);
        return ans;
    }
    void quickSort(vector<int> &nums,int left,int right) {
        if(left > right) return;
        vector<int> indexs = partition(nums,left,right);
        //这里全都用indexs[1]
        if(indexs[1] == m_k - 1) {
            ans = nums[indexs[1]];
            return;
        }
        else if(indexs[1] > m_k - 1) {
            quickSort(nums,left,indexs[1] - 1);
        }
        else {
            quickSort(nums,indexs[1]+1,right);
        }
    }
    vector<int> partition(vector<int> &nums,int left,int right) {
        int less = left - 1;
        int more = right;
        while(left < more) {
            if(nums[left] > nums[right] ) {
                swap(nums[++less],nums[left++]);
            }
            else if(nums[left] < nums[right]) {
                swap(nums[left],nums[--more]);
            }
            else {
                ++left;
            }
        }
        swap(nums[more],nums[right]);
        //返回大于区和小于区
        vector<int> ans {less+1,more};
        return ans;
    }
};
```

## 25.K 个一组翻转链表

[题目来源](https://leetcode-cn.com/problems/reverse-nodes-in-k-group/)

给你一个链表，每 k 个节点一组进行翻转，请你返回翻转后的链表。

k 是一个正整数，它的值小于或等于链表的长度。

如果节点总数不是 k 的整数倍，那么请将最后剩余的节点保持原有顺序。

进阶：

你可以设计一个只使用常数额外空间的算法来解决此问题吗？
你不能只是单纯的改变节点内部的值，而是需要实际进行节点交换。

```
head = [1,2,3,4,5], k = 2
输出：[2,1,4,3,5]
``` 


```cpp
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* reverseKGroup(ListNode* head, int k) {
        if(head == nullptr) return nullptr;
        ListNode *dumpy = new ListNode(-1);
        dumpy->next = head;
        
        ListNode *start = head, *pre = dumpy;
        ListNode *temp = nullptr,*last = nullptr;
        while(start)  {
            for(int i=1;i<k && start != nullptr;++i) {
                start = start->next;
            }
            if(start == nullptr) break;

            last = start->next;
            start->next = nullptr;
            start = pre->next;
            temp = start;

            while(start) {
                ListNode *cur = start;
                start = start->next;
                cur->next = last;
                last = cur;
            }
            pre->next = last;
            pre = temp;
            start = pre->next;
        }
        return dumpy->next;
    }
};
```

## 912. 排序数组

[题目来源](https://leetcode-cn.com/problems/sort-an-array/)

- 快速排序

```cpp
class Solution {
public:
    vector<int> partition(vector<int> &nums,int left,int right) {
        int less =left - 1;
        int more = right;
        while(left < more) {
            if(nums[left] < nums[right]  ) {
                swap( nums[++less],nums[left++]  );
            }
            else if( nums[left] > nums[right] ) {
                swap( nums[left] ,nums[--more] );
            }
            else {
                ++left;
            }
        }
        swap(nums[more],nums[right]);
        return {less+1,more};
    }
    void quickSort(vector<int> &nums,int left,int right) {
        if(left >= right) return;
        swap(nums[left],nums[rand() % (right - left + 1) + left]);
        vector<int> indexs = partition(nums,left,right);
        quickSort(nums,left,indexs[0] - 1);
        quickSort(nums,indexs[1] + 1,right);
    }
    vector<int> sortArray(vector<int>& nums) {
        if(nums.size() == 1) return nums;
        quickSort(nums,0,nums.size() - 1);
        return nums;
    }
};
```

- 归并排序
  
```cpp
class Solution {
public:
    void merge(vector<int> &nums,int left,int mid,int right) {
        int pl = left;
        int pr = mid + 1;
        vector<int> temp(right - left + 1);
        int index = 0;
        while(pl <= mid && pr <= right) {
            if(nums[pl] <= nums[pr]) {
                temp[index++] = nums[pl++];
            }
            else {
                temp[index++] = nums[pr++];
            }
        }
        while(pl <= mid) {
            temp[index++] = nums[pl++];
        }
        while(pr <= right) {
            temp[index++] = nums[pr++];
        }
        //拷贝回去
        index = left;
        for(auto c : temp) {
            nums[index++] = c;
        }
    }
    void sortProcess(vector<int> &nums,int left,int right) {
        if(left >= right) return;
        int mid = left + ( (right - left) >> 1 );
        sortProcess(nums,left,mid);
        sortProcess(nums,mid+1,right);
        merge(nums,left,mid,right);
    }
    vector<int> sortArray(vector<int>& nums) {
        sortProcess(nums,0,nums.size() - 1);
        return nums;
    }
};
```

## 1. 两数之和

[leetcode题目](https://leetcode-cn.com/problems/two-sum/)

给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出 和为目标值 target  的那 两个 整数，并返回它们的数组下标。

你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。

你可以按任意顺序返回答案。

示例 1：
```
输入：nums = [2,7,11,15], target = 9
输出：[0,1]
解释：因为 nums[0] + nums[1] == 9 ，返回 [0, 1] 。
```

```cpp
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        vector<int> ans;
        unordered_map<int,int> mp;
        for(int i=0;i<nums.size();++i) {
            unordered_map<int,int>::iterator it = mp.find(target - nums[i]);
            if(it != mp.end()) {
                return {it->second,i};
            }
            //存的是索引
            mp[nums[i]] = i;
        }
        return {};
    }
};
```

## 15. 三数之和


[leetcode题目](https://leetcode-cn.com/problems/3sum/)

给你一个包含 n 个整数的数组 nums，判断 nums 中是否存在三个元素 a，b，c ，使得 `a + b + c = 0` ？请你找出所有和为 0 且不重复的三元组。

注意：答案中不可以包含重复的三元组。

示例 1：
```
输入：nums = [-1,0,1,2,-1,-4]
输出：[[-1,-1,2],[-1,0,1]]
```

```cpp
class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        vector<vector<int>> ans;
        //先排序
        sort(nums.begin(),nums.end());
        for(int startIndex = 0;startIndex<nums.size();++startIndex) {
            //求三个数之和=0，如果第一个就大于0就break
            if(nums[startIndex] > 0) {
                break;
            }
            //去重
            if(startIndex > 0 && nums[startIndex] == nums[startIndex-1]) {
                continue;
            }
            //开始找
            int left = startIndex + 1;
            int right = nums.size() -1;
            while(left < right) {
                int sum = nums[startIndex] + nums[left] + nums[right];
                if(sum < 0) {
                    ++left;
                }
                else if(sum > 0) {
                    --right;
                }
                else {
                    vector<int> temp;
                    temp.push_back(nums[startIndex]);
                    temp.push_back(nums[left]);
                    temp.push_back(nums[right]);
                    ans.push_back(temp);

                    //继续匹配下一组，去重
                    ++left;
                    --right;
                    while(left < right && nums[left] == nums[left-1]) ++left;
                    while(left < right && nums[right] == nums[right+1])  --right;
                }
            }
        }
        return ans;
    }
};
```

## 141. 环形链表

[leetcode题目](https://leetcode-cn.com/problems/linked-list-cycle/)

判断一个链表是否有环

```cpp
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
    bool hasCycle(ListNode *head) {
        if(head == nullptr || head->next == nullptr) return false;
        ListNode *slow = head;
        ListNode *fast = head;
        while(fast && fast->next && slow) {
            //先让快慢指针往下走
            slow = slow->next;
            fast = fast->next->next;
            if(slow == fast) {
                return true;
            }
        }
        return false;
    }
};
```

## 53. 最大子序和


[leetcode](https://leetcode-cn.com/problems/maximum-subarray/)

给定一个整数数组 nums ，找到一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。

示例 1：

```
输入：nums = [-2,1,-3,4,-1,2,1,-5,4]
输出：6
解释：连续子数组 [4,-1,2,1] 的和最大，为 6 。
```

题解：

`dp[i]`：表示以 `nums[i]` 结尾 的 连续 子数组的最大和。

```
-2,1,-3,4,-1,2,1,-5,4
-2 1 -2 4  3 5 6 -1 4
```

```cpp
class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        if(nums.size() == 1) return nums[0];
        vector<int> dp(nums.size(),0);
        int ans = nums[0]; //必须初始化为第一个，【-1，-2】
        dp[0] = nums[0];
        for(int i=1;i<nums.size();++i) {
            dp[i] = max(dp[i-1]+nums[i],nums[i]);
            ans = max(ans,dp[i]);
        }
        return ans;
    }
};
```

## 21. 合并两个有序链表

[题目来源](https://leetcode-cn.com/problems/merge-two-sorted-lists/)

[剑指offer](https://www.nowcoder.com/practice/d8b6b4358f774294a89de2a6ac4d9337?tpId=13&rp=1&ru=%2Fta%2Fcoding-interviews&qru=%2Fta%2Fcoding-interviews%2Fquestion-ranking)

将两个升序链表合并为一个新的 升序 链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。

![](https://assets.leetcode.com/uploads/2020/10/03/merge_ex1.jpg)

```
输入：l1 = [1,2,4], l2 = [1,3,4]
输出：[1,1,2,3,4,4]
```

用一个虚拟节点，接下去

```cpp
class Solution {
public:
    ListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {
        if(l1 == nullptr) return l2;
        if(l2 == nullptr) return l1;

        ListNode *dumpy = new ListNode(-1);
        ListNode *cur = dumpy;
        while(l1 && l2) {
            if(l1->val <= l2->val) {
                cur->next = l1;
                cur = l1;
                l1 = l1->next;
            }
            else {
                cur->next = l2;
                cur = l2;
                l2 = l2->next;
            }
        }
        if(l1) cur->next = l1;
        if(l2) cur->next = l2;
        return dumpy->next;
    }
};
```

时间复杂度 O(M+N)

空间复杂度 O(1)


## 160. 相交链表


[剑指offer](https://www.nowcoder.com/practice/6ab1d9a29e88450685099d45c9e31e46?tpId=13&&tqId=11189&rp=1&ru=/ta/coding-interviews&qru=/ta/coding-interviews/question-ranking)

[leetcode](https://leetcode-cn.com/problems/intersection-of-two-linked-lists/)


输入两个无环的单链表，找出它们的第一个公共结点。（注意因为传入数据是链表，所以错误测试数据的提示是用其他方式显示的，保证传入数据是正确的）

![](https://assets.leetcode-cn.com/aliyun-lc-upload/uploads/2018/12/14/160_statement.png)


- 双指针

 p1 到 第一个链表结尾的时候指向 pHead2 继续，p2 同样 指向 pHead1 继续。

```cpp
class Solution {
public:
    ListNode *getIntersectionNode(ListNode *headA, ListNode *headB) {
        ListNode *pa = headA;
        ListNode *pb = headB;
        while(pa != pb) {
            pa = pa != nullptr ? pa->next : headB;
            pb = pb != nullptr ? pb->next : headA;
        }
        //如果不存在相交，就会两个都移动到两个链表的尾节点，都为null，所以返回null
        return pa;
    }
};
```

时间复杂度：$O(m+n)$，其中 m 和 n 是分别是链表 headA 和 headB 的长度。两个指针同时遍历两个链表，每个指针遍历两个链表各一次。

空间复杂度：$O(1)$。

- 哈希表

```cpp
class Solution {
public:
    ListNode *getIntersectionNode(ListNode *headA, ListNode *headB) {
        if(headA == nullptr || headB == nullptr) return nullptr;
        unordered_map<ListNode*,int> mp;
        ListNode *pa = headA;
        while(pa) {
            mp[pa] = pa->val;
            pa = pa->next;
        }
        ListNode *pb = headB;
        while(pb) {
            if(mp.count(pb) != 0) 
                return pb;
            pb = pb->next;
        }
        return nullptr;
    }
};
```

## 102. 二叉树的层序遍历

[题目来源](https://leetcode-cn.com/problems/binary-tree-level-order-traversal/)

```cpp
class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        vector<vector<int>> ans;
        if(root == nullptr) return ans;
        queue<TreeNode*> que;
        que.push(root);
        while(!que.empty()) {
            int size = que.size();
            vector<int> temp;
            for(int i=0;i<size;++i) {
                TreeNode *node = que.front();
                que.pop();
                temp.push_back(node->val);
                if(node->left) que.push(node->left);
                if(node->right) que.push(node->right);
            }
            ans.push_back(temp);
        }
        return ans;
    }
};
```

## 121. 买卖股票的最佳时机

[leetcode](https://leetcode-cn.com/problems/best-time-to-buy-and-sell-stock/)

给定一个数组 prices ，它的第 i 个元素 prices[i] 表示一支给定股票第 i 天的价格。

你只能选择 某一天 买入这只股票，并选择在 未来的某一个不同的日子 卖出该股票。设计一个算法来计算你所能获取的最大利润。

返回你可以从这笔交易中获取的最大利润。如果你不能获取任何利润，返回 0 。

```
输入：[7,1,5,3,6,4]
输出：5
解释：在第 2 天（股票价格 = 1）的时候买入，在第 5 天（股票价格 = 6）的时候卖出，最大利润 = 6-1 = 5 。
     注意利润不能是 7-1 = 6, 因为卖出价格需要大于买入价格；同时，你不能在买入前卖出股票。
```

思路：

- dp[i][k][0]  第 i 天，最多进行 k 次交易，不持有股票的最大利润
- dp[i][k][1]  第 i 天，最多进行 k 次交易，持有股票的最大利润

由于已知只能进行 1 次交易，因此 k = 1，所以这里的交易次数可以省略

```cpp
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        //先求出天数
        int n = prices.size();
        //定义动态规划数组
        vector<vector<int>> dp (n,vector<int> (2,0));
        for(int i=0;i<n;++i) {
            if(i-1 < 0) {
                dp[i][0] = 0;
                dp[i][1] = -prices[i];  //都还没开始，不可能持有股票，所以只能是负无穷
                continue;
            }
            //今天不持有,可能是昨天持有，然后今天卖出，也可能是昨天不持有，今天做reset
            dp[i][0] = max(dp[i-1][0],dp[i-1][1] + prices[i]);
            //今天持有，可能是昨天不持有，今天买入，也可能是昨天就持有，今天做reset
            // dp[i-1][k-1][0] = dp[i-1][0][0] = 0
            dp[i][1] = max(dp[i-1][1], - prices[i]);

        }
        return dp[n-1][0];
    }
};
```

## 103. 二叉树的锯齿形层序遍历

[leetcode](https://leetcode-cn.com/problems/binary-tree-zigzag-level-order-traversal/)

> 就是 ”之“ 字形打印二叉树

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
class Solution {
public:
    vector<vector<int>> zigzagLevelOrder(TreeNode* root) {
        vector<vector<int>> ans;
        if(root == nullptr) return ans;
        queue<TreeNode*> que;
        que.push(root);
        int index = 0;
        while(!que.empty()) {
            int size = que.size();
            vector<int> temp;
            ++index;
            for(int i=0;i<size;++i) {
                TreeNode *node = que.front();
                que.pop();
                temp.push_back(node->val);
                if(node->left) que.push(node->left);
                if(node->right) que.push(node->right);
            }
            if(index % 2 == 0) {
                reverse(temp.begin(),temp.end());
            }
            ans.push_back(temp);
        }
        return ans;
    }
};
```

