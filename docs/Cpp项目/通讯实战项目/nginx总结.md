<!-- TOC -->

- [什么是Nginx？](#什么是nginx)
- [为什么要用Nginx](#为什么要用nginx)
- [为什么Nginx性能这么高](#为什么nginx性能这么高)
- [什么是正向代理和反向代理](#什么是正向代理和反向代理)
- [使用“反向代理服务器的优点是什么?](#使用反向代理服务器的优点是什么)
- [Nginx应用场景](#nginx应用场景)
- [Nginx目录结构有哪些](#nginx目录结构有哪些)
- [Nginx配置文件nginx.conf有哪些属性模块](#nginx配置文件nginxconf有哪些属性模块)
- [Nginx静态资源](#nginx静态资源)
- [如何用Nginx解决前端跨域问题](#如何用nginx解决前端跨域问题)
- [Nginx虚拟主机怎么配置](#nginx虚拟主机怎么配置)
	- [基于虚拟主机配置域名](#基于虚拟主机配置域名)
	- [基于端口的虚拟主机](#基于端口的虚拟主机)
- [Nginx配置高可用性怎么配置](#nginx配置高可用性怎么配置)
- [限流怎么做的](#限流怎么做的)
	- [正常限制访问频率（正常流量）](#正常限制访问频率正常流量)
	- [突发限制访问频率（突发流量）](#突发限制访问频率突发流量)
	- [限制并发连接数](#限制并发连接数)
		- [漏桶算法](#漏桶算法)
		- [令牌桶算法](#令牌桶算法)
- [怎么限制浏览器访问](#怎么限制浏览器访问)
- [Nginx 缓存](#nginx-缓存)
- [为什么要做动静分离](#为什么要做动静分离)
	- [Nginx怎么做的动静分离](#nginx怎么做的动静分离)
- [Nginx负载均衡的算法怎么实现的?策略有哪些](#nginx负载均衡的算法怎么实现的策略有哪些)
	- [1 轮询(默认)](#1-轮询默认)
	- [权重 weight](#权重-weight)
	- [ip_hash( IP绑定)](#ip_hash-ip绑定)
	- [fair(第三方插件)](#fair第三方插件)
	- [url_hash(第三方插件)](#url_hash第三方插件)
- [Nginx怎么判断别IP不可访问](#nginx怎么判断别ip不可访问)
- [nginx是如何实现高并发的](#nginx是如何实现高并发的)
	- [进程模型](#进程模型)
	- [事件模型](#事件模型)

<!-- /TOC -->

------

## 什么是Nginx？

Nginx是一个 轻量级/高性能的反向代理 Web 服务器，他实现非常高效的反向代理、负载平衡，他可以处理2-3万并发连接数，官方监测能支持5万并发，

## 为什么要用Nginx

跨平台、配置简单、方向代理、高并发连接：处理2-3万并发连接数，官方监测能支持5万并发，内存消耗小：开启10个nginx才占150M内存 ，nginx处理静态文件好，耗费内存少，

而且Nginx内置的健康检查功能：如果有一个服务器宕机，会做一个健康检查，再发送的请求就不会发送到宕机的服务器了。重新将请求提交到其他的节点上。

使用Nginx的话还能：

- 节省宽带：支持GZIP压缩，可以添加浏览器本地缓存
- 稳定性高：宕机的概率非常小
- 接收用户请求是异步的

## 为什么Nginx性能这么高

- nginx接收一个请求后，首先由 listen 和 server_name 指令匹配server模块，再匹配 server 模块里的 location，location 就是实际地址

```js
    server {            						# 第一个Server区块开始，表示一个独立的虚拟主机站点
        listen       80；      					# 提供服务的端口，默认80
        server_name  localhost；       			# 提供服务的域名主机名
        location / {            				# 第一个location区块开始
            root   html；       				# 站点的根目录，相当于Nginx的安装目录
            index  index.html index.htm；      	# 默认的首页文件，多个用空格分开
        }          								# 第一个location区块结果
```

## 什么是正向代理和反向代理

正向代理就是一个人发送一个请求直接就到达了目标的服务器

反方代理就是请求统一被Nginx接收，nginx反向代理服务器接收到之后，按照一定的规 则分发给了后端的业务处理服务器进行处理了

## 使用“反向代理服务器的优点是什么?

反向代理服务器可以隐藏源服务器的存在和特征。它充当互联网云和 web 服务器之间的中间层。这对于安全方面来说是很好的，特别是当您使用 web 托管服务时。

**Nginx的优缺点**

**优点**：

- 占内存小，可实现高并发连接，处理响应快
- 可实现http服务器、虚拟主机、方向代理、负载均衡
- Nginx配置简单
- 可以不暴露正式的服务器IP地址


**缺点**：

动态处理差：nginx 处理静态文件好,耗费内存少，但是处理动态页面则很鸡肋，现在一般前端用 nginx 作为反向代理抗住压力，

## Nginx应用场景

- http服务器。Nginx是一个http服务可以独立提供http服务。可以做网页静态服务器。
- 虚拟主机。可以实现在一台服务器虚拟出多个网站，例如个人网站使用的虚拟机。
- 反向代理，负载均衡。当网站的访问量达到一定程度后，单台服务器不能满足用户的请求时，需要用多台服务器集群可以使用nginx做反向代理。并且多台服务器可以平均分担负载，不会应为某台服务器负载高宕机而某台服务器闲置的情况。
- nginz 中也可以配置安全管理、比如可以使用Nginx搭建API接口网关,对每个接口服务进行拦截。

## Nginx目录结构有哪些

```bash
[root@localhost ~]# tree /usr/local/nginx
/usr/local/nginx
├── client_body_temp
├── conf                             # Nginx所有配置文件的目录
│   ├── fastcgi.conf                 # fastcgi相关参数的配置文件
│   ├── fastcgi.conf.default         # fastcgi.conf的原始备份文件
│   ├── fastcgi_params               # fastcgi的参数文件
│   ├── fastcgi_params.default       
│   ├── koi-utf
│   ├── koi-win
│   ├── mime.types                   # 媒体类型
│   ├── mime.types.default
│   ├── nginx.conf                   # Nginx主配置文件
│   ├── nginx.conf.default
│   ├── scgi_params                  # scgi相关参数文件
│   ├── scgi_params.default  
│   ├── uwsgi_params                 # uwsgi相关参数文件
│   ├── uwsgi_params.default
│   └── win-utf
├── fastcgi_temp                     # fastcgi临时数据目录
├── html                             # Nginx默认站点目录
│   ├── 50x.html                     # 错误页面优雅替代显示文件，例如当出现502错误时会调用此页面
│   └── index.html                   # 默认的首页文件
├── logs                             # Nginx日志目录
│   ├── access.log                   # 访问日志文件
│   ├── error.log                    # 错误日志文件
│   └── nginx.pid                    # pid文件，Nginx进程启动后，会把所有进程的ID号写到此文件
├── proxy_temp                       # 临时目录
├── sbin                             # Nginx命令目录
│   └── nginx                        # Nginx的启动命令
├── scgi_temp                        # 临时目录
└── uwsgi_temp                       # 临时目录
```

## Nginx配置文件nginx.conf有哪些属性模块

```js
worker_processes  1；                					# worker进程的数量
events {                              					# 事件区块开始
    worker_connections  1024；            				# 每个worker进程支持的最大连接数
}                                    					# 事件区块结束
http {                               					# HTTP区块开始
    include       mime.types；            				# Nginx支持的媒体类型库文件
    default_type  application/octet-stream；     		# 默认的媒体类型
    sendfile        on；       							# 开启高效传输模式
    keepalive_timeout  65；       						# 连接超时
    server {            								# 第一个Server区块开始，表示一个独立的虚拟主机站点
        listen       80；      							# 提供服务的端口，默认80
        server_name  localhost；       					# 提供服务的域名主机名
        location / {            						# 第一个location区块开始
            root   html；       						# 站点的根目录，相当于Nginx的安装目录
            index  index.html index.htm；      			# 默认的首页文件，多个用空格分开
        }          										# 第一个location区块结果
        error_page   500502503504  /50x.html；     		# 出现对应的http状态码时，使用50x.html回应客户
        location = /50x.html {          				# location区块开始，访问50x.html
            root   html；      							# 指定对应的站点目录为html
        }
    }  
    ......
```

## Nginx静态资源

静态资源访问，就是存放在 nginx 的 html 页面，也就是我们可以自己编写

## 如何用Nginx解决前端跨域问题

使用 Nginx 转发请求。把跨域的接口写成调本域的接口，然后将这些接口转发到真正的请求地址

## Nginx虚拟主机怎么配置

1、基于域名的虚拟主机，通过域名来区分虚拟主机——应用：外部网站

2、基于端口的虚拟主机，通过端口来区分虚拟主机——应用：公司内部网站，外部网站的管理后台

3、基于ip的虚拟主机。

### 基于虚拟主机配置域名

需要建立`/data/www ``/data/bbs`目录，`windows`本地`hosts`添加虚拟机`ip`地址对应的域名解析；对应域名网站目录下新增`index.html`文件；

```js
	#当客户端访问www.lijie.com,监听端口号为80,直接跳转到data/www目录下文件
    server {
        listen       80;
        server_name  www.lijie.com;
        location / {
            root   data/www;
            index  index.html index.htm;
        }
    }

	#当客户端访问www.lijie.com,监听端口号为80,直接跳转到data/bbs目录下文件
	 server {
        listen       80;
        server_name  bbs.lijie.com;
        location / {
            root   data/bbs;
            index  index.html index.htm;
        }
    }

```

### 基于端口的虚拟主机

使用端口来区分，浏览器使用域名或`ip`地址:端口号 访问

```js
    #当客户端访问www.lijie.com,监听端口号为8080,直接跳转到data/www目录下文件
	 server {
        listen       8080;
        server_name  8080.lijie.com;
        location / {
            root   data/www;
            index  index.html index.htm;
        }
    }
	
	#当客户端访问www.lijie.com,监听端口号为80直接跳转到真实ip服务器地址 127.0.0.1:8080
	server {
        listen       80;
        server_name  www.lijie.com;
        location / {
		 	proxy_pass http://127.0.0.1:8080;
            index  index.html index.htm;
        }
	}
```

## Nginx配置高可用性怎么配置

当上游服务器(真实访问服务器)，一旦出现故障或者是没有及时相应的话，应该直接轮训到下一台服务器，保证服务器的高可用

Nginx配置代码：

```js
server {
        listen       80;
        server_name  www.lijie.com;
        location / {
		    ### 指定上游服务器负载均衡服务器
		    proxy_pass http://backServer;
			###nginx与上游服务器(真实访问的服务器)超时时间 后端服务器连接的超时时间_发起握手等候响应超时时间
			proxy_connect_timeout 1s;
			###nginx发送给上游服务器(真实访问的服务器)超时时间
            proxy_send_timeout 1s;
			### nginx接受上游服务器(真实访问的服务器)超时时间
            proxy_read_timeout 1s;
            index  index.html index.htm;
        }
    }
```



## 限流怎么做的

Nginx 限流就是限制用户请求速度，防止服务器受不了

限流有3种

- 正常限制访问频率（正常流量）
- 突发限制访问频率（突发流量）
- 限制并发连接数

Nginx的限流都是基于漏桶流算法，底下会说道什么是桶铜流

**实现三种限流算法**

### 正常限制访问频率（正常流量）

限制一个用户发送的请求，我Nginx多久接收一个请求。

Nginx 中使用 `ngx_http_limit_req_module` 模块来限制的访问频率，限制的原理实质是基于漏桶算法原理来实现的。在`nginx.conf`配置文件中可以使用`limit_req_zone`命令及`limit_req`命令限制单个`IP`的请求处理频率

```
	#定义限流维度，一个用户一分钟一个请求进来，多余的全部漏掉
	limit_req_zone $binary_remote_addr zone=one:10m rate=1r/m;

	#绑定限流维度
	server{
		
		location/seckill.html{
			limit_req zone=zone;	
			proxy_pass http://lj_seckill;
		}

	}
```
`1r/s`代表1秒一个请求，`1r/m`一分钟接收一个请求， 如果`Nginx`这时还有别人的请求没有处理完，`Nginx`就会拒绝处理该用户请求。

### 突发限制访问频率（突发流量）

限制一个用户发送的请求，我`Nginx`多久接收一个。

上面的配置一定程度可以限制访问频率，但是也存在着一个问题：如果突发流量超出请求被拒绝处理，无法处理活动时候的突发流量，这时候应该如何进一步处理呢？`Nginx`提供b`urst`参数结合`nodelay`参数可以解决流量突发的问题，可以设置能处理的超过设置的请求数外能额外处理的请求数。我们可以将之前的例子添加`burst`参数以及`nodelay`参数：

```
	#定义限流维度，一个用户一分钟一个请求进来，多余的全部漏掉
	limit_req_zone $binary_remote_addr zone=one:10m rate=1r/m;

	#绑定限流维度
	server{
		
		location/seckill.html{
			limit_req zone=zone burst=5 nodelay;
			proxy_pass http://lj_seckill;
		}

	}
```

为什么就多了一个 `burst=5 nodelay`; 呢，多了这个可以代表`Nginx`对于一个用户的请求会立即处理前五个，多余的就慢慢来落，没有其他用户的请求我就处理你的，有其他的请求的话我Nginx就漏掉不接受你的请求

### 限制并发连接数

`Nginx`中的`ngx_http_limit_conn_module`模块提供了限制并发连接数的功能，可以使用`limit_conn_zone`指令以及`limit_conn`执行进行配置。接下来我们可以通过一个简单的例子来看下：

```
	http {
		limit_conn_zone $binary_remote_addr zone=myip:10m;
		limit_conn_zone $server_name zone=myServerName:10m;
	}

    server {
        location / {
            limit_conn myip 10;
            limit_conn myServerName 100;
            rewrite / http://www.lijie.net permanent;
        }
    }
```
上面配置了单个IP同时并发连接数最多只能`10`个连接，并且设置了整个虚拟服务器同时最大并发数最多只能`100`个链接。当然，只有当请求的`header`被服务器处理后，虚拟服务器的连接数才会计数。刚才有提到过`Nginx`是基于漏桶算法原理实现的，实际上限流一般都是基于漏桶算法和令牌桶算法实现的。接下来我们来看看两个算法的介绍：

#### 漏桶算法

漏桶算法是网络世界中流量整形或速率限制时经常使用的一种算法，它的主要目的是控制数据注入到网络的速率，平滑网络上的突发流量。漏桶算法提供了一种机制，通过它，突发流量可以被整形以便为网络提供一个稳定的流量。也就是我们刚才所讲的情况。漏桶算法提供的机制实际上就是刚才的案例：**突发流量会进入到一个漏桶，漏桶会按照我们定义的速率依次处理请求，如果水流过大也就是突发流量过大就会直接溢出，则多余的请求会被拒绝。所以漏桶算法能控制数据的传输速率**。

#### 令牌桶算法

令牌桶算法是网络流量整形和速率限制中最常使用的一种算法。典型情况下，令牌桶算法用来控制发送到网络上的数据的数目，并允许突发数据的发送。Google 开源项目`Guava`中的`RateLimiter`使用的就是令牌桶控制算法。令牌桶算法的机制如下：存在一个大小固定的令牌桶，会以恒定的速率源源不断产生令牌。如果令牌消耗速率小于生产令牌的速度，令牌就会一直产生直至装满整个令牌桶。

![](https://img-blog.csdnimg.cn/20200411193930872.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MzEyMjA5MA==,size_16,color_FFFFFF,t_70)


## 怎么限制浏览器访问

```js
	## 不允许谷歌浏览器访问 如果是谷歌浏览器返回500
 	if ($http_user_agent ~ Chrome) {   
        return 500;  
    }
```



## Nginx 缓存

https://blog.csdn.net/h13140995776/article/details/101174283

## 为什么要做动静分离

- Nginx是当下最热的Web容器，网站优化的重要点在于静态化网站，网站静态化的关键点则是是动静分离，动静分离是让动态网站里的动态网页根据一定规则把不变的资源和经常变的资源区分开来，动静资源做好了拆分以后，我们则根据静态资源的特点将其做缓存操作。

- 让静态的资源只走静态资源服务器，动态的走动态的服务器

- Nginx的静态处理能力很强，但是动态处理能力不足，因此，在企业中常用动静分离技术。

- 对于静态资源比如图片，js，css等文件，我们则在反向代理服务器nginx中进行缓存。这样浏览器在请求一个静态资源时，代理服务器nginx就可以直接处理，无需将请求转发给后端服务器tomcat。			
若用户请求的动态文件，比如servlet,jsp则转发给Tomcat服务器处理，从而实现动静分离。这也是反向代理服务器的一个重要的作用

### Nginx怎么做的动静分离

只需要指定路径对应的目录。location/可以使用正则表达式匹配。并指定对应的硬盘中的目录。如下：（操作都是在Linux上）

```
		location /image/ {
            root   /usr/local/static/;
            autoindex on;
        }
```

1、创建目录

```
mkdir /usr/local/static/image
```

2、进入目录

```
cd  /usr/local/static/image
```

3、放一张照片上去#

```
1.jpg
```

4、重启 nginx

```
sudo nginx -s reload
```

5、打开浏览器 输入 `server_name/image/1.jpg` 就可以访问该静态图片了

## Nginx负载均衡的算法怎么实现的?策略有哪些

- 为了避免服务器崩溃，大家会通过负载均衡的方式来分担服务器压力。将对台服务器组成一个集群，当用户访问时，先访问到一个转发服务器，再由转发服务器将访问分发到压力更小的服务器。

- Nginx负载均衡实现的策略有以下五种：

### 1 轮询(默认)

每个请求按时间顺序逐一分配到不同的后端服务器，如果后端某个服务器宕机，能自动剔除故障系统

```
upstream backserver { 
 server 192.168.0.12; 
 server 192.168.0.13; 
} 
```


### 权重 weight

- weight的值越大分配

- 到的访问概率越高，主要用于后端每台服务器性能不均衡的情况下。其次是为在主从的情况下设置不同的权值，达到合理有效的地利用主机资源。

```
upstream backserver { 
	server 192.168.0.12 weight=2; 
	server 192.168.0.13 weight=8; 
} 
```
- 权重越高，在被访问的概率越大，如上例，分别是20%，80%。

### ip_hash( IP绑定)

每个请求按访问IP的哈希结果分配，使来自同一个IP的访客固定访问一台后端服务器，并且可以有效解决动态网页存在的session共享问题

```
upstream backserver { 
 ip_hash; 
 server 192.168.0.12:88; 
 server 192.168.0.13:80; 
} 
```

### fair(第三方插件)

- 必须安装upstream_fair模块。

- 对比 weight、ip_hash更加智能的负载均衡算法，fair算法可以根据页面大小和加载时间长短智能地进行负载均衡，响应时间短的优先分配。

```
upstream backserver { 
 server server1; 
 server server2; 
 fair; 
} 
```

### url_hash(第三方插件)

- 必须安装Nginx的hash软件包

- 按访问url的hash结果来分配请求，使每个url定向到同一个后端服务器，可以进一步提高后端缓存服务器的效率。

```
upstream backserver { 
 server squid1:3128; 
 server squid2:3128; 
 hash $request_uri; 
 hash_method crc32; 
} 
```

## Nginx怎么判断别IP不可访问

```js
# 如果访问的ip地址为192.168.9.115,则返回403
if  ($remote_addr = 192.168.9.115) {  
	return 403;  
}  
```

## nginx是如何实现高并发的

`nginx`之所以可以实现高并发，与它采用的`epoll`模型有很大的关系。`epoll`模型采用异步非阻塞的事件处理机制。这种机制可让`nginx`进程同时监控多个事件。

简单来说，就是异步非阻塞，使用了`epoll`模型和大量的底层代码优化。如果深入一点的话，就是`nginx`的特殊进程模型和事件模型的设计，才使其可以实现高并发。

### 进程模型

它是采用一个master进程和多个worker进程的工作模式。

- 1、master进程主要负责收集、分发请求。当一个请求过来时，master拉起一个worker进程负责处理这个请求。；
- 2、master进程也要负责监控worker的状态，保证高可靠性；
- 3、worker进程议案设置为和CPU核心数一致或者其二倍。nginx的worker进程和Apache的不一样。apache的进程在同一时间只能处理一个请求，所以它会开启很多个进程，几百甚至几千个。而nginx的worker进程在同一时间可以处理的请求数只受内存限制，因此可以处理更多请求。

### 事件模型

`nginx`是异步非阻塞的。

一个`master`进程，多个`worker`进程，每个`worker`进程可以处理多个请求。每进来一个`request`，都会有`worker`进程去处理。但不是全程的处理，那么处理到的程度就是可能发生阻塞的地方，比如向后端服务器转发`request`，并等待请求返回。那么，在等待期间，这个处理的`worker`不会这么傻等着，他会在发送完请求后，注册一个事件：“如果upstream返回了，告诉我一声，我再接着干”。于是它就去休息了，此时，如果再有`request`进来，它就可以很快再按这种方式处理。而一旦后端服务器返回了，就会触发这个事件，`worker`才会来接手，这个`request`才会接着往下走。
由于`nginx`的的这个工作性质决定了每个请求大部分的生命都是在网络传输中，所以实际上花费在`nginx` 服务器上的时间并不多，这就是它几进程就能解决高并发的秘密所在


--------------------

[参考链接](https://blog.csdn.net/weixin_43122090/article/details/105461971)
