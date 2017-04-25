function daysAgo(timestamp) {
  // Date is in milliseconds, so we / 1000 to give us seconds
  return parseInt((new Date() - parseInt(timestamp)) / 1000 / 60 / 60 / 24);
}

function list(val) {
  return val.split(',');
}

module.exports = {
  daysAgo: daysAgo,
  list: list
}
