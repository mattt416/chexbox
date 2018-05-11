var assert = require('assert');
var utils = require('./lib/utils');

describe('daysAgo', function() {
  it('should return a integer representing days since timestamp', function() {
    assert.equal(utils.daysAgo(Date.now().toString()), 0);
  });
});

describe('list', function() {
  it('should return array containing elements split by comma', function() {
    assert.deepEqual(utils.list('1,2,3'), [ '1', '2', '3' ]);
  });
});

describe('formatComments', function() {
  it('should return a formatted string containing a list of comments', function() {
    assert.equal(utils.formatComments([1,2,3]), '1. 1\n2. 2\n3. 3');
  });
});

describe('capitalize', function() {
  it('should return the word with the leading letter capitalized', function() {
    assert.equal(utils.capitalize('testing'), 'Testing');
  });
});

describe('Table.prototype.splitByNewline', function() {
  it('should split a string by newline', function() {
    var table = new utils.Table([[1,2,3],[4,5,6]]);
    assert.deepEqual(table.splitByNewline('test\ntest'), ['test', 'test']);
  });
});

describe('Table.prototype.calcColWidths', function() {
  it('should return an array representing the max width of each column', function() {
    var data = [
      [ 'header1', 'header2' ],
      [ 'value1', 'value2' ],
      [ 'value3\nvalue4.1 value4.2', 'value5' ],
    ];
    var table = new utils.Table(data);
    assert.deepEqual(table.calcColWidths(), [17, 7]);
  });
});

describe('Table.prototype.calcRowHeights', function() {
  it('should return an array representing the # of lines for each row', function() {
    var data = [
      [ 'header1', 'header2' ],
      [ 'value1', 'value2' ],
      [ 'value3\nvalue4', 'value5' ],
    ];
    var table = new utils.Table(data);
    assert.deepEqual(table.calcRowHeights(), [1, 1, 2]);
  });
});

describe('Table.prototype.getFieldWidth', function() {
  it('should return the width of the supplied field', function() {
    var data = [
      [ 'header1', 'header2' ],
      [ 'value1', 'value2' ],
      [ 'value3\nvalue4', 'value5' ],
    ];
    var table = new utils.Table(data);
    assert.equal(table.getFieldWidth(data[2][0]), data[2][0].length);
  });
});

describe('Table.prototype.genRowSeparator', function() {
  it('should return the row separator', function() {
    var data = [
      [ 'header1', 'header2' ],
      [ 'value1', 'value2' ],
      [ 'value3 value4', 'value5' ],
    ];
    var table = new utils.Table(data);
    var separator = '\u001b[2m+---------------+---------+\n\u001b[22m';
    assert.equal(table.genRowSeparator(), separator);
  });
});

describe('Table.prototype.genWhiteSpace', function() {
  it('should return whitespace for the # of padding supplied', function() {
    var data = [
      [ 'header1', 'header2' ],
      [ 'value1', 'value2' ],
      [ 'value3 value4', 'value5' ],
    ];
    var table = new utils.Table(data);
    assert.equal(table.genWhiteSpace(4), '    ');
  });
});

// TODO(mattt): We need to have a function that builds the table, and then
//              returns it as a string so we can validate that it's correct.
//describe('Table.prototype.printTable()', function() {
//  it('should return whitespace for the # of padding supplied', function() {
//    var data = [
//      [ 'header1', 'header2' ],
//      [ 'value1', 'value2' ],
//      [ 'value3 value4', 'value5' ],
//    ];
//    var table = new utils.Table(data);
//    assert.equal(table.printTable(), '');
//  });
//});
