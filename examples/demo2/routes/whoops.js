module.exports = function (req, res, next) {
  next(new Error('This is an error message.'));
};
