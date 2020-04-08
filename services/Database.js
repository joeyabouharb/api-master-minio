const mongoose = require('mongoose');
const { Log, LoggingLevel } = require('../utils/logger');

const {
  LOGIN_CREDENTIALS, LOGIN_URL, LOGIN_DB, LOGIN_OPTS,
} = process.env;

function onConnection() {
  Log(LoggingLevel.Info, `Connection to cluster ${this.url()} with db: ${this.db()} was successful!`);
}

function onDisconnect() {
  Log(LoggingLevel.Warn, `Connection to cluster ${this.url()} with db: ${this.db()} disconnected!`);
}

function onError(err) {
  Log(LoggingLevel.Error, `unsuccessful connection to database ${this.url()}/${this.db()}`, err);
}

function Database(credentials, url, db, opts) {
  this.url = () => url;
  this.db = () => db;
  this.connectionString = function getConnectionString() {
    return `mongodb+srv://${credentials}@${url}/${db}?${opts}`;
  };
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
  this.connection.on('connected', onConnection.bind(this));
  this.connection.on('disconnected', onDisconnect.bind(this));
  this.connection.catch(onError.bind(this));
};

module.exports = Object.freeze({
  LoginDb: new Database(
    LOGIN_CREDENTIALS, LOGIN_URL, LOGIN_DB, LOGIN_OPTS,
  ),
});
