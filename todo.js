#!/usr/bin/env node

var PouchDB = require('pouchdb-node');
var program = require('commander');

var db = new PouchDB('todo');
var remoteCouch = false;

function add(desc) {
  var todo = {
    _id: Date.now().toString(),
    description: desc,
    status: 'pending'
  };

  db.put(todo, function callback(err, result) {
    if (!err) {
      console.log('The following todo has been added:');
      console.log(todo);
    }
  });
}

function edit(timestamp, desc) {
  db.get(timestamp, function(err, doc) {
    db.put({
      _id: timestamp,
      _rev: doc._rev,
      status: doc.status,
      description: desc
    }, function(err, response) {
      if (err) { return console.log(err); }
      console.log('The following todo has been updated:');
      console.log(doc);
    });
  });
}

function complete(timestamp) {
  db.get(timestamp, function(err, doc) {
    db.put({
      _id: timestamp,
      _rev: doc._rev,
      status: 'done',
      description: doc.description
    }, function(err, response) {
      if (err) { return console.log(err); }
      console.log('The following todo has been completed:');
      console.log(doc);
    });
  });
}

function rm(timestamp) {
  db.get(timestamp, function(err, doc) {
    if (err) { return console.log(err); }
    db.remove(doc, function(err, response) {
      if (err) { return console.log(err); }
      console.log('The following todo has been deleted:');
      console.log(doc);
    });
  })
}

function list(filter = 'all') {
  var i;

  console.log('Timestamp\tStatus\tDescription');

  db.allDocs({include_docs: true, descending: false}, function (err, doc) {
    for (i = 0; i < doc.rows.length; i++) {
      if (filter === 'all' || filter === doc.rows[i].doc.status) {
        console.log(doc.rows[i].doc._id + '\t' + doc.rows[i].doc.status + '\t' + doc.rows[i].doc.description);
      }
    }
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

    list(options.filter);
  });

program
  .command('add <desc>')
  .description('add todo')
  .action(function(desc, options){
    add(desc);
  });

program
  .command('edit <timestamp> <desc>')
  .description('edit todo')
  .action(function(timestamp, desc, options){
    edit(timestamp, desc);
  });

program
  .command('complete <timestamp>')
  .description('complete todo')
  .action(function(timestamp, options){
    complete(timestamp);
  });

program
  .command('rm <timestamp>')
  .description('delete todo')
  .action(function(timestamp, options){
    rm(timestamp);
  });


program.parse(process.argv);
