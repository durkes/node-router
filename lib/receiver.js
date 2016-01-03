module.exports = function (error, request, response) {
  if (response.headersSent) {
    return;
  }

  if (error) {
    response.statusCode = error.status || 500;
    response.end(error.toString());
    return;
  }

  response.statusCode = 404;
  response.end('Not Found');
};
