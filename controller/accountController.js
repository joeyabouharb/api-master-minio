
const UserFactory = require('../models/userSchema');
const { LoginDb } = require('../services/Database');
const { Log, LoggingLevel } = require('../utils/logger');
const { signJwt } = require('../utils/jwt');
const Minio = require('../services/MinIO');

const register = (req, res) => {
  try {
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
        Log(LoggingLevel.Info, 'user created');
        res.send({
          created: true,
        }).status(200);
      })
      .catch((err) => {
        Log(LoggingLevel.Error, err.message, err);
        if (err.code === 11000) {
          if (err.keyPattern.username || err.keyPattern.email) {
            res.status(400).send({
              created: false,
              message: 'user already exists',
            });
          } else if (err.keyPattern.bucket) {
            res.status(400).send({
              created: false,
              message: 'bucket name already exists',
            });
          }
        } else if (err.name === 'ValidationError') {
          const names = Object.keys(err.errors);
          res.status(400).send({
            created: false,
            message: `required paramaters ${names.join(', ')} missing`,
          });
        } else {
          res.status(500).send({
            created: false,
            message: 'We could not contact our services at this time?',
          });
        }
      });
  } catch (err) {
    Log(LoggingLevel.Error, err.message, err);
    res.status(400).send({
      created: false,
      message: 'An unexpected error occured',
    });
  }
};

const login = async (req, res) => {
  try {
    const User = UserFactory(LoginDb.connection);
    const user = await User.findByEmailOrUsername(req.body.credential);
    if (user) {
      user.comparePassword(req.body.password, (err) => {
        if (err) {
          Log(LoggingLevel.Error, err.message, err);
          res.status(403).send({ message: 'ncorrect Email/Password Entered' });
        } else {
          signJwt({ username: user.username, bucket: user.bucket })
            .then((token) => {
              Log(LoggingLevel.Info, 'hello');
              res.send({ success: true, token });
            })
            .catch((error) => {
              Log(LoggingLevel.Error, error.message, error);
              res.status(400).send({ success: false, message: 'unexpected error occured' });
            });
        }
      });
    } else {
      Log(LoggingLevel.Info, 'no log in :(');
      res.status(403).send({
        message: 'Incorrect Email/Password Entered',
      });
    }
  } catch (err) {
    Log(LoggingLevel.Error, err.message, err);
    res.status(403).send({
      message: 'Incorrect Email/Password Entered',
    });
  }
};

module.exports = Object.freeze({
  register,
  login,
});
