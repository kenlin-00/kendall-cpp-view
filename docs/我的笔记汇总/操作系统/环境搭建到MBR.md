
- [第1章 环境部署](#第1章-环境部署)
	- [安装 Bochs](#安装-bochs)
	- [配置 bochs](#配置-bochs)
- [让MBR跑起来](#让mbr跑起来)
	- [主引导记录起始地址 0x7c00](#主引导记录起始地址-0x7c00)
	- [NASM 编译器](#nasm-编译器)
		- [安装 nasm](#安装-nasm)
	- [开始编写 MBR 引导程序代码](#开始编写-mbr-引导程序代码)
	- [创建一个镜像文件](#创建一个镜像文件)

------

大家好，我是零K同学，点击左上角<font color="blue" size=4 font-weight=bolder>蓝字</font>关注公众号: <font color="blue" size=4 font-weight=bolder>零K同学</font>。

-----

相信很多读者都是在校大学生或者一名应用层开发工程师，那么你可能就会问，我又不从事底层开发，以后也很大概率接触不到操作系统内核的知识，有必要深入学习操作系统吗？

答案当然是**肯定的**，操作系统是所有软件的基础，所有的上层软件都要依赖于操作系统提供各种运行机制。如果仔细观察身边的技术大牛，他们的基本功都是非常扎实，这对他们的技术成长是非常有帮助的。

此外，如果你的简历上说你自己手写了一个操作系统，这必定能给面试官留下很大的加分印象。

## 第1章 环境部署

首先需要准备一个虚拟机软件（VMWare 或者 VirtualBox），然后就是 linux 操作系统，具体的安装教程可以自行网上搜索。

我这里选择的开发环境是 VMWare + Ubuntu 18.4 + bochs-2.6.2

### 安装 Bochs

- 下载 bochs-2.6.2.tar.gz

下载地址: [https://sourceforge.net/projects/bochs/files/bochs/2.6.2/bochs-2.6.2.tar.gz/download](https://sourceforge.net/projects/bochs/files/bochs/2.6.2/bochs-2.6.2.tar.gz/download)

- 解压 (我把 bochs-2.6.2.tar.gz 放在 `/home/book/bochsken` 目录下)

下载完解压之后，cd 到 bochs-2.6.2 

- 通过 configure，make，make install 进行安装。

首先是 configure

> 下面第二行更改成自己的目录，注意 `\` 前面有一个空格，`\`后面不能有空格

```
./configure \
--prefix=/home/book/bochsken \
--enable-debugger \
--enable-disasm \
--enable-iodebug \
--enable-x86-debugger \
--with-x \
--with-x11


## 如果是 Ubuntu 20.4 尝试用这个命令  后面不需要修改 LIBS
./configure \
--prefix=/home/kendall/kenspace/bochs/labstr \
--enable-debugger \
--enable-disasm \
--enable-iodebug \
--enable-x86-debugger \
--with-x \
--with-x11 \
LDFLAGS='-pthread' \
LIBS='-lX11'
```

configure 之后执行 make

在编译过程中可能会报错，大家根据自己遇到的错误利用搜索工具解决，我这里列出我遇到的问题以及解决方案

**报错 1**

```
cd gui && \
make  libgui.a
make[1]: Entering directory '/home/book/bochsken/bochs-2.6.2/gui'
g++ -c  -I.. -I./.. -I../iodev -I./../iodev -I../instrument/stubs -I./../instrument/stubs -g -O2 -D_FILE_OFFSET_BITS=64 -D_LARGE_FILES     gtk_enh_dbg_osdep.cc -o gtk_enh_dbg_osdep.o
gtk_enh_dbg_osdep.cc:20:10: fatal error: gtk/gtk.h: No such file or directory
 #include <gtk/gtk.h>
          ^~~~~~~~~~~
compilation terminated.
Makefile:104: recipe for target 'gtk_enh_dbg_osdep.o' failed
make[1]: *** [gtk_enh_dbg_osdep.o] Error 1
make[1]: Leaving directory '/home/book/bochsken/bochs-2.6.2/gui'
Makefile:323: recipe for target 'gui/libgui.a' failed
make: *** [gui/libgui.a] Error 2
```

解决方法

```bash
sudo apt-get install xorg-dev

# 这里如果出现：E: Unmet dependencies. Try 'apt --fix-broken install' with no packages (or specify a solution).
```

**报错 2**

根据问题提示信息，是由于所依赖的包 `linux-image-4.10.0-35-generic` 并没有被正确安装导致。`linux-image-x.x.x` 是内核文件，从提示信息上看，应该是升级过程中断导致的问题。查看内核当前版本信息发现当前运行的版本为 `4.18.0-15-generic`。确实与提示的内核信息不一致，确认了问题所在。

```
book@100ask:~/bochsken$ uname -r
4.18.0-15-generic
```

解决方案

根据提示信息，运行 `apt-get -f install` 来修复问题

接下来我们执行修复命令，并重新执行更新和升级，确保完整修复问题。

```bash
sudo apt-get install libgtk2.0-dev
sudo apt --fix-broken install
sudo apt-get update
sudo apt-get upgrade


sudo make dist-clean   一定要清除干净
```

**报错 3**

通过上面一系列修复后执行 `make` 又有新的问题，解决方案可 [参考](https://blog.csdn.net/xiaoqin515515/article/details/19009653)

```
/usr/bin/ld: gui/libgui.a(gtk_enh_dbg_osdep.o): undefined reference to symbol 'pthread_create@@GLIBC_2.2.5'
/usr/bin/ld: /lib/x86_64-linux-gnu/libpthread.so.0: error adding symbols: DSO missing from command line
collect2: error: ld returned 1 exit status
make: *** [Makefile:179: bochs] Error 1
```

打开 Makefile，在92行左右找到 `LIBS ＝ 。。。`一行，在这一行最后面添加 `-lpthread`

```
 LIBS =  -lm 。。。-lpthread

#修改完后如下：
92 LIBS =  -lm -lgtk-x11-2.0 -lgdk-x11-2.0 -lpangocairo-1.0 -latk-1.0 -lcairo -lgdk_pixbuf-2.0 -lgio-2.0 -lpangoft2-1.0 -lpango-1.0 -lgobject-2.0 -lglib-2.0     -lfontconfig -lfreetype -lpthread
```

- 重新 make

- make 结束且未报错后，执行 `sudo make install`

> 如果把库都补齐了，这步基本顺利通过

安装成功的标志：生成了 bin 文件夹 (在自己定义的安装目录下 `/home/book/bochsken`)

### 配置 bochs

- 进入 bochs 目录, 新建 `boot.disk` 文件，并将下面配置复制粘贴进去，**注意将相应目录改成自己设置的目录**

> 注意书上的这部分代码是有误的。

```
# 设置 Bochs 在运行过程中能够使用的内存，本例为 32MB
megs: 32

# 设置对应真实机器的 BIOS 和 VGA BIOS
romimage: file=/home/book/bochsken/share/bochs/BIOS-bochs-latest
vgaromimage: file=/usr/local/share/bochs/VGABIOS-lgpl-latest   # 注意这里的路径不要写出了


# 设置 Bochs 使用的磁盘
# floppya: 1_44=a.img, status=inserted

# 选择启动盘符
# boot: flopy # 默认从软盘启动
boot: disk # 从硬盘启动，我们的任何代码都将直接写在硬盘上，所以不会再有读写软盘的操作。

# 设置日志文件输出
log: bochs.out

# 关闭鼠标，打开键盘，按照书上写会报错
mouse: enabled=0
#keyboard: enabled=1,
keyboard: keymap=/home/book/bochsken/share/bochs/keymaps/x11-pc-us.map


# 硬盘设置
ata0: enabled=1, ioaddr1=0x1f0, ioaddr2=0x3f0, irq=14

# 增加 Bochs 对 GDB 的支持，GDB 远程连接到此机器的 1234 端口便可调试
# gdbstub: enabled=1, port=1234, test_base=0, data_base=0, bss_base=0
```

- 接下来就可以运行 bochs 了

```
book@100ask:~/bochsken$ ./bin/bochs -f  boot.disk
```

> 注意本文使用的配置文件名是 boot.disk，下图是之前学习时截图的，所以看到是 `bochsrc.disk`。

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/bochs环境01.2as4ljsaskis.webp)

- 看到数字 [6] 就直接回车，再输入 c 回车

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/寻offer总结02/bochs环境02.6m7ql9otwio0.webp)

到目前为止环境已经基本搭建完成了，接下来可以感受操作系统的乐趣啦！！！建议自己亲自手动操作一遍， 这样可以锻炼自己的解决问题能力。


> 参考《操作系统真象还原》

----

<font color="green" size=4>更多读书笔记关注公众号:**零K同学**</font>

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-02/公众号二维码.leozf4yvy34.jpg)

-----------


大家好，我是零K同学，专注于分享读书笔记的Linux开发工程师，点击左上角<font color="blue" size=4 font-weight=bolder>蓝字</font>关注公众号: <font color="blue" size=4 font-weight=bolder>零K同学</font>。

-----

之前介绍了[实现一个操作系统系列的环境搭建篇，**点击可以查看**](https://mp.weixin.qq.com/s?__biz=MzkwMjIzNjc4NA==&mid=2247484227&idx=1&sn=c67056705853b047d03470a1767a31e6&chksm=c0a9dc5cf7de554a2f212803e816089b4837cd2154e74b1a9718c2d0f5504be5e2f265772a8a#rd)，今天继续深入写一个简单的领导程序。

## 让MBR跑起来

### 主引导记录起始地址 0x7c00

计算机通电后，BIOS 处理程序开始自检，随后，调用 BIOS 中断 0x91h，也就是 `call int 19h`。BIOS 会通过这个函数检测这台计算机有多少硬盘或者软盘，如果检测到了有可用的磁盘，那么 BIOS 就把它的第一个扇区加载到 0x7c00。  

> 主引导记录会存入内存地址 0x7C00, 为什么是 0x7c00，详细可以参考**这篇文章**：https://www.glamenv-septzen.net/en/view/6

主引导记录（Master boot record，缩写为 MBR ）

先简单说一下计算机启动是这样一个过程

- 通电
- 读取 ROM 里面的 BIOS，用来检查硬件
- 硬件检查通过
- BIOS 根据指定的顺序，检查引导设备的第一个扇区（即**主引导记录**），加载在内存地址 0x7C00
- 主引导记录把操作权交给操作系统

所以，主引导记录就是引导"操作系统"进入内存的一段小程序，大小不超过 1 个扇区（ 512 字节）。

0x7C00 这个地址来自 Intel 的第一代个人电脑芯片 8088，以后的 CPU 为了保持兼容，一直使用这个地址。

### NASM 编译器

- 符号`[]`

在 nasm 编译器中，如果直接引用变量名或者标识符，就会编译器认为正在引用这个变量的地址。但是如果希望访问变量里的数据，就必须使用符号`[]`，我们可以把它想象成 C语言中的数组。数组名加上`[]`之后就表示数组中国的元素。

- 符号`$`

符号`$`在 nasm 编译器中代表当前行被编译后的地址，比如下面代码：

```
jmp $
```

这条汇编指令的功能是死循环，将它翻译成十六进制的机器码是 `E9 FD FF`，其中机器码 E9 表示跳转，FD 表示确定跳转的目标地址，由于 x86 处理器是以小端模式保存数据的，所以机器码转换为地址偏移值是 0xfffd，也就是十进制的 13，从机器码 E9 可以知道，这个 jmp 指令完成的动作是相对跳转，跳转的目标地址是在当前指令地址处减 3 处，这条指令的长度是 3 个字节，所以处理器又回到这条指令处重新执行。符号 $ 在上述过程中指的是机器码 E9 之前的位置。

- 符号 `$$`

`$$` 代表一个 Section（节/段）其实是被编译后的地址，也就是某个段的起始地址，编写复杂程序时一般都会用到 Section，Section 既可以作为数据段又可以作为代码段。在 Section 中添加 vstart=xxxx 修饰，$$ 的值就是这个 section 的虚拟地址起始地址 xxxx。但是如果已经添加了关键字 vstart，我们还想获取真实的地址那应该怎么做呢？

我们先来看看下面代码

```
section data
	var dd 0
section code
	jmp start
```

这里有两个段，data 中定义的是变量，code 中是代码，也就是代码段和数据段。

#### 安装 nasm

```
sudo apt-get install nasm
```

然后使用下面命令查看是否安装成功

```
$ nasm -version
NASM version 2.13.02
```

### 开始编写 MBR 引导程序代码

- boot.asm


```x86asm
; 主引导程序
section mbr vstart=0x7c00
	mov ax,cs
	; 用 cs 寄存器来初始化这些寄存器
	mov ds,ax
	mov es,ax
	mov ss,ax
	mov fs,ax
	mov sp,0x7c00  ; 初始化栈指针

; 清屏功能
; 使用 int 0x10 中断的 0x06 子功能好，上卷窗口
	mov ax,0x0600  ;功能号   al 为上卷的行数 0 为全部
	mov bx,0x700    ;上卷的行属性
	; 左上角
	mov cx,0
	; 右下角，注意是从 0 开始
	mov dx,0x184f     ; 0x18=24,0x4f=79

	int 0x10

; 获取光标位置，在光标位置打印字符
; .get_cursor
	; 切换子功能号
	mov ah,3
	mov bh,0    ; bh是待获取的光标页号
	
	int 0x10

; 0x10 13 功能号，打印字符
	mov ax,message    ; 在后面定义
	mov bp,ax		;首地址
	int 0x10

	; 光标位置需要用到 dx 寄存器中的内容，cx中的内容可以忽略
	mov cx,9   ; 字符串的长度，不包括结束符
	mov ax,0x1301	;0x13子功能号，设置字符方式 ah=01
	mov bx,0x2   ; 页号
	
	int 0x10

	; 死循环，停在这里
	jmp $

	message db "1 Kendall"
	times 510-($-$$) db 0
	db 0x55,0xaa
```


**编译**

```
nasm -o boot.bin mbr.S 

# 注意看是512 字节
-rw-rw-r-- 1 book book  512 Apr  9 08:22 mbr.bin
```

写入 0 磁盘 0 道 1 扇区

### 创建一个镜像文件

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/linux笔记01/bximage.11fzl1jaotow.png)

然后修改 boot.disk 配置文件，指定 .img 路径

```
# 加入新的代码
# ata0-master: type=disk, path="boot.img", mode=flat, cylinders=520, heads=16, spt=63
# ata0-slave: type=disk, path="boot.img", mode=flat, cylinders=520, heads=16, spt=63
ata0-master: type=disk, path="boot.img", mode=flat,cylinders=2,heads=16,spt=63
```

开始写到镜像文件

```
book@100ask:~/bochsken/srcboot$ dd if=./mbr.bin of=../boot.img bs=512 count=1 conv=notrunc
1+0 records in
1+0 records out
512 bytes copied, 0.000291316 s, 1.8 MB/s
```

- if=输入路径
- of=写入镜像路径

运行查看效果

```
book@100ask:~/bochsken$ ./bin/bochs -f boot.disk
```


![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/linux笔记01/mbr01.37x48hwlw400.png)

----

<font color="green" size=4>更多读书笔记关注公众号:**零K同学**</font>

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-02/公众号二维码.leozf4yvy34.jpg)


------


