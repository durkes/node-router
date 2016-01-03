var _push = require('./push');
var _request = require('./request');
var _response = require('./response');
var _handler = require('./handler');
var _receiver = require('./receiver');

module.exports = function () {
  var stack = [];

  function router(request, response, receiver) {
    receiver = receiver || _receiver;
    _request(request, response);
    _response(request, response);

    var path = request.path.toLowerCase();
    var index = 0;
    next();

    function next(error) {
      var layer = stack[index++];
      if (!layer) {
        setImmediate(receiver, error, request, response);
        return;
      }

      var method = layer.method;
      if (method !== '*' && method !== request.method) {
        return next(error);
      }

      var anchor = layer.anchor;
      var marker = anchor.length;
      if (path.substr(0, marker) !== anchor) {
        return next(error);
      }

      var border = path[marker];
      if (border !== undefined && border !== '/' && border !== '.') {
        return next(error);
      }

      var handler = layer.handler;
      _handler(handler, error, request, response, next);
    }
  }

  router.push = _push(stack);
  return router;
};
