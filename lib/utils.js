const Table = require('cli-table2');
const chalk = require('chalk');

function daysAgo(timestamp) {
  // Date is in milliseconds, so we / 1000 to give us seconds
  return parseInt((new Date() - parseInt(timestamp)) / 1000 / 60 / 60 / 24);
}

function list(val) {
  return val.split(',');
}

function vertTable(data = []) {
  /* A vertical table doesn't create headers in the left-most column, so we use
     a standard horizontal table but set the colour of the left-most values to
     a header-specific colour */
  var table = new Table();
  for (var i = 0; i < data.length; i++) {
    table.push([data[i][0], data[i][1]]);
  }
  return table.toString();
}

function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1);
}

function formatComments(comments) {
  var formatted  = '';

  for (var i=0; i< comments.length; i++) {
    formatted += `${i+1}. ${comments[i]}`;
    if (i < (comments.length - 1)) {
      formatted += '\n';
    }
  }

  return formatted;
}

function LolzTable(data) {
  // Why we're writing our own table library:
  // cli-table2 tables don't adjust to size of terminal window
  // tty-table -- can't remember, need to try again!
  this.data = data;

  this.calcColWidths = function() {
    var widths = [];
    for (let i=0; i<this.data[0].length; i++) {
      // We convert to a string because we cannot get the length of an integer
      widths[i] = this.data[0][i].toString().length;
      for (let j=1; j<this.data.length; j++) {
        if (this.data[j][i].length > widths[i]) {
          widths[i] = this.data[j][i].length;
        }
      }
    }
  
    return widths;
  }

  this.widths = this.calcColWidths();

  this.genWhiteSpace = function(padding) {
    var whiteSpace = '';
    for (let k=0; k<padding; k++) {
      whiteSpace += ' '; 
    }
    return whiteSpace;
  }

  this.genRowSeparator= function(len) {
    var separator = '+';
    for (let l=0; l<(len-2); l++) {
      separator += '-';  
    };
    separator += '+\n';
    return separator;
  }

  this.printTable = function() {
    var table = '';
    var separator = '';

    for(let i=0; i<this.data.length; i++) {
      var row = '| ';
      // NOTE(mattt): 
      // We can't just do a row.length at the end of the iteration because the
      // row may have raw colour codes in it which cause the row's length to be
      // reported incorrectly.
      var rowLength = 2;

      for(let j=0; j<this.data[0].length; j++) {
        var whiteSpace = '';
        var padding = this.widths[j] - this.data[i][j].toString().length;
        var field = this.data[i][j];

        rowLength += ` ${field}${this.genWhiteSpace(padding)}`.length;
        if (i === 0) {
          field = chalk.black.bgCyan(field);
        }
        row += ` ${field}${this.genWhiteSpace(padding)}`;
        row += ' |';
        rowLength += 2;
      }
      separator = this.genRowSeparator(rowLength);
      row += '\n';
      table += separator;
      table += row;
    }
    table += separator;
    console.log(table);
  }
}

module.exports = {
  daysAgo: daysAgo,
  list: list,
  vertTable: vertTable,
  capitalize: capitalize,
  formatComments: formatComments,
  LolzTable: LolzTable,
};
