module.exports = function (req, res, next) {
  console.log('First handler');
  next();
};
