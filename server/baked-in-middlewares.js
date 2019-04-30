'use strict';

const http = require('htteepee');

module.exports = http.createMiddleware(require('./middleware')(
  'Hello '
), require('./middleware')(
  'there '
));
