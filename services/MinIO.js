const { Client } = require('minio');

const minIOClient = () => new Client({
  endPoint: process.env.END_POINT,
  port: process.env.MINO_PORT,
  useSSL: Boolean(process.env.MINIO_SSL),
  accessKey: process.env.ACCESS_KEY,
  secretKey: process.env.SECRET_KEY,
});

module.exports = Object.freeze(minIOClient);
