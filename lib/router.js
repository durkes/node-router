const _push = require('./push');
const _request = require('./request');
const _response = require('./response');
const _handler = require('./handler');
const _receiver = require('./receiver');

module.exports = function () {
  const stack = [];

  function router(request, response, receiver) {
    receiver = receiver || _receiver;
    _request(request, response);
    _response(request, response);

    const path = request.path.toLowerCase();
    let index = 0;
    next();

    /*skipped layers advance by loop, not recursion: a deep stack of routes
    would otherwise grow the call stack once per layer*/
    function next(error) {
      while (true) {
        const layer = stack[index++];
        if (!layer) {
          setImmediate(receiver, error, request, response);
          return;
        }

        const method = layer.method;
        if (method !== '*' && method !== request.method) {
          continue;
        }

        const anchor = layer.anchor;
        const marker = anchor.length;
        if (path.substr(0, marker) !== anchor) {
          continue;
        }

        const border = path[marker];
        if (border !== undefined && border !== '/' && border !== '.') {
          continue;
        }

        const handler = layer.handler;
        _handler(handler, error, request, response, next);
        return;
      }
    }
  }

  router.push = _push(stack);
  return router;
};
