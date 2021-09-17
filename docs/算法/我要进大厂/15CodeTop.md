
- [206. 反转链表](#206-反转链表)
- [3.无重复字符的最长子串](#3无重复字符的最长子串)
- [设计一个 LRU 缓存机制](#设计一个-lru-缓存机制)
- [215. 数组中的第K个最大元素](#215-数组中的第k个最大元素)
- [25.K 个一组翻转链表](#25k-个一组翻转链表)
- [912. 排序数组](#912-排序数组)
- [1. 两数之和](#1-两数之和)
- [15. 三数之和](#15-三数之和)

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

