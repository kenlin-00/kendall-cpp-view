- [client-tcp](/计算机网络/code/client.md)
- **server-tcp**

```c
//server.c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <unistd.h>

int main() 
{
	//1 创建套接字（监听套接字）
	int lfd = socket(AF_INET,SOCK_STREAM,0);
	
	//2 绑定
	// int bind(int sockfd, const struct sockaddr *addr, addrlen); 成功返回0
	struct sockaddr_in addr;
	addr.sin_family = AF_INET;
	addr.sin_port = htons(8000);
	inet_pton(AF_INET,"192.168.100.11",&addr.sin_addr.s_addr); //ip转成network形式
	int ret = bind(lfd,(struct sockaddr *)&addr,sizeof(addr)); //服务端需要绑定一个ip
	if(ret < 0)
	{
		perror("bind error");
		exit(0);
	}
	//3 监听
	// int listen(int sockfd, int backlog);
	listen(lfd,128);

	//4 提取
	// int accept(int sockfd, struct sockaddr *addr, socklen_t *addrlen); 返回文件描述符
	struct sockaddr_in cliaddr;
	socklen_t len = sizeof(cliaddr);

	//(已连接套接字)
	int cfd = accept(lfd,(struct sockaddr *)&cliaddr,&len);
	char buf_ip[16] = "";
	printf("new client ip=%s port=%d\n",inet_ntop(AF_INET,&cliaddr.sin_addr.s_addr,buf_ip,16),
			ntohs(cliaddr.sin_port));
	
	// 5 读写
	char buf[1024] = "";
	while (1)
	{
		bzero(buf,sizeof(buf));  //初始化
		int n = 0;
		//获取客户端的数据
		n = read(cfd,buf,sizeof(buf));
		if(n == 0) //如果返回0,说明对方关闭了
		{
			printf("client close,ip = %s,port = %d\n",inet_ntop(AF_INET,&cliaddr.sin_addr.s_addr,buf_ip,16),
				ntohs(cliaddr.sin_port));
			break;
		}
		printf("%s\n",buf);  //打印读取到的数据
	}
	//关闭
	close(lfd);
	close(cfd);
	

	return 0;
}
```