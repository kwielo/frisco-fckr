const _ = require('lodash');
const Table = require('cli-table');
const hrDate = require('./hr-date');

module.exports = function summary(reservation) {
  let startedAt = Date.now() - Math.floor(process.uptime()*1000);
  let info = new Table();
  info.push(
    {'started at': hrDate(startedAt)},
    {'will finish at': hrDate(startedAt + reservation.runningPeriod)},
    {login: process.env.USERNAME},
    {'check again period': reservation.checkAgainAfter}
  );
  let t = new Table({
    head: [
      'day',
      'priority',
      'tries',
      'last try',
      'reservation'
    ],
    colWidths: [12, 10, 7, 30, 45]
  });
  _.forEach(reservation.days, function(d, day) {
    t.push([
      day,
      d.priority,
      d.tries || '0',
      d.lastTry || 'n/a',
      d.reservation || 'n/a'
    ], );
  });
  try {
    console.clear();
    console.log(info.toString());
    console.log(t.toString());
  } catch (e) {
    console.error(e);
  }
}