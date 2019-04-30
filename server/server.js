// Todo: htteepee middleware? Listen for PUT and save to disk; also
//   middleware for authentication of credentials?

const http = require('./baked-in-middlewares');

http.createServer(function (req, res) {
  res.end('World!');
}).listen(1337, '127.0.0.1');
