const { Schema } = require('mongoose');
const validator = require('validator').default;
const argon2 = require('argon2');
const { LoginDb } = require('../services/Database');

const { connection } = LoginDb;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    max: 30,
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
    type: String,
    required: true,
    trim: true,
    minlength: 1,
  },
  bucket: {
    type: String,
    required: true,
    trim: true,
  },
});

userSchema.virtual('confirmPassword')
  .set(function set(confirmPassword) {
    this.confirmPassword = confirmPassword;
  });

userSchema.virtual('password')
  .set(function set(password) {
    if (!validator.equals(password, this.confirmPassword)) {
      this.password = {
        error: new Error('passwords do not match'),
      };
    } else if (!validator.matches(password, /^(?=.{12,})(?=.*[a-zA-Z])(?=.*\d)(?=.*[!#$%&? "-]).*$/)) {
      this.password = {
        error: new Error(
          `password must be at least 12 characters long and have at least one lower case,
          upper case and special character`,
        ),
      };
    } else {
      this.password = password;
    }
  });

userSchema.pre('save', async function hash(next) {
  if (this.password.error) {
    next(this.password.error);
  } else {
    this.passwordHash = await argon2.hash(this.password);
    next();
  }
});

userSchema.methods = {
  async comparePassword(candidate, next) {
    const isMatch = await argon2.verify(this.passwordHash, candidate)
      .catch((err) => next(err));
    if (isMatch) {
      next();
    } else {
      next(new Error('Incorrect Email/Password Entered'));
    }
  },
};

const User = connection.model('User', userSchema);

module.exports = Object.freeze(User);
