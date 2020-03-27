const mongoose = require('mongoose');

function Database(server, database) {
  this.connectionString = () => `mongodb://${server}/${database}`;
  this.connection = null;
}

Database.prototype.connect = function connect() {
  this.connection = mongoose.createConnection(
    this.connectionString(), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  );
  this.connection.on('error', (err) => {
    console.log(err);
  });
};

module.exports = Object.freeze({
  LoginDb: new Database('localhost:1231', 'hello'),
});
