module.exports = function tomorrow() {
  let d = new Date();
  d.setDate(d.getDate() + 1);

  return `${d.getFullYear()}/${d.getMonth()}/${d.getDay()}`;
}