const fs = require('fs');
const { promisify } = require('util');
const path = require('path');
const chalk = require('chalk');

const { PassThrough } = require('stream');
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


const { log: writeToConsole } = console;



function Logger(directory) {
  const startDate = new Date().toLocaleDateString('ko-KR');
  const fileName = `${directory}/log-${startDate}log`;
  this.writeStream = () => exists(directory)
    .then((doesExist) => {
      if (!doesExist) {
        mkdir(directory);
      }
      console.log('hello');
    })
    .then(() => {
      console.log('hello')
      const st = fs.createWriteStream(fileName, { flags: 'a' });
      const ps = new PassThrough();
      ps.end(Buffer.from('helloooo'));
      ps.pipe(st);
      return st;
    })
}

const writeLineToFile = (output, writeStream) => {
  writeStream.on('error', (err) => console.log)
  const readStream = new PassThrough();
  readStream.end(Buffer.from(`${output}\n`));
  readStream.pipe(writeStream);
  writeStream.end();
};

Logger.prototype.getLogger = function getLogInstace() {
  const writeStream = this.writeStream;
  function Log (level, message, ex = {}) {
    let line = `\n\tat ${Log.caller.name || '<Anonymous>'}: on line `;
    if (!ex.stack) {
      const trace = {};
      Error.captureStackTrace(trace, Log);
      const { stack } = trace;
      line += stack.split('\n')[1].split(' ').pop();
    }
    const output = `${new Date().toTimeString()} ---${level.name}--- ${message} ${ex.stack || line}`;
    writeToConsole(level.color(output));
    return writeStream().then((write) => {
      writeLineToFile(output, write)
    });
  }
  return { Log };
};

const exported = {
  logger: null, // default instance
  createLogger(directory) {
    this.logger = new Logger(directory);
  },
  getLogger() {
    return this.logger.getLogger();
  },
};

module.exports = {
  createLogger: exported.createLogger.bind(exported),
  getLogger: exported.getLogger.bind(exported),
  LoggingLevel,
};
