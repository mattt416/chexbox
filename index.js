#!/usr/bin/env node

var program = require('commander');
var t = require('./lib/todo');
var utils = require('./lib/utils')

var todo = new t.Todo();

program
  .version('0.0.1')

program
  .command('list')
  .description('list todos')
  .option("-f, --status [status]", "...")
  .option("-t, --tags <tags>", "...", utils.list)
  .action(function(options){
    if (options.status === undefined) {
      options.status = 'pending';
    }
    if (options.tags === undefined) {
      options.tags = [];
    }

    todo.list(options.status, options.tags);
  });

program
  .command('new <desc>')
  .description('new todo')
  .option("-t, --tags <tags>", "...", utils.list)
  .action(function(desc, options){
    if (options.tags === undefined) {
      options.tags = [];
    }
    todo.new(desc, options.tags)
  });

program
  .command('edit <timestamp> <desc>')
  .description('edit todo')
  .option("-t, --tags <tags>", "...", utils.list)
  .action(function(timestamp, desc, options){
    if (options.tags === undefined) {
      options.tags = [];
    }
    todo.edit(timestamp, desc, options.tags);
  });

program
  .command('done <timestamp>')
  .description('done todo')
  .action(function(timestamp, options){
    todo.complete(timestamp);
  });

program
  .command('rm <timestamp>')
  .description('delete todo')
  .action(function(timestamp, options){
    todo.rm(timestamp);
  });

program
  .command('*', '', {noHelp: true, isDefault: true})
  .action(function(){
    program.outputHelp();
  });

program.parse(process.argv);
