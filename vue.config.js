const webpack = require("webpack");
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const productionGzipExtensions = ["js", "css"];

function getProdExternals() {
  // for lib target
  // return {
  //   lodash: "lodash",
  //   moment: "moment",
  // };

  // for app target
  return {
    // "vue":"Vue",
    // "vue-router":"VueRouter",
    // "vuex":"Vuex",
    lodash: "_",
    moment: "moment",
    // "element-ui":"ELEMENT"
  };
}

module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/vpages/" : "./",
  // lintOnSave: false,//在线excel添加
  configureWebpack: {
    // externals: process.env.NODE_ENV === 'production' ? getProdExternals() : {},
    externals: process.env.NODE_ENV === "production" ? getProdExternals() : {},

    plugins: [
      // Ignore all locale files of moment.js
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

      // 配置compression-webpack-plugin压缩
      new CompressionWebpackPlugin({
        algorithm: "gzip",
        test: new RegExp("\\.(" + productionGzipExtensions.join("|") + ")$"),
        threshold: 10240,
        minRatio: 0.8,
      }),
    ],
  },
  devServer: {
    port: 8080, // 端口号
    // host: "192.168.0.133",
    https: false, // https:{type:Boolean}
    open: true, //配置自动启动浏览器
    // proxy: 'http://localhost:4000' // 配置跨域处理,只有一个代理
    // proxy: {
    //   "/api": {
    //   target: "<url>",
    //     ws: true,
    //     changeOrigin: true
    //   },
    //   "/foo": {
    //     target: "<other_url>"
    //   }
    // } // 配置多个代理
  },
};
