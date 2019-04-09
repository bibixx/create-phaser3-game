const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const baseConfigFactory = require('../webpack/base');
const startLogger = require('../utils/startLogger');

module.exports = () => {
  process.env.NODE_ENV = 'development';
  const baseConfig = baseConfigFactory();
  const compiler = webpack(baseConfig);

  compiler.hooks.invalid.tap('invalid', (stats) => {
    startLogger.compiling(stats);
  });

  compiler.hooks.done.tap('done', async (stats) => {
    startLogger.done(stats);
  });

  // eslint-disable-next-line no-new
  const server = new WebpackDevServer(compiler, {
    hot: true,
    inline: true,
    stats: { colors: true },
    clientLogLevel: 'none',
    quiet: true,
    overlay: false,
  });

  server.listen(8080, '127.0.0.1', () => {
    startLogger.before();
  });
};
