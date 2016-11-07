const dbController = require('../db/dbController');

const ensureProper = (body) => {
  return body.age && body.gender;
};
const makeProper = (body) => {
  let newBody = Object.assign({}, body);
  newBody.ageUpperLimit = newBody.ageUpperLimit || newBody.age + 3;
  newBody.ageLowerLimit = newBody.ageLowerLimit || newBody.age - 3;
  newBody.genderpref = newBody.genderpref || 'NONE';
  return newBody;
};

const matchFunctions = {
  newSearch: (req, res) => {
    if (ensureProper(req.body)) {
      let searchBody = makeProper(req.body);
      dbController.newSearch(req.user,
                            searchBody.age, 
                            searchBody.ageLowerLimit, 
                            searchBody.ageUpperLimit, 
                            searchBody.gender, 
                            searchBody.genderpref, (res) => {
        if(res instanceof Error) {
          res.sendStatus(500);
        } else {
          res.sendStatus(202);
        }
      });
    } else {
      res.sendStatus(400);
    }
  },
  findMatch: (req, res) => {
    if (req.user) {
      dbController.findMatch(req.user, (err, result) => {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        } else {
          res.send(result.rows);
        }
      })
    } else {
      res.sendStatus(401);
    }
  }
}

module.exports = matchFunctions;