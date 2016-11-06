var router = require('express').Router();

router.param('', (req, res, next) => {
  //For identifying user on this route.
  next();
});



module.exports = router;