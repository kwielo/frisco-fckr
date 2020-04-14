module.exports = function print(type, msg) {
  const t = {
    d: 'debug',
    i: 'info',
    l: 'log',
    e: 'error'
  };
  const n = new Date().toISOString();
  if (!['e','d'].includes(type)) {
    return;
  }
  t[type] ? console[t[type]](`[${n}] [${type}] ${msg}`) : console.log(`[?] ${msg}`);
}