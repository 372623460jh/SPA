/**
 * Created by jianghe on 2017/12/25.
 * 部署模式配置文件
 */

var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');

module.exports = {
    entry: {
        //入口文件
        index: './app/spa/app.js'
    },
    output: {
        //输出文件
        path: __dirname + '/pro',
        filename: 'bundle.js',
    },
    module: {
        loaders: [
            //js部分通过babel-loader编译成es5(.babelrc文件)
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            //css部分通过style-loader加载样式通过css-loader将css嵌入js
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },
            //字体部分
            {
                test: /\.(otf|eot|svg|ttf|woff|woff2).*$/,
                loader: 'url-loader?limit=20480&name=fonts/[name].[ext]'
            },
            //图片部分
            {
                test: /\.(gif|jpe?g|png|ico)$/,
                loader: 'url-loader?limit=20480&name=images/[name].[ext]'
            }
        ]
    },
    plugins: [
        //通过该插件配置的属性会成为一个全局属性
        new webpack.DefinePlugin({
            //在任何地方都可以访问到__DEV__()
            __DEV__: false,
            'process.env': {NODE_ENV: '"production"'}
        }),

        //html插件
        new HtmlWebpackPlugin({
            // 输入html模板
            template: 'app/index.html',
            // 输出html
            filename: 'index.html',
            // js插入的位置，true/'head'  false/'body'
            inject: 'body',
            // 引入那几个js对应entry的key
            chunks: ['index'],
            //引入js后加上hash值防缓存
            hash: true,
            // html压缩部分
            minify: {
                //移除HTML中的注释
                removeComments: true,
                //删除空白符与换行符
                collapseWhitespace: true
            }
        }),

        // webapck 会给编译好的代码片段一个id用来区分
        // 而这个插件会让webpack在id分配上优化并保持一致性。
        // 具体是的优化是：webpack就能够比对id的使用频率和分布来得出最短的id分配给使用频率高的模块
        new webpack.optimize.OccurrenceOrderPlugin(),

        //UglifyJs插件
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            //压缩代码
            // beautify: true,//美化代码(压缩后不需要美化)
            mangle: {
                except: ['$', 'exports', 'require']
            }//通过设置except数组来防止指定变量被改变
        })
    ],
    // 解析
    resolve: {
        // 路径别名
        alias: {
            // 以前你可能这样引用 import { Nav } from '../../components'
            // 现在你可以这样引用 import { Nav } from 'lib/components'
            lib: path.resolve(__dirname, 'app/libs'),
            model: path.resolve(__dirname, 'app/spa/model'),
            template: path.resolve(__dirname, 'app/spa/template'),
            style: path.resolve(__dirname, 'app/spa/style'),
            controller: path.resolve(__dirname, 'app/spa/controller')
        }
    }
}
