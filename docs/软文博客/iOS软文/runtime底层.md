

## OC 是一门动态语言

动态性是由 runtime 支撑。


在arm64架构之前，isa就是一个普通的指针，存储着Class、Meta-Class对象的内存地址

从arm64架构开始，对isa进行了优化，变成了一个共用体（union）结构，还使用位域来存储更多的信息
