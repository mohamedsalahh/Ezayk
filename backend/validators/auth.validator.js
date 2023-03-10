const { body } = require('express-validator');

const User = require('../models/user.model');

exports.signup = [
  body('username', 'Invalid Username.')
    .notEmpty()
    .withMessage("Username shouldn't be empty")
    .isLength({ min: 5, max: 50 })
    .withMessage("Username shouldn't be less than 5 or more than 50 charcters")
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
  body('email', 'Invalid email.')
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
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!#@$%]).{6,24}$/)
    .withMessage(
      "Password shouldn't be less than 6 or more than 24 and at least has one digit, special character, uppercase letter, and lowercase letter"
    ),
];
