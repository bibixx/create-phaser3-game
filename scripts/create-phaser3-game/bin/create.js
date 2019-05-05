#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { spawn } = require('child_process');

const writeFile = (p, d, o) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(p, d, o, (err,) => {
      if (err) {
        return reject(err);
      }

      return resolve();
    });
  })
};

const readFile = (p) => {
  return new Promise((resolve, reject) => {
    fs.readFile(p, (err, data) => {
      if (err) {
        return reject(err);
      }

      return resolve(data.toString('utf8'));
    });
  })
};

const exists = (p) => {
  return new Promise((resolve) => {
    fs.exists(p, (data) => {
      return resolve(data);
    });
  })
};

const ncp = (i, o) => {
  return new Promise((resolve, reject) => {
    require('ncp').ncp(i, o, (err) => {
      if (err) {
        return reject(err);
      }

      return resolve()
    });
  })
};

module.exports = (argv) => {
  const projectPackageJson = require('../project/package.json');
  const projectName = argv._[0];
  projectPackageJson.name = projectName;

  if (!projectName) {
    console.log('Please specify the project directory:');
    console.log(`  ${chalk.cyan('create-phaser3-game')} ${chalk.green('<project-directory>')}`);
    console.log('');
    console.log('For example:');
    console.log(`  ${chalk.cyan('create-phaser3-game')} ${chalk.green('my-phaser-game')}`);

    return process.exit(1);
  }

  const projectUrl = path.resolve(process.cwd(), projectName);

  const runCommand = (command, args, options) => {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, options);

      child.on('close', code => {
        if (code !== 0) {
          reject({
            command: `${command} ${args.join(' ')}`,
            code,
          });
          return;
        }
        resolve();
      });

      child.on('error', err => {
        reject({
          command: `${command} ${args.join(' ')}`,
          err
        });
      });
    });
  }

  async function shouldUseYarn() {
    if (argv.useNpm) {
      return false;
    }

    try {
      await runCommand('yarnpkg', ['--version'], { stdio: 'ignore' });
      return true;
    } catch (e) {
      return false;
    }
  }

  (async () => {
    const useYarn = await shouldUseYarn();
    let customPackageJson;

    const installCommand = useYarn ? 'yarn' : 'npm'

    const { customProject } = argv;

    if (await exists(projectUrl)) {
      console.log(`The directory ${chalk.green(projectName)} already exists`);
      console.log(`Either try using a new directory name, or remove the ${chalk.green(projectName)} folder.`);

      return process.exit(1);
    }

    console.log(`Creating a new Phaser 3 game in ${chalk.green(projectUrl)}`);

    if (customProject) {
      try {
        console.log(`Cloning project files from ${chalk.green(customProject)}`);
        console.log('');

        await runCommand(
          'git',
          ['clone', customProject, '--depth=1', projectName],
          { cwd: process.cwd(), stdio: 'inherit' }
        );

        try {
          customPackageJson = JSON.parse(await readFile(`${projectUrl}/package.json`));
        } catch (error) {
          if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) {
            console.error(error);

            return process.exit(1);
          }

          customPackageJson = null;
        }
      } catch (error) {
        return process.exit(1);
      }
    } else {
      console.log('');

      await ncp(
        path.resolve(__dirname, '../project'),
        projectUrl,
      );

      await writeFile(
        path.resolve(projectUrl, 'package.json'),
        JSON.stringify(projectPackageJson, null, 2)
      );
    }

    console.log('Installing packages. This might take a couple of minutes.');
    let andNDeps = '';
    if (customPackageJson && customPackageJson.dependencies) {
      const depsN = Object.keys(customPackageJson.dependencies).length;
      andNDeps = depsN > 0 ? ` and ${depsN} more ${depsN === 1 ? 'dependency' : 'dependencies'}` : '';
      console.log(`Installing ${chalk.cyan('phaser')}, ${chalk.cyan('phaser-scripts')}${andNDeps}...`);
    } else {
      console.log(`Installing ${chalk.cyan('phaser')}, and ${chalk.cyan('phaser-scripts')}${andNDeps}...`);
    }

    console.log('');

    if (customProject) {
      await runCommand(
        installCommand,
        [useYarn ? 'add' : 'install', 'phaser', 'phaser-scripts', ...(useYarn ? [] : ['-S'])],
        { cwd: projectUrl, stdio: 'inherit' }
      );

      try {
        if (customPackageJson) {
          let changed = false;

          if (!customPackageJson.scripts.start) {
            customPackageJson.scripts.start = "phaser-scripts start";
            changed = true;
          }

          if (!customPackageJson.scripts.build) {
            customPackageJson.scripts.build = "phaser-scripts build";
            changed = true;
          }

          if (changed) {
            await writeFile(
              path.resolve(projectUrl, 'package.json'),
              JSON.stringify(customPackageJson, null, 2)
            );
          }
        }
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.error(error);

          return process.exit(1);
        }
      }
    } else {
      await runCommand(
        installCommand,
        ['install'],
        { cwd: projectUrl, stdio: 'inherit' }
      );
    }

    try {
      await runCommand(
        'git',
        ['init'],
        { cwd: projectUrl, stdio: 'ignore' }
      );

      await runCommand(
        'git',
        ['add', '-A'],
        { cwd: projectUrl, stdio: 'ignore' }
      );

      await runCommand(
        'git',
        ['commit', '-m', 'Initial commit from Create Phaser 3 Game'],
        { cwd: projectUrl, stdio: 'ignore' }
      );

      console.log('');
      console.log('Initialized a git repository.');
    } catch (error) {}

    console.log('');
    console.log(`Success! Created ${chalk.cyan(projectName)} at ${chalk.green(projectUrl)}`);
    console.log('Inside that directory, you can run several commands:');

    console.log('');
    console.log(`  ${chalk.cyan(installCommand + ' start')}`);
    console.log('    Starts the development server.');
    console.log('');
    console.log(`  ${chalk.cyan(installCommand + ' build')}`);
    console.log('    Bundles the app into static files for production.');
    console.log('');
    console.log('We suggest that you begin by typing:');
    console.log('');
    console.log(`  ${chalk.cyan('cd')} ${projectName}`);
    console.log(`  ${chalk.cyan(installCommand + ' start')}`);
    console.log('');
    console.log('Happy hacking!');
  })();
}
