- **client-tcp**
- [server-tcp](/计算机网络/code/server.md)


```c
//client.c
#include <stdio.h>
#include <stdlib.h>

#include <string.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <unistd.h>
int main(int argc, char *argv[])
{
	//创建套接字
	int lfd = socket(AF_INET,SOCK_STREAM,0);
	//绑定
	struct sockaddr_in addr;
	addr.sin_family = AF_INET;
	addr.sin_port = htons(8000);
	//	addr.sin_addr.s_addr = INADDR_ANY;//绑定的是通配地址
	//服务器的IP
	inet_pton(AF_INET,"192.168.100.11",&addr.sin_addr.s_addr);
	int ret = bind(lfd,(struct sockaddr *)&addr,sizeof(addr));
	if(ret < 0)
	{
		perror("");
		exit(0);

	}
	//监听
	listen(lfd,128);
	//提取
	struct sockaddr_in cliaddr;
	socklen_t len = sizeof(cliaddr);
	int cfd = accept(lfd,(struct sockaddr *)&cliaddr,&len);
	char ip[16]="";
	printf("new client ip=%s port=%d\n",inet_ntop(AF_INET,&cliaddr.sin_addr.s_addr,
				ip,16),	ntohs(cliaddr.sin_port));
	//读写
	char buf[1024]="";
	while(1)
	{
		bzero(buf,sizeof(buf));
	//	int n = read(STDIN_FILENO,buf,sizeof(buf));
	//	write(cfd,buf,n);
		int n =0;
		n = read(cfd,buf,sizeof(buf));
		if(n ==0 )//如果read返回等于0,代表对方关闭 
		{
			printf("client close\n");
			break;
		}
		printf("%s\n",buf);
	
	}
	//关闭
	close(lfd);
	close(cfd);
	return 0;
}
```