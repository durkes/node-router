/*This demo separates each route into its own module for better organization.*/

var http = require('http');
var Router = require('../../index'); // Use require('node-router') in production

var router = Router();
var route = router.push;

/*Custom middleware*/
route(require('./routes/log'));

/*Add custom routes*/
route('/hello', require('./routes/hello'));
/*the above route will answer all requests to:
'/hello', '/hello.anything...', and '/hello/anything...'*/

route('/multi/handler', require('./routes/chain1'), function (req, res, next) {
  console.log('Second handler');
  res.send('Success');
});
/*the above route has two handler functions (chained)*/

route('/cause/an/error', require('./routes/whoops'));

/*catch everything else*/
route(require('./routes/wildcard'));

/*catch errors from any route above*/
route(require('./routes/error'));

/*launch the server*/
var server = http.createServer(router).listen(3000);
