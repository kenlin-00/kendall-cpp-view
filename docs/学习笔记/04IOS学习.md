### 显示 hello world

```objc

#import "ViewController.h"

@interface ViewController ()

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    [self.view addSubview:({
        UILabel *label = [[UILabel alloc] init];
        label.text = @"hello world";
        [label sizeToFit];
        label.center = CGPointMake(self.view.frame.size.width / 2, self.view.frame.size.width / 2);
        label;
    })];
}


@end
```

## 声明周期函数，重叠显示

```objc

#import "ViewController.h"

@interface TestView : UIView

@end

@implementation TestView

//创建一个 init 函数重载 init 方法
- (instancetype)init {
    self = [super init];
    if(self) {
        
    }
    return self;
}

//基类 UIView 中的生命周期函数
- (void)willMoveToSuperview:(nullable UIView *)newSuperview; {
    [super willMoveToSuperview:newSuperview];
}
- (void)didMoveToSuperview {
    [super didMoveToSuperview];
}
- (void)willMoveToWindow:(nullable UIWindow *)newWindow {
    [super willMoveToWindow:newWindow];
}
- (void)didMoveToWindow {
    [super didMoveToWindow];
}

@end


@interface ViewController ()

@end

@implementation ViewController

- (void)viewDidLoad {
    
    //设置背景为白色
    self.view.backgroundColor = [UIColor whiteColor];
    
//    [super viewDidLoad];
//    UIView *view = [[UIView alloc] init];
//    view.backgroundColor = [UIColor redColor];  // 设置背景为红色
//    view.frame = CGRectMake(100, 100, 100, 100);  //宽度和高度，距离屏幕的左端和右端的距离
//    [self.view addSubview:view];
    
    //重叠,基于栈实现，最上层是最后添加的内容
    [super viewDidLoad];
    TestView *view2 = [[TestView alloc] init];
    view2.backgroundColor = [UIColor greenColor];  // 设置背景为绿色
    view2.frame = CGRectMake(150, 150, 100, 100);  //宽度和高度，距离屏幕的左端和右端的距离
    [self.view addSubview:view2];
}


@end
```

## UIViewController

```cpp

#import "ViewController.h"

@interface TestView : UIView

@end

@implementation TestView

//创建一个 init 函数重载 init 方法
- (instancetype)init {
    self = [super init];
    if(self) {
        
    }
    return self;
}

//基类 UIView 中的生命周期函数
- (void)willMoveToSuperview:(nullable UIView *)newSuperview; {
    [super willMoveToSuperview:newSuperview];
}
- (void)didMoveToSuperview {
    [super didMoveToSuperview];
}
- (void)willMoveToWindow:(nullable UIWindow *)newWindow {
    [super willMoveToWindow:newWindow];
}
- (void)didMoveToWindow {
    [super didMoveToWindow];
}

@end



@interface ViewController ()

@end

@implementation ViewController


//重载 init 方法
- (instancetype)init {
    self = [super init];
    if(self) {
        
    }
    return self;
}

// 重载声明周期函数
- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
}
- (void)viewDidAppear:(BOOL)animated  {
    [super viewDidAppear:animated];
}
- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
}
- (void)viewDidDisappear:(BOOL)animated {
    [super viewDidDisappear:animated];
}

- (void)viewDidLoad {
    
    //设置背景为白色
    self.view.backgroundColor = [UIColor whiteColor];
    
//    [super viewDidLoad];
//    UIView *view = [[UIView alloc] init];
//    view.backgroundColor = [UIColor redColor];  // 设置背景为红色
//    view.frame = CGRectMake(100, 100, 100, 100);  //宽度和高度，距离屏幕的左端和右端的距离
//    [self.view addSubview:view];
    
    //重叠,基于栈实现，最上层是最后添加的内容
    [super viewDidLoad];
    TestView *view2 = [[TestView alloc] init];
    view2.backgroundColor = [UIColor greenColor];  // 设置背景为绿色
    view2.frame = CGRectMake(150, 150, 100, 100);  //宽度和高度，距离屏幕的左端和右端的距离
    [self.view addSubview:view2];
}


@end
```

## 搭建 APP



