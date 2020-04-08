const { Log, LoggingLevel } = require('./logger');

async function expressErrorLogger(err, req, res, next) {

  if (err) {
    Log(LoggingLevel.Error, err.message, err);
    res.sendStatus(400);
  } else {
    next();
  }
}

function expressLogger(req, res, next) {
  const start = new Date();
  res.on('finish', () => {
    const end = new Date();
    Log(LoggingLevel.Info, `METHOD: ${req.method} was made on ${req.url} - ${end - start} ms`);
  });
  next();
}

async function listen() {
  const { PORT, HOST } = process.env;
  Log(LoggingLevel.Info, `Express has started! Now listening on http://${HOST}:${PORT}`);
}

module.exports = Object.freeze({
  expressLogger, expressErrorLogger, listen,
});
