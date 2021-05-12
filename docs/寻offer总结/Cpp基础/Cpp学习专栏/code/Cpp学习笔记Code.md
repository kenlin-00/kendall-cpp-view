### C++的内存管理代码

```cpp
#include <iostream>

using namespace std;

enum class shape_type{
    circle, 
    triangle, 
    rectangle
};

class shape { 
public:
    shape(){
        cout << "this is shape" << endl;
    }

 };

class circle : public shape { 
public:
    circle(){
        cout << "this is circle" << endl;
    }
 };

class triangle : public shape { 
public:
    triangle(){
        cout << "this is triangle" << endl;
    }
 };

class rectangle : public shape { 
public:
    rectangle(){
        cout << "this is rectangle" << endl;
    }
 };


//这里create_shape 返回的是 shape 对象，对象的实际类型是某个 shape 的子类，圆啊，三角形啊，矩形啊，等等
class shape_wrapper {
public:
    // explicit 的作用是表明该构造函数是显示的, 而非隐式的, 跟它相对应的另一个关键字是implicit, 意思是隐藏的,
  explicit shape_wrapper(
    shape* ptr = nullptr)
    : ptr_(ptr) {}
  ~shape_wrapper()
  {
    delete ptr_;
  }
  shape* get() const { return ptr_; }
private:
  shape* ptr_;
};



//创建一个 shape 类
shape* create_shape(shape_type type){ 
     switch (type) { 
         case shape_type::circle: 
         return new circle(); 
         case shape_type::triangle: 
         return new triangle(); 
         case shape_type::rectangle: 
         return new rectangle(); 
     }
}

// ====>   防止内存泄露，把这个返回值放到一个本地变量里，并确保其析构函数会删除该对象即可。
// ====>   见 class shape_wrapper  

void foo(shape_type type)
{
    // create_shape 返回的是 shape*, ptr_wrapper 传入的是shape*
  shape_wrapper ptr_wrapper( create_shape(type) );  
}


int main() {

    // create_shape(shape_type::circle);
    // cout << "--------" << endl;
    // create_shape(shape_type::triangle);
    // cout << "--------" << endl;
    // create_shape(shape_type::rectangle);
    // cout << "--------" << endl;

    foo(shape_type::circle);

    return 0;
}
```