const _ = require('lodash');
const session = require('../session')
const print = require('../helpers/print');
const summary = require('../helpers/summary');
const sleep = require('../helpers/sleep');
const hrDate = require('../helpers/hr-date');
const {getSlots} = require('../services/slots');
const {headers, refreshToken} = require('../services/auth');
const reservations = require('./reservations');

module.exports = async function processDay(date, reservation, priority = 1) {

  while (true) {
    if ((process.uptime() * 1000) > reservation.runningPeriod) {
      console.info('Running period ended');
      process.exit(0);
    }
    if ((Date.now()-5000) > session.get('expires_at')) {
      await refreshToken(reservation);
    }

    const slots = await getSlots(date);
    if (slots.status === 401) {
      return Promise.reject();
    }
    let unavailable = [];
    for (let i = 0; i < slots.response.length; i++) {
      let slot = slots.response[i];
      if (
        (slot.canReserve && !reservation.isReserved)
        || (slot.canReserve && reservation.isReserved && priority < reservation.dayPriority)
      ) {
        print('i', "free slot available");
        let res;
        try {
          res = await reservations.make(slot.deliveryWindow);
        } catch (e) {
          print('e', e);
          continue;
        }
        let winStart = hrDate(slot.deliveryWindow.startsAt);
        let winEnd = hrDate(slot.deliveryWindow.endsAt);
        if (res.status === 204) {
          reservation.days[date].tries++;
          reservation.days[date].lastTry = new Date().toISOString();
          reservation.isReserved = true;
          reservation.slot = slot;
          reservation.dayPriority = priority;
          reservation.days[date].reservation = `${winStart} - ${winEnd}`;

          print('i', "RESERVATION SUCCESSFUL");
          print('i', `From: ${winStart}`);
          print('i', `To: ${winEnd}`);

          summary(reservation);

          return Promise.resolve();
        }
      } else {
        unavailable.push(slot.deliveryWindow.startsAt);
      }
    }
    reservation.days[date].tries++;
    reservation.days[date].lastTry = new Date().toISOString();
    // print('i', `${unavailable.length}/${slots.response.length} slots unavailable for ${date}, checking again in: ${reservation.checkAgainAfter}ms`);
    summary(reservation);

    await sleep(reservation.checkAgainAfter);
  }
}
