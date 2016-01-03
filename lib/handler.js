module.exports = function (handler, error, request, response, next) {
  var arity = handler.length;

  try {
    if (error && arity === 4) {
      handler(error, request, response, next);
      return;
    }

    if (!error && arity < 4) {
      handler(request, response, next);
      return;
    }
  } catch (thrown) {
    error = thrown;
  }

  next(error);
};
