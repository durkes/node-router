var push = require('./push');
var prep = require('./prep');
var call = require('./call');
var done = require('./done');

module.exports = function () {
	var stack = [];

	function router(request, response, receiver) {
		receiver = receiver || done;
		prep(request, response);

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
			call(handler, error, request, response, next);
		}
	}

	router.push = push(stack);
	return router;
};