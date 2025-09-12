const http = require('http');
const Router = require('../index'); // Use require('node-router') in production

const router = Router();
const route = router.push;

/*Add middleware (optional)*/
// const cookieParser = require('cookie-parser');
// route(cookieParser());

// const bodyParser = require('body-parser');
// route('POST', bodyParser.urlencoded({extended: false}));
/*only use bodyParser on POST requests*/

/*Custom middleware*/
route(function (req, res, next) {
  console.log('----------------------------------------');
  console.log('req.path: ' + req.path);
  console.log('req.query: ' + JSON.stringify(req.query));
  next();
});

/*Add custom routes*/
route('/hello', function (req, res, next) {
  res.send('Hi there!');
});
/*the above route will answer all requests to:
'/hello', '/hello.anything...', and '/hello/anything...'*/

route('/multi/handler', function (req, res, next) {
  console.log('First handler');
  next();
}, function (req, res, next) {
  console.log('Second handler');
  res.send('Success');
});
/*the above route has two handler functions (chained)*/

route('GET', '/api/retrieve', function (req, res, next) {
  if (req.query.id === 'test') {
    /*respond only to /api/retrieve?id=test*/
    res.send({ id: 'test', result: 'success' });
  } else {
    /*otherwise, continue to the next route*/
    next();
  }
});

route('GET', '/api/retrieve', function (req, res, next) {
  res.send(400, 'You must call this URL with the query string ?id=test');
  /*efficient coding would include this logic in the route above;
  this is just for demo*/
  /*notice next() was not called here in order to break the chain*/
});

route('/api/retrieve', function (req, res, next) {
  /*now catch all requests to '/api/retrieve' with methods other than GET
  (since GET requests would have been handled by one of the routes above)*/
  res.send(405, 'Must use GET method');
});

route('/cause/an/error', function (req, res, next) {
  next(new Error('This is an error message.'));
});

route('/error/multi/handler', function (req, res, next) {
  console.log('First handler');
  next(new Error('Skip to the error handler.'));
}, function (req, res, next) {
  res.send('This response will never occur.');
});

route(function (err, req, res, next) {
  /*catch errors from any route above*/
  /*notice the extra 'err' parameter in the function declaration*/
  res.send(err);
});

route('POST', function (req, res, next) {
  /*catch all POST-method requests*/
  const error = new Error('Method Not Allowed');
  error.status = 405;
  next(error);
});

route('/send/text', function (req, res, next) {
  res.send('Hello');
});

route('/send/json', function (req, res, next) {
  res.send({ status: 200, response: 'OK' });
});

route('/send/array', function (req, res, next) {
  res.send([5, 4, 3, 2, 1, 'a', 'b', 'c']);
});

route('/send/status', function (req, res, next) {
  res.send(201);
});

route('/send/status+text', function (req, res, next) {
  res.send(201, 'Created');
});

route('/send/status+json', function (req, res, next) {
  res.send(201, { response: 'Created' });
});

route('/send/error', function (req, res, next) {
  const error = new Error('Test Error');
  error.status = 555;
  res.send(error);
  /*same as res.send(555, 'Error: Test Error');*/
});

route('/send/error2', function (req, res, next) {
  const error = new Error('Test Error');
  error.name = 'Not Allowed';
  error.status = 555;

  /*override error status code*/
  res.send(500, error);
  /*same as res.send(500, 'Not Allowed: Test Error');*/
});

route('/send/error3', function (req, res, next) {
  const error = new Error('Test Error');
  error.status = 555;

  /*remember that send(error) will NOT invoke the next error handler*/
  /*but next(error) will*/
  next(error);
});

route(function (req, res, next) {
  /*catch all requests that made it this far*/
  res.send(404, 'Custom Not Found');
});

route('*', '/', function (req, res, next) {
  /*this more verbose route definition is functionally identical to the one
  above; for demo purposes only*/
  res.statusCode = 404;
  res.end('Custom Not Found');
});

route(function (err, req, res, next) {
  /*catch errors from routes below the last error handler*/
  /*it is smart to log unexpected exceptions*/
  console.warn("👇 \x1b[93mThis error is intentional for demonstration purposes. It is not a bug.\x1b[0m");
  console.error(err);
  res.send(err);
});

/*launch the server*/
const server = http.createServer(router).listen(3000, () => {
  console.log('\n🚀 Server running on http://localhost:3000');
  console.log('\n📋 Example routes to test:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const routes = [
    { path: '/hello', description: 'Simple hello route' },
    { path: '/multi/handler', description: 'Route with multiple handlers (chained)' },
    { path: '/api/retrieve?id=test', description: 'API route with query parameter (GET only)' },
    { path: '/api/retrieve', description: 'API route without query param (returns error)' },
    { path: '/cause/an/error', description: 'Route that throws an error' },
    { path: '/error/multi/handler', description: 'Route with error in chained handlers' },
    { path: '/send/text', description: 'Send plain text response' },
    { path: '/send/json', description: 'Send JSON response' },
    { path: '/send/array', description: 'Send array response' },
    { path: '/send/status', description: 'Send status code only' },
    { path: '/send/status+text', description: 'Send status code with text' },
    { path: '/send/status+json', description: 'Send status code with JSON' },
    { path: '/send/error', description: 'Send error response' },
    { path: '/send/error2', description: 'Send error with custom name' },
    { path: '/send/error3', description: 'Send error via next()' },
    { path: '/nonexistent', description: 'Test 404 handling' }
  ];

  routes.forEach(route => {
    const url = `http://localhost:3000${route.path}`;
    console.log(`🔗 ${url.padEnd(50)} - ${route.description}`);
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n💡 Tips:');
  console.log('   • Visit any link above to test the route in your browser');
  console.log('   • Try a POST request to /api/retrieve to see method not allowed');
  console.log('   • Error routes will demonstrate error handling\n');
});
