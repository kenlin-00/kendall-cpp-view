## mysql事务的基本概念
事务是MySQL等关系型数据库区别于NoSQL的重要方面，是保证数据一致性的重要手段。

事务（Transaction）是访问和更新数据库的程序执行单元，事务中可能包含一个或者多个SQL语句，这些语句要么执行，要么不执行。作为一个关系型数据库，MySQL支持事务。

### MySQL逻辑架构和存储引擎

![](./img/事务01.png)

从上图可以看出，MySQL服务器逻辑架构从上往下可以分为三层：
- 第一层：处理客户端连接，授权认证等；
- 第二层：服务器，负责查询语句的解析、优化、缓存以及内置函数的实现、存储过程等；
- 第三层：存储引擎，负责MySQL中数据的存储和提取，**MySQL中服务器不管理事务，事务是由存储引擎实现的**。MySQL支持事务的存储引擎有InnoDB、NDB Cluster等，其中InnoDB的使用最为广泛；其他存储引擎不支持事务，比如MyIsam，Memory等。

### 提交和回滚
典型的MySQL事务开启和提交操作如下。
```sql
-- 开启事务
start transaction
-- ...  # 一条或者多条SQL语句
-- 提交事务
commit
```
在自动提交模式下， 如果没有`start transaction`显示地开启一个事务，那么每个sql语句都会被当做一个事务执行提交操作。
通过如下方式，可以关闭`autocommit`;需要注意的是，`autocommit`

https://www.cnblogs.com/kismetv/p/10331633.html

https://blog.csdn.net/qq_38997379/article/details/89017287

https://www.cnblogs.com/personsiglewine/p/11507866.html