log4cpp安装
```
cd log4cpp/
./configure
make
make check 
sudo make install
```
这里就已经安装成功了

默认lib库路径是：/usr/local/lib/

默认头文件的位置：/usr/local/include/log4cpp

编译使用log4cpp库的cpp文件时，要加上库文件，才能顺利的编译通过：
```
g++ log4cpptest.cpp -llog4cpp -lpthread
```

在运行时，如果提示缺少log4cpp库文件，表示找不到log4cpp的动态库，需要进行以下设置以管理员身份登录终端，然后执行以下操作：

sudo vim /etc/ld.so.conf

添加
`/usr/`

更新文件使其生效
sudo ldconfig
