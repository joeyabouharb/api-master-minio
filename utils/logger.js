const fs = require('fs');
const { Readable } = require('stream');
const { promisify } = require('util');
const chalk = require('chalk');

const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);

const LoggingLevel = {
  Info: {
    color: chalk.blueBright,
    name: 'Info',
  },
  Debug: {
    color: chalk.magenta,
    name: 'Debug',
  },
  Warn: {
    color: chalk.yellow,
    name: 'Warn',
  },
  Error: {
    color: chalk.red,
    name: 'Error',
  },
};

async function getLogger() {
  const { log } = console;
  const directory = 'logs';
  if (!await exists(directory)) {
    await mkdir(directory).catch((err) => log(LoggingLevel.Error.color(err.message)));
  }
  const writeStream = function writestream(startDate) {
    const fileName = `${directory}/log-${startDate}.log`;
    const filename = fileName;
    return fs.createWriteStream(filename, { flags: 'a' });
  };
  return Object.freeze((level, message, stack) => {
    const output = `${new Date().toTimeString()} ---${level.name}--- ${message} ${stack}`;
    log(level.color(output));
    const reader = Readable.from(`${output}\n`);
    const date = new Date().toLocaleDateString().replace(/\//g, '-');
    const writer = writeStream(date);
    reader.pipe(writer);
  });
}

const Logger = async () => {
  const log = await getLogger();
  return log;
};

function logger(level, message, ex = {}) {
  let line = ex.stack || `\n\tat ${logger.caller.name || '<Anonymous>'}: on line `;
  if (!ex.stack) {
    const trace = {};
    Error.captureStackTrace(trace, logger);
    const { stack } = trace;
    line += stack.split('\n')[1].split(' ').pop();
  }
  Logger()
    .then((log) => log(level, message, line));
}

module.exports = Object.freeze({
  Log: logger,
  LoggingLevel,
});
