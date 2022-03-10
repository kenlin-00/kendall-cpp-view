> 上一篇文章中出现了很大的笔误，将指令译码器写成指令寄存器了，为了不给读者造成误导，决定重新发一篇，并补上 MBR 操作磁盘部分。       
> 另外，为了保证笔记的质量，之后的写作风格将会调整，尽可能将每一章的知识点串连起来，并查阅更多的书籍进行深入补充，所以之后的每一篇推文中涵盖的内容将会更广泛且有深度，更新频率也会有所调整。

----

本文分成四部分

- 第一部分，数组的起始下表为什么是 0 而不是 1
- 用两张图来介绍 CPU 的工作原理
- 实现 MBR 操作显示器
- MBR 操作磁盘

### 为什么数组的起始下标是 0 而不是 1 

在编译器中，占据第一位的数据的地址就是其实地址，然后它后面的其他数据一次排开就行。就比如第 n 个位置的地址是 (n-1) + 数据(n-1)的内存空间 ,由于程序的第 1 个数据的地址（偏移量）是 0 ，所以数组中第 1 个元素的下标也是 0.

> 所以每个变量的地址就是前一个变量的地址 + 前一个变量的内存空间大小

回到开始的问题，为什么数组的起始下标是0而不是 1 ？？

- 数组（Array）一种线性表数据结构，用一组连续的内存空间，存储一组相同类型的数据

连续的内存空间和相同的数据结构，使其可以“随机访问”，弊端也很明显，某些操作十分低效。在数组中删除或插入数据时，要做大量的数据搬移工作。

从数组中存储的数据模型来看，下标最精确的意思是“偏移量”，`a[0]` 的偏移量是 0，即为首地址。`a[i]` 的偏移量是 i，寻址公式就是 `a[i]_address = base_address + i*data_type_size`。

如果下标从 1 开始，那对应的寻址公式 `a[i]_address = base_address + （i-1）*data_type_size`。对 CPU 来说，每次随机访问，就多了一次运算，多发一条指令。

简单来说，就是假如数组的首地址是 base_address，如果索引从 1 开始计，元素 a[1] 是第一个元素，它的地址就是 base_address，当我们要获取第 8 个元素 a[8] 的数据时，计算机就要找到元素 a[8] 所在的地址，计算公式就是`base_address+(8-1)*type_size` 。

如果索引从 0 开始计，元素 a[0] 是第一个元素，它的地址就是 base_address，当我们要获取第 8 个元素 a[7] 的数据时，计算机就要找到元素 a[7] 所在的地址，计算公式就是 `base_address+7*type_size` 。

我们发现，索引从 0 开始，寻址时会**少做一次减法**，这就是一个优化，别小看这种优化，计算的数量一旦上去，比如上亿次计算，那积累起来的优势是相当可观的。

其实，各种算法的优化，本质都是一样的，让计算机做更少的计算，只有做的事情少了，效率才会提高。


### CPU的工作原理

我们应该都知道，**CPU 的唯一任务就是执行指令**，也就是一串串 010101.....。CPU从逻辑上可以划分成3个模块，分别是**控制单元**、**运算单元**和**存储单元**，这三部分由CPU内部总线连接起来。如下所示：

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/CPU的组成.6n3qmc9vhq00.png)


- 控制单元是整个 CPU 的指挥控制中心，由程序计数器 PC（Program Counter）, 指令寄存器 IR (Instruction Register)、指令译码器 ID (Instruction Decoder)和 操作控制器 OC (Operation Controller)等，对协调整个电脑有序工作极为重要。它根据用户预先编好的程序，依次从存储器中取出各条指令，放在指令寄存器 IR 中，通过指令译码（分析）确定应该进行什么操作，然后通过操作控制器 OC，按确定的时序，向相应的部件发出微操作控制信号。

- 运算单元：是运算器的核心。可以执行算术运算(包括加减乘数等基本运算及其附加运算)和逻辑运算(包括移位、逻辑测试或两个值比较)。，运算器接受控制单元的命令而进行动作，

