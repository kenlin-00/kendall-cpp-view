
> 上一篇[谁说换个大的内存条电脑就不卡了？](https://mp.weixin.qq.com/s?__biz=MzkwMjIzNjc4NA==&mid=2247484002&idx=1&sn=04c70a83762942802860ff7c30e9a2e3&chksm=c0a9dd7df7de546b6fcc55c2314c781d3cc5d5863e5b8401344fa7331b86a04aab9c29582b5b#rd)中主要介绍了 BIOS 的内存布局，今天来写个 MBR，让这个 mini 操作系统跑起来先。

实操总是会遇到好多坑，折腾了好久才把它跑出来，还得多练练基本功呐。虽然只是一小步，但是最后把“1 ken”字符串打印出来那一刻真是激动啊。好啦，不抒情了。直接上干货吧！

### 主引导记录起始地址 0x7c00

计算机通电后，BIOS 处理程序开始自检，随后，调用 BIOS 中断 0x91h，也就是 `call int 19h`。BIOS 会通过这个函数检测这台计算机有多少硬盘或者软盘，如果检测到了有可用的磁盘，那么 BIOS 就把它的第一个扇区加载到 0x7c00。  

> 主引导记录会存入内存地址 0x7C00, 为什么是 0x7c00，详细可以参考[这篇文章](https://www.glamenv-septzen.net/en/view/6)

主引导记录（Master boot record，缩写为 MBR ）是什么，后面学到《计算机是如何启动的？》会详细介绍，关注并留意 微信公众号【零K同学】

先简单说一下计算机启动是这样一个过程

- 通电
- 读取 ROM 里面的 BIOS，用来检查硬件
- 硬件检查通过
- BIOS 根据指定的顺序，检查引导设备的第一个扇区（即**主引导记录**），加载在内存地址 0x7C00
- 主引导记录把操作权交给操作系统

所以，主引导记录就是引导"操作系统"进入内存的一段小程序，大小不超过 1 个扇区（ 512 字节）。

0x7C00 这个地址来自 Intel 的第一代个人电脑芯片 8088，以后的 CPU 为了保持兼容，一直使用这个地址。

### 安装NASM工具

后面在实际的代码实践中需要用到 NASM 工具，这里先介绍一下这个工具在 Ubuntu 的安装和简单实用。

- 执行下面命令下载安装

```sh
sudo apt-get install nasm
```

- 通过查看版本查看 nasm 是否安装成功

```
$ nasm -version
NASM version 2.13.02
```

- 简单学一下使用 nasm 的使用

1.创建一个 `test.asm` 文件

```sh
touch test.asm
vim test.asm
```

vim 打开该文件并输入下面代码，vim 的具体用法自己通过网络搜索学习。

```x86asm
section .data
  hello:     db 'Hello world!',10    ; 'Hello world!' plus a linefeed character
  helloLen:  equ $-hello             ; Length of the 'Hello world!' string
                                     ; (I'll explain soon)
 
section .text
  global _start
 
_start:
  mov eax,4            ; The system call for write (sys_write)
  mov ebx,1            ; File descriptor 1 - standard output
  mov ecx,hello        ; Put the offset of hello in ecx
  mov edx,helloLen     ; helloLen is a constant, so we don't need to say
                       ;  mov edx,[helloLen] to get it's actual value
  int 80h              ; Call the kernel
 
  mov eax,1            ; The system call for exit (sys_exit)
  mov ebx,0            ; Exit with return code of 0 (no error)
  int 80h
```

2.编译，这时候会产生 `.o` 文件

```
nasm -f elf64 test.asm
```

3.链接

```
 ld -s test.o -o test
```

4.执行

```
$ ./test
Hello world!
```

### 关于寄存器的简单介绍

因为后面的汇编代码中涉及到很多寄存器，所以这里先简单总结一下

- CS 寄存器 和 IP 寄存器

这一组寄存器非常重要，一般写为：`cs: ip`

CS:IP 两个寄存器指示了 CPU 当前将要读取的指令的地址，其中 **CS 为代码段寄存器**，而 **IP 为指令指针寄存器**(相当于偏移地址）。CPU 执行指令时，通过代码寄存器 CS 和指令指针寄存器 IP 来确定要执行的下一条指令的内存地址。

修改 CS、IP 的指令不同于修改通用的寄存器值的指令，修改通用寄存器的值可以用 mov 指令（`mav ax,123`），mov 指令被称为传送指令。而修改 CS、IP 的指令是 jmp 指令。jmp 指令被称为跳转指令，我们在[上一节](https://mp.weixin.qq.com/s?__biz=MzkwMjIzNjc4NA==&mid=2247484002&idx=1&sn=04c70a83762942802860ff7c30e9a2e3&chksm=c0a9dd7df7de546b6fcc55c2314c781d3cc5d5863e5b8401344fa7331b86a04aab9c29582b5b#rd)也说过了。

- `AX,BX,CX,DX` 寄存器

这四个寄存器也被称为**通用寄存器**.一般**用来存放数据**,一个寄存器可以存放 16bit ,也就是 2bytes. 所以也被称为 16 位寄存器。

这四个寄存器可以被分为两个 8 位寄存器，比如

```
AX = AH + AL， BX = BH+BL, CX = CH + CL,  DX = DH+DL
```

- DS 寄存器和 ES 寄存器

  - DS 数据段寄存器
  - ES 附加段寄存器

它们属于**段寄存器**，不能直接保存数据，只能通过其他的通用寄存器转存数据。它们俩没有明显的区别，但是 DS 是其他指针寄存器的默认段寄存器

- SS：堆栈段寄存器，存放堆栈的底部地址，

- ES: 扩展段寄存器，前程序使用附加数据段的段基址，该段是串操作指令中目的串所在的段；

- FS: 标志段寄存器，80386 起增加的两个辅助段寄存器之一，在这之前只有 es 寄存器；

- SP: 堆栈指针寄存器， SP(stack pointer) 存放栈的偏移地址;

- GS: 全局段寄存器

> `ds, es, fs, gs` 这类寄存器属于 sreg（状态寄存器），CPU 不能直接给它们赋值，只能通过其他寄存器来传入，比如可以使用 ax 寄存器来中转。所以不能写成 `mov ds: 0x7c00`，*0x7c00 是主引导记录起始地址*


### 写一个主引导记录MBR

我们需要先制作一个 img 镜像文件，直接使用 bximage 制作即可。具体步骤参考下图：

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/制作img镜像.4k5q6jyxvs80.webp)


接着可以写汇编代码啦，下面的代码主要实现的功能是在屏幕上打印字符串 “1 ken" 其中背景是黑色，前景为绿色。

```x86asm
; 主引导程序
; --------------------------------------------------

SECTION MBR vstart=0x7c00  ; 在程序编译时，把起始地址编译为 0x7coo
; A处：利用 cs 寄存器的值去初始化其他寄存器
	mov ax, cs  ; cs 代码段寄存器
	mov ds, ax	; ax 是通用寄存器，一般用来存放数据，因为 ds,es,ss,fs 这些段寄存器不能直接保存数据
	mov es, ax	
	mov ss, ax  
	mov fs, ax  
	mov sp, 0x7c00  ; 初始化栈指针


; B处：这部分代码是实现 清屏 ，利用 0x06 号功能，上卷全部窗口，就可以清屏。
; --------------------------------------------------
; INT 0x10    功能号: 0x06    功能描述：上卷窗口
; --------------------------------------------------
; 输入：
; AH 功能号 = 0x06
; AL = 上卷的行数(如果为0，表示全部)
; BH = 上卷行属性
; (CL, CH) = 窗口左上角的 (X, Y) 位置
; (DL, DH) = 窗口右下角的 (X, Y) 位置
; 无返回值:
	mov ax, 0x600
	mov bx, 0x700
	mov cx, 0   ;左上角：（0,0)
	mov dx, 0x184f  ;右下角: (80, 25)
                   ; VGA 文本模式中，一行只能容纳 80 个字符，共 25 行
                   ; 下标从 0 开始，所以 0x18=24, 0x4f=79
	int 0x10	;中断
; --------------------------------------------------
; C处，获取光标位置
	; .get_cursor 获取当前光标位置，在光标处打印字符
	mov ah, 3	; 输入3号子功能是获取光标位置，需要存入 ah 寄存器中，ah 是 ax 的膏8位
	mov bh, 0   ; bh 寄存器存储的是待获取光标的页号

	int 0x10	; 输出：ch = 光标开始行，cl = 光标结束行
				; dh = 光标所在行号，dl = 光标所在列号

; D处：打印字符串
	mov ax, message
	mov bp, ax		;es:bp 为字符串首地址，es 这时候同 cs 一致
	; 光标位置要用到dx寄存器中内容，cs中的光标位置可以忽略
	mov cx, 5		; cx 为串长度，不包括结束符 '\0'
	mov ax, 0x1301	; 13号子功能，显示字符以及属性，需要存取 ah 寄存器
					; al = 01: 写字符方式，显式字符串，光标跟随移动
	mov bx, 0x2		; bh = 0,要显示的页号，此处是第0页
					; bl = 02，字符属性，黑底绿字
		
	int 0x10

; E处
	jmp $		; 程序悬停在这里

  ; 其定义了一个名为 message 的数组，数组元素的类型为 db （字节型）
	message db "1 ken"          
                                  ; db 字节型
                                  ; dw 字类型
                                  ; dd 双字型
                                  ; dq 四字型
                                  ; dt 十字节型 
    times 510-($-$$) db 0 ; 填充文件末尾的魔数 0xaa55 和当前位置之间的空间
                          ; 保证编译后生成的文件大小为 512 字节（硬盘一个扇区的大小）
    db 0x55, 0xaa
```

上述汇编代码中，

- A处的主要功能是初始化，用 cs 寄存器的值去初始化其他寄存器，因为 BIOS 是通过跳转指令 jmp 0: 0x7c00 跳转的，所以这时候 cs 的值为 0。

- B处是清屏操作，因为 BIOS 在工作中，会有一些日志输出，把它们清理掉方便观看我们自己输出的字符串

- C处是打印操作，为了避免打印字符混乱，或者覆盖其他输出，需要获取光标的位置。

- D处是往光标处打印字符
  - `mov ax, 0x1301` 13对应的是 ah 寄存器，这是调用 0x13 号子功能，01 对应的是 al 寄存器，表示写字符的方式。

- 代码中多处用到第 0x10 号中断，其调用方法是把功能号送入 ah 寄存器

> 上述代码更详细介绍可以参考《操作系统真象还原》第 62 页

然后编译 

```bash
nasm -o a.bin mbr.S
```

将编译后的 bin 文件写入扇区。

```bash
book@100ask:~/bochsken$ dd if=~/bochsken/boot/a.bin of=hd60M.img  seek=0 count=1 conv=notrunc

# 这里的 if=[输入]  of=[输出] 
# seek 跳过输出的几个单元开始写，一个单元512个字节
# count 是写的单元数
# notrunc 的意思就是不要截断
```

然后修改 `.disk` 配置文件，指定 `.img` 路径。通过 `vim bochsrc.disk` 插入下列代码：

```
ata0-master: type=disk, path="hd60M.img", mode=flat,cylinders=2,heads=16,spt=63
```

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/修改disk配置文件.2yxgsiyytsm0.webp)

接下来通过 bochs 测试，`bin/bochs -f bochsrc.disk`，如下图所示。如果想退出就在控制台按 `ctrl+C` 然后输入 `quit`

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/第二章结果.65acf1bf3u80.png)

> **好啦。大功告成！！！**


> 《[阮一峰的理解计算机](http://www.ruanyifeng.com/blog/2015/09/0x7c00.html)》学习笔记
> 
> 《操作系统真象还原》读书笔记