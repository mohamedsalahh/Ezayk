const boom = require('@hapi/boom');
const jwt = require('jsonwebtoken');

const User = require('../models/user.model');
const Group = require('../models/group.model');
const groupService = require('./group.service');

exports.sanitizeUser = (user, includePrivatefields = false) => {
  if (!user) {
    return {};
  }

  const sanitizedUser = {
    id: user._id,
    username: user.username,
    name: user.name,
    email: user.email,
    imageUrl: user.imageUrl,
    isGroupsPrivate: user.isGroupsPrivate,
    groups: includePrivatefields || !user.isGroupsPrivate ? user.groups : [],
    isEmailConfirmed: includePrivatefields ? user.isEmailConfirmed : undefined,
  };

  return sanitizedUser;
};

exports.getUserProfile = (user) => {
  return this.sanitizeUser(user, true);
};

exports.getUserByUsername = async (username) => {
  const user = await User.findOne({ username }).select('-groups').lean({ virtuals: true });

  if (!user) {
    return boom.notFound('User not found');
  }

  return this.sanitizeUser(user);
};

exports.getUserById = async (userId) => {
  const user = await User.findById(userId).select('-groups').lean({ virtuals: true });

  if (!user) {
    return boom.notFound('User not found');
  }

  return this.sanitizeUser(user);
};

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

exports.joinGroup = async (user, group) => {
  const canUserJoin = this.canUserJoinGroup(user, group);
  if (canUserJoin instanceof Error) {
    return canUserJoin;
  }

  user.groups.push(group.id);
  group.members.push(user.id);

  await user.save();
  await group.save();

  return this.getUserProfile(user);
};

exports.joinGroupViaLink = async (user, token) => {
  let decodedToken;
  try {
    decodedToken = token && jwt.verify(token, env.GROUP_JOIN_LINK_TOKEN_SECRET);
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

exports.canUserJoinGroup = (user, group) => {
  const isGroupMember =
    group.members.some((id) => id == user.id) && user.groups.some((id) => id == group.id);

  if (isGroupMember) {
    return boom.forbidden('Already in the group', {
      user: this.sanitizeUser({}, user), // todo
    });
  }

  if (group.members.length >= 100) {
    return boom.forbidden('The group exceeds the members limit');
  }

  return true;
};

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

  return this.getUserProfile(user);
};
