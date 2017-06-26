const Table = require('cli-table2');

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

module.exports = {
  daysAgo: daysAgo,
  list: list,
  vertTable: vertTable
}
