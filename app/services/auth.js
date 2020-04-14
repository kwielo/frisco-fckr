const {post} = require('axios');
const querystring = require('querystring');
const uuid = require('uuid');
const print = require('../helpers/print');
const session = require('../session');

const headers = {
  'X-Frisco-Division': 'WAW',
  'X-Frisco-Features': 'BalanceAmount=1',
  'X-Frisco-Visitorid': uuid.v4()
};

async function refreshToken() {
  const data = querystring.stringify(session.isSignIn() ?
    {
      refresh_token: session.get('refresh_token'),
      grant_type: 'refresh_token'
    } :
    {
      password: process.env.PASSWORD,
      username: process.env.USERNAME,
      grant_type: 'password'
    });
  const url = 'https://commerce.frisco.pl/connect/token';
  let res;
  try {
    res = await post(
      url,
      data,
      {headers: Object.assign(headers, {'content-type': 'application/x-www-form-urlencoded'})}
    );
  } catch (e) {
    print('e', e);
    return Promise.reject();
  }
  if (res.status === 200) {
    print(
      'i',
      session.isSignIn() ? `successfully refreshed token` : `successfully logged in as ${process.env.USERNAME}`
    );
  }
  session.setSession(Object.assign(
    res.data,
    {
      acquired_at: Date.now(),
      expires_at: Date.now() + (res.data.expires_in*1000)
    }
  ));

  return Promise.resolve();
}

module.exports = {
  headers,
  refreshToken
}