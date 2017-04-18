#!/usr/bin/env node

var PouchDB = require('pouchdb-node');
var program = require('commander');

var localDB = new PouchDB('todo');
var remoteDB = new PouchDB('http://localhost:5984/todo');

function syncDB() {
  localDB.sync(remoteDB).on('complete', function () {
    // yay, we're in sync!
  }).on('error', function (err) {
    // boo, we hit an error!
  });
}

function newTodo(desc) {
  var todo = {
    _id: Date.now().toString(),
    description: desc,
    status: 'pending'
  };

  localDB.put(todo, function callback(err, result) {
    if (!err) {
      console.log('The following todo has been added:');
      console.log(todo);
      syncDB();
    }
  });
}

function editTodo(timestamp, desc) {
  localDB.get(timestamp, function(err, doc) {
    localDB.put({
      _id: timestamp,
      _rev: doc._rev,
      status: doc.status,
      description: desc
    }, function(err, response) {
      if (err) { return console.log(err); }
      console.log('The following todo has been updated:');
      console.log(doc);
      syncDB();
    });
  });
}

function completeTodo(timestamp) {
  localDB.get(timestamp, function(err, doc) {
    localDB.put({
      _id: timestamp,
      _rev: doc._rev,
      status: 'done',
      description: doc.description
    }, function(err, response) {
      if (err) { return console.log(err); }
      console.log('The following todo has been completed:');
      console.log(doc);
      syncDB();
    });
  });
}

function rmTodo(timestamp) {
  localDB.get(timestamp, function(err, doc) {
    if (err) { return console.log(err); }
    localDB.remove(doc, function(err, response) {
      if (err) { return console.log(err); }
      console.log('The following todo has been deleted:');
      console.log(doc);
      syncDB();
    });
  })
}

function listTodos(filter = 'all') {
  var i;

  console.log('Timestamp\tStatus\tDescription');

  localDB.allDocs({include_docs: true, descending: false}, function (err, doc) {
    for (i = 0; i < doc.rows.length; i++) {
      if (filter === 'all' || filter === doc.rows[i].doc.status) {
        console.log(doc.rows[i].doc._id + '\t' + doc.rows[i].doc.status + '\t' + doc.rows[i].doc.description);
      }
    }
    syncDB();
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
    if (options.filter === undefined) {
      options.filter = 'pending';
    }

    listTodos(options.filter);
  });

program
  .command('new <desc>')
  .description('new todo')
  .action(function(desc, options){
    newTodo(desc);
  });

program
  .command('edit <timestamp> <desc>')
  .description('edit todo')
  .action(function(timestamp, desc, options){
    editTodo(timestamp, desc);
  });

program
  .command('done <timestamp>')
  .description('done todo')
  .action(function(timestamp, options){
    completeTodo(timestamp);
  });

program
  .command('rm <timestamp>')
  .description('delete todo')
  .action(function(timestamp, options){
    rmTodo(timestamp);
  });

program.parse(process.argv);
