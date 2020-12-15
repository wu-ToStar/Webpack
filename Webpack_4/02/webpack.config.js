const { resolve } = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsWebpackPlugin = require("optimize-css-assets-webpack-plugin");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");
const webpack = require("webpack");
const AddAssetHtmlWebpackPlugin = require("add-asset-html-webpack-plugin");
const TerserWebpackPlugin = require('terser-webpack-plugin');

// process.env.NODE_ENV = "development";

// 复用loader
const commonCssLoader = [
  // 创建style标签，将样式放入
  // 'style-loader',
  // 这个loader取代style-loader。作用：提取js中的css成单独文件
  MiniCssExtractPlugin.loader,
  // 将css文件整合到js文件中
  "css-loader",
  {
    loader: "postcss-loader",
    ident: "postcss",
    options: {
      postcssOptions: {
        //或者将插件引入写在单独的配置js中
        //config: './config/postcss.config.js',
        plugins: [require("postcss-preset-env")()],
      },
    },
  },
];

module.exports = {
  entry: "./src/js/index.js",
  // entry: {
  //   index: './src/js/index.js',
  //   test:'./src/js/test.js'
  // },
  output: {
    filename: "js/[name].[contenthash:10].js",
    path: resolve(__dirname, "build"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        enforce: "pre",
        loader: "eslint-loader",
        options: {
          fix: true,
        },
      },
      {
        // 以下loader只会匹配一个
        oneOf: [
          {
            test: /\.css$/,
            use: [...commonCssLoader],
          },

          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: [
              /* 
                开启多进程打包。 
                进程启动大概为600ms，进程通信也有开销。
                只有工作消耗时间比较长，才需要多进程打包
              */
              {
                loader: "thread-loader",
                options: {
                  workers: 2, // 进程2个
                },
              },
              {
                loader: "babel-loader",
                options: {
                  presets: [
                    [
                      "@babel/preset-env",
                      {
                        useBuiltIns: "usage",
                        corejs: {
                          version: 3,
                        },
                        targets: {
                          chrome: "60",
                          firefox: "60",
                        },
                      },
                    ],
                  ],
                  //开启Babel缓存
                  cacheDirectory: true,
                },
              },
            ],
          },
          {
            test: /\.(jpg|png|gif)/,
            loader: "url-loader",
            options: {
              limit: 8 * 1024,
              name: "[hash:10].[ext]",
              outputPath: "imgs",
              esModule: false,
            },
          },
          {
            test: /\.html$/,
            loader: "html-loader",
          },
          {
            exclude: /\.(js|css|less|html|jpg|png|gif)/,
            loader: "file-loader",
            options: {
              outputPath: "media",
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      minify: {
        collapseWhitespace: true,
        removeComments: true,
      },
    }),
    new MiniCssExtractPlugin({
      // 对输出的css文件进行重命名
      filename: "css/[name].[contenthash:10].css",
    }),
    new OptimizeCssAssetsWebpackPlugin(),
    new WorkboxWebpackPlugin.GenerateSW({
      /*
        1. 帮助serviceworker快速启动
        2. 删除旧的 serviceworker

        生成一个 serviceworker 配置文件~
      */
      clientsClaim: true,
      skipWaiting: true,
    }),
    // 告诉webpack哪些库不参与打包，同时使用时的名称也得变~
    new webpack.DllReferencePlugin({
      manifest: resolve(__dirname, "dll/manifest.json"),
    }),
    // 将某个文件打包输出去，并在html中自动引入该资源
    new AddAssetHtmlWebpackPlugin({
      filepath: resolve(__dirname, "dll/jquery.js"),
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: "all",
    },
    // 将当前模块的记录其他模块的hash单独打包为一个文件 runtime
    // 解决：修改a文件导致b文件的contenthash变化
    runtimeChunk: {
      name: (entrypoint) => `runtime-${entrypoint.name}`,
    },
    minimize: true,
    minimizer: [
      // 配置生产环境的压缩方案：js和css
      new TerserWebpackPlugin({
        
        // 开启缓存
        cache: true,
        // 开启多进程打包
        parallel: true,
        // 启动source-map
        sourceMap: true,
        
      }),
    ],
  },

  mode: "production",
  // externals: {
  //   // 拒绝jQuery被打包进来
  //   jquery: 'jQuery'
  // },
  resolve: {
    // 配置解析模块路径别名: 优点简写路径 缺点路径没有提示
    alias: {
      $css: resolve(__dirname, "src/css"),
    },
    // 配置省略文件路径的后缀名
    //extensions: [".js", ".json", ".jsx", ".css"],
    // 告诉 webpack 解析模块是去找哪个目录
    modules: [resolve(__dirname, "./node_modules"), "node_modules"],
  },
};
