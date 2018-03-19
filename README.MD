# SPA框架说明文档 #

版本：v1.1

日期：2018年3月18日

----
## 前言：

### 本SPA框架适用于移动端混合app开发参照了Android和React Native的部分设计理念。可以本人开源MVVM框架VU结合使用。控制器页面一一对应，业务层可以轻松自由的控制页面。

- ###使用该框架必须掌握的几个点：
	1. **入口文件配置**
	2. **spa框架中自带模板及模板引擎**
	3. **控制器概念**
	4. **生命周期方法**
	5. **核心API**
	
## Demo

- 以项目中examples文件下的简单demo举例，下图是各个文件目录的含义

    - 项目目录：https://github.com/372623460jh/SPA/tree/master/dist

    ![Alt text](http://img.ijianghe.cn/images/jiang/$jhCatalog.png)
	
## 文件：

- 系统文件
	1. app.js *入口文件,需使用者自主编写*
    3. index.html *入口html，文件名可自定义*

- 样式文件
	1. 公共样式 *公共样式需要在入口html中自主引入*
	2. 页面样式 *控制器与页面样式的对应关系是多对一，只需在`config.js`对应的控制器下配置即可，系统会根据锚点值变化来自动引入样式文件（多个控制器可以引入同一个样式文件，也可以为空）*

- 控制器文件
	*控制器中包含了页面模板和页面的业务逻辑*

**注意**：
1. 公共样式需要在入口js`app.js`中手动引入;
2. 控制器文件需要在入口js`app.js`中手动引入;
3. 对应样式表中的选择器建议以`路由名_`来命名（如：books.css中的按钮选择器建议为`.books_btn`）该条不是强制要求只是为了防止样式表中选择器冲突给出的建议;

## 入口文件配置

- app.js是webpack打包的入口文件，在该文件中会引入公共样式，页面控制器，初始化需要用到的库。

    ```javascript
    'use strict';
    // 引入视口库初始化视口
    import autoViewPort from 'lib/autoViewPort/autoViewPort';
    autoViewPort();
    
    // 引入垫片babel-polyfill将es6的新api转为es5
    import 'babel-polyfill';
    
    // 引入spa框架
    import '../../../../src/spa';
    
    // 引入公共样式部分
    import 'style/common/base.css';
    import 'style/common/basic.css';
    
    // 引入控制器部分
    import 'controller/AController';
    import 'controller/BController';
    import 'controller/CController';
    import 'controller/DController';
    
    //执行spa的初始化方法
    $jh.init({
        home: '/testA',//默认首页
        container: '#jhAppWrap',//主页面中的占位标签
        errRoute: '/404'//错误页路由名不配置默认是/error
    });
    ```

**注意**：
1. 本spa组件是以hash值来路由的。当页面上无路由值时该组件会自动为url添加`#/testA`，也就是上面配置文件中init时的`home`属性(如在浏览器输入`http://127.0.0.1:9527/bundle.html`会被修改为默认路由`http://127.0.0.1:9527/bundle.html#/testA`);
2. 当路由变化spa框架会加载对应路由的控制器装载到主页面中，装载到init时的`container`属性配置的选择器中;
3. 当路由找不到对应的控制器时会跳转到init时的`errRoute`属性配置的路由；

## 模板和模板引擎

- 模板

    - 模板就是控制器对应页面的html字符串
    
    ```javascript
    // 这就是一个简单的模板
    let template =
        `<div class="testA">
            <div class = "back">{{back}}</div>
            <div class = "content">{{name}}</div>
        </div>`;
    ```

- 模板引擎
    
    - SPA中集成了Mustache模板引擎（不建议使用），有兴趣的同学可以详细学下，这里只介绍在本使用

    ```javascript
    // 使用模板和数据渲染出dom
    var template =
        '<div class="index">' +
        '<div class="index_box">main</div>' +
        '<div class="index_btn">' +
        '{{#test}}' +
        '<div class="btn" id={{title}}>{{content}}</div>' +
        '{{/test}}' +
        '</div>' +
        '</div>';
    var data = {
        test: [
            {
                title: 'btn1',
                content: '按钮1'
            }, {
                title: 'btn2',
                content: '按钮2'
            }, {
                title: 'btn3',
                content: '按钮3'
            }, {
                title: 'btn4',
                content: '按钮4'
            }
        ]
    };
    var dom = $jh.parseDom(template, data)[0];
    ```
        
    - 简单解释几点：
    	1. 	{{#A}}{{/A}}表示循环A
    	2. 	{{B}}表示取B的值
    	3. 	$jh.parseDom方法会将template模板装载data数据后返回一个真实dom对象；

## MVVM框架
    
上述介绍的模板引擎当数据发生变化时不会引起界面的局部更新，只能手动更新页面，导致性能下降

- SPA中不建议使用自带的Mustache模板引擎，建议使用本人开源的一个MVVM的框架(vu.js)，有兴趣的同学请移步：https://github.com/372623460jh/Vu

    安利一发vu,vu是参照vue思想开发出的一个轻量,高性能的mvvm框架,之所以叫vu寓意是残疾版的vue。

    ```javascript
    // 使用模板和数据渲染出dom
    var template =
        '<div class="index">' +
        '<div class="index_box">main</div>' +
        '<div class="index_btn">' +
        '<div -for="item in test" class="btn" :id="item.title">{{item.content}}</div>' +
        '</div>' +
        '</div>';
    var data = {
        test: [
            {
                title: 'btn1',
                content: '按钮1'
            }, {
                title: 'btn2',
                content: '按钮2'
            }, {
                title: 'btn3',
                content: '按钮3'
            }, {
                title: 'btn4',
                content: '按钮4'
            }
        ]
    };
    var vu = new $Vu({
        template:template,
        data:data
    });
    // vu.$el就是渲染出来的真实dom
    ```

## 控制器

- 控制器很简单可以理解为Android开发中的Activity,控制器中有生命周期方法（稍后介绍），控制器必须继承`$jh.SpaController`类
必须重写`onCreate`和`onResume`方法

    ```javascript
    
    import 'style/testA.css';
    import testATemp from 'template/testA';
    
    class Acontroller extends $jh.SpaController {
        /**
         * 构造方法
         */
        constructor() {
            super();
        }
        
        /**
         * 页面被创建时会执行此生命周期方法
         * @param nowPage 当前页
         * @param lastPage 从哪个页来
         */
        onCreate(nowPage, lastPage) {};
    
        /**
         * 重新回到该页面时执行该生命周期方法
         * @param nowPage 当前页
         * @param lastPage 从哪个页来
         */
        onResume(nowPage, lastPage) {};
    
        /**
         * 当虚拟或物理返回返回键被按下时（可不写，不写时默认执行$jh.goBack()方法）
         */
        onBack() {};
        
        /**
         * 页面被销毁时会进此生命周期方法（可不写，不写时不执行）
         */
        onDestroy() {};
    }
    // 添加控制器/testA是hash值
    $jh.addController('/testA', Acontroller);
    ```

**注意：**

1. 控制器和模板一一对应，一个控制器控制一个模板页面中的业务逻辑。
2. Page对象上面代码中`onCreate`，`onResume`生命周期方法中的`nowPage`，`lastPage`就是Page对象（以下是Page对象的构造方法）

    ```javascript
    function Page(initData) {
        // 路由名字
        this.routeName = initData.routeName || '';
        // 内存传递的参数(深拷贝)
        this.args = this.deepcopy(data.args);
        // url传递的参数，url传递的参数会影响界面。所以当routeName相等而param不等时页面不能复用
        this.params = initData.params || 'dom';
        // 页面键值
        this.pageKey = data.pageKey || '';
        // 页面类型（normal正常页，temp临时页）
        this.pageType = data.pageType || 'normal';
        // dom对象
        this.dom;
        // 保存到路由栈中的标志位（如果是不进栈页面加上一个时间戳，如果是进栈页面===路由名）
        this.pageId = this.routeName + new Date().getTime();
        // 控制器对象
        this.controller = undefined;
    }
    ```

## 生命周期方法

- onCreate:页面被创建时会执行此生命周期方法
- onResume:页面被创建时会执行此生命周期方法（可不写，不写时不执行）
- onDestroy:页面被销毁时会进此生命周期方法（可不写，不写时不执行）

**注意：**

- onBack:该方法虽然不属于生命周期方法，但使用频率很高（当虚拟或物理返回键被点击时执行）

<h2 id="api">SPA暴露的属性和方法</h2>

* [$jh.go() 页面跳转(前进)](#a) 
* [$jh.goBack() 页面跳转(返回)](#b) 
* [$jh.switchPage 切换页面的方法](#c)
* [$jh.parseDom() 将模板解析为dom](#d) 
* [$jh.setStorage() 保存共享的数据](#e) 
* [$jh.getStorage() 读取共享的数据](#f) 
* [$jh.delStorage() 删除共享的数据](#g) 
* [$jh.extend() 继承，深拷贝，浅拷贝方法](#h) 
* [$jh.urlparams2obj() 将url中的参数字串转化为对象](#i) 
* [$jh.obj2urlparams() 将对象转化为url参数字串](#j) 
* [$jh.loading.show() 显示loading](#k)
* [$jh.loading.close() 隐藏loading](#l)
* [$jh.SpaController 控制器父类](#m)
* [$jh.addController() 添加控制器](#n)
* [$jh.backHandle() 物理按键返回和虚拟按键返回的接口](#o)
* [$jh.init() spa初始化方法](#p)
* [$jh.prop spa框架的一些常量](#q)


---
- <h3 id="a">$jh.go() 页面跳转（前进）</h3> 
	
	- A页面跳转到B页面：在A控制器中执行
	```javascript
	$jh.go({
         routeName:'/B'
    });
	```

	- A页面跳转到B页面并传递name=‘张三’的参数：在A控制器中执行
    ```javascript
    $jh.go({
         routeName:'/B',
         args:{name:'张三'}
    });
    ```

	- 综合用例A页面跳转到B页面并传递name=‘张三’的参数,通过url传递age=24：在A控制器中执行 **(不建议使用url传参)**
    ```javascript
    $jh.go({
         routeName:'/B',
         args:{name:'张三'},
         params:'age=24',
         animation:'easeIn',//页面切换动画
         pageKey:'pageB',//给页面一个id（唯一标识页面）
         pageType:'normal'//页面类型（normal正常页，temp临时页）
    });
    ```
---

- <h3 id="b">$jh.goBack() 页面跳转（返回）</h3> 

	- B页面返回上一页：在B控制器中执行
    ```javascript
    $jh.goBack();
    ```

	- B页面返回到A页面：在A控制器中执行
    ```javascript
    $jh.goBack({
         routeName:'/A'
    });
    ```

	- B页面返回到A页面并传递name=‘张三’的参数：在A控制器中执行
    ```javascript
    $jh.goBack({
         routeName:'/A',
         args:{name:'张三'},
    });
    ```

	- 综合用例B页面跳转到A页面并传递name=‘张三’的参数,通过url传递age=24：在A控制器中执行**(不建议使用url传参)**
    ```javascript
    $jh.goBack({
         routeName:'/A',
         args:{name:'张三'},
         params:'age=24',
         animation:'easeOut',//页面切换动画
         pageKey:'pageB',//返回页的id
    });
    ```

---

- <h3 id="c">$jh.switchPage() 页面跳转（返回）</h3> 

	- 当前页切换到A页：如果A存在在栈中使用goBack返回,如果A页不存在在栈中使用go跳转
    ```javascript
    $jh.switchPage({
         routeName:'/A'
    });
    ```

	- 综合用例切换到A页面并传递name=‘张三’的参数,通过url传递age=24,**(不建议使用url传参)**
    ```javascript
    $jh.switchPage({
         routeName:'/A',
         args:{name:'张三'},
         params:'age=24',
         animation:'easeOut',//页面切换动画
         pageKey:'pageA',//返回页的id
    });
    ```
---

- <h3 id="d">$jh.parseDom() 将模板解析为dom的方法（Mustache） </h3> 

	- 在A页面中想把模板（未使用模板引擎）转换为dom对象
	
	`var rootDom = $jh.parseDom(template)[0];`

	- 在A页面中想把模板（使用模板引擎）转换为dom对象
	
	`var rootDom = $jh.parseDom(template,data)[0];`

---

- <h3 id="e">$jh.setStorage() 保存共享的数据 </h3> 

    - spa用于保存数据的方法（数据是使用extend方法深拷贝过的）
    
    `$jh.setStorage(key,value);`

---

- <h3 id="f">$jh.get_storage() 读取共享的数据 </h3> 

    - spa用于读取保存数据的方法
     
     `$jh.getStorage(key);`

---

- <h3 id="g">$jh.delStorage() 删除共享的数据 </h3> 

    - spa用于删除保存数据的方法 
    
    `$jh.delStorage(key);`

---

- <h3 id="h">$jh.extend() 继承，深拷贝，浅拷贝方法 </h3> 

    - 将obj1,obj2深拷贝到{}中

	`$jh.extend(true,{},obj1,obj2...)`
	
	- 将obj1,obj2浅拷贝到{}中

    `$jh.extend({},obj1,obj2...)`
    
    - 将obj1浅拷贝到this(spa)中成为spa的静态属性

    `$jh.extend(obj1)`
    
    - 将obj1深拷贝到this(spa)中成为spa的静态属性

    `$jh.extend(true,obj1)`

---

- <h3 id="i">$jh.urlparams2obj() 将url中的参数字串转化为对象 </h3> 

    - 将url str转为对象

	`$jh.urlparams2obj(str)`

---

- <h3 id="j">$jh.obj2urlparams() 将对象转化为url参数字串 </h3> 

    - 将obj转为url中的参数字串

	`$jh.obj2urlparams(obj)`

---

- <h3 id="k">$jh.loading.show() 显示loading </h3>

    - 显示loading
    
    ```javascript
    $jh.loading.show({
         name:'loading名',
         data:{},//渲染loading需要的数据
         duration:2000,//延时2000ms后关闭
         unclose:true//点击其他区域不允许关闭loading
    })
    ```

---

- <h3 id="l">$jh.loading.close() 隐藏loading </h3>

    - 隐藏loading

	`spa.loading.show()'`
	
---

- <h3 id="m">$jh.SpaController 控制器父类</h3>

    - 是所有控制器的父类，所有控制器都要继承该父类

	`$jh.SpaController`
	
---

- <h3 id="n">$jh.addController() 添加控制器</h3>

    - 将控制器添加到控制器管理栈中

    `$jh.addController('routeName',控制器类)`
    
---

- <h3 id="o">$jh.backHandle() 物理按键返回和虚拟按键返回的接口</h3>

    - 物理按键返回和虚拟按键点击时执行该方法,就会将返回事件触发到当前栈顶控制器

    `$jh.backHandle()`
    
---

- <h3 id="p">$jh.init() spa初始化方法</h3>

    - 在入口`app.js`文件中需要执行该初始化方法
    ```javascript
    $jh.init({
        home: '/testA',//默认路由
        container: '#jhAppWrap',//主页面中的占位标签
        errRoute: '/404'//错误页路由名不配置默认是/error
    });
    ```
    
---

- <h3 id="p">$jh.prop spa框架的一些常量</h3>

    - `$jh.prop`中保存着spa框架的一些常量,如版本号之类,开发人员可以在任意位置添加读取。

## Demo

