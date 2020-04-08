require('dotenv').config();
const axios = require('axios');
const querystring = require('querystring');
const uuid = require('uuid');

const checkAgainAfter = 500;

const headers = {
  'X-Frisco-Division': 'WAW',
  'X-Frisco-Features': 'BalanceAmount=1',
  'X-Frisco-Visitorid': uuid.v4()
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let session;
async function refreshToken() {
  const data = querystring.stringify(session ?
    {
      refresh_token: session.refresh_token,
      grant_type: 'refresh_token'
    } :
    {
      password: process.env.PASSWORD,
      username: process.env.USERNAME,
      grant_type: 'password'
    });
  console.log(data);

  const url = 'https://commerce.frisco.pl/connect/token';
  const res = await axios.post(url, data, {headers});
  session = res.data;
  console.info(res.data);
  setTimeout(refreshToken, 300000);
}

async function getSlots(date) {
  const reqHeaders = Object.assign(headers, {
    authorization: `Bearer ${session.access_token}`,
    'content-type': 'application/json'
  });
  const url = `https://commerce.frisco.pl/api/users/${session.user_id}/calendar/Van/${date}`;
  const res = await axios.get(url, {headers: reqHeaders});
  return {
    status: res.status,
    response: res.data
  };
}

async function makeReservation(data) {
  const reqHeaders = Object.assign(headers, {
    authorization: `Bearer ${session.access_token}`,
    'content-type': 'application/json'
  });
  const url = `https://commerce.frisco.pl/api/users/${session.user_id}/cart/reservation`;
  const res = await axios.post(url,  JSON.stringify(data), {headers: reqHeaders});
  return {
    status: res.status,
    response: res.data
  };
}

async function processDay(date, reservation, priority = 1) {
  let madeReservation = false;
  while (!madeReservation) {
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
        console.log("free slot!");

        let {status, reservationResponse} = await makeReservation(slot.deliveryWindow);
        if (status === 204) {
          reservation.isReserved = true;
          reservation.slot = slot;
          reservation.dayPriority = priority;
          console.info("[!!] RESERVATION SUCCESSFUL");
          console.info("> From: ");
          console.info(new Date(slot.deliveryWindow.startsAt).toString());
          console.info("> To: ");
          console.info(new Date(slot.deliveryWindow.endsAt).toString());
          madeReservation = true;
        }

        if (madeReservation) {
          return Promise.resolve();
        }
      } else {
        unavailable.push(slot.deliveryWindow.startsAt);
      }
    }
    console.info(`${unavailable.length}/${slots.response.length} slots unavailable for ${date}, checking again in: ${checkAgainAfter}ms`);

    await sleep(checkAgainAfter);
  }
}

(async function () {
  await refreshToken();

  const reservation = {
    isReserved: false,
    dayPriority: null,
    slot: null
  };

  return Promise
    .all([
      processDay('2020/04/08', reservation, 1),
      processDay('2020/05/28', reservation, 2),
    ])
    .then(res => console.log(res))
    .catch(err => console.error(err));

})();

