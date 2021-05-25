> 每天练习

----

- [反转链表](#反转链表)
- [排序](#排序)
  - [快速排序](#快速排序)
  - [归并排序](#归并排序)
- [设计LRU缓存结构](#设计lru缓存结构)
- [21.合并两个有序链表](#21合并两个有序链表)
- [415.字符串相加](#415字符串相加)
- [两数之和](#两数之和)
- [求二叉树的层次遍历](#求二叉树的层次遍历)
- [寻找第 K 大](#寻找第-k-大)
- [用两个栈实现队列](#用两个栈实现队列)
- [跳台阶](#跳台阶)
- [链表中的节点每K个一组旋转](#链表中的节点每k个一组旋转)
- [矩阵覆盖](#矩阵覆盖)
- [二进制中1的个数](#二进制中1的个数)
- [1472. 设计浏览器历史记录](#1472-设计浏览器历史记录)
- [1154.一年中的第几天](#1154一年中的第几天)
- [剑指 Offer 48.最长不含重复字符的子字符串](#剑指-offer-48最长不含重复字符的子字符串)
- [9.回文数](#9回文数)
- [链表两两反转](#链表两两反转)
- [剑指 Offer 54.二叉搜索树的第k大节点](#剑指-offer-54二叉搜索树的第k大节点)
- [k个数翻转](#k个数翻转)
- [构建子集](#构建子集)
  - [写一个环形缓冲区](#写一个环形缓冲区)
  - [二叉搜索树](#二叉搜索树)
  - [未排序正数数组中累加和为给定值得最长子数组长度](#未排序正数数组中累加和为给定值得最长子数组长度)

-----

## 反转链表
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

递归法：

先进入第一个节点，接着第二个...

最后出来的是最后一个。倒数第二个.....

```cpp
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
       ListNode* pre = NULL;
       return reverse(pre,head);
    }
    ListNode* reverse(ListNode* pre,ListNode* cur) {
        if(cur==NULL) {
            return pre; //返回的是pre，不是cur
        }
        ListNode* curNext = cur->next; //记录下一个节点
        cur->next = pre;  //指向前面的节点
        return reverse(cur,curNext);
    }
};
```


## 排序

[题目来源](https://leetcode-cn.com/problems/sort-an-array/)

### 快速排序

[题目来源](https://www.nowcoder.com/practice/2baf799ea0594abd974d37139de27896?tpId=117&tqId=37851&rp=1&ru=%2Factivity%2Foj&qru=%2Fta%2Fjob-code-high%2Fquestion-ranking&tab=answerKey)

```cpp
class Solution {
public:
    vector<int> sortArray(vector<int>& nums) {
        int left = 0,right = nums.size() - 1;
        quickSort(nums,left,right);
        return nums;
    }
    void quickSort(vector<int>& nums,int left,int right) {
        if(left < right) { //相等就不用动了
            //排序基准元素,返回排序号的位置
            int index = partition(nums,left,right);
            //排序左边
            quickSort(nums,left,index - 1);
            quickSort(nums,index + 1,right);
        }
    }
    int partition(vector<int> &nums,int left,int right) {
        //选择基准
        // int pivot = nums[left];
        swap( nums[left], nums[rand() % (right - left + 1) + left] );
        // swap(nums[left],pivot);
        int pivot = nums[left];
        while(left < right) {
            // 从右往左
            while(left< right && nums[right] >= pivot) {
                --right;
            }
            //填坑
            nums[left] = nums[right];
            //从右往左
            while(left < right && nums[left] <= pivot) {
                ++left;
            }
            //填坑
            nums[right] = nums[left];
        }
        //把基准放到合适的位置
        //这时候left = right
        nums[left] = pivot;
        return left;
    }
};
```

时间复杂度： 在最优的情况下，快速排序算法的时间复杂度为 O(nlogn)

空间复杂度： O(logn)

### 归并排序

思想：归并排序采用的是分治法思想，

- 首相是将 `n` 个元素分治成 `n/2` 个元素的子序列
- 用合并排序算法对两个子序列进行排序
- 合并两个已经排序好的子序列
- 递归以上的三个步骤，直到全部排好序

动图演示：

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/归并排序.2xhvcwnpy060.gif)

```cpp
#include <iostream>
#include<string>
#include <vector>

using  namespace std;



void merge(vector<int>& nums,vector<int>& temp,int first,int mid,int last)
{
    int low1=first,low2=mid+1;
    int index=first;
    while(low1<=mid && low2<=last)
    {
        if(nums[low1]<=nums[low2])temp[index++]=nums[low1++];
        else temp[index++]=nums[low2++];
    }
    // 如果剩下左边的
    while(low1<=mid) temp[index++]=nums[low1++];
    //如果剩下右边的
    while(low2<=last) temp[index++]=nums[low2++];

    //拷贝回 nums
    for(index=first;index<=last;++index)
    {
        nums[index]=temp[index];
    }
}

void mergeSort(vector<int>& nums,int first,int last,vector<int>& temp)
{
    if(first<last)
    {
        int mid=(first+last)/2;
        //分治左边
        mergeSort(nums,first,mid,temp);
        //分治右边
        mergeSort(nums,mid+1,last,temp);
        //归并，左边的第一个和右边的第一个比
        merge(nums,temp,first,mid,last);
    }
}

vector<int> sortArray(vector<int>& nums) {
    int n=nums.size();
    if(n<=1)return nums;
    vector<int> temp(n);
    mergeSort(nums,0,n-1,temp);
    return nums;
}

int main() {

    vector<int> nums = { 5,2,3,1 };
    sortArray(nums);
    vector<int>::iterator it = nums.begin();
    while (it != nums.end() )
    {
        cout << *it++ << " ";
    }
    cout << endl;
    
    return 0;
}
```


## 设计LRU缓存结构

[](https://www.nowcoder.com/practice/e3769a5f49894d49b871c09cadd13a61?tpId=117&tqId=37804&rp=1&ru=%2Factivity%2Foj&qru=%2Fta%2Fjob-code-high%2Fquestion-ranking&tab=answerKey)

若opt=1，接下来两个整数x, y，表示set(x, y)

若opt=2，接下来一个整数x，表示get(x)，若x未出现过或已被移除，则返回-1

对于每个操作2，输出一个答案

```cpp
class Solution {
public:
    /**
     * lru design
     * @param operators int整型vector<vector<>> the ops
     * @param k int整型 the k
     * @return int整型vector
     */
    vector<int> LRU(vector<vector<int> >& operators, int k) {
        cap = k;  //缓冲区的长度
        vector<int> ans;
        for(auto &nums : operators) {  //nums是每个数组
            if(nums[0] == 1) {
                set(nums[1],nums[2]);
            }else {  //获取
                ans.push_back(get(nums[1]));
            }
        }
        return ans;
    }
    //获取
    //先查找哈希表，如果没有就结束，有就复制到头部，再删除原有位置元素
    int get(int key) {
        
        auto it = mp.find(key);
        //如果在哈希表中找不到，那就直接返回找不到
        if(it == mp.end()) {
            return -1;
        }
        
        //如果存在
        
         //value的值
        auto target_it = it->second;
        //定义一个pari对
        pair<int,int> n{target_it->first,target_it->second};
        //缓冲区中先插入
        cache.push_front(n);
        // mp.emplace(key,cache.begin()); //不能写到这里
        //删除
        cache.erase(target_it);
        mp.erase(key);
        //哈希表中插入
        mp.emplace(key,cache.begin());
        
        
        return n.second;
    }
    //插入
    //首先查找，如果有就删除，然后不管有没有都在队头插入
    void set(int key,int value) {
        auto it = mp.find(key);
        
        //如果有就删除
        if(it != mp.end()) {
            cache.erase(it->second);
            mp.erase(key);
        }
        //然后再队头插入
        pair<int, int> n{key,value};
        cache.push_front(n);
        mp.emplace(key,cache.begin());
        
        //如果有容量已经到达上限，就弹出队尾
        if(cap < cache.size()) {
            mp.erase(cache.back().first);
            cache.pop_back();
        }
    }
    
private:
    int cap = 0;
    list<pair<int, int>> cache;
    unordered_map<int, list<pair<int, int>>::iterator > mp;
};
```


 ## 21.合并两个有序链表

[题目来源](https://leetcode-cn.com/problems/merge-two-sorted-lists/)

```
输入：l1 = [1,2,4], l2 = [1,3,4]
输出：[1,1,2,3,4,4]
```

题解：



[NK题目](https://www.nowcoder.com/practice/a479a3f0c4554867b35356e0d57cf03d?tpId=190&tqId=35188&rp=1&ru=%2Factivity%2Foj&qru=%2Fta%2Fjob-code-high-rd%2Fquestion-ranking&tab=answerKey)

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


## 415.字符串相加

[题目来源](https://leetcode-cn.com/problems/add-strings/)

给定两个字符串形式的非负整数 num1 和num2 ，计算它们的和。

 

提示：
```
num1 和num2 的长度都小于 5100
num1 和num2 都只包含数字 0-9
num1 和num2 都不包含任何前导零
你不能使用任何內建 BigInteger 库， 也不能直接将输入的字符串转换为整数形式
```

题解

```cpp
class Solution {
public:
    string addStrings(string num1, string num2) {
        string res = "";
        int i = num1.size() - 1,j = num2.size() - 1;
        int sum = 0;
        while(i >= 0 || j >= 0 || sum ) {  //还要保证sum==0,因为最后一个也可能进十位
            if(i >= 0 ) sum += num1[i--] - '0';
            if(j >= 0 ) sum += num2[j--] - '0';
            res = (char)('0' + sum % 10) + res;  //只加个位部分
            //sum进十位
            sum /= 10;
        }
        return res;
    }
};
```



## 两数之和

[题目来源](https://www.nowcoder.com/practice/20ef0972485e41019e39543e8e895b7f?tpId=188&tqId=38285&rp=1&ru=%2Factivity%2Foj&qru=%2Fta%2Fjob-code-high-week%2Fquestion-ranking&tab=answerKey)


给出一个整数数组，请在数组中找出两个加起来等于目标值的数，
你给出的函数`twoSum` 需要返回这两个数字的下标（`index1，index2`），需要满足 `index1` 小于`index2`。

注意：

下标是从1开始的

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

倒序快排

第 K 大一定在第 K-1 位置


```cpp
class Solution {
public:
    int ans = 0;
    int partition(vector<int>& arr, int i, int j)
    {
        int pivot = arr[i];
        //倒序
        while (i < j)
        {
            while (i < j && arr[j] <= pivot) j--;
            arr[i] = arr[j];
            while (i < j && arr[i] >= pivot) i++;
            arr[j] = arr[i];
        }
        //不需要保存基站数据了，也用不上
        arr[i] = pivot;
        return i;
    }
    //倒序排序
    void quicksort(vector<int>& arr, int left, int right, int K)
    {
        if (left <= right)
        {
            int mid = partition(arr, left, right);
            if (mid == K - 1) //第K大一定在 K-1 位置
            {
                ans = arr[mid];
            }
            else if (mid < K - 1)
            {
                quicksort(arr, mid + 1, right, K);
            }
            else
            {
                quicksort(arr, left, mid - 1, K);
            }
        }
    }
    int findKth(vector<int> a, int n, int K) {
        quicksort(a, 0, n-1, K);
        return ans;
    }
};
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

## 链表中的节点每K个一组旋转

[题目来源](https://www.nowcoder.com/practice/b49c3dc907814e9bbfa8437c251b028e?tpId=117&tqId=37746&rp=1&ru=%2Fta%2Fjob-code-high&qru=%2Fta%2Fjob-code-high%2Fquestion-ranking&tab=answerKey)

将给出的链表中的节点每 `k`  个一组翻转，返回翻转后的链表
如果链表中的节点数不是 `k` 的倍数，将最后剩下的节点保持原样
你不能更改节点中的值，只能更改节点本身。
要求空间复杂度  `O(1)`

例如：

给定的链表是`1→2→3→4→5`

对于 `k=2`, 你应该返回 `2→1→4→3→5`

对于 `k=3`, 你应该返回 `3→2→1→4→5`

题解一：

使用递归

先找到需要翻转的结尾节点，再进行翻转，之后递归后面的

```cpp
/**
 * struct ListNode {
 *	int val;
 *	struct ListNode *next;
 * };
 */

class Solution {
public:
    /**
     * 
     * @param head ListNode类 
     * @param k int整型 
     * @return ListNode类
     */
    ListNode* reverseKGroup(ListNode* head, int k) {
         if(head == nullptr || head->next == nullptr || k == 0) {
             return head;
         }
        
        //比如：[1，2，3，4，5] 3
        //找到需要翻转的最后一个节点
        ListNode* tail = head;
        for(int i=0;i<k;++i) {
            //如果不够长了就直接返回head
            if(tail == nullptr) return head;
            tail = tail->next;
        }
        //这时候 tail->4
        
        //进入翻转函数进行翻转，返回的是翻转后的头结点
        ListNode* newHead = reverse(head,tail); //执行完之后head->1,taile->3,
        //翻转的结果是：3，2，1 newHead->3
        
        //递归继续下一组
        head->next = reverseKGroup(tail,k);
        return newHead;
    }
    //翻转函数(画图看一下)
    ListNode* reverse(ListNode* head,ListNode* tail) {
        ListNode* next = head->next;
        head->next = nullptr; //如果不加就会成为一个环形，如果不输出也不影响
        while(next != tail) {
            ListNode* node = next->next;
            next->next = head;
            head = next;
            next = node;
        }
        return head;
    }
};
```

上述代码的逻辑图

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结/25-01.1yi0v9303rr4.png)

## 矩阵覆盖

[剑指offer](https://www.nowcoder.com/practice/72a5a919508a4251859fb2cfb987a0e6?tpId=13&tqId=11163&rp=1&ru=%2Fta%2Fcoding-interviews&qru=%2Fta%2Fcoding-interviews%2Fquestion-ranking&tab=answerKey)

> 这题就是找规律

```cpp
class Solution {
public:
    int rectCover(int number) {
        if(number <= 2 ) return number;
        int one = 1;
        int two = 2;
        int ret;
        for(int i=3;i<=number;++i) {
            ret = one + two;
            one = two;
            two = ret;
        }
        return ret;
    }
};
```

## 二进制中1的个数

[剑指offer](https://www.nowcoder.com/practice/8ee967e43c2c4ec193b040ea7fbb10b8?tpId=13&tqId=11164&rp=1&ru=%2Fta%2Fcoding-interviews&qru=%2Fta%2Fcoding-interviews%2Fquestion-ranking&tab=answerKey)

```cpp
class Solution {
public:
     int  NumberOf1(int n) {
         int ret = 0;
         while(n>=1) {
             int temp = n % 2;
             if(temp == 1) ++ret;
             n /= 2;
         }
         return ret;
     }
};
```
当然这种方法，对于大部分数据是对的，但是对于`-2147483648`,二进制为`1000...000`，一共有`31`个`0`.因为计算机使用补码存储二进制数据的。对于这个数据，我们的方***输出0，实际上为1.所以这种方法不对。

未通过


## 1472. 设计浏览器历史记录

[题目来源](https://leetcode-cn.com/problems/design-browser-history/)

你有一个只支持单个标签页的 浏览器 ，最开始你浏览的网页是 homepage ，你可以访问其他的网站 url ，也可以在浏览历史中后退 steps 步或前进 steps 步。

请你实现 BrowserHistory 类：

- `BrowserHistory(string homepage)` ，用 `homepage` 初始化浏览器类。
- `void visit(string url)` 从当前页跳转访问 `url` 对应的页面  。执行此操作会把浏览历史前进的记录全部删除。
- `string back(int steps)` 在浏览历史中后退 `steps` 步。如果你只能在浏览历史中后退至多 `x` 步且 `steps > x` ，那么你只后退 `x` 步。请返回后退 至多 `steps` 步以后的 `url` 。
- `string forward(int steps)` 在浏览历史中前进 `steps` 步。如果你只能在浏览历史中前进至多 x 步且 `steps > x` ，那么你只前进 `x` 步。请返回前进 至多 `steps`步以后的 url 。

示例：

```
输入：
["BrowserHistory","visit","visit","visit","back","back","forward","visit","forward","back","back"]
[["leetcode.com"],["google.com"],["facebook.com"],["youtube.com"],[1],[1],[1],["linkedin.com"],[2],[2],[7]]
输出：
[null,null,null,null,"facebook.com","google.com","facebook.com",null,"linkedin.com","google.com","leetcode.com"]

解释：
BrowserHistory browserHistory = new BrowserHistory("leetcode.com");
browserHistory.visit("google.com");       // 你原本在浏览 "leetcode.com" 。访问 "google.com"
browserHistory.visit("facebook.com");     // 你原本在浏览 "google.com" 。访问 "facebook.com"
browserHistory.visit("youtube.com");      // 你原本在浏览 "facebook.com" 。访问 "youtube.com"
browserHistory.back(1);                   // 你原本在浏览 "youtube.com" ，后退到 "facebook.com" 并返回 "facebook.com"
browserHistory.back(1);                   // 你原本在浏览 "facebook.com" ，后退到 "google.com" 并返回 "google.com"
browserHistory.forward(1);                // 你原本在浏览 "google.com" ，前进到 "facebook.com" 并返回 "facebook.com"
browserHistory.visit("linkedin.com");     // 你原本在浏览 "facebook.com" 。 访问 "linkedin.com"
browserHistory.forward(2);                // 你原本在浏览 "linkedin.com" ，你无法前进任何步数。
browserHistory.back(2);                   // 你原本在浏览 "linkedin.com" ，后退两步依次先到 "facebook.com" ，然后到 "google.com" ，并返回 "google.com"
browserHistory.back(7);                   // 你原本在浏览 "google.com"， 你只能后退一步到 "leetcode.com" ，并返回 "leetcode.com"
```

```cpp
class BrowserHistory {
private:
    deque<string> d;
    int index;  //当前页面索引
public:
    BrowserHistory(string homepage) {
        d.push_back(homepage);
        index = 0;
    }
    
    void visit(string url) {
        while(d.size() > index + 1) {  //+1的目的是为了来保存新的url
            d.pop_back();
        }
        ++index;  //然后索引+1，指向新的位置
        d.push_back(url);
    }
    
    string back(int steps) {
        while(steps > 0 && index > 0)  //只有一个页面的时候就不能回退了
        {
            --steps;
            --index;
        }
        //返回当前页
        return d.at(index);  //返回对双端队列容器对象中位置n处元素的引用
     }
    
    string forward(int steps) {
        while(steps > 0 && index < d.size() - 1) //最后一页就不能前进了 
        {
            --steps;
            ++index;
        }
        return d.at(index);
    }
};

/**
 * Your BrowserHistory object will be instantiated and called as such:
 * BrowserHistory* obj = new BrowserHistory(homepage);
 * obj->visit(url);
 * string param_2 = obj->back(steps);
 * string param_3 = obj->forward(steps);
 */
```

> https://blog.csdn.net/m0_37609579/article/details/100529801


## 1154.一年中的第几天 

[题目来源](https://leetcode-cn.com/problems/day-of-the-year/)

给你一个按 YYYY-MM-DD 格式表示日期的字符串 date，请你计算并返回该日期是当年的第几天。

通常情况下，我们认为 1 月 1 日是每年的第 1 天，1 月 2 日是每年的第 2 天，依此类推。每个月的天数与现行公元纪年法（格里高利历）一致。

 

示例 1：
```
输入：date = "2019-01-09"
输出：9
```

初始化一个数组，保存每个月的天数

```cpp
class Solution {
public:
    int dayOfYear(string date) {
        vector<int> monday = {31,28,31,30,31,30,31,31,30,31,30,31};
        vector<int> intdata;   //保存年月日，int型
        string temp = "";
        int ret = 0;
        //分离日期字符串 年 月 日
        for(int i=0;i<date.size();++i) {
            if(date[i] == '-') {
                intdata.push_back(stoi( temp ));//转成int型
                temp = "";
            }
            else{
                temp += date[i] ;  //2019 
            }
        }
        //加上最后一个，日
        intdata.push_back( stoi( temp) );

        for(int i=1;i<= intdata[1] - 1;++i) {  //intdata[1] 是月份 这里的i就是月份
            ret += monday[i-1];
        }
        //考虑闰年，只有当月份大于2才执行
        if(intdata[1] > 2 && ( intdata[0] % 4 == 0 ) ) {
            ret += intdata[2] + 1;  
        }
        else {
            ret += intdata[2];  //加上日期，这个月的第几天
        }
        return ret;
    }
};
```

优化:

初始化一个数组，保存每个月的最后一天是第几天

```cpp
class Solution {
public:
    int dayOfYear(string date) {
        vector<int> monthDay = { 0,31,59,90,120,151,181,212,243,273,304,334 };;
        int year = 0;
        bool flag;  //是不是闰年
        //取出年就可以了
       for(int i=0;i<4;++i) {
           if(date[i] != '-') {
               year = year*10 + ( date[i] - '0' );
           }
       }
        if(year % 4 == 0) { //如果是如年
            flag = true;
        }
        else {
            flag = false;
        }
        int month = ( date[5] - '0' ) * 10 + ( date[6] - '0' ); //月
        int day =  ( date[8] - '0' ) * 10 + ( date[9] - '0' ); //日
        if(month < 3) {
            return monthDay[month - 1] + day;
        }
        else {
            return monthDay[month - 1] + day + flag;
        }
    }
};
```

## 剑指 Offer 48.最长不含重复字符的子字符串

[题目来源](https://leetcode-cn.com/problems/zui-chang-bu-han-zhong-fu-zi-fu-de-zi-zi-fu-chuan-lcof)

请从字符串中找出一个最长的不包含重复字符的子字符串，计算该最长子字符串的长度。

示例 1:
```
输入: "abcabcbb"
输出: 3 
解释: 因为无重复字符的最长子串是 "abc"，所以其长度为 3。
```

```cpp
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        int left = 0,right = 0;
        unordered_map<char,int> window;
        int res = 0;
        while(right < s.size()) {
            char c = s[right];
            ++right;
            window[c]++;

            while(window[c] > 1) {
                char d = s[left];
                ++left;
                window[d]--;
            }
            res = max(res,right - left);
        }
        return res;
    }
};
```



https://leetcode-cn.com/problems/longest-substring-without-repeating-characters

## 9.回文数

[题目来源](https://leetcode-cn.com/problems/palindrome-number/)


给你一个整数 x ，如果 x 是一个回文整数，返回 true ；否则，返回 false 。

回文数是指正序（从左向右）和倒序（从右向左）读都是一样的整数。例如，121 是回文，而 123 不是。

 

示例 1：
```
输入：x = 121
输出：true
```

- 转成字符串

```cpp
class Solution {
public:
    bool isPalindrome(int x) {
        stringstream ss;
        ss << x;
        string s = ss.str();
        int left = 0,right = s.size()  - 1;
        while(left < right) {
            if(s[left++] != s[right--]) {
                return false;
            }
        }
        return true;
    }
};
```

- 翻转一半的数字

用 `x > reverseNum` 作为条件

```cpp
class Solution {
public:
    bool isPalindrome(int x) {
        if(x < 0 || (x % 10 == 0 && x != 0) ) {
            return false;
        }
        //翻转一般的数字
        int reverseNum = 0;
        while(x > reverseNum) {
            reverseNum = reverseNum * 10 + x % 10;
            x /= 10;
        }
        // 当数字长度为奇数时，我们可以通过 revertedNumber/10 去除处于中位的数字。
        // 例如，当输入为 12321 时，在 while 循环的末尾我们可以得到 x = 12，revertedNumber = 123，
        // 由于处于中位的数字不影响回文（它总是与自己相等），所以我们可以简单地将其去除。

        return x == reverseNum || x == reverseNum / 10;
    }
};
```

时间复杂度：O(logn)，对于每次迭代，我们会将输入除以 10，因此时间复杂度为 O(logn)。

空间复杂度：O(1)。我们只需要常数空间存放若干变量。


## 链表两两反转

> https://blog.csdn.net/plokmju88/article/details/102965953

第一种思路：交换两个节点的值

```cpp

#include <stdio.h>
#include <iostream>
using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(NULL) {}
};


ListNode* reverseTwo(ListNode* head) {
    if(head == nullptr || head->next == nullptr ) return head;

    ListNode* one = head;
    ListNode* two = head->next;
    while(one != nullptr && two != nullptr) {
        swap(one->val,two->val);
        if(two->next && two->next->next) {
            one = one->next->next;
            two = two->next->next;
        }
        else {
            break;
        }
    }
    return head;
}

int main() {
    ListNode *head = new ListNode(0);
    ListNode* p = head;
    for(int i=1;i<11;++i ) {
        ListNode* temp = new ListNode(i);
        p->next = temp;
        p = p->next;
    }
    p->next = NULL;
    

    p = head;
    while (p != nullptr)    
    {
        cout << p->val << " ";
        p = p->next;

    }
    cout << endl;
    
    ListNode* res =  reverseTwo(head);
    p = head;
    while (p != nullptr)    
    {
        cout << p->val << " ";
        p = p->next;

    }
    cout << endl;

    return 0;
}
```

> 第二种思路：


```cpp
 
#include <stdio.h>
#include <iostream>
using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(NULL) {}
};

ListNode* ReverseList(ListNode* head)// 两两反转链表
{
    if (head == NULL)
          return NULL;
    ListNode* cur = head;
    //记录下下个结点，下次的置换在该结点和该结点的下一个结点间进行
    ListNode * nexnex = cur->next->next;
    //置换当前结点和下一个结点，例如，这一步后B指向A了，但是A依然指向B，目标是要A指向D。
    ListNode * swaphead = cur->next;
    swaphead->next = cur;
    //递归,返回D
    ListNode * swapnexnex = ReverseList(nexnex);
    //使A指向D
    cur->next = swapnexnex;
    //最后返回B
    return swaphead;
}

ListNode* Init(int num) // 创建链表
{
    if (num <= 0)
        return NULL;
    ListNode* cur = NULL;
    ListNode* head = NULL;
    ListNode* node = (ListNode*)malloc(sizeof(ListNode));
    node->val = 1;
    head = cur = node;
    for (int i = 1; i < num; i++)
    {
        ListNode* node = (ListNode*)malloc(sizeof(ListNode));
        node->val = i + 1;
        cur->next = node;
        cur = node;
    }
    cur->next = NULL;
    return head;
}

void Display(ListNode *head)// 打印链表
{
    if (head == NULL)
    {
        cout << "the list is empty" << endl;
        return;
    }
    else
    {
        ListNode *p = head;
        while (p)
        {
            cout << p->val << " ";
            p = p->next;
        }
    }
    cout << endl;
}

int main( )
{
    ListNode* list = NULL;
    list = Init(10);
    Display(list);
    ListNode* newlist = ReverseList(list);
    Display(newlist);
 
    return 0;

}
```



## 剑指 Offer 54.二叉搜索树的第k大节点

[题目来源](https://leetcode-cn.com/problems/er-cha-sou-suo-shu-de-di-kda-jie-dian-lcof/)

## k个数翻转

## 构建子集

对一个正数组成的数组，用最少的元素构建一个子集，满足该子集之和大于剩余元素之和。输出子集的一种情况即可。

个人答案：

直接从大到小排序，计算sum；注：排序面试官说用sort就行了。
从前往后遍历将数组分成两部分，当前面部分比后面大时，输出前面数组。


实现两个函数模拟EXCEL的列，一个是由数字到字母，一个是由字母到数字。即28->AC;AC->28。
个人答案：

就很基础，注意A对应的数字是1而不是0即可。
```
1
string InttoName(int a);
1
int NametoInt(string s);
```

### 写一个环形缓冲区
```
// RingBuffer 一块连续的内存
// Write
// Read
// 1、FIFO 2、读写不相互覆盖

```

### 二叉搜索树

### 未排序正数数组中累加和为给定值得最长子数组长度

> 这里全部算法题

> https://www.nowcoder.com/discuss/640138?channel=-1&source_id=profile_follow_post_nctrack