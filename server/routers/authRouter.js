const passport = require('passport');

const passportStrategies = require('../controllers/Strategies');
var router = require('express').Router();
var authController = require('../controllers/authController');

passportStrategies.init(passport);
passportStrategies.local(passport);
router.use(passport.initialize())
      .use(passport.session());

router.post('/signup', authController.local.signup, passport.authenticate('local'), authController.loginSuccess)
      .post('/login', passport.authenticate('local'), authController.local.login);
      // .delete('/user')

module.exports = router;