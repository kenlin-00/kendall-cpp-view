## 8-1

```c

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