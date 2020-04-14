const { Client } = require('minio');
const { Log, LoggingLevel } = require('../utils/logger');
require('dotenv').config();

const {
  END_POINT, MINIO_PORT, MINIO_SSL, ACCESS_KEY, SECRET_KEY,
} = process.env;

const minIOClient = function getMinioConnection() {
  const client = new Client({
    endPoint: END_POINT,
    port: Number(MINIO_PORT),
    useSSL: Boolean(Number(MINIO_SSL)),
    accessKey: ACCESS_KEY,
    secretKey: SECRET_KEY,
  });
  Log(LoggingLevel.Info, `connection to ${END_POINT} successful!`);
  return client;
};

const { createWriteStream, createReadStream } = require('fs');

module.exports = Object.freeze(minIOClient);
