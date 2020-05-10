const {join} = require('fs');
const app = require('multipronged')();
const passport = require('@passport-next/passport');
const LocalStrategy = require('@passport-next/passport-local').Strategy;

const User = {
  // eslint-disable-next-line require-await
  async findOne ({username}) {
    return {
      verifyPassword (password) {
        // eslint-disable-next-line max-len
        // eslint-disable-next-line node/global-require, import/no-dynamic-require
        require(join(__dirname, './maptext-admin.json'));
      }
    };
  }
};

passport.use(new LocalStrategy(
  async function (username, password) {
    const user = await User.findOne({username});
    return user && user.verifyPassword(password)
      ? user
      : false;
  }
));

app.use([
  passport.initialize(),
  passport.session()
]);

module.exports = app;
