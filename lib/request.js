const _url = require('url');

module.exports = function (request, response) {
  let parsed = {};

  if (request.url) {
    parsed = _url.parse(request.url, true);
  }

  request.path = parsed.pathname || '/';
  request.query = parsed.query || {};
};
