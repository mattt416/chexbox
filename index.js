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
  .option("-f, --status [status]", "filter by status")
  .option("-t, --tags <tags>", "filter by tags", utils.list)
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
  .option("-t, --tags <tags>", "add todo with specified tags", utils.list)
  .action(function(desc, options){
    if (options.tags === undefined) {
      options.tags = [];
    }
    todo.new(desc, options.tags)
  });

program
  .command('show <timestamp>')
  .description('show todo')
  .action(function(timestamp, options){
    todo.show(timestamp);
  });

program
  .command('edit <timestamp> <desc>')
  .description('edit todo')
  .option("-t, --tags <tags>", "update tags on specified todo", utils.list)
  .action(function(timestamp, desc, options){
    if (options.tags === undefined) {
      options.tags = [];
    }
    todo.edit(timestamp, desc, options.tags);
  });

program
  .command('done <timestamp>')
  .description('complete todo')
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
    console.log('here');
    program.outputHelp();
  });

if (process.argv.length < 3) {
  program.outputHelp();
} else {
  program.parse(process.argv);
}
