module.exports = function (err, req, res, next) {
  /*notice the extra 'err' parameter in the function declaration*/
  console.error(err);
  res.send(err);
};
