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

const projectPackageJson = require('../project/package.json');
const projectName = process.argv[2];
projectPackageJson.name = projectName;

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
  try {
    await runCommand('yarnpkg', ['--version'], { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

(async () => {
  const useYarn = await shouldUseYarn();

  const installCommand = useYarn ? 'yarn' : 'npm'

  console.log(`Creating a new React app in ${chalk.green(projectUrl)}`);
  console.log('');

  await ncp(
    path.resolve(__dirname, '../project'),
    projectUrl,
  )

  await writeFile(
    path.resolve(projectUrl, 'package.json'),
    JSON.stringify(projectPackageJson, null, 2)
  );

  console.log('Installing packages. This might take a couple of minutes.');
  console.log(`Installing ${chalk.cyan('phaser')}, and ${chalk.cyan('phaser-scripts')}...`);
  console.log('');

  await runCommand(
    installCommand,
    ['install'],
    { cwd: projectUrl, stdio: 'inherit' }
  );

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
  console.log(`Success! Created ${projectName} at ${projectUrl}`);
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
