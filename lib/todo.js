#!/usr/bin/env node

const os = require('os');

const PouchDB = require('pouchdb-node');
const chalk = require('chalk');
const program = require('commander');
const Table = require('cli-table2');

var utils = require('./utils')

var localDB = new PouchDB(os.homedir() + '/.chexbox');
var remoteDB = new PouchDB('http://localhost:5984/todo');

PouchDB.plugin(require('pouchdb-find'));

const headerColour = chalk.black.bgCyan;

function Todo() {
  this.new = function(desc, tags) {
    var todo = {
      _id: Date.now().toString(),
      description: desc,
      status: 'pending',
      tags: tags
    };

    localDB.put(todo, function callback(err, result) {
      var data = [];

      if (!err) {
        console.log(chalk.black.bgCyan('Added'));
        data.push(
          [ headerColour('ID'), todo._id ],
          [ headerColour('Description'), todo.description ],
          [ headerColour('Tags'), todo.tags.join(',') ]
        );
        console.log(utils.vertTable(data));
        syncDB();
      }
    });
  }

  this.edit = function(timestamp, desc, tags) {
    var update;

    localDB.get(timestamp, function(err, doc) {
      update = {
        _id: timestamp,
        _rev: doc._rev,
        status: doc.status,
        description: desc
      };

      if (tags.length > 0) {
        update.tags = tags;
      } else {
        update.tags = doc.tags;
      }

      localDB.put(update, function(err, response) {
        var data = [];

        if (err) { return console.log(err); }
        console.log(chalk.black.bgCyan('Updated'));
        data.push(
          [ headerColour('ID'), doc._id ],
          [ headerColour('Status'), doc.status ],
          [ headerColour('Description'), doc.description ],
          [ headerColour('Tags'), doc.tags.join(',') ]
        );
        console.log(utils.vertTable(data));
        syncDB();
      });
    });
  }

  this.complete = function(timestamp) {
    localDB.get(timestamp, function(err, doc) {
      localDB.put({
        _id: timestamp,
        _rev: doc._rev,
        status: 'done',
        tags: doc.tags,
        description: doc.description
      }, function(err, response) {
        var data = [];

        if (err) { return console.log(err); }
        console.log(chalk.black.bgCyan('Done'));
        data.push(
          [ headerColour('ID'), doc._id ],
          [ headerColour('Status'), doc.status ],
          [ headerColour('Description'), doc.description ],
          [ headerColour('Tags'), doc.tags.join(',') ]
        );
        console.log(utils.vertTable(data));
        syncDB();
      });
    });
  }

  this.rm = function(timestamp) {
    localDB.get(timestamp, function(err, doc) {
      if (err) { return console.log(err); }
      localDB.remove(doc, function(err, response) {
        var data = [];
        if (err) { return console.log(err); }
        console.log(chalk.black.bgCyan('Removed'));
        data.push(
          [ headerColour('ID'),  doc._id ],
          [ headerColour('Status'),  doc.status ],
          [ headerColour('Description'),  doc.description ],
          [ headerColour('Tags'),  doc.tags.join(',') ]
        );
        console.log(utils.vertTable(data));
        syncDB();
      });
    })
  }

  this.list = function(status = 'all', tags) {
    var query = {};

    if (status !== 'all') {
      query.status = { $eq: status }
    }

    if (tags.length > 0) {
      //query.tags = { $elemMatch: { $eq: 'home'} }
      query.tags = { $all: tags }
    }

    header = [
      headerColour('ID'),
      headerColour('Age'),
      headerColour('Status'),
      headerColour('Tags'),
      headerColour('Description')
    ]

    var table = new Table({
        head: (header),
        colWidths: [null, null, null, null, 80],
        wordWrap: true
    });

    localDB.find({
      selector: query
    }, function (err, result) {
      for (let i = 0; i < result.docs.length; i++) {
        let itemColour = chalk.white;

        if (result.docs[i].status === 'done') {
          itemColour = chalk.gray;
        }

        table.push(
          [ itemColour(result.docs[i]._id),
            itemColour(utils.daysAgo(result.docs[i]._id) + 'd'),
            itemColour(result.docs[i].status),
            itemColour(result.docs[i].tags.join(',')),
            itemColour(result.docs[i].description) ]
        );

      }
      console.log(table.toString());
      syncDB();
    });
  }
}

function syncDB() {
  localDB.sync(remoteDB).on('complete', function () {
    // yay, we're in sync!
  }).on('error', function (err) {
    // boo, we hit an error!
  });
}

module.exports = {
  Todo: Todo
}