- 存储单元：包括 CPU 片内缓存和寄存器组，是 CPU 中暂时存放数据的地方，里面保存着那些等待处理的数据，或已经处理过的数据。CPU 访问寄存器所用的时间要比访问内存的时间短。采用寄存器，可以减少 CPU 访问内存的次数，从而提高了 CPU 的工作速度。但因为受到芯片面积和集成度所限，寄存器组的容量不可能很大。

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/CPU工作原理.2s7fwqxli5s0.png)

现在结合上图简单说下 CPU 的工作过程

控制单元要取出下一条运行的指令，这个指令在程序计数器 PC 中，在 x86CPU 上，程序计数器就是 cs: ip（在之前[这篇文章](https://mp.weixin.qq.com/s?__biz=MzkwMjIzNjc4NA==&mid=2247484002&idx=1&sn=04c70a83762942802860ff7c30e9a2e3&chksm=c0a9dd7df7de546b6fcc55c2314c781d3cc5d5863e5b8401344fa7331b86a04aab9c29582b5b&token=1518323587&lang=zh_CN#rd)中说过其实就是 cs 寄存器和 ip 寄存器），所以读取 ip 寄存器后，将这个地址送到 【地址总线】。

这个时候 CPU 就可以根据这个地址得到了【指令】，然后将这个指令存入指令寄存器 IR 中。

接着由控制单元当中的指令译码器 ID 来分析这个指令是什么操作，然后确定操作码，然后 ID 还要去检查操作数的类型，如果操作数在内存中就直接将操作数放到自己的存储单元中，如果在寄存器中就将这个操作数和操作码一并传递给【运算单元】，由运算单元执行指令。

接着控制单元又取下一条指令，就这样循环下去一直到 CPU 断电。

> 上面讲了很多枯燥的理论，理论的分析先告一段落，还是写写代码跑跑比较有激情点。

### 让 MBR 直接操作显卡

```
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
	mov ax, 0xb800	;文本模式中，其内存的起始地址是 0xb800
	mov gs, ax  	; 往 gs 寄存器中存入段基地址


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
	int 10h	;中断
; --------------------------------------------------
	; A处：输出背景颜色为绿色，前景颜色为红色，并且设置跳动的字符串“1 Ken"
   mov byte [gs:0x00],'1'
   mov byte [gs:0x01],0xA4     ; A表示绿色背景闪烁，4表示前景色为红色

   mov byte [gs:0x02],' '
   mov byte [gs:0x03],0xA4

   mov byte [gs:0x04],'K'
   mov byte [gs:0x05],0xA4   

   mov byte [gs:0x06],'e'
   mov byte [gs:0x07],0xA4

   mov byte [gs:0x08],'n'
   mov byte [gs:0x09],0xA4

  ; 其定义了一个名为 message 的数组，数组元素的类型为 db （字节型）
	message db "1 ken"          
                                  ; db 字节型
                                  ; dw 字类型
                                  ; dd 双字型
                                  ; dq 四字型
                                  ; dt 十字节型 
    times 510-($-$$) db 0 ; 填充文件末尾的魔数 0xaa55 和当前位置之间的空间
                          ; 保证编译后生成的文件大小为 512 字节（硬盘一个扇区的大小）
    db 0x55, 0xa
```

在上面代码的 A 处，`mov byte [gs:0x00],'1'` 这句代码的意思是 gs 为数据段基址，以 0 为偏移地址的内存中写入字符 1。这里的 byte 关键字是用来指定操作数的占用空间。

现在开始编译查看效果

```bash
$ nasm mbr.S -o b.bin
$ dd if=b.bin of=../hd60M.img bs=512 count=1 conv=notrunc
1+0 records in
1+0 records out
512 bytes copied, 0.000286874 s, 1.8 MB/s
```

然后启动 boch 执行 c 命令，在屏幕上出现 绿色和红色 跳动的字符。

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/显示闪烁.115y0updrnn4.png)

