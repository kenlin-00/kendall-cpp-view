## 1.什么是 inode

文件存储在硬盘上，硬盘的最小存储单位叫做“扇区”（`Sector`）。每个扇区储存`512`字节（相当于`0.5KB`）。

操作系统在读取硬盘的时候，不会一个个扇区地读取，这样效率太低了，而是一次连续读取多个扇区，也就是一次性读取一个块，这个块是有多个扇区组成的“块”，是文件存储的最小单位。“块”的大小一般是`4kb`,也就是八个扇区(sector)组成一个块（block）。


文件数据都储存在“块”中，那么很显然，我们还必须找到一个地方储存文件的“元信息”，比如文件的创建者、文件的创建日期、文件的大小等等。这种储存文件元信息的区域就叫做`inode`，中文译名为"**索引节点**"。

**每一个文件都有对应的`inode`**，里面包含了与该文件有关的一些信息。

## 2.inode 的内容

`inode`包含文件的元信息,具体如下：

- `Size` 文件的字节数
- `Uid `文件拥有者的User ID
- `Gid` 文件的Group ID
- `Access` 文件的读、写、执行权限
- **文件的时间戳**，共有三个：
  - `Change` 指`inode`上一次变动的时间
  - `Modify` 指文件内容上一次变动的时间
  - `Access` 指文件上一次打开的时间
-` Links` 链接数，即有多少文件名指向这个`inode`
- `Inode` 文件数据`block`的位置
- `Blocks` 块数
- `IO Blocks` 块大小
- `Device` 设备号码

可以通过`stat`命令查看一个文件的`inode`信息。
```
$ stat test.c
  File: 'test.c'
  Size: 217             Blocks: 8          IO Block: 4096   regular file
Device: 801h/2049d      Inode: 2376573     Links: 1
Access: (0664/-rw-rw-r--)  Uid: ( 1000/ kendall)   Gid: ( 1000/ kendall)
Access: 2021-03-28 21:48:13.593371400 -0700
Modify: 2021-03-28 21:48:13.597371423 -0700
Change: 2021-03-28 21:48:13.597371423 -0700
 Birth: -
```

总之，除了文件名以外的所有文件信息，都存在`inode`之中。至于为什么没有文件名，下文会有详细解释。

## 3.inode的大小

`inode`也会消耗硬盘空间，所以硬盘格式化的时候，操作系统自动将硬盘分成两个区域。一个是**数据区**，存放文件数据；另一个是`inode`区（`inode table`），存放`inode`所包含的信息。

每个`inode`节点的大小，一般是`128`字节或`256`字节。`inode`节点的总数，在格式化时就会确定，一般是每`1KB`或每`2KB`就设置一个`inode`。假定在一块`1GB`的硬盘中，每个`inode`节点的大小为`128`字节，每`1KB`就设置一个`inode`，那么`inode table`的大小就会达到`128MB`，占整块硬盘的`12.8%`。

查看某个分区的`inode`总数：`$ df -i`

```
$ df -i     # Inode总数 已使用   空闲
Filesystem      Inodes  IUsed   IFree IUse% Mounted on
udev            494293    439  493854    1% /dev
tmpfs           501983    621  501362    1% /run
/dev/sda1      2559088 332227 2226861   13% /
tmpfs           501983      1  501982    1% /dev/shm
tmpfs           501983      5  501978    1% /run/lock
tmpfs           501983     17  501966    1% /sys/fs/cgroup
tmpfs           501983      5  501978    1% /run/user/1000
```

查看每个`inode`节点的大小:

```
$ sudo dumpe2fs -h /dev/sda1 | grep "Inode size"
dumpe2fs 1.42.13 (17-May-2015)
Inode size:               256
```

由于每个文件都必须有一个`inode`，因此有可能发生inode已经用光，但是硬盘还未存满的情况。这时，就无法在硬盘上创建新文件。案例>>http://zyan.cc/post/295/

------
一、发现问题：
　　在一台配置较低的Linux服务器（内存、硬盘比较小）的/data分区内创建文件时，系统提示磁盘空间不足，用df -h命令查看了一下磁盘使用情况，发现/data分区只使用了66%，还有12G的剩余空间，按理说不会出现这种问题。

二、分析问题：
　　后来用df -i查看了一下/data分区的索引节点(inode)，发现已经用满(IUsed=100%)，导致系统无法创建新目录和文件。

![](./img/inode01.jpg)

三、查找原因：
　　/data/cache目录中存在数量非常多的小字节缓存文件，占用的Block不多，但是占用了大量的inode。

四、解决方案：

　　1、删除/data/cache目录中的部分文件，释放出/data分区的一部分inode。

　　2、用软连接将空闲分区/opt中的newcache目录连接到/data/cache，使用/opt分区的inode来缓解/data分区inode不足的问题：
　　`ln -s /opt/newcache /data/cache`

　　3、更换服务器，用高配置的服务器替换低配置的服务器。很多时候用钱去解决问题比用技术更有效，堆在我办公桌上5台全新的 DELL PowerEdge 1950 服务器即将运往IDC机房。

https://blog.csdn.net/xuz0917/article/details/79473562

https://blog.csdn.net/SOJUE/article/details/48769389
------

