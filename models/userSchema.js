/* eslint-disable no-underscore-dangle */
const { Schema } = require('mongoose');
const validator = require('validator').default;
const argon2 = require('argon2');
const { LoginDb } = require('../services/Database');
const { logger, LoggingLevel } = require('../utils/logger');

const { connection } = LoginDb;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    max: 30,
    validate(value) {
      if (!validator.isAlphanumeric(value)) {
        throw new Error('Only Alphanumeric characters for username');
      }
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('');
      }
    },
  },
  passwordHash: {
  },
  bucket: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
}, {
  writeConcern: {
    w: 'majority',
    j: true,
    wtimeout: 1000,
  },
});

userSchema.virtual('confirmPassword')
  .set(function set(value) {
    this._confirmPassword = value;
  });

userSchema.virtual('password')
  .set(function set(value) {
    if (!validator.equals(value, this._confirmPassword)) {
      throw new Error('passwords are not the same.');
    } else if (!validator.matches(value, /^(?=.{12,})(?=.*[a-zA-Z])(?=.*\d)(?=.*[!#$%&? "-]).*$/)) {
      throw new Error('passwords must contain at least 1 lower case, upper case and special character');
    } else {
      this._password = value;
    }
  });

userSchema.pre('save', async function hash(next) {
  try {
    this.passwordHash = await argon2.hash(this._password);
    next();
  } catch (err) {
    logger.Log(LoggingLevel.Error, err.message, err);
    next(err);
  }
});

userSchema.methods = {
  async comparePassword(candidate, next) {
    try {
      const isMatch = await argon2.verify(this.passwordHash, candidate);
      if (isMatch) {
        next();
      } else {
        next(new Error('Incorrect Email/Password Entered'));
      }
    } catch (err) {
      next(err);
    }
  },
};

userSchema.statics = {
  findByEmailOrUsername(credential) {
    if (validator.isEmail(credential)) {
      return this.findOne({ email: credential });
    }
    return this.findOne({ username: credential });
  },
};

const User = connection.model('User', userSchema);

module.exports = Object.freeze(User);
