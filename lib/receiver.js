module.exports = function (error, request, response) {
  if (response.headersSent) {
    return;
  }

  if (error) {
    response.send(error);
    return;
  }

  response.send(404, 'Not Found');
};
