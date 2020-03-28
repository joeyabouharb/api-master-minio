
const User = require('../models/userSchema');
const { logger, LoggingLevel } = require('../utils/logger');

function loginViewModel({ credential, password }) {
  return Boolean(credential && password);
}

const register = async (req, res) => {
  try {
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      confirmPassword: req.body.confirmPassword,
      password: req.body.password,
      bucket: `bucket${Math.random()}`, // to do create an actual bucket
    });
    await user.save();
    res.send({
      created: true,
    }).status(404);
  } catch (err) {
    logger.Log(LoggingLevel.Error, err.message, err);
    res.send({
      created: false,
    }).status(400);
  }
};

const login = async (req, res) => {
  if (!loginViewModel(req.body).isValid) {
    logger.Log(LoggingLevel.Warn, 'request body did not have any of the valid paramaters');
    res.send({ error: 'invalid request' }).status(400);
  } else {
    try {
      const user = await User.findByEmailOrUsername(req.body.credential);
      if (user) {
        user.comparePassword(req.body.password, (err) => {
          if (err) {
            res.send({ error: err.message }).status(403);
          } else {
            res.send({ success: true }).status(200);
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
  }
};

module.exports = Object.freeze({
  register,
  login,
});
