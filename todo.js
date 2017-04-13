#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');

function ToDo(desc) {
  this.description = desc;
  this.created_at = Date.now();
  this.done = false;
}

function add(list, desc) {
  var todo = new ToDo(desc);

  list.push(todo);
  write(list);
  console.log('The following todo has been added:');
  console.log(todo);
}

function edit(list, timestamp, desc) {
  var i;
      found = null;

  for (i = 0; i < list.length; i++) {
    if (list[i] !== null && list[i]['created_at'] === parseInt(timestamp)) {
      list[i].description = desc;
      found = list[i];
      /*
        We break here so we can exit without inspecting any further entries,
        while also being able to use the current values of list and i below.
      */ 
      break;
    }
  }

  if (found !== null) {
    write(list);
    console.log('The following todo has been updated:');
    console.log(found);
  }
}

function complete(list, timestamp) {
  var i;
      found = null;
  
  for (i = 0; i < list.length; i++) {
    if (list[i] !== null && list[i]['created_at'] === parseInt(timestamp)) {
      found = list[i];
      list[i].done = true;
      /*
        We break here so we can exit without inspecting any further entries,
        while also being able to use the current values of list and i below.
      */ 
      break;
    }
  }

  if (found !== null) {
    write(list);
    console.log('The following todo has been completed:');
    console.log(found);
  }
}

function rm(list, timestamp) {
  var i;
      found = null;
  
  for (i = 0; i < list.length; i++) {
    if (list[i] !== null && list[i]['created_at'] === parseInt(timestamp)) {
      found = list[i];
      delete list[i];
      /*
        We break here so we can exit without inspecting any further entries,
        while also being able to use the current values of list and i below.
      */ 
      break;
    }
  }

  if (found !== null) {
    write(list);
    console.log('The following todo has been deleted:');
    console.log(found);
  }
}

function display(list) {
  var i;

  console.log('Timestamp\tDone\tDescription');

  for (i = 0; i < list.length; i++) {
    // TODO: Add ability to show completed todos
    //if (list[i] !== null && list[i].done === false) {
    if (list[i] !== null) {
      console.log(list[i].created_at + '\t' + list[i].done + '\t' + list[i].description);
    }
  };
}

function read(callback, filter = 'all') {
  var i,
      list,
      args = [];

  for (i = 1; i < arguments.length; i++) {
    args.push(arguments[i]);
  }

  fs.readFile('todo.json', 'utf8', function (err, data) {
    // file does not exist
    if (err && err.code === 'ENOENT') {
      write([]);
    }

    // undefined when file is empty
    if (data === undefined) {
      list = [];
    } else {
      list = JSON.parse(data);
    }

    for (i = 0; i < list.length; i++) {
      if (list[i] === null) {
        continue;
      }

      if (filter === 'done' && !list[i].done) {
        /*
          Deleting the entry doesn't seem to mark it as null, which happens
          when you delete an entry and then write the file.
        */
        //delete list[i]
        list[i] = null;
      } else if (filter === 'pending' && list[i].done) {
        list[i] = null;
      }
    }

    /*
     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator
     "Spread syntax" (...args) takes the array and expands it in place to be
     used as function arguments. Simply passing args would pass an array, which
     would need to be separated on the receiving end
    */
    callback(list, ...args);
  });
}

function write(list) {
  fs.writeFile('todo.json', JSON.stringify(list, null, '  '), 'utf-8', function (err) {
    // TODO: Add some error handling here
  });
}

function sort(list) {
  list.sort(function(a, b) {
    return a.created_at - b.created_at;
  });

  console.log(list);
}

program
  .version('0.0.1')

program
  .command('list')
  .description('list todos')
  .option("-f, --filter [status]", "...")
  .action(function(options){
    if (options.filter === "done" || options.filter === "all") {
      read(display, options.filter);
    } else {
      read(display, "pending");
    }
  });

program
  .command('add <desc>')
  .description('add todo')
  .action(function(desc, options){
    read(add, desc);
  });

program
  .command('edit <timestamp> <desc>')
  .description('edit todo')
  .action(function(timestamp, desc, options){
    read(edit, timestamp, desc);
  });

program
  .command('complete <timestamp>')
  .description('complete todo')
  .action(function(timestamp, options){
    read(complete, timestamp);
  });

program
  .command('rm <timestamp>')
  .description('delete todo')
  .action(function(timestamp, options){
    read(rm, timestamp);
  });

program.parse(process.argv);
