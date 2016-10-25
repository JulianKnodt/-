const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const authRouter = require('./routers/authRouter');
const codeRouter = require('./routers/codeRouter');
var app = express();

let port = process.env.PORT || 3030;

app.use(morgan('dev'));
app.use(bodyParser.json());
app.set('title', 'Musubi');

app.use('/auth', authRouter);
app.use('/code', codeRouter)

app.listen(port, () => {
  process.stdout.write(`Listening on port ${port}`);
});