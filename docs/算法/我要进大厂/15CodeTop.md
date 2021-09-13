


---- 

## 206. 反转链表

[题目链接][https://leetcode-cn.com/problems/reverse-linked-list/]

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

[题目来源](https://leetcode-cn.com/problems/longest-substring-without-repeating-characters/)

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