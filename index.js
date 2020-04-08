require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

require('./services/Database').LoginDb.connect();
const { expressErrorLogger, expressLogger, listen } = require('./utils/middlewares');

const { PORT, HOST } = process.env;

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const accountRoute = require('./routes/accountRoute');
const fileRoute = require('./routes/fileRoute');

// error logger
app.use(expressErrorLogger);

// logger
app.use(expressLogger);

// routes
app.use(
  '/api/accounts', accountRoute,
);

app.use(
  '/api/files/', fileRoute,
);

app.listen(PORT, HOST, listen(PORT, HOST));
