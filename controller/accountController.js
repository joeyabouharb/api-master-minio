
const UserFactory = require('../models/userSchema');
const { LoginDb } = require('../services/Database');
const { getLogger, LoggingLevel } = require('../utils/logger');
const { signJwt } = require('../utils/jwt');
const Minio = require('../services/MinIO');

const register = (req, res) => {
  try {
    const logger = getLogger();
    const User = UserFactory(LoginDb.connection);
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      confirmPassword: req.body.confirmPassword,
      password: req.body.password,
      bucket: req.body.bucket,
    });
    user.save()
      .then(() => {
        const client = Minio();
        return client.makeBucket(user.bucket, 'us-east-1');
      })
      .then(() => {
        logger.Log(LoggingLevel.Info, 'user created');
        res.send({
          created: true,
        }).status(200);
      })
      .catch((err) => {
        if (err.code === 11000) {
          if (err.keyPattern.username || err.keyPattern.email) {
            res.send({
              created: false,
              msg: 'user already exists',
            }).status(400);
          } else if (err.keyPattern.bucket) {
            res.send({
              created: false,
              msg: 'bucket name already exists',
            }).status(400);
          }
        } else if (err.name === 'ValidationError') {
          const names = Object.keys(err.errors);
          res.send({
            created: false,
            msg: `required paramaters ${names.join(', ')} missing`,
          }).status(400);
        } else {
          res.send({
            created: false,
            msg: 'unknown error',
          }).status(400);
        }
        logger.Log(LoggingLevel.Error, err.message, err);
      });
  } catch (err) {
    logger.Log(LoggingLevel.Error, err.message, err);
    res.send({
      created: false,
      error: 'unknown error',
    }).status(400);
  }
};

const login = async (req, res) => {
  try {
    const logger = getLogger();
    const User = UserFactory(LoginDb.connection);
    const user = await User.findByEmailOrUsername(req.body.credential);
    if (user) {
      user.comparePassword(req.body.password, (err) => {
        if (err) {
          res.send({ error: err.message }).status(403);
        } else {
          signJwt({ username: user.username, bucket: user.bucket })
            .then((token) => {
              res.send({ success: true, token }).status(200);
            })
            .catch((error) => {
              logger.Log(LoggingLevel.Error, error.message, error);
              res.send({ success: false }).status(400);
            });
        }
      });
    } else {
      res.send({
        error: 'Incorrect Email/Password Entered',
      }).status(403);
    }
  } catch (err) {
    logger.Log(LoggingLevel.Error, err.message, err);
    res.send({
      error: 'Incorrect Email/Password Entered',
    }).status(403);
  }
};

module.exports = Object.freeze({
  register,
  login,
});
