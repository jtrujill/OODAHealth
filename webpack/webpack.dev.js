const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  output: {
    filename: '[name].bundle.js'
  },
  devtool: 'eval-cheap-module-source-map',
  devServer: {
    host: '0.0.0.0',
    disableHostCheck: true,
    historyApiFallback: true,
    contentBase: path.join(__dirname, '..', 'src', 'assets')
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      eslint: {
        files: './src/**/*.{ts,tsx}'
      }
    }),
    new ForkTsCheckerNotifierWebpackPlugin({excludeWarnings: true})
  ]
});
