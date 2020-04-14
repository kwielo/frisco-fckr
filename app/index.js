require('dotenv').config();
const _ = require('lodash');
const {refreshToken} = require('./services/auth');
const processDay = require('./services/process-day');
const print = require('./helpers/print');
const tomorrow = require('./helpers/tomorrow');

(async function () {

  const runningPeriod = Number(process.env.RUNNING_PERIOD || 30 * 60 * 1000);
  const checkAgainAfter = Number(process.env.CHECK_AGAIN || 500);
  const days = (process.env.DAYS || tomorrow()).split(',');
  const reservation = {
    session: null,
    runningPeriod,
    checkAgainAfter,
    days: (() => {
      let o = {};
      days.forEach((day, idx) => {
        o[day] = {
          priority: idx+1,
          tries: 0,
          lastTry: null,
          reservation: null
        }
      });
      return o;
    })(),
    isReserved: false,
    dayPriority: null,
    slot: null
  };

  await refreshToken();

  Promise
    .all(_.map(reservation.days, (opt, day) => (
      processDay(day, reservation, opt.priority)
    )))
    .then(res => print('x', res))
    .catch(err => print('e', err));

})();

