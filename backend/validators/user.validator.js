const { body, param, query } = require('express-validator');

const User = require('../models/user.model');
const { constants } = require('../config/constants');

exports.getUsers = [
  query('q', 'Invalid query value').optional().isString(),
  query('skip').optional().isInt({ min: 0 }).withMessage('Invalid skip value'),
  query('limit').optional().isInt({ min: 0 }).withMessage('Invalid limit value'),
];

exports.getUser = [param('username', 'Invalid username').exists().notEmpty()];

exports.updateUser = [
  body('username', 'Invalid username')
    .optional()
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
  body('name', 'Invalid name. Please ensure that the name consists of alphabetic characters only')
    .optional()
    .matches(constants.NAME_REGEX),
  body('bio', 'invalid bio').optional().isString(),
  body('isGroupsPrivate', 'Invalid group privacy value').optional().isBoolean(),
];

exports.updateUserProfileImage = [param('username', 'Invalid username').exists().notEmpty()];

exports.joinGroupViaLink = [
  param('username', 'Invalid username').exists().notEmpty(),
  body('token', 'Invalid join link').exists().withMessage('Token is required').notEmpty().isJWT(),
];

exports.getUserGroups = [param('username', 'Invalid username').exists().notEmpty()];

exports.leaveGroup = [
  param('username', 'Invalid username').exists().notEmpty(),
  body('groupId', 'Invalid group id').exists().withMessage('Group id is required').isMongoId(),
];
