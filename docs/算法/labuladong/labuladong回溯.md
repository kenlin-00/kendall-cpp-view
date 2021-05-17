解决一个回溯问题，实际上就是一个决策树的遍历过程。

只需要思考 3 个问题：

1、路径：也就是已经做出的选择。

2、选择列表：也就是你当前可以做的选择。(可以选择走哪条路)

3、结束条件：也就是到达决策树底层，无法再做选择的条件。

**回溯算法的框架**：

```
result = []
void backtrack(路径, 选择列表):
    if 满足结束条件:
        result.add(路径)
        return

    for 选择 in 选择列表:
        做选择
        backtrack(路径, 选择列表)
        撤销选择
```

**其核心就是 for 循环里面的递归，在递归调用之前「做选择」，在递归调用之后「撤销选择」**

## 全排列问题

> [参考labuladong](https://mp.weixin.qq.com/s?__biz=MzAxODQxMDM0Mw==&mid=2247484709&idx=1&sn=1c24a5c41a5a255000532e83f38f2ce4&chksm=9bd7fb2daca0723be888b30345e2c5e64649fc31a00b05c27a0843f349e2dd9363338d0dac61&scene=21#wechat_redirect)


**为了简单清晰起见，我们这次讨论的全排列问题不包含重复的数字**

![](https://mmbiz.qpic.cn/sz_mmbiz_jpg/gibkIz0MVqdF1umAdyXuPq54ibw7X23mnaGJiambtpqc4vkhsqZYoEZWianibsImtDvmXRMCJuUB8gkLfCJVAQDt2RA/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

我们定义的`backtrack`函数其实就像一个指针，在这棵树上游走，同时要正确维护每个节点的属性，每当走到树的底层，其「路径」就是一个全排列。

多叉树的遍历框架就是这样:

```cpp
void traverse(TreeNode root) {
    for (TreeNode child : root.childern)
        // 前序遍历需要的操作
        traverse(child);
        // 后序遍历需要的操作
}
```

