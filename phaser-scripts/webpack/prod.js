const merge = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const base = require('./base');
const { publicPath } = require('../utils/paths');

module.exports = merge(base, {
  mode: 'production',
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js',
    path: publicPath,
  },
  devtool: false,
  performance: {
    maxEntrypointSize: 900000,
    maxAssetSize: 900000,
    hints: false,
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false,
          },
        },
      }),
    ],
  },
});
