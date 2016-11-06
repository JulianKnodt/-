const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const expressSession = require('express-session');

const authRouter = require('./routers/authRouter');
const codeRouter = require('./routers/codeRouter');
const db = require('./db/dbConnection.js');

var app = express();

let port = process.env.PORT || 3030;

const sessionConfig = {
  secret: '’君の名は’',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false },
  name: 'ito.sid'
}

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(expressSession(sessionConfig));
app.set('title', 'Ito');

app.use('/auth', authRouter);
app.use('/code', codeRouter);
app.get('/', (req, res) => {
  res.sendStatus(202);
});

var server = app.listen(port, () => {
  process.stdout.write(`Listening on port ${port}\n`);
});

server.on('close', () => {
  db.end(err => {
    if(err) process.stdout.write(err + '\n');
  });
});

module.exports = server;