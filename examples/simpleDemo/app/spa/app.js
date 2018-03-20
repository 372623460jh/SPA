/**
 * Created by jianghe on 2017/12/19.
 */

'use strict';

// 视口组件
import autoViewPort from 'lib/autoViewPort/autoViewPort';
autoViewPort();

// 让bable将ES6的api通过babel-polyfill垫片转为ES5，
// 不加这个垫片使用bable-es2015只会讲语法转为ES5 不会将es6的新api转为es5
import 'babel-polyfill';

// 引入spa组件
import $jh from '../../../../src/spa';

// 关联返回控制器和js原生Android接口
import jsInterface from 'lib/jsInterface/jsInterface';
jsInterface.commonMethod.setBackHandlerCB($jh.backHandle);

/**
 * 公共样式部分
 */
import 'style/common/base.css';
import 'style/common/basic.css';

/**
 * 控制器部分
 */
import 'controller/AController';
import 'controller/BController';
import 'controller/CController';
import 'controller/DController';

/**
 * spa初始化
 */
$jh.init({
    home: '/testA',//默认首页
    container: '#jhAppWrap',//主页面中的占位标签
    errRoute: '/404'//错误页路由名不配置默认是/error
});