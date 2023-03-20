const { body, param, query } = require('express-validator');

const User = require('../models/user.model');

exports.getUsers = [
  query('username').optional().isString().withMessage('Invalid query'),
  query('skip').optional().isInt({ min: 0 }).withMessage('Invalid skip'),
  query('limit').optional().isInt({ min: 0 }).withMessage('Invalid limit'),
];

exports.getUser = [
  param('id', 'Invalid user ID').exists().withMessage('User ID is required').isMongoId(),
];

exports.deleteUser = [
  param('id', 'Invalid user ID').exists().withMessage('User ID is required').isMongoId(),
];

exports.updateUsername = [
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
];

exports.changeGroupsPrivacy = [
  body('isGroupsPrivate')
    .exists()
    .withMessage('Group privacy is required')
    .isBoolean()
    .withMessage('Invalid group privacy value'),
];

exports.joinGroup = [
  body('groupId', 'Invalid group ID').exists().withMessage('Group ID is required').isMongoId(),
];

exports.joinGroupViaLink = [
  body('token', 'Invalid join link').exists().withMessage('Token is required').notEmpty().isJWT(),
];

exports.leaveGroup = [
  body('groupId', 'Invalid group ID').exists().withMessage('Group ID is required').isMongoId(),
];