> 还有 bochs 调试部分没有总结出来，我觉得这部分的命令需要多练习才会记得住，全部列出来感觉用处不大，感兴趣的朋友可以参考原书《操作系统真象还原》115-122 页。

------

### MBR使用磁盘

为了能让 MBR 使用磁盘。我们对之前的 mbr.S 进行改造，当然还是要受限于 512 字节大小的限制，因为只有 512 字节的空间，没办法加载各种内核环境并运行，所以需要借助另一个程序来完成这部分工作，就是加载器，loader。简单地说就是把硬盘中的 loader 加载到内存，然后将加载内核环境的这些任务交给 loader。

MBR 在第 0 扇区，第 1 扇区是空闲的，加载的 loader 在第 2 扇区，其中 loader 要定义一些数据结构（如 GDT 全局描述表），本实验中参考原书的方式，将 loader 加载存放数据的地址设置为 0x900。


首先我们需要在原来代码文件夹下新建一个 include 文件夹，放 boot.inc 文件

```
book@100ask:~/bochsken/boot/include$ vim boot.inc

; 添加如下代码
;-------------	 loader和kernel   ----------
LOADER_BASE_ADDR equ 0x900 
LOADER_START_SECTOR equ 0x2
```

然后开始写代码，更详细的介绍看代码注释和原书第 133-135页。

- **mbr.S**

```
; 主引导程序
; --------------------------------------------------
; 下面这一行代码是 nasm 编译器中的预处理指令，
; 目的是让编译器在编译之间把 boot.inc 文件包含进来
%include "boot.inc"

SECTION MBR vstart=0x7c00         
   mov ax,cs      
   mov ds,ax
   mov es,ax
   mov ss,ax
   mov fs,ax
   mov sp,0x7c00
   mov ax,0xb800
   mov gs,ax

; 清屏
   mov     ax, 0600h
   mov     bx, 0700h
   mov     cx, 0                   ; 左上角: (0, 0)
   mov     dx, 184fh		   ; 右下角: (80,25),
				   ; 因为VGA文本模式中，一行只能容纳80个字符,共25行。
				   ; 下标从0开始，所以0x18=24,0x4f=79
   int     10h                     ; int 10h

   ; 输出字符串:MBR
   mov byte [gs:0x00],'1'
   mov byte [gs:0x01],0xA4

   mov byte [gs:0x02],' '
   mov byte [gs:0x03],0xA4

   mov byte [gs:0x04],'K'
   mov byte [gs:0x05],0xA4	   ;A表示绿色背景闪烁，4表示前景色为红色

   mov byte [gs:0x06],'e'
   mov byte [gs:0x07],0xA4

   mov byte [gs:0x08],'n'
   mov byte [gs:0x09],0xA4
	 
   mov eax,LOADER_START_SECTOR	 ; 起始扇区lba地址，它等于 0x2，也就是前面说的吧 loader 放到第 2 扇区
   ;数据从硬盘中读进来后存放的位置，由寄存器 bx 指定
   mov bx,LOADER_BASE_ADDR       ; 写入的地址，MBR 要把 loader 从硬盘中读入后放到这里，也就是 0x900
   mov cx,1			 ; 待读入的扇区数，这个由文件大小来定读几个扇区
   call rd_disk_m_16		 ; 以下读取程序的起始部分（一个扇区）
  
   jmp LOADER_BASE_ADDR
       
;-----------------------------------------------------------------
;功能:读取硬盘n个扇区
; 因为汇编可以直接操作寄存器，所以在汇编中定义函数传递参数可以用 【寄存器】,也可以用【栈】
rd_disk_m_16:	      ; 在 16 位模式下读硬盘
;-----------------------------------------------------------------
				       ; eax=LBA扇区号
				       ; ebx=将数据写入的内存地址
				       ; ecx=读入的扇区数
      mov esi,eax	  ;把 eax 中的值备份到 esi 中，因为 al 在 out 指令中会被用到，这会影响到 eax 的低 8 位
      mov di,cx		  ;备份cx，备份数据的扇区到 di 寄存器。di 寄存器是 16 位。
;读写硬盘:
;第1步：设置要读取的扇区数
      mov dx,0x1f2
      mov al,cl
      out dx,al            ;读取的扇区数

      mov eax,esi	   ;恢复ax

;第2步：将LBA地址存入0x1f3 ~ 0x1f6

      ;LBA地址7~0位写入端口0x1f3
      mov dx,0x1f3                       
      out dx,al                          

      ;LBA地址15~8位写入端口0x1f4
      mov cl,8
      shr eax,cl
      mov dx,0x1f4
      out dx,al

      ;LBA地址23~16位写入端口0x1f5
      shr eax,cl
      mov dx,0x1f5
      out dx,al

      shr eax,cl
      and al,0x0f	   ;lba第24~27位
      or al,0xe0	   ; 设置7～4位为1110,表示lba模式
      mov dx,0x1f6
      out dx,al

;第3步：向0x1f7端口写入读命令，0x20 
      mov dx,0x1f7
      mov al,0x20                        
      out dx,al

;第4步：检测硬盘状态
  .not_ready:
      ;同一端口，写时表示写入命令字，读时表示读入硬盘状态
      nop
      in al,dx
      and al,0x88	   ;第4位为1表示硬盘控制器已准备好数据传输，第7位为1表示硬盘忙
      cmp al,0x08
      jnz .not_ready	   ;若未准备好，继续等。

;第5步：从0x1f0端口读数据
      mov ax, di
      mov dx, 256
      mul dx
      mov cx, ax	   ; di为要读取的扇区数，一个扇区有512字节，每次读入一个字，
			   ; 共需di*512/2次，所以di*256
      mov dx, 0x1f0
  .go_on_read:
      in ax,dx
      mov [bx],ax
      add bx,2		  
      loop .go_on_read
      ret

   times 510-($-$$) db 0
   db 0x55,0xaa

```

