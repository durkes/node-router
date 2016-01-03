var util = require('util');

module.exports = function (status, data) {
  if (typeof status !== 'number') {
    data = status;
    status = undefined;
  }

  if (typeof data === 'object') {
    if (util.isError(data)) {
      status = status || data.status || 500;
      data = data.toString();
    } else {
      this.setHeader('Content-Type', 'application/json');
      data = JSON.stringify(data);
    }
  }

  if (status) {
    this.statusCode = status;
  }

  this.end(data);
};
