const boom = require('@hapi/boom');
const jwt = require('jsonwebtoken');

const Group = require('../models/group.model');
const groupService = require('./group.service');

exports.getUserPublicData = (user, targetUser) => {
  const sanitizedUser = {
    id: targetUser.id,
    username: targetUser.username,
    email: targetUser.email,
    imageUrl: targetUser.imageUrl,
    isGroupsPrivate: targetUser.isGroupsPrivate,
    groups: user.id === targetUser.id || !targetUser.isGroupsPrivate ? targetUser.groups : [],
    isAdmin: user.id === targetUser.id ? targetUser.isAdmin : undefined,
  };

  return sanitizedUser;
};

exports.getProfile = async (user) => {
  await user.populate('groups');

  return this.getUserPublicData(user, user);
};

exports.getUser = async (user, targetUser) => {
  await targetUser.populate('groups');

  return this.getUserPublicData(user, targetUser);
};

exports.changeUsername = async (user, username) => {
  user.username = username;

  await user.save();

  return await this.getProfile(user);
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

  return await this.getProfile(user);
};

exports.joinGroupViaLink = async (user, token) => {
  const decodedToken = token && jwt.verify(token, env.EMAIL_TOKEN_SECRET);
  if (!decodedToken) {
    return boom.unauthorized('Invalid join link');
  }

  const group = Group.findById(decodedToken.groupId);
  if (!group || group?.joinLinkToken !== token) {
    return boom.unauthorized('Invalid join link');
  }

  const joinedData = await this.joinGroup(user, group);

  return joinedData;
};

exports.canUserJoinGroup = (user, group) => {
  const isGroupMember =
    group.members.some((id) => id.toString() === user.id) &&
    user.groups.some((id) => id.toString() === group.id);

  if (isGroupMember) {
    return boom.forbidden('Already in the group', {
      user: this.getUserPublicData({}, user),
    });
  }

  if (group.members.length >= 100) {
    return boom.forbidden('The group exceeds the members limit');
  }

  return true;
};

exports.leaveGroup = async (user, group) => {
  group.members = group.members.filter((id) => id.toString() !== user.id);
  group.admins = group.admins.filter((id) => id.toString() !== user.id);
  user.groups = user.groups.filter((id) => id.toString() !== group.id);

  if (groupService.isUserGroupAdmin(user, group) && !group.admins.length) {
    if (!group.members.length) {
      const userData = await groupService.deleteGroup(group, user);
      return userData;
    }

    group.admins.push(group.members[0]);
  }

  await user.save();
  await group.save();

  return await this.getProfile(user);
};
