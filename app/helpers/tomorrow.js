module.exports = function tomorrow() {
  let d = new Date();
  d.setDate(d.getDate() + 1);
  let month = (d.getUTCMonth()+1).toString().padStart(2, '0');
  let day = (d.getDate()).toString().padStart(2, '0');

  return `${d.getFullYear()}/${month}/${day}`;
}
