const fs = require('fs');
const { promisify } = require('util');
const path = require('path');
const chalk = require('chalk');

const appendFile = promisify(fs.appendFile);
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

const writeLineToFile = async (output, file) => {
  const fullpath = path.join(__dirname, file);
  const dir = path.dirname(fullpath);
  return exists(path.join(dir))
    .then((dirExists) => {
      if (!dirExists) {
        mkdir(dir);
      }
    })
    .then(() => (
      appendFile(fullpath, `${output}\n`)
    ));
};


function Logger(logFile, startDate) {
  this.fileName = () => `../logs/${logFile}-${startDate}`;
}
Logger.prototype.getLogger = function getter() {
  const file = this.fileName();
  function Log(level, message, ex = {}) {
    let line = `\n\tat function ${Log.caller.name || '<Anonymous>'}(): on line `;
    if (!ex.stack) {
      const trace = {};
      Error.captureStackTrace(trace, Log);
      const { stack } = trace;
      line += stack.split('\n')[1].split(' ').pop();
    }
    const output = `${new Date().toTimeString()} ---${level.name}--- ${message} ${ex.stack || line}`;
    writeToConsole(level.color(output));
    return writeLineToFile(output, file);
  }
  return { Log };
};

module.exports = Object.freeze({
  logger: new Logger('../logs/log', new Date().toLocaleDateString('ko-KR')).getLogger(),
  LoggingLevel,
});
