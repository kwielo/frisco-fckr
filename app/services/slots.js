const {get} = require('axios');
const {headers} = require('../services/auth');
const session = require('../session');

async function getSlots(date) {
  const url = `https://commerce.frisco.pl/api/users/${session.get('user_id')}/calendar/Van/${date}`;
  const res = await get(
    url,
    {
      headers: Object.assign(headers, {
        authorization: `Bearer ${session.get('access_token')}`,
        'content-type': 'application/json'
      })
    }
  );
  return {
    status: res.status,
    response: res.data
  };
}

module.exports = {
  getSlots
}