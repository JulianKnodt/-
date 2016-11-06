const bcrypt = require('bcrypt');
var db = require('./dbConnection');

const NONE = 'NONE';
const MALE = 'MALE';
const FEMALE = 'FEMALE';
const NEUTRAL = 'NEUTRAL';

const parseRange = (rangeString) => {
  let range = rangeString.split(',');
  range[0] = Number(range[0].slice(1));
  range[1] = Number(range[1].slice(0, -1));
  return range;
};

const userFunctions = {
  newUser: (email, password, callback) => {
    bcrypt.hash(password, 7, (err, hash) => {
      if(err) return callback(err);
      db.query(`INSERT INTO player (email, password)
                VALUES ('${email}', '${hash}')`, (err, res) => {
          if (err) return callback(err);
          return callback(res);
      });
    });
  },
  ensureIsUser: (email, password, callback) => {
    db.query(`SELECT playerID, email, password FROM player WHERE email = '${email}'`, (err, res) => {
      if(err) return callback(err);
      if(res.rows.length > 0) {
        bcrypt.compare(password, res.rows[0].password, (err, result) => {
          if(err) return callback(err);
          return callback(result);
        });
      } else {
        return callback(false);
      }
    });
  },
  findUserSecure: (email, password, callback) => {
    db.query(`SELECT playerID, email, password FROM player WHERE email = '${email}'`, (err, res) => {
      if(err) return callback(err);
      if(res.rows.length > 0) {
        bcrypt.compare(password, res.rows[0].password, (err, result) => {
          if(err) return callback(err);
          if(result) {
            return callback(res.rows[0].playerid);
          } else {
            return callback(false);
          }
        });
      } else {
        return callback(false);
      }
    })
  },
  findUser: (email, callback) => {
    db.query(`SELECT playerID, email, fbID FROM player WHERE email = '${email}'`, (err, res) => {
      return err ? callback(err) : callback(res);
    });
  },
  findUserById: (id, callback) => {
    db.query(`SELECT email, fbID FROM player WHERE playerid = '${id}'`, (err, res) => {
      return err ? callback(err) : callback(res);
    });
  },
  deleteUserRaw: (email, callback) => {
    db.query(`DELETE FROM player WHERE email = '${email}'`, (err, res) => {
      return err ? callback(err) : callback(res);
    });
  },
  deleteUser: (email, password, callback) => {
    db.query(`SELECT email, password FROM player WHERE email = '${email}'`, (err, res) => {
      if (err) return callback(err);
      if (res.rows.length) {
        bcrypt.compare(password, res.rows[0].password, (err, result) => {
          if(err) return callback(err);
          if (result === true) {
            userFunctions.deleteUserRaw(email, callback);
          } else {
            return callback(new Error('Incorrect Password For Deletion'));
          }
        });
      } else {
        return callback(new Error('User not found'));
      }
    });
  }
};

const searchFunctions = {
  newSearch: (playerUUID, age, ageLower, ageUpper, gender, genderPref, callback) => {
    db.query(`INSERT INTO search (id, agepref, age, gender, genderpref)
              VALUES ('${playerUUID}', int4range(${ageLower}, ${ageUpper}), ${age}, '${gender}', '${genderPref}') ;`, (err, res) => {
      return err ? callback(err) : callback(res);     
    })
  },
  findMatch: (playerUUID, callback) => {
    db.query(`SELECT agepref, age, gender, genderpref FROM search WHERE id = '${playerUUID}'`, (err, res) => {
      if(res.rows.length > 1) {
        return callback(new Error('Multiple Users with same UUID, Violates Unique Key Constraint'));
      } else {
        let range = parseRange(res.rows[0].agepref);
        let age = res.rows[0].age;
        let gender = res.rows[0].gender;
        let genderPref = res.rows[0].genderpref;
        return searchFunctions.findMatchRaw(range[0], range[1], age, gender, genderPref, callback);
      }
    });
  },
  findMatchRaw: (ageLower, ageUpper, age, gender, genderPref, callback) => {
    if (genderPref === NONE) {
      db.query(`SELECT id FROM search WHERE 
                agepref @> ${age} AND
                (genderpref = '${gender}' OR genderpref = 'NONE') AND
                int4range(${ageLower}, ${ageUpper}) @> age`, (err, res) => {
        return callback(err, res);          
      });
    } else {
      db.query(`SELECT id FROM search WHERE 
                agepref @> ${age} AND 
                gender = '${genderPref}' AND 
                (genderpref = '${gender}' OR genderpref = 'NONE') AND
                int4range(${ageLower}, ${ageUpper}) @> age`, (err, res) => {
        return callback(err, res);          
      });
    }
  }
}

const mixedFunctions = {
  findMatchForPlayer: (email, callback) => {
    userFunctions.findUser(email, (result) => {
      if(result.rows.length > 1) {
        return callback(new Error('Multiple Users with same UUID, Violates Unique Key Constraint'));
      } else {
        return searchFunctions.findMatch(result.rows[0].playerid, callback);
      }
    });
  },
  createNewPlayer: (email, password, age, ageLower, ageUpper, gender, genderPref, callback) => {
    userFunctions.newUser(email, password, (res) => {
      if(res instanceof Error) return callback(res);
      userFunctions.findUser(email, (res) => {
        if(res instanceof Error) return callback(res);
        if(res.rows.length > 1) {
          return searchFunctions.newSearch(res.rows[0].playerid, age, ageLower, ageUpper, gender, genderPref, callback);
        }
      })
    });
  },
  createSearchForExistingPlayer: (email, age, ageLower, ageUpper, gender, genderPref, callback) => {
    userFunctions.findUser(email, (res) => {
      if(res instanceof Error) return callback(res);
      if(res.rows.length > 1) {
        return searchFunctions.newSearch(res.rows[0].playerid, age, ageLower, ageUpper, gender, genderPref, callback);
      }
    });
  }
}


module.exports = Object.assign({}, userFunctions, searchFunctions, mixedFunctions);