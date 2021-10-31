
- [OC部分](#oc部分)
  - [NSLog 和printf区别](#nslog-和printf区别)

------

## OC部分

### NSLog 和printf区别

NSLog是Foundation框架􏰀供的Objective-C日志输出函数,与标准C中的printf函数类似,并可以格式化输出。

- NSLog传递进去的格式化字符是NSString的对象,而不是char *这种字符串指针
- NSLog输出的内容中会自动包含一些系统信息
- NSLog输出的内容会自动换行
- NSLog声明在NSObjCRuntime.h中

声明：void NSLog(NSString *format, ...);

