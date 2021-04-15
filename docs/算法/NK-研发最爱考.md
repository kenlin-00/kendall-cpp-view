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
[题目来源](https://www.nowcoder.com/practice/20ef0972485e41019e39543e8e895b7f?tpId=188&tqId=38285&rp=1&ru=%2Factivity%2Foj&qru=%2Fta%2Fjob-code-high-week%2Fquestion-ranking&tab=answerKey）

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

