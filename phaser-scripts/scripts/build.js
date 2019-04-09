const webpack = require('webpack');
const prodConfig = require('../webpack/prod');
const buildLogger = require('../utils/buildLogger');

module.exports = () => {
  const compiler = webpack(prodConfig);
  buildLogger.before();

  compiler.run((err, stats) => {
    if (err || stats.hasErrors()) {
      buildLogger.error({ stats });
      return process.exit(1);
    }

    return buildLogger.after({ errors: err, stats });
  });
};
