/**
 * Created by jianghe on 2017/12/19.
 */
'use strict';

import 'style/testD.css';
import testATemp from 'template/testD';
import $jh from '../../../../../src/spa';
import Vu from 'lib/Vu/vu';


class Dcontroller extends $jh.SpaController {

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
            name: '当前是testD页'
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
        back.addEventListener('click', function () {
            $jh.backHandle();
        });
    };

    onBack() {
        $jh.goBack({
            routeName: '/testB',
            animation: 'easeOut'
        });
    };
}
$jh.addController('/testD', Dcontroller);