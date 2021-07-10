'use strict';

const path = require('path');
const jsonServer = require('json-server');
const textSearchMiddleware = require('./text-search.js');

// Todo: Need to redirect if not logged in?
module.exports = (app) => {
  const jsonPath = 'maptext.json';
  const router = jsonServer.router(jsonPath);
  router.db._.id = 'name';
  const middlewares = jsonServer.defaults({
    static: path.join(process.cwd(), '.')
  });
  app.use(jsonPath, [textSearchMiddleware, ...middlewares]);
  app.use(router);
};
