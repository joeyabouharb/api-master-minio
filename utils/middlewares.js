const { getLogger, LoggingLevel } = require('./logger');

async function expressErrorLogger(err, req, res, next) {
  const logger = getLogger();
  if (err) {
    await logger.Log(LoggingLevel.Error, err.message, err);
    res.sendStatus(400);
  } else {
    next();
  }
}

function expressLogger(req, res, next) {
  const logger = getLogger();
  const start = new Date();
  res.on('finish', () => {
      const end = new Date();
      logger.Log(LoggingLevel.Info, `METHOD: ${req.method} was made on ${req.url} - ${end - start} ms`);
  });
  next();
}

async function listen() {
  const logger = getLogger();
  const { PORT, HOST } = process.env;
  await logger.Log(LoggingLevel.Info, `Express has started! Now listening on http://${HOST}:${PORT}`);
}

module.exports = Object.freeze({
  expressLogger, expressErrorLogger, listen,
});
