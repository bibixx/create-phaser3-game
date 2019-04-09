const chalk = require('chalk');
const clearConsole = require('../utils/clearConsole');

const appName = 'test';
const urls = {
  localUrlForTerminal: 'http://localhost:3000/',
  lanUrlForTerminal: 'http://10.10.10.19:3000/',
};
const useYarn = true;
const isInteractive = process.stdout.isTTY;

module.exports = {
  before: () => {
    if (isInteractive) {
      clearConsole();
    }

    console.log(chalk.cyan('Starting the development server...'));
  },
  compiling: () => {
    if (isInteractive) {
      clearConsole();
    }

    console.log('Compiling...');
  },
  done: (stats) => {
    clearConsole();

    if (stats.hasErrors()) {
      const { errors } = stats.toJson({ all: false, warnings: false, errors: true });
      console.error(chalk.red('Failed to compile'));

      errors.forEach((error) => {
        const [fileName, ...errorMessage] = error.split('\n');

        console.log('');
        console.log(chalk.bgWhite.black(fileName));
        console.log(errorMessage.join('\n'));
      });

      return console.log('\n');
    }

    if (stats.hasWarnings()) {
      const { errors } = stats.toJson({ all: false, warnings: true, errors: false });
      console.error(chalk.red('Compiled with warnings'));

      errors.forEach((error) => {
        const [fileName, ...errorMessage] = error.split('\n');

        console.log('');
        console.log(chalk.bgWhite.black(fileName));
        console.log(errorMessage.join('\n'));
      });

      return console.log('\n');
    }

    console.log(chalk.green('Compiled successfully!'));

    console.log();
    console.log(`You can now view ${chalk.bold(appName)} in the browser.`);
    console.log();

    if (urls.lanUrlForTerminal) {
      console.log(
        `  ${chalk.bold('Local:')}            ${urls.localUrlForTerminal}`,
      );
      console.log(
        `  ${chalk.bold('On Your Network:')}  ${urls.lanUrlForTerminal}`,
      );
    } else {
      console.log(`  ${urls.localUrlForTerminal}`);
    }

    console.log();
    console.log('Note that the development build is not optimized.');
    console.log(
      'To create a production build, use '
        + `${chalk.cyan(`${useYarn ? 'yarn' : 'npm run'} build`)}.`,
    );
    return console.log();
  },
};
