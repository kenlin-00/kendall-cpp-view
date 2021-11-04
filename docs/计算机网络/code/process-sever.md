- process-sever

```c
#include <stdio.h>
#include <sys/socket.h>
#include <unistd.h>
#include <signal.h>
#include <sys/wait.h>
#include "wrap.h"

void free_process(int sig)
{
	pid_t pid;
	while(1)
	{
		pid = waitpid(-1,NULL,WNOHANG);
		if(pid <=0 )//小于0 子进程全部退出了 =0没有进程没有退出
		{
			break;
		}
		else
		{
			printf("child pid =%d\n",pid);
		}
	}
}

int main(int argc, char *argv[])
{
	sigset_t set;
	sigemptyset(&set);
	sigaddset(&set,SIGCHLD);
	sigprocmask(SIG_BLOCK,&set,NULL);
	//创建套接字，绑定
	int lfd = tcp4bind(8008,NULL);
	// 监听
	Listen(lfd,128);
	//提取
	//回射（客户端发什么就回什么）
	struct sockaddr_in cliaddr;
	socklen_t len = sizeof(cliaddr);
	while (1)
	{
		char ip[16] = "";
		//提取连接 (已连接套接字)
		int cfd = Accept(lfd,(struct sockaddr *)&cliaddr,&len);
		printf("new client ip=%s port=%d\n",inet_ntop(AF_INET,&cliaddr.sin_addr.s_addr,ip,16),
				ntohs(cliaddr.sin_port));
		//fork 创建子进程
		pid_t pid;
		pid = fork();
		if(pid < 0)
		{
			perror("");
			exit(0);
		}
		else if(pid == 0)  //子进程
		{
			//关闭 监听套接字 lfd
			close(lfd);
			//服务客户端
			while(1)
			{
				//读取客户端的数据
				char buf[1024] = "";
				int n = read(cfd,buf,sizeof(buf));
				if(n < 0)  //读取失败
				{
					perror("");
					close(cfd);
					exit(0);
				}
				else if(n == 0) //客户端关闭
				{
					printf("client close\n");
					close(cfd);
					exit(0);
				}
				else  //读取成功
				{
					printf("%s\n",buf);
					//写回给客户端
					write(cfd,buf,n);
				}
			}
		}
		else //父进程
		{
			close(cfd);
			//回收
			//注册信号回调
			struct sigaction act;
			act.sa_flags =0;
			act.sa_handler = free_process;
			sigemptyset(&act.sa_mask);
			sigaction(SIGCHLD,&act,NULL);
			sigprocmask(SIG_UNBLOCK,&set,NULL);
		}
	}
	
	return 0;
}
```