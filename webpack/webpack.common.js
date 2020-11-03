const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const environment = (process.env.ENV || '').toLocaleLowerCase();

function getEnvironmentFile(env) {
  const baseFilename = 'environment';

  let envFile;
  switch (environment) {
    case 'prod':
      envFile = `${baseFilename}.prod.ts`;
      break;
    default:
      envFile = `${baseFilename}.ts`;
  }
  return path.resolve(__dirname, '..', 'src', 'environments', envFile);
}

module.exports = {
  entry: {
    app: './src/index.tsx'
  },
  output: {
    filename: '[name].[contentHash].bundle.js',
    path: path.resolve(__dirname, '..', 'dist')
  },
  module: {
    rules: [
      {
        test: /\.tsx?/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          transpileOnly: true
        }
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [
    new HtmlWebpackPlugin({template: './src/index.html'}),
    new webpack.NormalModuleReplacementPlugin(/environments\/environment/, getEnvironmentFile(environment))
  ]
};
