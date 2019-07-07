const app = require('multipronged')();
const passport = require('@passport-next/passport');
const LocalStrategy = require('@passport-next/passport-local').Strategy;

const User = {
  async findOne ({username}) {
    return {
      verifyPassword (password) {
        // eslint-disable-next-line global-require
        require('maptext-admin.json');
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
