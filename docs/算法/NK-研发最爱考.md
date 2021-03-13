## 1.反转链表(重点)
[题目来源](https://www.nowcoder.com/practice/75e878df47f24fdc9dc3e400ec6058ca?tpId=190&tqId=35203&rp=1&ru=%2Factivity%2Foj&qru=%2Fta%2Fjob-code-high-rd%2Fquestion-ranking&tab=answerKey)

输入一个链表，反转链表后，输出新链表的表头。

示例：
```
输入：
{1,2,3}
输出：
{3,2,1}
```

题解：使用尾插发

```cpp
/*
struct ListNode {
	int val;
	struct ListNode *next;
	ListNode(int x) :
			val(x), next(NULL) {
	}
};*/
class Solution {
public:
    ListNode* ReverseList(ListNode* pHead) {
        if(!pHead || !pHead->next) return pHead;
        ListNode * p = pHead; //交换指针
        ListNode * q = pHead->next;//遍历指针
        pHead = NULL;
        while(q) {
            p->next = pHead;
            pHead = p;
            p = q;
            q = q->next;
        }
        //插入最后一个元素
        p->next = pHead;
        pHead = p;
        return pHead;
    }
};
```

## 2.排序
[题目来源](https://www.nowcoder.com/practice/2baf799ea0594abd974d37139de27896?tpId=190&tqId=36114&rp=1&ru=%2Factivity%2Foj&qru=%2Fta%2Fjob-code-high-rd%2Fquestion-ranking&tab=answerKey)

题解一：快速排序


```cpp
class Solution {
public:
    /**
     * 代码中的类名、方法名、参数名已经指定，请勿修改，直接返回方法规定的值即可
     * 将给定数组排序
     * @param arr int整型vector 待排序的数组
     * @return int整型vector
     */
    vector<int> MySort(vector<int>& arr) {
        //快速排序
        quick_sort(arr, 0, arr.size()-1);
        return arr;
    }
    void quick_sort(vector<int>& arr,int start,int end) {
        if(start >= end) return;
        int left = start;
        int right = end;
        int temp = arr[right];
        while(left < right) {
            //从左向右
            while(left < right && arr[left] <= temp){
                ++left;
            }
            arr[right] = arr[left];
            //从右往左
            while(left < right && arr[right] >= temp) {
                --right;
            }
            arr[left] = arr[right];
        }
        //遍历一遍完，这时候left=right arr[left]已经确定
        //递归进行第二次变能力
        arr[right] = temp;
        if(left!=start) {
            quick_sort(arr, start,left - 1);
        }
        if(right!=end) {
            quick_sort(arr, left + 1, end);
        }
    }
};
```

效率更高

```cpp
class Solution {
public:
    /**
     * 代码中的类名、方法名、参数名已经指定，请勿修改，直接返回方法规定的值即可
     * 将给定数组排序
     * @param arr int整型vector 待排序的数组
     * @return int整型vector
     */
    vector<int> MySort(vector<int>& arr) {
        //快速排序
        quickSort(arr, 0, arr.size()-1);
        return arr;
    }
    void quickSort(vector<int>& arr,int left,int right) {
        if (left >= right) return;
        int a = arr[left], l = left + 1, r = right;
        while (l <= r) {
            if (arr[l] > a) swap(arr[l], arr[r--]);
            else l++;
        }
        swap(arr[r], arr[left]);
        quickSort(arr, left, r - 1);
        quickSort(arr, r+1, right);
    }
};
```

## 3.设计LRU缓存结构

[题目来源](https://www.nowcoder.com/practice/e3769a5f49894d49b871c09cadd13a61?tpId=190&tqId=35214&rp=1&ru=%2Factivity%2Foj&qru=%2Fta%2Fjob-code-high-rd%2Fquestion-ranking&tab=answerKey)


设计`LRU`缓存结构，该结构在构造时确定大小，假设大小为`K`，并有如下两个功能
- `set(key, value)`：将记录`(key, value)`插入该结构
- `get(key)`：返回`key`对应的`value`值

[要求]

`set`和`get`方法的时间复杂度为`O(1)`

某个`key`的`set`或`get`操作一旦发生，认为这个`key`的记录成了最常使用的。

当缓存的大小超过`K`时，移除最不经常使用的记录，即`set`或`get`最久远的。

若`opt=1`，接下来两个整数`x`, `y`，表示`set(x, y)`

若`opt=2`，接下来一个整数`x`，表示`get(x)`，若x未出现过或已被移除，则返回`-1`

对于每个操作`2`，输出一个答案

示例
```cpp
输入
[[1,1,1],[1,2,2],[1,3,2],[2,1],[1,4,4],[2,2]],3
返回值
[1,-1]
```

题解思路[可参考](https://www.bilibili.com/video/BV1ZQ4y1A74H?from=search&seid=16797895766189914345)

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
        vector<int> key;  
        vector<int> value;  
        vector<int> ret;
        for(int i=0;i<operators.size();++i) {
            //执行set方法 set(key,val)
            if(operators[i][0] == 1) {
                set(operators[i][1],operators[i][2],key,value,k) ;
            }
            if(operators[i][0] == 2) {
                get(operators[i][1],key,value,ret);
            }
        }
        return ret;
    }
    void get(int a,vector<int>& key,vector<int> &value,vector<int>& ret) {
        int t = -1;
        int t1,t2;
        for(int i = 0; i < key.size(); ++i){
            if(a == key[i]){
                t = i;
                break;
            }
        }
        if(t == -1){
            ret.push_back(-1);
        }else{
            t1 = key[t];
            t2 = value[t];
            key.erase(key.begin() + t);
            value.erase(value.begin() + t);
            key.push_back(t1);
            value.push_back(t2);
            ret.push_back(t2);
        }
    }
    void set(int a, int b, vector<int>& key,vector<int>& value,int k) {
        if(key.size() < k){
            key.push_back(a);
            value.push_back(b);
        }else{
            key.erase(key.begin());
            value.erase(value.begin());
            key.push_back(a);
            value.push_back(b);
        }
    }
};
```

## 4.在移动有序的数组中寻找目标值

[题目来源](https://www.nowcoder.com/practice/7cd13986c79d4d3a8d928d490db5d707?tpId=190&tqId=35352&rp=1&ru=%2Factivity%2Foj&qru=%2Fta%2Fjob-code-high-rd%2Fquestion-ranking&tab=answerKey)

给出一个转动过的有序数组，你事先不知道该数组转动了多少
(例如,0 1 2 4 5 6 7可能变为4 5 6 7 0 1 2).
在数组中搜索给出的目标值，如果能在数组中找到，返回它的索引，否则返回-1。
假设数组中不存在重复项。


```
输入：[1],0
输出：-1

输入：[3,2,1],1
输出：2
```
对旋转数组进行均等划分后，总有一边是有序的，如：

`10 11 12 13 14 15 1 2 3`           
`10 11 15 1 2 3 4 5 6 7 8`

我们定位到有序的一边后，对比`target`与有序子数组的左右边界，就可以作出搜索左侧还是右侧的决策。

```cpp
class Solution {
public:
    /**
     * 
     * @param A int整型一维数组 
     * @param n int A数组长度
     * @param target int整型 
     * @return int整型
     */
    int search(int* A, int n, int target) {
        if(n<=0) return -1;
        int left = 0;
        int right = n - 1;
        while(left <= right) {
            int mid = left + (right - left) / 2;
            if(A[mid] == target) return mid;
            if(A[mid] >= A[left]) {
                //左侧有序
                if(A[mid] > target && A[left] <= target) {
                    right = mid - 1;
                }
                else{  //目标不可能在左边
                    left = mid + 1;
                }
            }
            else {
                //右侧有序(含A[mid])
                if(A[mid] < target && A[right] >= target) 
                    left = mid + 1;
                else   //目标数不在右边
                    right = mid - 1;
            }
        }
        return -1;
    }
};
```

## 5.判断链表是否有环

[题目来源](https://www.nowcoder.com/practice/650474f313294468a4ded3ce0f7898b9?tpId=190&tqId=35179&rp=1&ru=%2Factivity%2Foj&qru=%2Fta%2Fjob-code-high-rd%2Fquestion-ranking&tab=answerKey)


判断给定的链表中是否有环。如果有环则返回`true`，否则返回`false`。
你能给出空间复杂度`O(1)`的解法么？

使用快指针和慢指针

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
        if(head==nullptr || head->next==nullptr) return false;
        if(head->next == head) return true;
        //定义快指针和慢指针
        ListNode *fast = head;
        ListNode *slow = head;
        while(fast!=nullptr && fast->next != nullptr) {
            fast = fast->next->next;
            slow = slow->next;
            if(slow == fast) return true;
        }
        return false;
    }
};
```

## 6.实现二叉树先序、中序、后续遍历

[题目来源](https://www.nowcoder.com/practice/a9fec6c46a684ad5a3abd4e365a9d362?tpId=190&tqId=35221&rp=1&ru=%2Factivity%2Foj&qru=%2Fta%2Fjob-code-high-rd%2Fquestion-ranking&tab=answerKey)

分别按照二叉树先序，中序和后序打印所有的节点。

解法一：使用递归
```cpp
/**
 * struct TreeNode {
 *	int val;
 *	struct TreeNode *left;
 *	struct TreeNode *right;
 * };
 */

class Solution {
public:
    /**
     * 
     * @param root TreeNode类 the root of binary tree
     * @return int整型vector<vector<>>
     */
    vector<vector<int> > threeOrders(TreeNode* root) {
        vector<vector<int>> res;
        if(root == nullptr || (!root->left && !root->right)) 
            return res;
        preorder(root);
        midorder(root);
        postorder(root);
        res = {pre,mid,post};
        return res;
    }
    //前序遍历
    void preorder(TreeNode* root) {
        if(root == nullptr) return;
        pre.push_back(root->val);
        if(root->left) preorder(root->left);
        if(root->right) preorder(root->right);
    }
    //中序遍历
    void midorder(TreeNode* root) {
        if(root == nullptr) return;
        if(root->left) midorder(root->left);
        mid.push_back(root->val);
        if(root->right) midorder(root->right);
    }
    //后序遍历
    void postorder(TreeNode* root) {
        if(root == nullptr) return;
        if(root->left) postorder(root->left);
        if(root->right) postorder(root->right);
        post.push_back(root->val);
    }
private:
    vector<int> pre,mid,post;
};
```

## 7.最小的K个数
[题目来源](https://www.nowcoder.com/practice/6a296eb82cf844ca8539b57c23e6e9bf?tpId=190&tqId=35976&rp=1&ru=%2Factivity%2Foj&qru=%2Fta%2Fjob-code-high-rd%2Fquestion-ranking&tab=answerKey)

给定一个数组，找出其中最小的K个数。例如数组元素是`4,5,1,6,2,7,3,8`这`8`个数字，则最小的`4`个数字是`1,2,3,4`。如果`K>数组的长度`，那么返回一个空的数组。

示例：
```cpp
输入：
[4,5,1,6,2,7,3,8],4
输出
[1,2,3,4]
```

题解一：使用`sort`排序

```cpp
class Solution {
public:
    vector<int> GetLeastNumbers_Solution(vector<int> input, int k) {
        vector<int> res;
        if(k>input.size()) return res;
        sort(input.begin(), input.end());
        for(int i=0;i<k;++i) {
            res.push_back(input[i]);
        }
        return res;
    }
};
```

题解二：基于快排思想

对数组`[l, r]`一次快排`partition`过程可得到，`[l, p), p`, `[p+1, r)`三个区间,`[l,p)`为小于等于`p`的值
`[p+1,r)`为大于等于`p`的值。
然后再判断`p`，利用二分法

- 1.如果`[l,p`), `p`，也就是`p+1`个元素（因为下标从`0`开始），如果`p+1 == k`, 找到答案
- 2.如果`p+1 < k`, 说明答案在`[p+1, r)`区间内，
- 3.如果`p+1 > k` , 说明答案在`[l, p)`内

```cpp
class Solution {
public:
    int partition(vector<int> &input,int l,int r) {
        int pivot = input[r-1];
        int i = l;
        for (int j=l; j<r-1; ++j) {
            if (input[j] < pivot) {
                swap(input[i++], input[j]);
            }
        }
        swap(input[i], input[r-1]);
        return i;
    }
    
    vector<int> GetLeastNumbers_Solution(vector<int> input, int k) {
        vector<int> ret;
        if(k == 0 || k > input.size()) return ret;
        int l=0,r = input.size();
        while(l < r) {
            int p = partition(input,l,r) ;
            if(p+1 ==  k) {
               return vector<int>({input.begin(), input.begin()+k});
            }
            if(p+1<k) {
                l = p + 1;
            }
            else {
                r = p;
            }
        }
        return ret;
    }
};
```

