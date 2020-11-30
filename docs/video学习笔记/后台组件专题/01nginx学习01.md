## Nginx安装
```
tar zxvf nginx-1.13.7.tar.gz 
tar zxvf openssl-1.1.0g.tar.gz 
tar zxvf pcre-8.41.tar.gz 
tar zxvf zlib-1.2.11.tar.gz 

$ cd nginx-1.13.7
$ ./configure --prefix=/usr/local/nginx --with-http_realip_module --with-http_addition_module --with-http_gzip_static_module --with-http_secure_link_module --with-http_stub_status_module --with-stream --with-pcre=/home/kendall/kenworkspace/app/nginx/pcre-8.41 --with-zlib=/home/kendall/kenworkspace/app/nginx/zlib-1.2.11 --with-openssl=/home/kendall/kenworkspace/app/nginx/openssl-1.1.0g

make

sudo make install
```

在目录`/usr/local/nginx`下会看到nginx文件夹。   
启动：
```
cd /usr/local/nginx
sudo ./sbin/nginx -c ./conf/nginx.conf
```
直接访问IP：`http://192.168.136.135/`

停止：
```
sudo ./sbin/nginx -s stop
```
### Nginx是使用
编写配置文件
```
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
启动：
```
sudo ./sbin/nginx -c ~/kenworkspace/lingsheng/nginx/vip.conf
```





http请求？？

