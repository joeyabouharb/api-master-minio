const { logger, LoggingLevel } = require('./logger');

async function expressErrorLogger(err, req, res, next) {
  if (err) {
    await logger.Log(LoggingLevel.Error, err.message, err);
    res.sendStatus(400);
  } else {
    next();
  }
}

async function expressLogger(req, res, next) {
  await logger.Log(LoggingLevel.Info, `METHOD: ${req.method} was made on ${req.url}`);
  next();
}

async function listen() {
  const { PORT, HOST } = process.env;
  await logger.Log(LoggingLevel.Info, `Express has started! Now listening on http://${HOST}:${PORT}`);
}

module.exports = Object.freeze({
  expressLogger, expressErrorLogger, listen,
});
