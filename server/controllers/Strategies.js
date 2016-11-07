const LocalStrategy = require('passport-local').Strategy;
const dbController = require('../db/dbController');

let strategies = {
  init: (passport) => {
    passport.serializeUser((user, done) => {
      done(null, user);
    });
    passport.deserializeUser((user, done) => {
      dbController.findUserById(user, (res) => {
        if(res instanceof Error) {
          done(res, null);
        } else if(res.rows.length > 0){
          done(null, res.rows[0]);
        } else {
          done(new Error('No User Found'), null);
        }
      })
    });
  },
  local: (passport) => {
    passport.use(new LocalStrategy({
      usernameField: 'email'
    },
    function(email, password, done){
      dbController.findUserSecure(email, password, function(result) {
        if (result instanceof Error) {
          return done(result);
        } else if (result === false) {
          return done(null, false, {message: 'Incorrect Username or Password'});
        } else {
          return done(null, result);
        }
      });
    }));
  },
  isAuthenticated: (req, res, next) => {
    if (req.user) {
      next();
    } else {
      res.redirect('/');
    }
  }
};

module.exports = strategies;