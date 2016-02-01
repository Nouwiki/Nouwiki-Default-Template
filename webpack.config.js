var ExtractTextPlugin = require("extract-text-webpack-plugin");
module.exports = {
  node: {
    fs: "empty"
  },
  entry: {
    "static": [
      './frontend/static/assets_src/css/style.css',
      './frontend/static/assets_src/css/content.css',
      './frontend/static/assets_src/css/normalize.css',
    ],
    "dynamic": [
      './frontend/dynamic/assets_src/js/ui.js',

      './frontend/static/assets_src/css/style.css',
      './frontend/static/assets_src/css/content.css',
      './frontend/static/assets_src/css/normalize.css',

      './frontend/dynamic/assets_src/css/prose-bright.css',
      './frontend/dynamic/assets_src/css/ui.css',
    ],
  },
  output: {
    filename: "./frontend/[name]/assets/js/template.ui.js"
  },
  module: {
    //noParse: [/autoit.js/],
    loaders: [
      { test: /\.js$/, loader: 'babel-loader' },
      { test: /\.scss$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader!sass-loader?sourceMap") },
      { test: /\.less$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader') }, // use ! to chain loaders
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') },
      { test: /\.(png|jpg)$/, loapackder: 'url-loader?limit=8192' }, // inline base64 URLs for <=8k images, direct URLs for the rest
      { test: /\.json$/, loader: "json" }
    ]
  },
  plugins: [
      new ExtractTextPlugin("./frontend/[name]/assets/css/template.ui.css")
  ]
};
