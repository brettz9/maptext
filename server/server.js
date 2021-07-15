'use strict';

const path = require('path');
const express = require('express');
const jsonServer = require('json-server');
const textSearchMiddleware = require('./text-search.js');

// Todo: Need to redirect if not logged in?
module.exports = (app) => {
  const router = jsonServer.router('maptext.json');
  router.db._.id = 'name';
  const middlewares = jsonServer.defaults({
    static: path.join(process.cwd(), '.')
  });

  const restMiddleware = [
    textSearchMiddleware, ...middlewares, router
  ];

  // Single Page Application
  app.use('/maps/main', express.static('index.html'));
  app.use('/maps/view', express.static('index.html'));

  // No login required for GET
  // app.get('/maps', [...restMiddleware]);
  app.use('/maps', [(req, res, next) => {
    if ((/^\/(?:\.git|nogin\.js|db)/u).test(req.url)) {
      res.status(404).send('Bad request');
      return;
    }
    if (!req.session.user) {
      res.redirect('/');
      return;
    }

    next();
  }, ...restMiddleware]);
};
