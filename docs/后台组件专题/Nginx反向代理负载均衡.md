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


