#!/usr/bin/env node

var PouchDB = require('pouchdb-node');
var program = require('commander');

var localDB = new PouchDB('todo');
var remoteDB = new PouchDB('http://localhost:5984/todo');

function list(val) {
  return val.split(',');
}

function syncDB() {
  localDB.sync(remoteDB).on('complete', function () {
    // yay, we're in sync!
  }).on('error', function (err) {
    // boo, we hit an error!
  });
}

function newTodo(desc, tags) {
  var todo = {
    _id: Date.now().toString(),
    description: desc,
    status: 'pending',
    tags: tags
  };

  localDB.put(todo, function callback(err, result) {
    if (!err) {
      console.log('The following todo has been added:');
      console.log(todo);
      syncDB();
    }
  });
}

function editTodo(timestamp, desc, tags) {
  console.log(tags);
  localDB.get(timestamp, function(err, doc) {
    localDB.put({
      _id: timestamp,
      _rev: doc._rev,
      status: doc.status,
      description: desc,
      tags: tags // We should only update tags if they're passed in
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

function listTodos(status = 'all', tags) {
  var i;
  var j;
  var found;

  console.log('Timestamp\tStatus\tTags\tDescription');

  localDB.allDocs({include_docs: true, descending: false}, function (err, doc) {
    for (i = 0; i < doc.rows.length; i++) {
      found = false;

      /*
        This is to deal w/ legacy todos, any new document created going
        forward will have this property set.
      */
      if (!doc.rows[i].doc.hasOwnProperty('tags')) {
        doc.rows[i].doc.tags = [];
      }

      // TODO: Figure out how to filter these out via a PouchDB query
      if (status === 'all' || status === doc.rows[i].doc.status) {
        if (tags.length === 0) {
          found = true;
        } else if (tags.length > 0) {
          for (j = 0; j < tags.length; j++) {
            if (doc.rows[i].doc.tags.indexOf(tags[j]) !== -1) {
              found = true;
              break;
            }
          }
        }
      }

      if (found === true) {
        console.log(doc.rows[i].doc._id + '\t' +
                    doc.rows[i].doc.status + '\t' +
                    doc.rows[i].doc.tags.toString() + '\t' +
                    doc.rows[i].doc.description);
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
  .option("-f, --status [status]", "...")
  .option("-t, --tags <tags>", "...", list)
  .action(function(options){
    if (options.status === undefined) {
      options.status = 'pending';
    }
    if (options.tags === undefined) {
      options.tags = [];
    }

    listTodos(options.status, options.tags);
  });

program
  .command('new <desc>')
  .description('new todo')
  .option("-t, --tags <tags>", "...", list)
  .action(function(desc, options){
    if (options.tags === undefined) {
      options.tags = [];
    }
    newTodo(desc, options.tags);
  });

program
  .command('edit <timestamp> <desc>')
  .description('edit todo')
  .option("-t, --tags <tags>", "...", list)
  .action(function(timestamp, desc, options){
    if (options.tags === undefined) {
      options.tags = [];
    }
    editTodo(timestamp, desc, options.tags);
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
