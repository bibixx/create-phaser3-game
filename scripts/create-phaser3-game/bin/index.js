#!/usr/bin/env node

const yargs = require('yargs');
const chalk = require('chalk');

// eslint-disable-next-line no-unused-expressions
yargs
  .scriptName(`Usage: create-phaser3-game ${chalk.green('<project-directory>')} [options]}`)
  .command('$0', '', (yargs) => {
    return yargs
      .option('custom-project', {
        describe: 'the git URL for custom project that will be copied into root'
      })
      .option('use-npm')
      .boolean('use-npm')
      .epilogue(`Only ${chalk.green('<project-directory>')} is required.
A custom ${chalk.cyan('--custom-project')} can be one of syntaxes:
  - ssh://[user@]host.xz[:port]/path/to/repo.git/
  - git://host.xz[:port]/path/to/repo.git/
  - http[s]://host.xz[:port]/path/to/repo.git/
  - ftp[s]://host.xz[:port]/path/to/repo.git/
  - https://git-scm.com/docs/git-clone#_git_urls_a_id_urls_a
`)
  }, require('./create.js'))
  .alias('h', 'help')
  .help()
  .argv;
