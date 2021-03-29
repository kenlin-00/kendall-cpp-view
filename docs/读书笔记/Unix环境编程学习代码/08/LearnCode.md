## 8-1

```c
#include "apue.h"
#include <stdio.h>
int globvar = 6;
char buf[] = "a write to stdout\n";

int main() {
    int var;
    pid_t pid;

    var = 88;
     // 减1 是为了避免将终止null字节写出
    if(write(STDOUT_FILENO,buf,sizeof(buf) - 1) != sizeof(buf) - 1) { 
        err_sys("write error!!!! \n");
    }
    printf("...before fork...\n"); //还没开始创建子进程

    if((pid = fork()) < 0) { //创建失败
        err_sys("fork error");
    }else if(pid == 0) { //子进程
        ++globvar;
        ++var;
    }else { //父进程
        sleep(2);
    }
    printf("pid = %ld,glob = %d,var = %d\n",(long)getpid(),globvar,var);
    exit(0);
}
```

运行

```
$ ./a.out 
a write to stdout
before fork
pid = 48375,glob = 7,var = 89  #子进程
pid = 48374,glob = 6,var = 88  #父进程

$ ./a.out > temp.out
$ cat temp.out 
a write to stdout
before fork
pid = 48427,glob = 7,var = 89
before fork
pid = 48426,glob = 6,var = 88
```