#!/usr/bin/env node

var os = require('os');

var PouchDB = require('pouchdb-node');
var chalk = require('chalk');
var program = require('commander');

var utils = require('./utils')

var localDB = new PouchDB(os.homedir() + '/.chexbox');
var remoteDB = new PouchDB('http://localhost:5984/todo');

PouchDB.plugin(require('pouchdb-find'));

function Todo() {
  this.new = function(desc, tags) {
    var todo = {
      _id: Date.now().toString(),
      description: desc,
      status: 'pending',
      tags: tags
    };

    localDB.put(todo, function callback(err, result) {
      if (!err) {
        console.log(chalk.black.bgCyan('Added'));
        console.log('ID: ' + todo._id);
        console.log('Description: ' + todo.description);
        console.log('Tags: ' + todo.tags);
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
        if (err) { return console.log(err); }
        console.log(chalk.black.bgCyan('Updated'));
        console.log('ID: ' + doc._id);
        console.log('Status: ' + doc.status);
        console.log('Description: ' + doc.description);
        console.log('Tags: ' +  doc.tags);
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
        if (err) { return console.log(err); }
        console.log(chalk.black.bgCyan('Done'));
        console.log('ID: ' + doc._id);
        console.log('Status: ' + doc.status);
        console.log('Description: ' + doc.description);
        console.log('Tags: ' +  doc.tags);
        syncDB();
      });
    });
  }

  this.rm = function(timestamp) {
    localDB.get(timestamp, function(err, doc) {
      if (err) { return console.log(err); }
      localDB.remove(doc, function(err, response) {
        if (err) { return console.log(err); }
        console.log(chalk.black.bgCyan('Removed'));
        console.log('ID: ' + doc._id);
        console.log('Status: ' + doc.status);
        console.log('Description: ' + doc.description);
        console.log('Tags: ' + doc.tags);
        syncDB();
      });
    })
  }

  this.list = function(status = 'all', tags) {
    var i;
    var j;
    var found;
    var colour;
    var query = {};

    if (status !== 'all') {
      query.status = { $eq: status }
    }

    if (tags.length > 0) {
      //query.tags = { $elemMatch: { $eq: 'home'} }
      query.tags = { $all: tags }
    }

    console.log(chalk.black.bgCyan('ID' + '\t\t' +
                                   'Age' + '\t' +
                                   'Status' + '\t' +
                                   'Tags' + '\t' +
                                   'Description'))

    localDB.find({
      selector: query
    }, function (err, result) {
      for (i = 0; i < result.docs.length; i++) {
        colour = chalk.white;

        if (result.docs[i].status === 'done') {
          colour = chalk.gray;
        }

        console.log(colour(result.docs[i]._id + '\t' +
                           utils.daysAgo(result.docs[i]._id) + 'd' + '\t' +
                           result.docs[i].status + '\t' +
                           result.docs[i].tags + '\t' +
                           result.docs[i].description));
      }
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
