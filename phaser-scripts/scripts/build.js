const webpack = require('webpack');
const prodConfig = require('../webpack/prod');

module.exports = () => {
  const compiler = webpack(prodConfig);

  compiler.run((err, stats) => {
    if (err || stats.hasErrors) {
      const errors = stats.toJson({ all: false, warnings: true, errors: true });

      return errors;
    }
  });
};
