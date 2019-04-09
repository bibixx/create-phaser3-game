const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const baseConfig = require('../webpack/base');

module.exports = () => {
  const compiler = webpack(baseConfig);

  // eslint-disable-next-line no-new
  const server = new WebpackDevServer(compiler, {
    hot: true,
    inline: true,
    stats: { colors: true },
  });

  server.listen(8080, '127.0.0.1', () => {
    console.log('Starting server on http://localhost:8080');
  });
};
