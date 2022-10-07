module.exports = function (req, res, next) {
  const date = new Date();
  const ts = date.getTime();

  /*send json timestamp*/
  res.send({ ts: ts });
};
