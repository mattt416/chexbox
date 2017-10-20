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
