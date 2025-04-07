const path = require('path')
// resolve用来拼接绝对路径的方法
// const { resolve } = require('path');
// 引入打包 html 文件的插件 html-webpack-plugin
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const outDirName = 'dist'
const mode = 'production' // production development
module.exports = {
  // 模式  development  开发环境，production 生产环境
  // 生产环境下会自动压缩js代码
  // mode: 'production'
  mode: mode,
  // webpack配置
  // 入口起点文件
  entry: './src/js/index.js', // 入口文件
  // 输出
  output: {
    filename: 'bundle.js', // 输出文件名
    path: path.resolve(__dirname, outDirName), // 输出路径 __dirname nodejs的变量,代表当前文件的目录绝对路径
    library: 'XYFUTILS', // 为你的库指定一个全局变量名 前端调用的变量名称，你可以自己定义不需要和index.js导出名称相同
    libraryExport: 'default', //这个很重要，要不前端需要 xxx.default 才可以调用
    /**
     *
     * var / assign: 暴露为一个变量
     * this / window / global / commonjs：在对象上赋值暴露
     * commonjs2 / amd / umd：指定兼容特定的模块系统
     *
     * var 这是默认值，将库导出为一个全局变量。在浏览器环境中，库会被挂载到全局作用域。
     * assign 将库导出赋值给一个未定义的全局变量。如果该变量已经存在，则会覆盖它。
     * this 将库导出为 this 对象的一个属性。在浏览器环境中，this 指向 window；在 Node.js 环境中，this 指向 global。
     * window 将库导出为 window 对象的一个属性，仅适用于浏览器环境。
     * global 将库导出为 global 对象的一个属性，主要用于 Node.js 环境。
     * commonjs 将库导出为 CommonJS 模块，可在 Node.js 环境中使用 require 引入。
     * commonjs2 与 commonjs 类似，但导出的是 module.exports 而不是 exports，这是 Node.js 模块更常用的导出方式。
     * amd 将库导出为 AMD 模块，可在支持 AMD 规范的环境（如 RequireJS）中使用。
     * umd 通用模块定义，结合了 AMD、CommonJS 和全局变量的方式，使库可以在多种环境中使用。
     * system 将库导出为 SystemJS 模块，适用于支持 SystemJS 加载器的环境。
     * module 符合 ES 模块规范的格式。这意味着打包后的代码会使用 export 和 import 语句，适用于支持 ES 模块的现代环境，如现代浏览器（通过 <script type="module">）和 Node.js（通过 type: "module" 或 .mjs 文件扩展名）。
     */
    libraryTarget: 'umd',
    clean: true,
  },
  // loader的配置
  module: {
    rules: [
      // 详细loader配置
      //不同文件必须配置不同loader处理
      /*
      js兼容性处理:babel-loader @babel/core @babel/preset-env
      1.基本js兼容性处理 @babel/preset-env
      问题：只能转换基本语法，如promise不能转换
      2．全部js兼容性处理 --> @babel/polvfill
      问题：我只要解决部分兼容性问题，但是将所有兼容性代码全部引入，体积太大了~
      3. 需要做兼容性处理的就做：按需加载 --> core-js
      */
      {
        test: /.js$/, // 匹配所有的.js文件
        // 指定检查的目录，或者配置排除某些文件夹
        // include: [path.resolve(__dirname, 'src')],
        // 注意:只检查自己写的源代码,第三方的库是不用检查的,这里排除node_modules文件夹
        exclude: /node_modules/, // 排除node_modules目录
        use: {
          loader: 'babel-loader', // 使用Babel进行转译
          options: {
            presets: ['@babel/preset-env'], // 使用 Babel 预设环境
          },
        },
      },
    ],
  },
  // plugins的配置
  plugins: [
    // 详细的plugins配置
    // html-webpack-plugin
    // 功能:默认会创建一个空的HTML, 自动引入打包输出的所有资源(JS/CSS)
    // 需求:需要有结构的HTML文件
    new HtmlWebpackPlugin({
      // 复制../src/html/index.html'文件,并自动引入打包输出的所有资源(JS/CS5)
      template: './src/html/index.html', // 模板文件
      filename: 'index.html', //配置输出的文件名
      inject: 'head', //将js文件注入到模版的什么位置
      minify: {
        // 对html压缩
        keepClosingSlash: true, //在单例元素上保留尾部斜杠
        // removeRedundantAttributes: true,//当值与默认值匹配时移除属性
        // removeScriptTypeAttributes: true,//删除脚本类型的属性
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        collapseWhitespace: true, // 移除空格
        removeComments: true, // 移除注释
      },
    }),
    new CleanWebpackPlugin(), // 清理输出目录
  ],

  devServer: {
    static: {
      // contentBase: path.join(__dirname, outDirName), // 服务器内容的根目录
      directory: path.join(__dirname, outDirName), // 服务器内容的根目录
    },
    compress: true, // 启用gzip压缩
    port: 9000, // 服务器端口号
  },
}
