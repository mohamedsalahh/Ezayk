const { body, param } = require('express-validator');

exports.createGroup = [
  body('groupName', 'Invalid group name').notEmpty().withMessage("Group name shouldn't be empty"),
];

exports.getGroup = [param('id').isMongoId().withMessage('Invalid groupId')];

exports.getGroups = [
  body('groups').isArray().withMessage('Should provide a list of valid IDs'),
  body('groups.*.id').isMongoId().withMessage('Some groups have invalid id'),
];

exports.deleteGroup = [param('id').isMongoId().withMessage('Invalid groupId')];

exports.createGroupJoinLink = [param('id').isMongoId().withMessage('Invalid groupId')];

exports.addMembersToGroup = [
  param('id').isMongoId().withMessage('Invalid groupId'),
  body('members.*.id').isMongoId().withMessage('Some users have invalid id'),
];

exports.addAdminToGroup = [
  param('id').isMongoId().withMessage('Invalid groupId'),
  body('adminId').isMongoId().withMessage('Invalid userId'),
];
