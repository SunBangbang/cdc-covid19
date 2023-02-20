/**
 * 配置参考: https://cli.vuejs.org/zh/config/
 */
const path = require('path')
const webpack = require('webpack')
const CompressionPlugin = require("compression-webpack-plugin")
function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src'))
      .set('tim', resolve('src/tim.js'))

    if (process.env.NODE_ENV === 'production') {
      config.plugin('compressionPlugin')
        .use(new CompressionPlugin({
          filename: '[path].gz[query]',
          algorithm: 'gzip',
          test: /\.(js|css|less|scss)$/, // 匹配文件名
          threshold: 10240, // 对超过10k的数据压缩
          minRatio: 0.8,
          deleteOriginalAssets: false // 不删除源文件
        }));
    }

    // const svgRule = config.module.rule('svg')
    // svgRule.uses.clear()
    // svgRule
    //   .test(/\.svg$/)
    //   .use('svg-sprite-loader')
    //   .loader('svg-sprite-loader')
  },
  css: {
    loaderOptions: {
      // postcss: {
      //   plugins: [
      //     // 把px单位换算成rem单位
      //     require("postcss-pxtorem")({
      //       rootValue: 140, // 换算的基数(设计图750的根字体为32)
      //       propList: ["*"], // 可以从px更改为rem的属性
      //       minPixelValue: 2, // 设置要替换的最小像素值
      //       selectorBlackList: ['login-', 'remember-', 'bottom-']
      //     })
      //   ]
      // },
      stylus: {
        'resolve url': true,
        // 自定义主题场景
        import: [path.resolve(__dirname, './src/assets/css/base.styl')]
      },
      // css: {},
      // postcss: {
      //   plugins: [
      //     require('postcss-px2rem')({remUnit: 192})
      //   ]
      // }
    }
  },
  // 默认打开eslint效验，如果需要关闭，设置成false即可
  lintOnSave: false,
  productionSourceMap: false,
  devServer: {
    open: true,
    port: 8001,
    overlay: {
      errors: true,
      warnings: true
    }
  },
  configureWebpack:{
    devtool: "source-map",
    plugins: [
      new webpack.ProvidePlugin({
        $: "jquery",
        JQUERY: "jquery",
        jQuery: "jquery",
        jquery: "jquery",
        "window.jQuery": "jquery"
      }),
    ]
  }
}
