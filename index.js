require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const path = require('path');
require('./utils/logger').createLogger(path.join(__dirname, './logs'));
require('./services/Database').LoginDb.connect();
const { expressErrorLogger, expressLogger, listen } = require('./utils/middlewares');

const { PORT, HOST } = process.env;

const app = express();
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const accountRoute = require('./routes/accountRoute');

// error logger
app.use(expressErrorLogger);

// logger
app.use(expressLogger);

// routes
app.use(
  '/api/accounts', accountRoute,
);

app.listen(PORT, HOST, listen(PORT, HOST));
