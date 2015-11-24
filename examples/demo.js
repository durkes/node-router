var http = require('http');
var Router = require('../index'); // Use require('node-router') in production

var router = Router();
var route = router.push;

/*Add middleware (optional)*/
// var cookieParser = require('cookie-parser');
// route(cookieParser());

// var bodyParser = require('body-parser');
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
	res.send('Success');
});
/*the above route has two handler functions defined in an array*/

route('GET', '/api/retrieve', function (req, res, next) {
	if (req.query.id === 'test') {
		/*respond only to /api/retrieve?id=test*/
		res.send({id: 'test', result: 'success'});
	}
	else {
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
	var error = new Error('Method Not Allowed');
	error.status = 405;
	next(error);
});

route('/send/text', function (req, res, next) {
	res.send('Hello');
});

route('/send/json', function (req, res, next) {
	res.send({status: 200, response: 'OK'});
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
	res.send(201, {response: 'Created'});
});

route('/send/error', function (req, res, next) {
	var error = new Error('Test Error');
	error.status = 555;
	res.send(error);
	/*same as res.send(555, 'Error: Test Error');*/
});

route('/send/error2', function (req, res, next) {
	var error = new Error('Test Error');
	error.name = 'Not Allowed';
	error.status = 555;

	/*override error status code*/
	res.send(500, error);
	/*same as res.send(500, 'Not Allowed: Test Error');*/
});

route('/send/error3', function (req, res, next) {
	var error = new Error('Test Error');
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
	console.error(err);
	res.send(err);
});

/*launch the server*/
var server = http.createServer(router).listen(3000);
