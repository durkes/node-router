module.exports = function (stack) {
  return function () {
    var methods = [];
    var anchors = [];
    var handlers = [];

    var arity = arguments.length;
    var i = 0;

    while (i < arity) {
      var argument = arguments[i];

      if (typeof argument === 'function') {
        handlers.push(argument);
      } else if (typeof argument === 'string') {
        if (argument[0] === '/') {
          anchors.push(argument);
        } else {
          methods.push(argument);
        }
      } else {
        throw new TypeError('Route definitions may contain only string or function type arguments.');
      }

      i++;
    }

    if (handlers.length < 1) {
      throw new Error('Every route must include a handler function.');
    }

    if (methods.length < 1) {
      methods.push('*');
    } else {
      methods.forEach(function (method, i) {
        methods[i] = method.toUpperCase();
      });
    }

    if (anchors.length < 1) {
      anchors.push('');
    } else {
      anchors.forEach(function (anchor, i) {
        if (anchor[anchor.length - 1] === '/') {
          anchor = anchor.slice(0, -1);
        }

        anchors[i] = anchor.toLowerCase();
      });
    }

    methods.forEach(function (method) {
      anchors.forEach(function (anchor) {
        handlers.forEach(function (handler) {
          stack.push({
            anchor: anchor,
            method: method,
            handler: handler,
          });
        });
      });
    });
  };
};
