

------

## IOS 多线程

> https://www.jianshu.com/p/2d57c72016c6

IOS 是使用 GCD 实现多线程的，GCD 类似一个线程池，在这个线程池的基础上执行并发任务。

### 使用 GCD 的好处

- GCD 可用于多核的并行运算；
- GCD 会自动管理线程的生命周期（创建线程、调度任务、销毁线程）
- 程序员只需要告诉 GCD 想要执行什么任务，不需要编写任何线程管理代码。

###  GCD 任务和队列

在 GCD 中是放在 block 中的。执行任务有两种方式：『同步执行』 和 『异步执行』。

两者的主要区别是：是否等待队列的任务执行结束，以及是否具备开启新线程的能力。

#### 同步执行（sync）

- 同步添加任务到指定的队列中，在添加的任务执行结束之前，会一直等待，直到队列里面的任务完成之后再继续执行。
- 只能在当前线程中执行任务，不具备开启新线程的能力。

#### 异步执行（async）

- 异步添加任务到指定的队列中，它不会做任何等待，可以继续执行任务。
- 可以在新的线程中执行任务，具备开启新线程的能力。


在 GCD 中有两种队列：『串行队列』 和 『并发队列』。两者都符合 FIFO（先进先出）的原则。两者的主要区别是：执行顺序不同，以及开启线程数不同。

#### 串行队列（Serial Dispatch Queue）

- 每次只有一个任务被执行。让任务一个接着一个地执行。（只开启一个线程，一个任务执行完毕后，再执行下一个任务）

#### 并发队列（Concurrent Dispatch Queue）：

- 可以让多个任务并发（同时）执行。（可以开启多个线程，并且同时执行任务）

> 注意：并发队列 的并发功能只有在异步（dispatch_async）方法下才有效。

### GCD 的使用步骤

- 创建一个队列（串行队列或并发队列）；
    - 可以使用 `dispatch_queue_create` 方法来创建队列。
    - 第一个参数表示队列的唯一标识符，用于 DEBUG
    - 第二个参数用来识别是串行队列还是并发队列

- 将任务追加到任务的等待队列中，然后系统就会根据任务类型执行任务（同步执行或异步执行）。

```cpp
// 串行队列的创建方法
dispatch_queue_t queue = dispatch_queue_create("net.bujige.testQueue", DISPATCH_QUEUE_SERIAL);
// 并发队列的创建方法
dispatch_queue_t queue = dispatch_queue_create("net.bujige.testQueue", DISPATCH_QUEUE_CONCURRENT);
```

### 任务的创建方法

GCD 提供了同步执行任务的创建方法 `dispatch_sync` 和异步执行任务创建方法 `dispatch_async。`

```cpp
// 同步执行任务创建方法
dispatch_sync(queue, ^{
    // 这里放同步执行任务代码
});
// 异步执行任务创建方法
dispatch_async(queue, ^{
    // 这里放异步执行任务代码
});
```

### GCD 线程间的通信

在 iOS 开发过程中，我们一般在主线程里边进行 UI 刷新，例如：点击、滚动、拖拽等事件。我们通常把一些耗时的操作放在其他线程，比如说图片下载、文件上传等耗时操作。而当我们有时候在其他线程完成了耗时操作时，需要回到主线程，那么就用到了线程之间的通讯。

### GCD 的其他方法

#### GCD 栅栏方法：dispatch_barrier_async

我们有时需要异步执行两组操作，而且第一组操作执行完之后，才能开始执行第二组操作。这样我们就需要一个相当于 栅栏 一样的一个方法将两组异步执行的操作组给分割起来，当然这里的操作组里可以包含一个或多个任务。这就需要用到dispatch_barrier_async 方法在两个操作组间形成栅栏。

`dispatch_barrier_async` 方法会等待前边追加到并发队列中的任务全部执行完毕之后，再将指定的任务追加到该异步队列中。然后在 `dispatch_barrier_async` 方法追加的任务执行完毕之后，异步队列才恢复为一般动作，接着追加任务到该异步队列并开始执行。具体如下图所示：

