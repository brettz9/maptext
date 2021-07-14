'use strict';

const path = require('path');
const jsonServer = require('json-server');
const textSearchMiddleware = require('./text-search.js');

// Todo: Need to redirect if not logged in?
module.exports = (app) => {
  const router = jsonServer.router('maptext.json');
  router.db._.id = 'name';
  const middlewares = jsonServer.defaults({
    static: path.join(process.cwd(), '.')
  });
  app.use('/maps', [(req, res, next) => {
    // Todo: Change this so only restricting editing
    if (!req.session.user) {
      res.redirect('/');
      return;
    }
    next();
  }, textSearchMiddleware, ...middlewares, router]);
};
