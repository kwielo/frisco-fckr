const {post} = require('axios');
const {headers} = require('../services/auth');
const session = require('../session');
const print = require('../helpers/print');

async function make(data) {
  print('i', `making reservation`);
  const url = `https://commerce.frisco.pl/api/users/${session.get('user_id')}/cart/reservation`;
  const res = await post(
    url,
    JSON.stringify(data),
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
  make
}