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
  this.data = data;

  this.getColWidth = function(col) {
    var str = '';

    if (typeof col=== 'number') {
      // We convert to a string because we cannot get the length of an integer
      str = col.toString();
    } else if (chalk.hasColor(col)) {
      str = chalk.stripColor(col);
    } else {
      str = col;
    }

    return str.length;
  };

  this.calcColWidths = function() {
    var widths = [];
    for (let i=0; i<this.data[0].length; i++) {
      widths[i] = this.getColWidth(this.data[0][i]);
      for (let j=1; j<this.data.length; j++) {
        let width = this.getColWidth(this.data[j][i]);
        if (width > widths[i]) {
          widths[i] = width;
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

  this.genRowSeparator = function() {
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

  this.rowSeparator = this.genRowSeparator();

  this.printTable = function() {
    var table = '';

    for(let i=0; i<this.data.length; i++) {
      var row = chalk.dim('|');

      for(let j=0; j<this.data[0].length; j++) {
        //var padding = this.widths[j] - this.data[i][j].toString().length;
        var padding = this.widths[j] - this.getColWidth(data[i][j]);
        var field = this.data[i][j];
        
        if ((type === "horizontal" && i === 0) || (type === "vertical" && j === 0)) {
          field = chalk.cyan(field);
        }
        row += ` ${field}${this.genWhiteSpace(padding)}`;
        row += chalk.dim(' |');
      }
      row += '\n';
      table += this.rowSeparator;
      table += row;
    }
    table += this.rowSeparator;
    console.log(table);
  }
}

module.exports = {
  daysAgo: daysAgo,
  list: list,
  capitalize: capitalize,
  formatComments: formatComments,
  Table: Table,
};
