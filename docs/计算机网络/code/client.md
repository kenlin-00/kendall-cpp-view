- **client-tcp**
- [server-tcp](/计算机网络/code/server.md)


```c
//client.c
#include <unistd.h>
#include <stdio.h>
#include <arpa/inet.h>
#include <sys/socket.h>

int main() {

    //1 创建套接字
    int sock_fd;
    // int socket(int domain, int type, int progcctocol);  //成功：返回文件描述符
    sock_fd = socket(AF_INET,SOCK_STREAM,0);

    //2 连接服务器
    // int connect(int sockfd, const struct sockaddr *addr, socklen_t addrlen);
    struct sockaddr_in addr; 
    addr.sin_family = AF_INET;  //设置协议
    addr.sin_port = htons(8000); //将端口转成大端  设置端口
    // int inet_pton(int af, const char *src, void *dst);
    // 该功能将字符串src转换为af地址族中的网络地址结构
    inet_pton(AF_INET,"192.168.100.11",&addr.sin_addr.s_addr);
    connect(sock_fd,(struct sockaddr *)&addr,sizeof(addr));  //将addr强制转换
    
    //3 读写数据
    char buf[1024] = "";
    while(1) 
    {
        //获取数据
        int n = read(STDIN_FILENO,buf,sizeof(buf));
        // 发送数据给服务器写出来
        write(sock_fd,buf,n);
        //获取服务端的数据
        n = read(sock_fd,buf,sizeof(buf));
        write(STDOUT_FILENO,buf,n);
        printf("\n");
    }

    //4 关闭
    close(sock_fd);
    return 0 ;
}

```