const _types = require('util').types;

module.exports = function (status, data) {
  if (typeof status !== 'number') {
    data = status;
    status = undefined;
  }

  if (typeof data === 'object' && !Buffer.isBuffer(data)) {
    if (_types.isNativeError(data) || data instanceof Error) {
      status = status || data.status || 500;
      data = data.toString();
    } else {
      if (!this.headersSent) {
        this.setHeader('Content-Type', 'application/json');
      }
      data = JSON.stringify(data);
    }
  }

  /*default the content type so browsers do not MIME-sniff the body; a type
  already set by the handler always wins*/
  if (!this.headersSent && !this.getHeader('Content-Type')) {
    if (typeof data === 'string') {
      this.setHeader('Content-Type', 'text/plain; charset=utf-8');
    } else if (Buffer.isBuffer(data)) {
      this.setHeader('Content-Type', 'application/octet-stream');
    }
  }

  if (status) {
    this.statusCode = status;
  }

  this.end(data);
};
