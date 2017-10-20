#!/usr/bin/env node

const os = require('os');

const PouchDB = require('pouchdb-node');
const chalk = require('chalk');
const Table = require('cli-table2');

var utils = require('./utils');

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
      tags: tags,
      comments: []
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
  };

  this.edit = function(timestamp, desc, tags) {
    localDB.get(timestamp, function(err, doc) {
      var update = {
        _id: timestamp,
        _rev: doc._rev,
        status: doc.status,
        comments: doc.comments,
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
  };

  this.done = function(timestamp) {
    this.updateStatus(timestamp, 'done');
  };

  this.pending = function(timestamp) {
    this.updateStatus(timestamp, 'pending');
  };

  this.updateStatus = function(timestamp, status) {
    localDB.get(timestamp, function(err, doc) {
      var update = {
        _id: timestamp,
        _rev: doc._rev,
        status: status,
        tags: doc.tags,
        comments: doc.tags,
        description: doc.description
      };

      localDB.put(update, function(err, response) {
        var data = [];

        if (err) { return console.log(err); }
        console.log(chalk.black.bgCyan(utils.capitalize(status)));
        data.push(
          [ headerColour('ID'), doc._id ],
          [ headerColour('Status'), status ],
          [ headerColour('Description'), doc.description ],
          [ headerColour('Tags'), doc.tags.join(',') ]
        );
        console.log(utils.vertTable(data));
        syncDB();
      });
    });
  };

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
    });
  };

  this.list = function(status = 'all', tags) {
    var query = {};

    if (status !== 'all') {
      query.status = { $eq: status };
    }

    if (tags.length > 0) {
      //query.tags = { $elemMatch: { $eq: 'home'} }
      query.tags = { $all: tags };
    }

    const header = [
      headerColour('ID'),
      headerColour('Age'),
      headerColour('Status'),
      headerColour('Tags'),
      headerColour('Description'),
      headerColour('Comments')
    ];

    var table = new Table({
      head: (header),
      colWidths: [null, null, null, null, 80, null],
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
            itemColour(result.docs[i].description),
            itemColour(result.docs[i].comments.length) ]
        );

      }
      console.log(table.toString());
      syncDB();
    });
  };

  this.show = function(timestamp) {
    localDB.get(timestamp, function(err, doc) {
      var data = [];

      if (err) { return console.log(err); }
      console.log(chalk.black.bgCyan('Show'));
      data.push(
        [ headerColour('ID'), doc._id ],
        [ headerColour('Status'), doc.status ],
        [ headerColour('Description'), doc.description ],
        [ headerColour('Tags'), doc.tags.join(',') ],
        [ headerColour('Comments'), utils.formatComments(doc.comments) ]
      );
      console.log(utils.vertTable(data));
      syncDB();
    });
  };

  this.comment = function(timestamp, comment) {
    localDB.get(timestamp, function(err, doc) {
      // We can't do doc.comments.push(comment) in update below as
      // array.push(item) returns array.length, and not array.  This
      // results in update.comments being set to doc.comments.length,
      // which is not what we want.
      var comments = doc.comments;
      var update = {
        _id: timestamp,
        _rev: doc._rev,
        status: doc.status,
        tags: doc.tags,
        description: doc.description
      };

      comments.push(comment);
      update.comments = comments;

      localDB.put(update, function(err, response) {
        var data = [];

        if (err) { return console.log(err); }
        console.log(chalk.black.bgCyan('Comment Added'));
        data.push(
          [ headerColour('ID'), doc._id ],
          [ headerColour('Status'), doc.status ],
          [ headerColour('Description'), doc.description ],
          [ headerColour('Tags'), doc.tags.join(',') ],
          [ headerColour('Comments'), utils.formatComments(comments) ]
        );
        console.log(utils.vertTable(data));
        syncDB();
      });
    });
  };
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
};
