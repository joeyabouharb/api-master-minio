const mongoose = require('mongoose');
const { logger, LoggingLevel } = require('../utils/logger');

const {
  LOGIN_CREDENTIALS, LOGIN_URL, LOGIN_DB, LOGIN_OPTS,
} = process.env;

function Database(credentials, url, db, opts) {
  this.url = () => url;
  this.db = () => db;
  this.connectionString = () => `mongodb+srv://${credentials}@${url}/${db}?${opts}`;
  this.connection = mongoose;
}

Database.prototype.connect = function connect() {
  this.connection = mongoose.createConnection(
    this.connectionString(), {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    },
  );
  this.connection.on('connected', async () => {
    await logger.Log(LoggingLevel.Info, `Connection to cluster ${this.url()} with db: ${this.db()} was successful!`);
  });
  this.connection.on('disconnected', async () => {
    await logger.Log(LoggingLevel.Warn, `Connection to cluster ${this.url()} with db: ${this.db()} disconnected!`);
  });
  this.connection.catch(async (err) => {
    await logger.Log(LoggingLevel.Error, `unsuccessful connection to database ${this.url()}/${this.db()}`, err);
  });
};

module.exports = Object.freeze({
  LoginDb: new Database(
    LOGIN_CREDENTIALS, LOGIN_URL, LOGIN_DB, LOGIN_OPTS,
  ),
});
