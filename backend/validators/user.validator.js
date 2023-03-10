const { body, param } = require('express-validator');

const User = require('../models/user.model');

exports.getUser = [param('id', 'Invalid UserId').isMongoId()];

exports.updateUsername = [
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
];

exports.joinGroup = [body('groupId', 'Invalid groupId').isMongoId()];

exports.joinGroupViaLink = [body('token', 'Invalid join link').notEmpty()];

exports.leaveGroup = [body('groupId', 'Invalid groupId').isMongoId()];
