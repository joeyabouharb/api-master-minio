require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
require('./services/Database').LoginDb.connect();
const accountRoute = require('./routes/accountRoute');
const { expressErrorLogger, expressLogger, listen } = require('./utils/middlewares');

const { PORT, HOST } = process.env;

const app = express();
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// error logger
app.use(expressErrorLogger);

// logger
app.use(expressLogger);

// account routes
app.use(
  '/api/accounts', accountRoute,
);

app.listen(PORT, HOST, listen(PORT, HOST));
