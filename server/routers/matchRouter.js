const router = require('express').Router();
const matchController = require('../controllers/matchController');
const strategies = require('../controllers/Strategies');

router.all(strategies.isAuthenticated)
      .post('/new', matchController.newSearch)
      .post('/find', matchController.findMatch);

module.exports = router;