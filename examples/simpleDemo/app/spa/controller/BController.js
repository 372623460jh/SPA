/**
 * Created by jianghe on 2017/12/19.
 */
'use strict';

import 'style/testB.css';
import testATemp from 'template/testB';
import $jh from '../../../../../src/spa';
import Vu from 'lib/Vu/vu';


class Bcontroller extends $jh.SpaController {

    constructor() {
        super();
        this.rootDom = null;
        this.data = {};
        this.vu = null;
    }

    onCreate(nowPage, lastPage) {
        var that = this;
        that.data = {
            back: '回A',
            name: '当前是testB页'
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
                routeName: '/testC',
                animation: 'easeIn'
            });
        });
        back.addEventListener('click', function () {
            $jh.backHandle();
        });
    };

    onResume(nowPage, lastPage) {
        var that = this;
        that.data.name = `从${lastPage.routeName}返回到了testB`;
        setTimeout(function () {
            that.data.name = `当前是testB页`;
        }, 800);
    };

    onBack() {
        $jh.goBack({
            animation: 'easeOut'
        });
    };
}
$jh.addController('/testB', Bcontroller);