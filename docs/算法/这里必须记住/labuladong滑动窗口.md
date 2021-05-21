> [参考链接](https://mp.weixin.qq.com/s?__biz=MzAxODQxMDM0Mw==&mid=2247485141&idx=1&sn=0e4583ad935e76e9a3f6793792e60734&chksm=9bd7f8ddaca071cbb7570b2433290e5e2628d20473022a5517271de6d6e50783961bebc3dd3b&scene=21#wechat_redirect)


- [框架](#框架)
- [76.最小覆盖子串](#76最小覆盖子串)
- [567. 字符串的排列](#567-字符串的排列)
- [438. 找到字符串中所有字母异位词](#438-找到字符串中所有字母异位词)
- [3.无重复字符的最长子串](#3无重复字符的最长子串)

-----


大致思路

```cpp
int left = 0, right = 0;

while (right < s.size()) {
    // 增大窗口
    window.add(s[right]);
    right++;

    while (window needs shrink) {
        // 缩小窗口
        window.remove(s[left]);
        left++;
    }
}
```

这个算法技巧的时间复杂度是 `O(N)`，比一般的字符串暴力算法要高效得多。


## 框架

```cpp
/* 滑动窗口算法框架 */
void slidingWindow(string s, string t) {
    unordered_map<char, int> need, window;
    for (char c : t) need[c]++;

    int left = 0, right = 0;
    int valid = 0; 
    while (right < s.size()) {
        // c 是将移入窗口的字符
        char c = s[right];
        // 右移窗口
        right++;
        // 进行窗口内数据的一系列更新
        ...

        /*** debug 输出的位置 ***/
        printf("window: [%d, %d)\n", left, right);
        /********************/

        // 判断左侧窗口是否要收缩，滑动窗口缩小的时机
        while (window needs shrink) {
            // d 是将移出窗口的字符
            char d = s[left];
            // 左移窗口
            left++;
            // 进行窗口内数据的一系列更新
            ...
        }
    }
}
```
其中两处`...`表示的更新窗口数据的地方，到时候你直接往里面填就行了。

## 76.最小覆盖子串

[题目来源](https://leetcode-cn.com/problems/minimum-window-substring/)

给你一个字符串 s 、一个字符串 t 。返回 s 中涵盖 t 所有字符的最小子串。如果 s 中不存在涵盖 t 所有字符的子串，则返回空字符串 "" 。

注意：如果 s 中存在这样的子串，我们保证它是唯一的答案。

 

示例 1：
```
输入：s = "ADOBECODEBANC", t = "ABC"
输出："BANC"
```

**滑动窗口算法的思路是这样**：

1、我们在字符串 `S` 中使用双指针中的左右指针技巧，初始化`left = right = 0`，把索引左闭右开区间`[left, right)`称为一个「窗口」。

2、我们先不断地增加`right`指针扩大窗口`[left, right)`，直到窗口中的字符串符合要求（包含了`T`中的所有字符）。

3、此时，我们停止增加`right`，转而不断增加`left`指针缩小窗口`[left, right)`，直到窗口中的字符串不再符合要求（不包含T中的所有字符了）。同时，每次增加`left`，我们都要更新一轮结果。

4、重复第 2 和第 3 步，直到`right`到达字符串`S`的尽头。

这个思路其实也不难，第 2 步相当于在寻找一个「可行解」，然后第 3 步在优化这个「可行解」，最终找到最优解，也就是最短的覆盖子串。左右指针轮流前进，窗口大小增增减减，窗口不断向右滑动，这就是「滑动窗口」这个名字的来历。


**现在我们来看看这个滑动窗口代码框架怎么用**：

首先，初始化`window`和`need`两个哈希表，记录窗口中的字符和需要凑齐的字符：

```cpp
unordered_map<char, int> need, window;
for (char c : t) need[c]++;
```

然后，使用`left`和`right`变量初始化窗口的两端，不要忘了，区间`[left, right)`是左闭右开的，所以初始情况下窗口没有包含任何元素：

```cpp
int left = 0, right = 0;
int valid = 0; 
while (right < s.size()) {
    // 开始滑动
}
```

**其中 valid 变量表示窗口中满足 need 条件的字符个数**，也就已经覆盖几个了。如果`valid`和`need.size`的大小相同，则说明窗口已满足条件，已经完全覆盖了串`T`。

**现在开始套模板，只需要思考以下四个问题**：

1、当移动`right`扩大窗口，即加入字符时，应该更新哪些数据？

2、什么条件下，窗口应该暂停扩大，开始移动left缩小窗口？

3、当移动`left`缩小窗口，即移出字符时，应该更新哪些数据？

4、我们要的结果应该在扩大窗口时还是缩小窗口时进行更新？

如果一个字符进入窗口，应该增加`window`计数器；如果一个字符将移出窗口的时候，应该减少`window`计数器；当`valid`满足`need`时应该收缩窗口；应该在收缩窗口的时候更新最终结果。


```cpp
class Solution {
public:
    string minWindow(string s, string t) {

        if(s.size() == 0 || s.size() < t.size() ) return "";

        unordered_map<char, int> need, window;
        //把要匹配的子串添加到数组中
        for (char c : t) need[c]++;

        int left = 0, right = 0;
        int valid = 0;  //窗口中满足子串的字符个数，也就是已经覆盖到几个了

        int start = 0,len = INT_MAX;  //len是滑动窗口的大小，start是满足子串的第一个位置


        while (right < s.size()) {
            // c 是将移入窗口的字符
            char c = s[right];
            // 右移窗口
            right++;
            // 进行窗口内数据的一系列更新
            if(need.count(c)) {  //查看c是否在need中，如果在
                window[c]++;
                //当这个元素已经存够了的话
                if(window[c] == need[c]) {  
                    ++valid;
                }
            }


            /*** debug 输出的位置 ***/
            // printf("window: [%d, %d)\n", left, right);
            /********************/

            //这时候窗口已经全部覆盖了子串字符了

            // 判断左侧窗口是否要收缩
            while (valid == need.size() ) {

                //记录要返回的字符串
                if(right - left < len) {
                    start = left;
                    len = right - left;
                }

                // d 是将移出窗口的字符
                char d = s[left];
                // 左移窗口
                left++;

                // 进行窗口内数据的一系列更新
                
                //如果移除的字符正好在need 中
                if(need.count(d)) {

                    /*
                        这里添加停止滑动窗口缩小的条件，或者满足条件返回
                    */

                    //先判断窗口中还有没有其他地方还有这个字符
                    if(window[d] == need[d]) {  //正好相等,没有重复的去了
                        --valid;  //不满足了，不缩小了
                    }
                    //可以去掉重复的
                    window[d]--;  
                }
            }
        }
        return len == INT_MAX ? "" : s.substr(start,len);
    }
};
```


## 567. 字符串的排列

[题目来源](https://leetcode-cn.com/problems/permutation-in-string/)


给定两个字符串 s1 和 s2，写一个函数来判断 s2 是否包含 s1 的排列。

换句话说，第一个字符串的排列之一是第二个字符串的 子串 。

示例 1：
```
输入: s1 = "ab" s2 = "eidbaooo"
输出: True
解释: s2 包含 s1 的排列之一 ("ba").
```

对于这道题的解法代码，基本上和最小覆盖子串一模一样，只需要改变两个地方：

1、本题移动left缩小窗口的时机是窗口大小大于t.size()时，因为排列嘛，显然长度应该是一样的。

2、当发现valid == need.size()时，就说明窗口中就是一个合法的排列，所以立即返回true。

```cpp
class Solution {
public:
    bool checkInclusion(string s1, string s2) {
        //定义一个窗口和一个保存需要的子串
        unordered_map<char,int> window,need;
        for(char c : s1) need[c]++;
        
        int left = 0,right = 0;
        int valid = 0;  //记录已经包含子串中的几个了

        while(right < s2.size()) {
            char c = s2[right];
            ++right;

            //进行窗口内数据的一系列更新
            if(need.count(c)) {
                window[c]++;
                if(window[c] == need[c])
                    ++valid;
            }

            //已经全部满足了子串，也就是长度一样了，因为是排序的
            while(right - left == s1.size()) {
                
                if(valid == need.size()) {
                    return true;
                }

                //滑出的字符
                char d = s2[left];
                ++left;
                if(need.count(d)) {
                    if(window[d] == need[d]) 
                        --valid;
                    window[d]--; //去掉重复的
                }
            }
        }
        return false;
    }
};
```

## 438. 找到字符串中所有字母异位词

[题目来源](https://leetcode-cn.com/problems/find-all-anagrams-in-a-string/)

给定一个字符串 s 和一个非空字符串 p，找到 s 中所有是 p 的字母异位词的子串，返回这些子串的起始索引。

字符串只包含小写英文字母，并且字符串 s 和 p 的长度都不超过 20100。

说明：

字母异位词指字母相同，但排列不同的字符串。

不考虑答案输出的顺序。

示例 1:
```
输入:
s: "cbaebabacd" p: "abc"

输出:
[0, 6]

解释:
起始索引等于 0 的子串是 "cba", 它是 "abc" 的字母异位词。
起始索引等于 6 的子串是 "bac", 它是 "abc" 的字母异位词。
```

跟寻找字符串的排列一样，只是找到一个合法异位词（排列）之后将起始索引加入`res`即可。

```cpp
class Solution {
public:
    vector<int> findAnagrams(string s, string p) {
        vector<int> res;

        unordered_map<char,int> window,need;
        for(char c : p) {
            need[c]++;
        }

        int left = 0,right = 0;
        int valid = 0;

        while(right < s.size()) {
            char c= s[right];
            ++right;

            if(need.count(c)) {
                window[c]++;
                if(window[c] == need[c]) {
                    ++valid;
                }
            }
            //窗口长度等于匹配子串的长度肯定要缩小窗口了
            while(right - left == p.size()) {

                //已经匹配到的个数一样的就满足条件了，不要求排序嘛
                if(valid == need.size()) {
                    res.push_back(left);
                }

                char d = s[left];
                ++left;
                if(need.count(d)) {
                    if(window[d] == need[d]) {
                        --valid;
                    }
                    --window[d];
                }
            }
        }
        return res;
    }
};
```

## 3.无重复字符的最长子串

[题目来源](https://leetcode-cn.com/problems/longest-substring-without-repeating-characters/)

请从字符串中找出一个最长的不包含重复字符的子字符串，计算该最长子字符串的长度。

示例 1:
```
输入: "abcabcbb"
输出: 3 
解释: 因为无重复字符的最长子串是 "abc"，所以其长度为 3。
```

这题，不是一套框架就出答案，不过反而更简单了，稍微改一改框架就行了：

这就是变简单了，连`need`和`valid`都不需要，而且更新窗口内数据也只需要简单的更新计数器window即可。

当`window[c]`值大于 `1` 时，说明窗口中存在重复字符，不符合条件，就该移动`left`缩小窗口了嘛。

唯一需要注意的是，在哪里更新结果`res`呢？我们要的是最长无重复子串，哪一个阶段可以保证窗口中的字符串是没有重复的呢？

这里和之前不一样，要在收缩窗口完成后更新`res`，因为窗口收缩的 `while` 条件是存在重复元素，换句话说收缩完成后一定保证窗口中没有重复嘛。

```cpp
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char,int> window;
        int res = 0;
        int left = 0,right = 0;
        while(right < s.size()) {
            char c = s[right];
            ++right;
            window[c]++;

            //当存在一个重复的数就收缩窗口
            while( window[c] > 1 ) {
                char d = s[left];
                ++left;
                window[d]--;
            }
            //滑动窗口的大小，最大的
            res = max(res,right - left);
        }
        return res;
    }
};
```