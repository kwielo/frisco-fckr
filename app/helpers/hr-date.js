module.exports = function hrDate(dateString) {
  let d = new Date(dateString);

  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}