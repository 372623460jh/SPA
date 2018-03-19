/**
 * Created by jianghe on 2017/12/19.
 */
'use strict';

import 'style/testC.css';
import testATemp from 'template/testC';
import $jh from '../../../../../src/spa';
import Vu from 'lib/Vu/vu';


class Ccontroller extends $jh.SpaController {

    constructor() {
        super();
        this.rootDom = null;
        this.data = {};
        this.vu = null;
    }

    onCreate(nowPage, lastPage) {
        var that = this;
        that.data = {
            back: '回B',
            name: '当前是testC页'
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
                routeName: '/testD',
                animation: 'easeIn'
            });
        });
        back.addEventListener('click', function () {
            $jh.backHandle();
        });
    };

    onResume(nowPage, lastPage) {
        var that = this;
        that.data.name = `从${lastPage.routeName}返回到了testC`;
        setTimeout(function () {
            that.data.name = `当前是testC页`;
        }, 800);
    };

    onBack() {
        $jh.goBack({
            animation: 'easeOut'
        });
    };
}
$jh.addController('/testC', Ccontroller);