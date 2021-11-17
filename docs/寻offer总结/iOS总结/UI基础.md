

-----

## 图片的两种加载方式
- imageNamed:
  - a. 就算指向它的指针被销毁,该资源也不会被从内存中干掉
  - b. 放到 Assets.xcassets 的图片,默认就有缓存
  - c. 图片经常被使用
 
- imageWithContentsOfFile:
  - a. 指向它的指针被销毁,该资源会被从内存中干掉
  - b. 放到项目中的图片就不由缓存
  - c. 不经常用,大批量的图片

