### 部署环境
下载SDL：https://www.libsdl.org/download-2.0.php

用Qt建立一个纯C的工程，将SDL动态库和头文件拷问到工程目录。

- 编写配置文件

  ```properties
  TEMPLATE = app
  CONFIG += console
  CONFIG -= app_bundle
  CONFIG -= qt
  
  SOURCES += main.c
  
  #修改配置文件的路径
  win32 {
      INCLUDEPATH += $$PWD/SDL2-2.0.10/include
      LIBS += $$PWD/SDL2-2.0.10/lib/x86/SDL2.lib
  }
  ```

- 编写main.c文件

  ```c
  
  ```

  然后构建项目

  ![image-20210120104636063](D:\cppSumWork\kendall-cpp\docs\video学习笔记\音视频学习\img\image-20210120104636063.png)

  把SDL2.dll 拷贝到构建项目目录中去

  运行

- 