module.exports = function (handler, error, request, response, next) {
  const arity = handler.length;
  let result;

  try {
    if (error && arity === 4) {
      result = handler(error, request, response, next);
    } else if (!error && arity < 4) {
      result = handler(request, response, next);
    } else {
      next(error);
      return;
    }
  } catch (thrown) {
    next(thrown);
    return;
  }

  if (result && typeof result.then === 'function') {
    result.then(undefined, next);
  }
};