![](https://upload-images.jianshu.io/upload_images/1877784-4d6d77fafd3ad007.png?imageMogr2/auto-orient/strip|imageView2/2/w/1200/format/webp)

#### GCD 信号量：dispatch_semaphore

GCD 中的信号量是指 Dispatch Semaphore，是持有计数的信号。类似于过高速路收费站的栏杆。可以通过时，打开栏杆，不可以通过时，关闭栏杆。在 Dispatch Semaphore 中，使用计数来完成这个功能，计数小于 0 时等待，不可通过。计数为 0 或大于 0 时，计数减 1 且不等待，可通过。

Dispatch Semaphore 提供了三个方法：

- `dispatch_semaphore_create：创建一个` Semaphore 并初始化信号的总量
- `dispatch_semaphore_signal`：发送一个信号，让信号总量加 1
- `dispatch_semaphore_wait`：可以使总信号量减 1，信号总量小于 0 时就会一直等待（阻塞所在线程），否则就可以正常执行。

> 注意：信号量的使用前提是：想清楚你需要处理哪个线程等待（阻塞），又要哪个线程继续执行，然后使用信号量。

Dispatch Semaphore 在实际开发中主要用于：

保持线程同步，将异步执行任务转换为同步执行任务
保证线程安全，为线程加锁

####  Dispatch Semaphore 线程同步

我们在开发中，会遇到这样的需求：异步执行耗时任务，并使用异步执行的结果进行一些额外的操作。换句话说，相当于，将将异步执行任务转换为同步执行任务。比如说：AFNetworking 中 AFURLSessionManager.m 里面的 tasksForKeyPath: 方法。通过引入信号量的方式，等待异步执行任务结果，获取到 tasks，然后再返回该 tasks。

我们来利用 Dispatch Semaphore 实现线程同步，将异步执行任务转换为同步执行任务。

```cpp
/**
 * semaphore 线程同步
 */
- (void)semaphoreSync {
    
    NSLog(@"currentThread---%@",[NSThread currentThread]);  // 打印当前线程
    NSLog(@"semaphore---begin");
    
    dispatch_queue_t queue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
    dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
    
    __block int number = 0;
    dispatch_async(queue, ^{
        // 追加任务 1
        [NSThread sleepForTimeInterval:2];              // 模拟耗时操作
        NSLog(@"1---%@",[NSThread currentThread]);      // 打印当前线程
        
        number = 100;
        
        dispatch_semaphore_signal(semaphore);
    });
    
    dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
    NSLog(@"semaphore---end,number = %zd",number);
}
```

- semaphore---end 是在执行完 number = 100; 之后才打印的。而且输出结果 number 为 100。这是因为 异步执行 不会做任何等待，可以继续执行任务。

执行顺如下：

- semaphore 初始创建时计数为 0。

- 异步执行 将 任务 1 追加到队列之后，不做等待，接着执行 dispatch_semaphore_wait 方法，semaphore 减 1，此时 semaphore == -1，当前线程进入等待状态。
- 然后，异步任务 1 开始执行。任务 1 执行到 dispatch_semaphore_signal 之后，总信号量加 1，此时 semaphore == 0，正在被阻塞的线程（主线程）恢复继续执行。
- 最后打印 semaphore---end,number = 100。

这样就实现了线程同步，将异步执行任务转换为同步执行任务。

#### Dispatch Semaphore 线程安全和线程同步（为线程加锁）

**线程安全**：如果你的代码所在的进程中有多个线程在同时运行，而这些线程可能会同时运行这段代码。如果每次运行结果和单线程运行的结果是一样的，而且其他的变量的值也和预期的是一样的，就是线程安全的。

若每个线程中对全局变量、静态变量只有读操作，而无写操作，一般来说，这个全局变量是线程安全的；若有多个线程同时执行写操作（更改变量），一般都需要考虑线程同步，否则的话就可能影响线程安全。

**线程同步**：可理解为线程 A 和 线程 B 一块配合，A 执行到一定程度时要依靠线程 B 的某个结果，于是停下来，示意 B 运行；B 依言执行，再将结果给 A；A 再继续操作。

## 内存管理

### weak的实现原理,SideTable 的结构是什么样的

`weak`：其实是一个hash表结构，其中的key是所指对象的地址，value是weak的指针数组，weak 表示的是弱引用，不会对对象引用计数 +1，当引用的对象被释放的时候，其值被自动设置为nil，一般用于解决循环引用的。

**weak 的实现原理**

1、初始化时：runtime 会调用 objc_initWeak 函数，初始化一个新的weak指针指向对象的地址。

2、添加引用时：`objc_initWeak` 函数会调用 `objc_storeWeak()` 函数， `objc_storeWeak()` 的作用是更新指针指向，创建对应的弱引用表。

3、释放时，调用 clearDeallocating 函数。clearDeallocating 函数首先根据对象地址获取所有 weak 指针地址的数组，然后遍历这个数组把其中的数据设为nil，最后把这个 entry 从 weak 表中删除，最后清理对象的记录。