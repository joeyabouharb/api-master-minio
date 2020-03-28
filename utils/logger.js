const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

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

const writeLineToFile = (output, file) => {
  const fullpath = path.join(__dirname, file);
  return fs.exists(fullpath, (exists) => {
    if (!exists) {
      fs.openSync(fullpath, 'w');
    }
    return fs.appendFile(fullpath, `${output}\n`, () => {});
  });
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
    const output = `${Date.now()}\t---${level.name}--- ${message} ${ex.stack || line}`;
    writeToConsole(level.color(output));
    return writeLineToFile(output, file);
  }
  return { Log };
};

module.exports = Object.freeze({
  logger: new Logger('feature', Date.now()).getLogger(),
  LoggingLevel,
});
