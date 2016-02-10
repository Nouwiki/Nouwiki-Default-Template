// need to add a post-css loader (css prefixer)
var ExtractTextPlugin = require("extract-text-webpack-plugin");
module.exports = {
  node: {
    fs: "empty"
  },
  entry: {
    "filesystem": [
      './assets_src/static/css/normalize.css',
      './assets_src/static/css/github-markdown.css',
      './assets_src/static/css/style.css'
    ],
    "static": [
      './assets_src/static/css/normalize.css',
      './assets_src/static/css/github-markdown.css',
      './assets_src/static/css/style.css'
    ],
    "dynamic": [
      './assets_src/static/css/normalize.css',
      './assets_src/static/css/github-markdown.css',
      './assets_src/static/css/style.css',

      './assets_src/dynamic/js/ui.js',
      './assets_src/dynamic/css/prose-bright.css',
      './assets_src/dynamic/css/ui.css'
    ],
  },
  output: {
    filename: "./assets/[name]/js/template.ui.js"
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader' },
      { test: /\.scss$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader!sass-loader?sourceMap") },
      { test: /\.less$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader') },
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') },
      { test: /\.json$/, loader: "json" }
    ]
  },
  plugins: [
      new ExtractTextPlugin("./assets/[name]/css/template.ui.css")
  ]
};
