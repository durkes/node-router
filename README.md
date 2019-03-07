# node-router - Node.js middleware router

node-router is a lightweight, flexible, and lightning-fast router for Node.js web servers. It provides key conveniences for developing a Node server with the option to add middleware for additional functionality when you need it. Built-in features are limited by design and the configuration is simple and flexible. Much of the baseline code was derived from [Connect](https://www.npmjs.com/package/connect).

In its current form, node-router is ideal for routing and responding to requests with dynamic text or JSON. It is not designed to act as a static file server.

### Table of Contents
 * [How to use node-router](#how-to-use-node-router)
 * [Routing](#routing)
 * [Request properties](#request-properties)
 * [Responding to requests](#responding-to-requests)
 * [Error handling](#error-handling)
 * [A thorough example](#a-thorough-example)
 * [Middleware](#middleware)
 * [How node-router is different](#how-node-router-is-different)

## How to use node-router

#### Installation
```bash
$ npm install node-router
```

#### Setting up your server
```js
var http = require('http');
var Router = require('node-router');

var router = Router();    // create a new Router instance
var route = router.push;  // shortcut for router.push()

/*Add routes*/
route('POST', '/form', routeHandler);  // handle POST requests to /form
route('/hello', routeHandler);         // handle any request to /hello
route('PUT', routeHandler);            // handle all PUT requests to any path

// handle all GET and POST requests to /one and /two
route('GET', 'POST', '/one', '/two', routeHandler);

route(routeHandler);      // catch-all route
route(errorHandler);      // catch errors from any route above

var server = http.createServer(router).listen(3000);  // launch the server


/*Example handler functions*/
function routeHandler(req, res, next) {
  if (true) res.send('Hello!');  // respond to request if condition true
  else next();                   // otherwise, call next matching route
}

function errorHandler(err, req, res, next) {
  res.send(err);                 // responded, so do not call next()
}
```

## Routing
Routing in node-router works by matching the requested URL path and HTTP method.
```js
route(METHOD, PATH, HANDLER);
```
Every route definition **must** contain a route handler function, but method and path are optional.
 - If no method is defined, or the method is defined as `'*'`, the route will match any method
 - If no path is defined, or the path is defined as `'/'`, the route will match any path
 - Route definitions may contain multiple methods, paths, and handlers

Method and path matching are **case insensitive**, and paths only need to match the prefix as long as the breakpoint character is a slash (`/`) or period (`.`). Furthermore, a trailing slash (`/`) in the route definition path has no effect.

#### Example
Consider the following route definitions (they are functionally identical):
```js
route('/test', function (req, res, next) { ... });
route('/TEST', function (req, res, next) { ... });
route('/test/', function (req, res, next) { ... });
route('*', '/test', function (req, res, next) { ... });
```
Requests to these URLs would **match** the routes above:
 - http://www.example.com/test
 - http://www.example.com/TEST
 - http://www.example.com/test/
 - http://www.example.com/test.
 - http://www.example.com/test/anything...
 - http://www.example.com/test.anything...
 - http://www.example.com/test?query=string

But requests to these URLs would **not match**:
 - ~~http://www.example.com/tes~~
 - ~~http://www.example.com/test1~~
 - ~~http://www.example.com/another/test~~

#### Route chaining
**Order is important.**
Since routing allows for prefix matching, it might be important to define routes for nested paths first (depending on your intention).

```js
route('/test/one', function (req, res, next) { ... });
route('/test', function (req, res, next) { ... });
```

In this example, requests to `http://www.example.com/test/one` will be handled by the first route, while requests to `http://www.example.com/test/two` will be handled by the second route.

If the route definitions were in reverse order, requests to `http://www.example.com/test/one` would be handled by the `/test` route first.

#### Multiple routes in a single definition
For readability and convenience, multiple methods, paths, and handlers can be registered on a single route definition.

```js
route('GET', 'POST', '/path1', '/path2', handlerOne, handlerTwo);
```

This is functionally identical to:
```js
route('GET', '/path1', handlerOne);
route('GET', '/path1', handlerTwo);
route('POST', '/path1', handlerOne);
route('POST', '/path1', handlerTwo);
route('GET', '/path2', handlerOne);
route('GET', '/path2', handlerTwo);
route('POST', '/path2', handlerOne);
route('POST', '/path2', handlerTwo);
```

#### next()
Within your route handler functions, you must respond to requests using `res.send()` or `res.end()`, or call `next()` to invoke the next matching route handler. This enables you to create a waterfall effect.

Consider the following two catch-all routes:
```js
route(function (req, res, next) {
  var hour = new Date().getHours();
  if (hour === 0) {
    res.send('Down for maintenance');
  } else {
    next();
  }
});

route(function (req, res, next) {
  res.send('Hello!');
});
```
In this example, the first route will respond with "Down for maintenance" during the midnight hour. During other hours it will resolve to `next()` and invoke the second route to respond with "Hello!"

You should not call `next()` more than once from within a route handler.

## Request properties
node-router appends the requested path and query string data to the `req` object.

Consider the following route definition:
```js
route('/api', routeHandler);
```
For requests to `http://www.example.com/API/retrieve?name=John%20Doe&state=MO`, the `req` object will contain the following properties and values:
```js
function routeHandler(req, res, next) {
  req.path === '/API/retrieve'  // matches the current URL path
  req.query.name === 'John Doe'
  req.query.state === 'MO'
}
```

## Responding to requests
node-router includes a `send` method to conveniently handle common response patterns. Use `res.send()` anywhere you would normally use `res.end()`, but with added functionality to send an object and change the response status code.

Call `res.send()` __once per request__ from within a route handler.
```js
res.send('Simple text response');
res.send(404, 'Not Found');
res.send(500);  // No response body; status code only

var json = {version: '1.0', code: 200, message: 'Success'};
res.send(json);

var error = new Error('Not Allowed');
error.status = 405;
res.send(error);
```

## Error handling
Error handlers are declared in the same way as a route handler, but with an additional `err` parameter.
```js
route(errorHandler);
function errorHandler(err, req, res, next) {
  res.send(err);
}
```
You should include at least one error handler (usually the very last route definition), but you can include multiple error handlers if you need errors to be handled differently throughout the route chain. When an error is thrown or passed to `next`, the next error handler in the chain will be invoked.

#### Generating an error
Inside a typical route, you can invoke the next error handler in the chain by calling `next(error)` or simply throwing an error.
```js
route('GET', '/api/retrieve', function (req, res, next) {
  if (req.query.id === 'test') {
    /*respond only to /api/retrieve?id=test*/
    res.send({id: 'test', result: 'success'});
  } else {
    /*otherwise, pass an error*/
    var error = new Error('Invalid request');
    next(error);
  }
});
```

#### Fair warning
When an exception occurs in a typical Node app, the app crashes with the printed stack trace. With node-router, however, if one of your routes throws an exception, the exception will be caught by the nearest error handler, keeping your app from crashing. This is good for obvious reasons, but can obscure misbehaving logic and allow your app to operate in an unstable state.

For production environments, it is recommended that you implement custom logic within your error handlers to log the stack trace (err.stack) of unexpected errors, generate a notification, and restart the app.

## A thorough example
```js
var http = require('http');
var Router = require('node-router');

var router = Router();
var route = router.push;

/*Add middleware (optional)*/
var cookieParser = require('cookie-parser');
route(cookieParser());

var bodyParser = require('body-parser');
route('POST', bodyParser.urlencoded({extended: false}));
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
    res.send({id: 'test', result: 'success'});
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
```

[More examples](examples)

## Middleware
In many cases, your app will require functionality beyond node-router's built-in capabilities. Middleware can be used to add functionality such as the ability to parse incoming POST data and cookies.

#### Common middleware
 - [body-parser](https://www.npmjs.com/package/body-parser)
 - [cookie-parser](https://www.npmjs.com/package/cookie-parser)

node-router is compatible with middleware for [Express](https://www.npmjs.com/package/express), [Restify](https://www.npmjs.com/package/restify), and [Connect](https://www.npmjs.com/package/connect).

## How node-router is different
 - [Express](https://www.npmjs.com/package/express) includes support for serving static files and rendering view templates
 - [Restify](https://www.npmjs.com/package/restify) includes built-in REST API functionality and helpers
 - Express and Restify support URL path parameters (e.g. /person/:*name*)
 - [Connect](https://www.npmjs.com/package/connect) does not support HTTP method-based routing
 - node-router is faster and more flexible, but contains fewer built-in features

### License
[MIT](LICENSE)
