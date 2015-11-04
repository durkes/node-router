var url = require('url');
var send = require('./send');

module.exports = function (request, response) {
	var parsed = {};

	if (request.url) {
		parsed = url.parse(request.url, true);
	}

	request.path = parsed.pathname || '/';
	request.query = parsed.query || {};

	response.send = send;
};