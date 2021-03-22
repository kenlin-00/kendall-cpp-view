### hello_server
```c
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>

//接电话套接字
//server端，受理连接请求


void error_handling(char *message);

int main(int argc,char* argv[]) {
	//唯一标识符
	int serv_sock;
	int clnt_sock;

	//struct sockaddr和struct sockaddr_in这两个结构体用来处理网络通信的地址
	/*
	struct sockaddr_in {  
	     short int sin_family; // 地址族  
	     unsigned short int sin_port; // 端口号
	     struct in_addr sin_addr; // 32位 IP 地址
	     unsigned char sin_zero[8]; // Same size as struct sockaddr  不使用
	}; 
	*/
	struct sockaddr_in serv_addr;  //服务端的地址
    struct sockaddr_in clnt_addr;  //客户端的地址
    socklen_t clnt_addr_size; // socklen_t 其实就是unsigned int类型

	char message[] = "Hello world!";

	if(argc != 2) {
		//输入两个参数Usage  port
        printf("Usage : %s <port>\n",argv[0]);
		exit(1);
	}

	//创建socket 函数套接字 参数：协议族，套接字类型，具体协议，如果已经确定就传0
	//int socket(int domain, int type, int protocol);
	serv_sock = socket(PF_INET,SOCK_STREAM,0);
	if(serv_sock == -1) {
		error_handling("socket() error");
	}

	//void *memset(void *s,  int c, size_t n); 
	// 作用是在一段内存块中填充某个给定的值，它对较大的结构体或数组进行清零操作的一种最快方法。
	memset(&serv_addr,0,sizeof(serv_addr));
	serv_addr.sin_family = AF_INET;
	// h表示host，n表示network，
	serv_addr.sin_addr.s_addr = htonl(INADDR_ANY); //INADDR_ANY:转换过来就是0.0.0.0，泛指本机的意思，也就是表示本机的所有IP
	//端口号
	// int atoi(const char *str) 把把参数 str 所指向的字符串转换为一个整数（类型为 int 型）
	serv_addr.sin_port = htonl(atoi(argv[1]));

	//绑定IP地址和端口号
	// int bind(int sockfd, const struct sockaddr *addr,
    //             socklen_t addrlen);
	if(bind(serv_sock,(struct sockaddr* )& serv_addr,sizeof(serv_addr)) == -1) {
		error_handling("bind() error");
	}

	//调用监听函数将套接字转成可接收状态
	//  int listen(int sockfd, int backlog);  backlog表示允许有多少个客户端等待连接
	if(listen(serv_sock,5) == -1 ){
		error_handling("listen() error");
	}

	//调用accept函数连接请求（拿起电话），如果没有连接请求的状态下调用该函数，则不会返回，直到有连接请求为止
	clnt_addr_size = sizeof(clnt_addr);
	// int accept(int sockfd, struct sockaddr *addr, socklen_t *addrlen);
	clnt_sock = accept(serv_sock,(struct sockaddr *)&clnt_addr,&clnt_addr_size);
	if(clnt_sock == -1) {
		error_handling("accept() error");
	}

	//向客户端写数据
	write(clnt_sock,message,sizeof(message));

	return 0;
}

void error_handling(char *message){

    fputs(message,stderr);
    fputs("\n",stderr);
    exit(1);
}

```

### hello_client

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>

void error_handling(char *message);

int main(int argc,char *argv[]){
	int sock;
	struct sockaddr_in serv_addr;
	char message[30];
	int str_len;

	if(argc != 3){
		printf("Usage : %s <IP> <port>\n",argv[0]);
		exit(1);
	}

    //创建套接字，这个时候套接字并没有马上分配给客户端和服务端，如果调用bind、listen函数见成为服务端套接字，如果调用connect套接字将成为客户端套接字
	sock = socket(PF_INET,SOCK_STREAM,0);
	if(sock == -1){
		error_handling("socket() error");
	}
	
	memset(&serv_addr,0,sizeof(serv_addr));
	serv_addr.sin_family = AF_INET;
	serv_addr.sin_addr.s_addr = inet_addr(argv[1]);
	serv_addr.sin_port = htons(atoi(argv[2]));
    
    //调用connect函数向服务端发起连接请求
	if(connect(sock,(struct sockaddr *)&serv_addr,sizeof(serv_addr)) == -1){
		error_handling("connect() error\r\n");
	}
	str_len = read(sock,message,sizeof(message)-1);
	if(str_len == -1)
	{
		error_handling("read() error");
	}

	printf("Message from server : %s \n",message);

	close(sock);
	return 0;
}

void error_handling(char *message){
	fputs(message,stderr);
	fputs("\n",stderr);
	exit(1);
}
```

### low_open

```c
#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>
void error_handling(char *message);

int main()
{
    int fd;
    char buf[] = "Let's go!\n";
    // O_CREAT | O_WRONLY | O_TRUNC 是文件打开模式，将创建新文件，并且只能写。如存在 data.txt 文件，则清空文件中的全部数据。
    fd = open("data.txt", O_CREAT | O_WRONLY | O_TRUNC);
    if (fd == -1)
        error_handling("open() error!");
    printf("file descriptor: %d \n", fd);
    // 向对应 fd 中保存的文件描述符的文件传输 buf 中保存的数据。
    if (write(fd, buf, sizeof(buf)) == -1)
        error_handling("write() error!");
    close(fd);
    return 0;
}

void error_handling(char *message)
{
    fputs(message, stderr);
    fputc('\n', stderr);
    exit(1);
}
```