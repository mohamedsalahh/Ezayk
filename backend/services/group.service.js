const boom = require('@hapi/boom');

const Group = require('../models/group.model');
const userService = require('./user.service');
const { env } = require('../config/constants');
const { formatLink } = require('../utils/files-paths');
const { createJoinLinkToken } = require('../utils/create-tokens');

exports.getGroupPublicData = (group) => {
  const sanitizedGroup = {
    id: group.id,
    name: group.name,
    imageUrl: group.imageUrl,
    members: group.members,
    admins: group.admins,
  };

  return sanitizedGroup;
};

exports.createGroup = async (group, user) => {
  const createdGroup = new Group({ name: group.name, members: [user.id], admins: [user.id] });

  user.groups.push(createdGroup.id);

  await user.save();
  await createdGroup.save();

  return await userService.getProfile(user);
};

exports.deleteGroup = async (group, user) => {
  if (!this.isUserGroupAdmin(user, group)) {
    return boom.forbidden("You can't delete the group");
  }

  user.groups = user.groups.filter((id) => id.toString() !== group.id);

  await Group.deleteOne({ _id: group.id });
  await user.save();

  return userService.getProfile(user);
};

exports.getGroup = async (group, user) => {
  if (!this.isUserGroupMember(user, group)) {
    return boom.forbidden("You aren't a member in the group");
  }

  await group.populate('members');
  await group.populate('admins');

  return this.getGroupPublicData(group);
};

exports.getGroups = async (groups = [], user) => {
  const groupsData = await Promise.all(
    groups.map(async (group) => {
      if (!group) {
        return boom.notFound("Some groups don't exist");
      }
      return await this.getGroup(group, user);
    })
  );

  return groupsData;
};

exports.createGroupJoinLink = async (group, user) => {
  if (!this.isUserGroupAdmin(user, group)) {
    return boom.forbidden("You aren't allowed to create a join link for the group");
  }

  const token = createJoinLinkToken(group.id);
  const link = formatLink(env.FRONTEND_URL, token);

  group.joinLinkToken = token;

  await group.save();

  return link;
};

exports.addMembersToGroup = async (group, user, users) => {
  if (!this.isUserGroupAdmin(user, group)) {
    return boom.forbidden("You aren't allowed to add members to the group");
  }

  let error;
  users.every(async (user) => {
    if (user) {
      const joinedData = await userService.joinGroup(user, group);
      if (joinedData instanceof Error) {
        error = joinedData;
        return false;
      }
    }

    return true;
  });

  if (error) {
    return error;
  }

  return await userService.getProfile(user);
};

exports.addAdminToGroup = async (group, user, admin) => {
  if (!this.isUserGroupAdmin(user, group)) {
    return boom.forbidden("You aren't allowed to add admin to the group");
  }

  if (this.isUserGroupAdmin(admin, group)) {
    return await userService.getProfile(user);
  }

  if (!this.isUserGroupMember(admin, group)) {
    return boom.forbidden('The user should be a member in the group to be an admin');
  }

  group.admins.push(admin.id);

  await group.save();

  return await userService.getProfile(user);
};

exports.isUserGroupAdmin = (user, group) => group.admins.some((id) => id.toString() === user.id);

exports.isUserGroupMember = (user, group) => group.members.some((id) => id.toString() === user.id);
