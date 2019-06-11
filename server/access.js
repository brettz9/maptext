const app = require('multipronged')();
const passport = require('@passport-next/passport');

app.use([
  passport.initialize(),
  passport.session()
]);

module.exports = app;
