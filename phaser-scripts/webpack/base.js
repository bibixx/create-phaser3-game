const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const root = process.cwd();

module.exports = () => ({
  mode: 'development',
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: require.resolve('babel-loader'),
        },
      },
      ...[process.env.NODE_ENV !== 'production' && {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [require.resolve('style-loader'), require.resolve('css-loader')],
      }].filter(isTruthy => isTruthy),
      {
        test: [/\.vert$/, /\.frag$/],
        use: {
          loader: require.resolve('raw-loader'),
        },
      },
      {
        test: /\.(gif|png|jpe?g|svg|xml|mp3|wav)$/i,
        use: {
          loader: require.resolve('file-loader'),
          options: {
            name: 'static/assets/[name].[contenthash:8].[ext]',
          },
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      CANVAS_RENDERER: JSON.stringify(true),
      WEBGL_RENDERER: JSON.stringify(true),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(root, './index.html'),
    }),
  ],
});
