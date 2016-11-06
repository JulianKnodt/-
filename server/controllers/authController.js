const dbController = require('../db/dbController');

const authFunctions = {
  local: {
    signup: (req, res, next) => {
      if(req.body.email && req.body.password) {
        dbController.newUser(req.body.email, req.body.password, (result) => {
          if (result instanceof Error) {
            if(Number(result.code) === 23505) {
              res.sendStatus(409);
            } else {
              next(result);
            }
          } else {
            next();
          }
        });
      } else {
        res.sendStatus(401);
      }
    },
    login: (req, res) => {
      dbController.ensureIsUser(req.body.email, req.body.password, (result) => {
        if (result instanceof Error) {
          res.sendStatus(500);
        } else if (result) {
          res.sendStatus(202);
        } else {
          res.sendStatus(403);
        }
      })
    },
    delete: (req, res) => {
      dbController.deleteUser(req.body.email, req.body.password, (result) => {
        if (result instanceof Error) {
          res.sendStatus(500);
        } else {
          res.sendStatus(200);
        }
      });
    },
    oauth: (req, res) => {
      //TODO
    }
  },
  loginSuccess: (req, res) => {
    if(req.user) {
      res.sendStatus(200);
    } else {
      res.sendStatus(500);
    }
  }
};

module.exports = authFunctions;