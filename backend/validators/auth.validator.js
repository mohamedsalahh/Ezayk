const { body, check, oneOf, param } = require('express-validator');

const User = require('../models/user.model');
const { constants } = require('../config/constants');

exports.signup = [
  body('username', 'Invalid username')
    .exists()
    .withMessage('Username is required')
    .notEmpty()
    .withMessage("Username shouldn't be empty")
    .matches(constants.USERNAME_REGEX)
    .withMessage(
      'Username should only contain alphanumeric characters or hyphens, and connot begin or end with a hyphen'
    )
    .isLength({ max: 30 })
    .withMessage('Username shouldnot be more than 30 characters')
    .custom(async (value) => {
      try {
        const user = await User.findOne({ username: value });
        if (user) {
          return Promise.reject('Username already exists');
        }
      } catch (err) {
        return Promise.reject('Something went wrong');
      }
    }),
  body('email', 'Invalid e-mail')
    .exists()
    .withMessage('E-mail is required')
    .isEmail()
    .withMessage('Invalid e-mail')
    .custom(async (value) => {
      try {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject('E-Mail address already exists');
        }
      } catch (err) {
        return Promise.reject('Something went wrong');
      }
    }),
  body('password', 'Invalid password')
    .exists()
    .withMessage('Password is required')
    .isStrongPassword({ minLength: 4 })
    .withMessage(
      'Password must contain at least 4 characters, including at least one digit, one symbol, one uppercase letter, and one lowercase letter'
    ),
];

exports.login = [
  oneOf([
    check('email')
      .exists()
      .withMessage('Username/E-mail is required')
      .isEmail()
      .withMessage('E-mail not valid'),
    check('username').exists().withMessage('Username/E-mail is required'),
  ]),
  body('password').exists().withMessage('Password is required'),
];

module.exports.forgotPassword = [
  body('email', 'Invalid e-mail.')
    .exists()
    .withMessage('E-mail is required')
    .isEmail()
    .withMessage('Invalid e-mail'),
];

module.exports.resetPassword = [
  param('resetPasswordToken').isJWT().withMessage('Reset password token is not valid'),
  body('password', 'Invalid password.')
    .exists()
    .withMessage('Password is required')
    .isStrongPassword({ minLength: 4 })
    .withMessage(
      'Password must contain at least 4 characters, including at least one digit, one symbol, one uppercase letter, and one lowercase letter'
    ),
];
