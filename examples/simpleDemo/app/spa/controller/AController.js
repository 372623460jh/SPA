/**
 * Created by jianghe on 2017/12/19.
 */
'use strict';

import 'style/testA.css';
import testATemp from 'template/testA';
import $jh from '../../../../../src/spa';
import Vu from 'lib/Vu/vu';


class Acontroller extends $jh.SpaController {

    constructor() {
        super();
        this.rootDom = null;
        this.data = {};
        this.vu = null;
    }

    onCreate(nowPage, lastPage) {
        var that = this;
        that.data = {
            back: '关闭',
            name: '当前是testA页'
        };
        that.render(nowPage, lastPage);
    }

    render(nowPage, lastPage) {
        var that = this;
        that.vu = new Vu({
            template: testATemp.html,
            data: that.data
        });
        that.vu.appendIn(nowPage.dom);
        var back = that.vu.$el.querySelector('.back');
        var btn = that.vu.$el.querySelector('.content');
        btn.addEventListener('click', function () {
            $jh.go({
                routeName: '/testB',
                animation: 'easeIn'
            });
        });
        back.addEventListener('click', function () {
            $jh.backHandle();
        });
    };

    onResume(nowPage, lastPage) {
        var that = this;
        that.data.name = `从${lastPage.routeName}返回到了testA`;
        setTimeout(function () {
            that.data.name = `当前是testA页`;
        }, 800);
    };

    onBack() {
        $jh.goBack();
    };
}
$jh.addController('/testA', Acontroller);