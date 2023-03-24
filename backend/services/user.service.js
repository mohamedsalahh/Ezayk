const boom = require('@hapi/boom');
const jwt = require('jsonwebtoken');

const User = require('../models/user.model');
const Group = require('../models/group.model');
const groupService = require('./group.service');

/**
 * Returns the public data of a user.
 * @async
 * @param {Object} user - The user object.
 * @param {Object} targetUser - The target user object.
 * @returns {Promise<Object>} - A Promise that resolves with an object containing the public data of the user.
 */
exports.sanitizeUser = async (user, targetUser) => {
  await user.populate('groups', 'name');

  const sanitizedUser = {
    id: targetUser.id,
    username: targetUser.username,
    email: targetUser.email,
    isEmailConfirmed: user.id == targetUser.id ? targetUser.isEmailConfirmed : undefined,
    imageUrl: targetUser.imageUrl,
    isGroupsPrivate: targetUser.isGroupsPrivate,
    groups: user.id == targetUser.id || !targetUser.isGroupsPrivate ? targetUser.groups : [],
    isAdmin: user.id == targetUser.id ? targetUser.isAdmin : undefined,
  };

  return sanitizedUser;
};

/**
 * Returns the profile data of a user.
 * @async
 * @param {Object} user - The user object.
 * @returns {Promise<Object>} - A Promise that resolves with an object containing the profile data of the user.
 */
exports.getProfile = async (user) => {
  return await this.sanitizeUser(user, user);
};

/**
 * Returns the data of a user.
 * @async
 * @param {Object} user - The user object.
 * @param {Object} targetUser - The target user object.
 * @returns {Promise<Object>} - A Promise that resolves with an object containing the public data of the user.
 */
exports.getUser = async (user, targetUser) => {
  return await this.sanitizeUser(user, targetUser);
};

/**
 * Get users.
 * @async
 * @param {Object} options - The query object.
 * @param {string} query.username - The username to search for.
 * @param {number} query.skip - The number of documents to skip.
 * @param {number} query.limit - The maximum number of documents to return.
 * @returns {Promise<Object>} The users and total.
 */
exports.getUsers = async ({ username, skip, limit }) => {
  const query = {};

  if (username) {
    query.username = { $regex: username, $options: 'x' };
  }
  const total = await User.countDocuments(query);
  if (total < 1) {
    return { users: [], total };
  }

  const users = await User.find(query)
    .skip(skip || 0)
    .limit(limit || 10)
    .select('username email')
    .lean({ virtuals: true });

  return { users, total };
};

/**
 * Changes the username of a user.
 * @async
 * @param {Object} user - The user object.
 * @param {string} username - The new username.
 * @returns {Promise<Object>} The updated user profile.
 */
exports.changeUsername = async (user, username) => {
  user.username = username;

  await user.save();

  return await this.getProfile(user);
};

/**
 * Changes the privacy of user groups.
 * @async
 * @param {Object} user - The user object.
 * @param {boolean} isGroupsPrivate - The privacy status of the user groups.
 * @returns {Promise<Object>} - The updated user profile.
 */
exports.changeGroupsPrivacy = async (user, isGroupsPrivate) => {
  user.isGroupsPrivate = isGroupsPrivate;

  await user.save();

  return await this.getProfile(user);
};

/**
 * Joins a user to a group.
 * @async
 * @param {Object} user - The user object.
 * @param {Object} group - The group object.
 * @returns {Promise<Object|Error>} The updated user profile or an error if the user cannot join the group.
 */
exports.joinGroup = async (user, group) => {
  const canUserJoin = this.canUserJoinGroup(user, group);
  if (canUserJoin instanceof Error) {
    return canUserJoin;
  }

  user.groups.push(group.id);
  group.members.push(user.id);

  await user.save();
  await group.save();

  return await this.getProfile(user);
};

/**
 * Joins a user to a group via a join link.
 * @async
 * @param {Object} user - The user object.
 * @param {string} token - The join link token.
 * @returns {Promise<Object|Error>} The updated user profile or an error if the join link is invalid.
 */
exports.joinGroupViaLink = async (user, token) => {
  let decodedToken;
  try {
    decodedToken = token && jwt.verify(token, env.EMAIL_TOKEN_SECRET);
  } catch (err) {
    return boom.badRequest('Invalid join link');
  }

  if (!decodedToken) {
    return boom.badRequest('Invalid join link');
  }

  const group = Group.findById(decodedToken.groupId);
  if (!group || group?.joinLinkToken !== token) {
    return boom.badRequest('Invalid join link');
  }

  return await this.joinGroup(user, group);
};

/**
 * Checks if a user can join a group.
 * @param {Object} user - The user object.
 * @param {Object} group - The group object.
 * @returns {boolean|Error} True if the user can join the group, or an error if the user cannot join the group.
 */
exports.canUserJoinGroup = (user, group) => {
  const isGroupMember =
    group.members.some((id) => id == user.id) && user.groups.some((id) => id == group.id);

  if (isGroupMember) {
    return boom.forbidden('Already in the group', {
      user: this.sanitizeUser({}, user),
    });
  }

  if (group.members.length >= 100) {
    return boom.forbidden('The group exceeds the members limit');
  }

  return true;
};

/**
 * Removes a user from a group.
 * @async
 * @param {Object} user - The user object.
 * @param {Object} group - The group object.
 * @returns {Promise<Object|Error>} The updated user profile or an error.
 */
exports.leaveGroup = async (user, group) => {
  if (groupService.isUserGroupAdmin(user, group) && group.admins.length === 1) {
    if (group.members.length === 1) {
      return await groupService.deleteGroup(group, user);
    }

    group.admins.push(group.members[0]);
  }

  group.members = group.members.filter((id) => id != user.id);
  group.admins = group.admins.filter((id) => id != user.id);
  user.groups = user.groups.filter((id) => id != group.id);

  await user.save();
  await group.save();

  return await this.getProfile(user);
};
