module.exports = function (req, res, next) {
  console.log('----------------------------------------');
  console.log('req.path: ' + req.path);
  console.log('req.query: ' + JSON.stringify(req.query));
  next();
};
