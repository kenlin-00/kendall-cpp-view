## Nginx安装
```
tar zxvf nginx-1.13.7.tar.gz 
tar zxvf openssl-1.1.0g.tar.gz 
tar zxvf pcre-8.41.tar.gz 
tar zxvf zlib-1.2.11.tar.gz 

$ cd nginx-1.13.7
$ ./configure --prefix=/usr/local/nginx --with-http_realip_module --with-http_addition_module --with-http_gzip_static_module --with-
http_secure_link_module --with-http_stub_status_module --with-stream --with-pcre=/home/kendall/kenworkspace/app/nginx
/pcre-8.41 --with-zlib=/home/kendall/kenworkspace/app/nginx
/zlib-1.2.11 --with-
openssl=/home/kendall/kenworkspace/app/nginx
/openssl-1.1.0g
```

## 使用Nginx
```
vim vip.conf 

worker_processes 4;

events {
        worker_connections 1024;
}


http {

    server {
        listen 8888;
        server_name localhost;

        client_max_body_size 100m;

        location / { 
            root /usr/local/nginx/html/;
        }   

    }   
}
```

## 使用Nginx
测试：      
启动Nginx       
注意需要使用root用户

```
./sbin/nginx –c ./conf/nginx.conf
```
再浏览器上访问：192.168.136.135

关闭：
```
nginx -s quit
```

自己编写一个配置文件
```
# vim vip.conf                   

worker_processes 4;

events {
        worker_connections 1024;
}


http {

    server {
        listen 8888;
        server_name localhost;

        client_max_body_size 100m;

        location / { 
            root /usr/local/nginx/html/;
        }   

    }   
}
```
测试：
```
nginx -c vip_conf/vip.conf 
访问：http://192.168.136.135:8888/
停止：  
```

配置文件讲解
```
user  nginx;
worker_processes  1;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;
# 以上同城为全局块
# worker_processes的数值越大，Nginx的并发能力就越强
# error_log代表Nginx错误日志存放的位置
# pid是Nginx运行的一个标识

events {
    worker_connections  1024;
}
# events块
# worker_connections的数值越大，Nginx的并发能力就越强

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    keepalive_timeout  65;

    #gzip  on;

    include /etc/nginx/conf.d/*.conf;
}

# http块
# include代表引入一个外部文件
# include       /etc/nginx/mime.types;	mime.types中存放着大量媒体类型
#include /etc/nginx/conf.d/*.conf;	引入了conf.d下以.conf为结尾的配置文件
```

参考：https://www.ljxy.pub/article/6



