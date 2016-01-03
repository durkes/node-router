var _send = require('./send');

module.exports = function (request, response) {
  response.send = _send;
};
