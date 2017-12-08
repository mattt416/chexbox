//const Table = require('cli-table2');
const chalk = require('chalk');

function daysAgo(timestamp) {
  // Date is in milliseconds, so we / 1000 to give us seconds
  return parseInt((new Date() - parseInt(timestamp)) / 1000 / 60 / 60 / 24);
}

function list(val) {
  return val.split(',');
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

  console.log(formatted);

  return formatted;
}

function Table(data, type="horizontal") {
  // Why we're writing our own table library:
  // cli-table2 tables don't adjust to size of terminal window
  // tty-table -- can't remember, need to try again!
  this.tableType = type;
  this.data = data;
  this.heights = this.calcRowHeights();
  this.widths = this.calcColWidths();
  this.rowSeparator = this.genRowSeparator();
}

Table.prototype.calcColWidths = function() {
  var widths = [];
  for (let i=0; i<this.data[0].length; i++) {
    widths[i] = this.getColWidth(this.data[0][i]);
    for (let j=1; j<this.data.length; j++) {
      for (let k=0; k<this.heights[j]; k++) {
        let field = this.splitByNewline(this.data[j][i]);
        if (field[k]) {
          let width = this.getColWidth(field[k]);
          if (width > widths[i]) {
            widths[i] = width;
          }
        }
      }
    }
  }
  return widths;
}

Table.prototype.calcRowHeights = function() {
  var heights = [];
  for (let i=0; i<this.data.length; i++) {
    heights[i] = this.splitByNewline(this.data[i][0]).length;
    for (let j=1; j<this.data[0].length; j++) {
      let height = this.splitByNewline(this.data[i][j]).length;
      if (height > heights[i]) {
        heights[i] = height;
      }
    }
  }
  return heights;
}

Table.prototype.genRowSeparator = function() {
  var separator = '+';
  for (let i=0; i<this.widths.length; i++) {
    // +2 to account for the spacing on each end of the field
    for (let j=0; j<(this.widths[i]+2); j++) {
      separator += '-';
    };
    separator += '+';
  };
  separator += '\n';
  return chalk.dim(separator);
}

Table.prototype.genWhiteSpace = function(padding) {
  var whiteSpace = '';
  for (let k=0; k<padding; k++) {
    whiteSpace += ' ';
  }
  return whiteSpace;
}

Table.prototype.getColWidth = function(field) {
  var str = '';

  if (typeof field=== 'number') {
    // We convert to a string because we cannot get the length of an integer
    str = field.toString();
  } else if (chalk.hasColor(field)) {
    str = chalk.stripColor(field);
  } else {
    str = field;
  }

  return str.length;
};

Table.prototype.printTable = function() {
  var table = this.rowSeparator;

  for(let i=0; i<this.data.length; i++) {
    for(let k=0; k<this.heights[i]; k++) {
      var tableRow = chalk.dim('|');

      for(let j=0; j<this.data[0].length; j++) {
        var field = this.splitByNewline(this.data[i][j]);

        if (field[k]) {
          var padding = this.widths[j] - this.getColWidth(field[k]);
          var fieldRow = field[k];
        } else {
          var fieldRow = '';
          var padding = this.widths[j];
        }

        if ((this.tableType === "horizontal" && i === 0) || (this.tableType === "vertical" && j === 0)) {
          fieldRow = chalk.cyan(fieldRow);
        }
        tableRow += ` ${fieldRow}${this.genWhiteSpace(padding)}`;
        tableRow += chalk.dim(' |');
      }
      tableRow += '\n';
      table += tableRow;
    }
    table += this.rowSeparator;
  }
  console.log(table);
}

Table.prototype.splitByNewline = function(field) {
  return field.toString().split('\n');
}

module.exports = {
  daysAgo: daysAgo,
  list: list,
  capitalize: capitalize,
  formatComments: formatComments,
  Table: Table,
};
