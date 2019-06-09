const passport = require('@passport-next/passport');

module.exports = (req, res, next) => {
  // Todo: Passport
  console.log('passport', passport);
  next();
};
