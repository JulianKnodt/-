var router = require('express').Router();

router.param('', (req, res, next) => {
  next();
});



module.exports = router;