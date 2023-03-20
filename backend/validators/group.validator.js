const { body, param } = require('express-validator');

exports.createGroup = [
  body('groupName', 'Invalid group name')
    .exists()
    .withMessage('Group name is required')
    .notEmpty()
    .withMessage("Group name shouldn't be empty"),
];

exports.getGroup = [
  param('id')
    .exists()
    .withMessage('Group ID is required')
    .isMongoId()
    .withMessage('Invalid group ID'),
];

exports.getGroups = [
  body('groups')
    .exists()
    .withMessage('Groups list is required')
    .isArray()
    .withMessage('Should provide a list of valid IDs'),
  body('groups.*.id').isMongoId().withMessage('Some groups have invalid ID'),
];

exports.deleteGroup = [
  param('id')
    .exists()
    .withMessage('Group ID is required')
    .isMongoId()
    .withMessage('Invalid group ID'),
];

exports.createGroupJoinLink = [
  param('id')
    .exists()
    .withMessage('Group ID is required')
    .isMongoId()
    .withMessage('Invalid group ID'),
];

exports.updateGroupImage = [
  param('id')
    .exists()
    .withMessage('Group ID is required')
    .isMongoId()
    .withMessage('Invalid group ID'),
];

exports.addMembersToGroup = [
  param('id')
    .exists()
    .withMessage('Group ID is required')
    .isMongoId()
    .withMessage('Invalid group ID'),
  body('members')
    .exists()
    .withMessage('Memebers list is required')
    .isArray()
    .withMessage('Should provide a list of valid IDs'),
  body('members.*.id').isMongoId().withMessage('Some members have invalid ID'),
];

exports.addAdminToGroup = [
  param('id')
    .exists()
    .withMessage('Group ID is required')
    .isMongoId()
    .withMessage('Invalid group ID'),
  body('adminId')
    .exists()
    .withMessage('Admin ID is required')
    .isMongoId()
    .withMessage('Invalid admin ID'),
];
