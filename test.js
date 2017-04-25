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