- **loader.S**

```
%include "boot.inc"
section loader vstart=LOADER_BASE_ADDR

; 输出背景色绿色，前景色红色，并且跳动的字符串"1 MBR"
mov byte [gs:0x00],'2'
mov byte [gs:0x01],0xA4     ; A表示绿色背景闪烁，4表示前景色为红色

mov byte [gs:0x02],' '
mov byte [gs:0x03],0xA4

mov byte [gs:0x04],'L'
mov byte [gs:0x05],0xA4   

mov byte [gs:0x06],'O'
mov byte [gs:0x07],0xA4

mov byte [gs:0x08],'A'
mov byte [gs:0x09],0xA4

mov byte [gs:0x0a],'D'
mov byte [gs:0x0b],0xA4

mov byte [gs:0x0c],'E'
mov byte [gs:0x0d],0xA4

mov byte [gs:0x0e],'R'
mov byte [gs:0x0f],0xA4

jmp $		       ; 通过死循环使程序悬停在此
```

然后编译，需要编译两个 `.S` 文件

```
$ nasm -I include/ mbr.S -o mbr.bin
$ dd if=mbr.bin if=../hd60M.img bs=512 count=1 seek=0 conv=notrunc

$ nasm -I include/ loader.S -o loader.bin
$ dd if=./loader.bin of=../hd60M.img bs=512 count=1 seek=2 conv=notrunc
```

编译后所有的文件如下

```
book@100ask:~/bochsken/boot$ tree
.
├── include
│   └── boot.inc
├── loader.bin
├── loader.S
├── mbr.bin
└── mbr.S
```

启动 bochs 查看结果


![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/读取磁盘结果.6yguv6spfds0.png)


> 学习这些内容对汇编的功底要求比较高，推荐想全面学习汇编的同学可以去看王爽的《汇编语言》那本书，之后计划在公众号中也会出一篇关于这本书的读书笔记。

**关注公众号《零K同学》**

![](https://cdn.jsdelivr.net/gh/kendall-cpp/blogPic@main/blog-img-01/公众号.56g0fjb12ds0.jpg)