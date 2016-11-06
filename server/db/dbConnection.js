const pg = require('pg');
 
const config = {
  database: "mpsql"
};

var client = new pg.Pool(config);

client.connect(err => {
  if(err) console.log(err);
  client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;', (err, res) => {
    if(err) console.log(err);
  });
  client.query(`CREATE TABLE IF NOT EXISTS player
                (playerID uuid not null primary key unique default gen_random_uuid(),
                password varchar(60),
                fbID text unique default null)`, (err, res) => {
                  if(err) console.log(err);
  });
  client.query(`CREATE TABLE IF NOT EXISTS post
                (id bigserial not null primary key,
                message text not null,
                author uuid REFERENCES player(playerID) )`, (err, res) => {
                  if(err) console.log(err);
                });
  client.query(`DO $$
                  BEGIN
                      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender') THEN
                          CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'NEUTRAL', 'NONE');
                      END IF;
                  END
              $$;`, (err, res) => {
    if(err) console.log(err);
  });
  client.query(`CREATE TABLE IF NOT EXISTS search
                (id uuid not null primary key REFERENCES player(playerID),
                start date not null default (now() at time zone 'utc'),
                agepref int4range check(agepref <@ int4range(0, 150)),
                age int not null check(age > 0), check(age < 150),
                gender gender not null,
                genderpref gender not null)`, (err, res) => {
                  if(err) console.log(err);
                  client.query(`CREATE INDEX ON search (agepref);
                                CREATE INDEX ON search (age);
                                CREATE INDEX ON search (gender);
                                CREATE INDEX ON search (genderpref);`, (err, res) => {
                                  if(err) console.log(err);
                                })
                });
  client.query(`CREATE TABLE IF NOT EXISTS connection
                (id bigserial not null primary key,
                player1 uuid REFERENCES player(playerID),
                player2 uuid REFERENCES player(playerID),
                key text)`, (err, res) => {
                  if(err) console.log(err);
                });
}, config);

module.exports = client;