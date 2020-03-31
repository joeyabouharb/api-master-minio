const fs = require('fs');
const chalk = require('chalk');

const { PassThrough } = require('stream');

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


const { log: writeToConsole } = console;


function Logger(directory) {
  const startDate = new Date().toLocaleDateString('ko-KR');
  const fileName = `${directory}/log-${startDate}log`;
  this.writeStream = fs.createWriteStream(fileName, { flags: 'a' });
  this.readStream = new PassThrough();
  this.readStream.pipe(this.writeStream);
}

Logger.prototype.getLogger = function Log(level, message, ex = {}) {
  let line = `\n\tat ${Log.caller.name || '<Anonymous>'}: on line `;
  if (!ex.stack) {
    const trace = {};
    Error.captureStackTrace(trace, Log);
    const { stack } = trace;
    line += stack.split('\n')[1].split(' ').pop();
  }
  const output = `${new Date().toTimeString()} ---${level.name}--- ${message} ${ex.stack || line}`;
  writeToConsole(level.color(output));
  this.readStream.write(Buffer.from(`${output}\n`));
};

const exported = {
  logger: null, // default instance
  createLogger(directory) {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory);
    }
    this.logger = new Logger(directory);
  },
  getLogger() {
    if (this.logger) {
      return this.logger.getLogger.bind(this.logger);
    }
    throw new Error('no logger Instance found');
  },
};

module.exports = {
  createLogger: exported.createLogger.bind(exported),
  getLogger: exported.getLogger.bind(exported),
  LoggingLevel,
};
