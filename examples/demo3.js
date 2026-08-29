/*This demo shows what happens when next() is called after a response has
already been sent, and how to contain it.*/

const http = require('http');
const Router = require('../index'); // Use require('node-router') in production

const router = Router();
const route = router.push;

route('/mistake', function (req, res, next) {
  res.send('Response already sent');

  /*calling next() here is a mistake: the response is finished, so any handler
  below would write to a closed socket and throw ERR_STREAM_WRITE_AFTER_END
  asynchronously, where no try/catch can reach it, taking down the server*/
  next();
});

/*Guard middleware*/
route(function (req, res, next) {
  /*node-router does not check this for you; once the response has ended there
  is nothing left for any handler below to do, so stop the chain here*/
  if (res.writableEnded) {
    console.warn("\x1b[93mnext() was called after the response ended; stopping the chain.\x1b[0m");
    return;
  }

  next();
});
/*a guard only protects the routes BELOW it; remove it and the next handler
will take down the server*/

route('/mistake', function (req, res, next) {
  res.send('This response can never be sent');
});

route('/hello', function (req, res, next) {
  res.send('Still running!');
});

route(function (req, res, next) {
  res.send(404, 'Not Found');
});

route(function (err, req, res, next) {
  console.error(err);
  res.send(err);
});

/*launch the server*/
const server = http.createServer(router).listen(3000, () => {
  console.log('\n🚀 Server running on http://localhost:3000');
  console.log('\n📋 Example routes to test:');
  console.log('🔗 http://localhost:3000/mistake  - Calls next() after responding');
  console.log('🔗 http://localhost:3000/hello    - Confirms the server is still alive\n');
});
