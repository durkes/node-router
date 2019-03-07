module.exports = function (req, res, next) {
  var date = new Date();
  var ts = date.getTime();

  /*send json timestamp*/
  res.send({ts: ts});
};
