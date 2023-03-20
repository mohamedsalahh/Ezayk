const { body, check, oneOf, param } = require('express-validator');
const validator = require('validator');

const User = require('../models/user.model');

exports.signup = [
  body('username', 'Invalid Username.')
    .exists()
    .withMessage('Username is required')
    .notEmpty()
    .withMessage("Username shouldn't be empty")
    .isLength({ min: 5 })
    .withMessage("Username shouldn't be less than 5 charcters")
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
  body('email', 'Invalid e-mail.')
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
  body('password', 'Invalid password.')
    .exists()
    .withMessage('Password is required')
    .isStrongPassword({ minLength: 5 })
    .withMessage(
      "Password shouldn't be less than 5 and at least has one digit, one symbol, one uppercase letter, and one lowercase letter"
    ),
];

exports.login = [
  oneOf([
    check('email')
      .exists()
      .withMessage('E-mail is required')
      .isEmail()
      .withMessage('E-mail not valid')
      .custom((value, { req }) => {
        if (validator.isEmail(value)) {
          req.isEmail = true;
        }
        return true;
      }),
    check('email')
      .exists()
      .withMessage('E-mail is required')
      .isLength({ min: 5 })
      .withMessage('Invalid username length'),
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
    .isStrongPassword({ minLength: 5 })
    .withMessage(
      "Password shouldn't be less than 5 and at least has one digit, one symbol, one uppercase letter, and one lowercase letter"
    ),
];
