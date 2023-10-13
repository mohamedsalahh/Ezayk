const boom = require('@hapi/boom');

const Group = require('../models/group.model');
const userService = require('./user.service');
const { env } = require('../config/constants');
const { formatLink } = require('../utils/files-paths');
const { createJoinLinkToken } = require('../utils/create-tokens');

/**
 * Returns the public data of a group.
 * @async
 * @param {Object} group - The group object.
 * @returns {Promise<Object>}  A Promise that resolves with an object containing the public data of the group.
 */
exports.sanitizeGroup = async (group) => {
  await group.populate('admins', 'username email');
  await group.populate('members', 'username email');

  const sanitizedGroup = {
    id: group.id,
    name: group.name,
    imageUrl: group.imageUrl,
    members: group.members,
    admins: group.admins,
  };

  return sanitizedGroup;
};

/**
 * Creates a new group.
 * @async
 * @param {Object} group - The group object.
 * @param {Object} user - The user object.
 * @returns {Promise<Object|Error>} The updated user profile or an error if the group could not be created.
 */
exports.createGroup = async (group, user) => {
  const createdGroup = new Group({ name: group.name, members: [user.id], admins: [user.id] });

  user.groups.push(createdGroup.id);

  await user.save();
  await createdGroup.save();

  return userService.getUserProfile(user);
};

/**
 * Deletes a group.
 * @async
 * @param {Object} group - The group object.
 * @param {Object} user - The user object.
 * @returns {Promise<Object|Error>} The updated user profile or an error if the group could not be deleted.
 */
exports.deleteGroup = async (group, user) => {
  if (!this.isUserGroupAdmin(user, group)) {
    return boom.forbidden("You can't delete the group");
  }

  user.groups = user.groups.filter((id) => id != group.id);

  await Group.deleteOne({ _id: group.id });
  await user.save();

  return userService.getUserProfile(user);
};

/**
 * Returns the data of a group.
 * @async
 * @param {Object} group - The group object.
 * @param {Object} user - The user object.
 * @returns {Promise<Object|Error>} The public data of the group or an error if the user is not a member of the group.
 */
exports.getGroup = async (group, user) => {
  if (!this.isUserGroupMember(user, group)) {
    return boom.forbidden("You aren't a member in the group");
  }

  return await this.sanitizeGroup(group);
};

/**
 * Get groups data
 * @async
 * @param {Array} groups - An array of group objects.
 * @param {Object} user - A user object.
 * @returns {Promise<any[]>} - A promise that resolves to an array of group data.
 */
exports.getGroups = async (groups = [], user) => {
  const groupsData = await Promise.all(
    groups.map(async (group) => {
      if (!group) {
        return group;
      }
      return await this.getGroup(group, user);
    })
  );

  return groupsData;
};

/**
 * Creates a join link for a group.
 * @async
 * @param {Object} group - The group object.
 * @param {Object} user - The user object.
 * @returns {Promuse<string|Error>} - The join link or error if the user is not an admin of the group.
 */
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

/**
 * Adds members to a group.
 * @param {Object} group - The group to add members to.
 * @param {Object} user - The user adding members to the group.
 * @param {Object[]} users - The users to add to the group.
 * @returns {Promise<Object|Error>} - The profile of the user adding members to the group or error if the user is not an admin of the group.
 */
exports.addMembersToGroup = async (group, user, users) => {
  if (!this.isUserGroupAdmin(user, group)) {
    return boom.forbidden("You aren't allowed to add members to the group");
  }

  for (const user of users) {
    await userService.joinGroup(user, group);
  }

  return userService.getUserProfile(user);
};

/**
 * Adds an admin to a group.
 * @async
 * @param {Object} group - The group to add the admin to.
 * @param {Object} user - The user adding the admin.
 * @param {Object} admin - The user to add as an admin.
 * @returns {Promise<Object|Error>} The profile of the user or error if the user is not an admin of the group.
 */
exports.addAdminToGroup = async (group, user, admin) => {
  if (!this.isUserGroupAdmin(user, group)) {
    return boom.forbidden("You aren't allowed to add admin to the group");
  }

  if (this.isUserGroupAdmin(admin, group)) {
    return userService.getUserProfile(user);
  }

  if (!this.isUserGroupMember(admin, group)) {
    return boom.forbidden('The user should be a member in the group to be an admin');
  }

  group.admins.push(admin.id);

  await group.save();

  return userService.getUserProfile(user);
};

/**
 * Checks whether a user is an admin of a group.
 * @param {Object} user - The user object.
 * @param {Object} group - The group object.
 * @returns {boolean} - `true` if the user is an admin of the group, `false` otherwise.
 */
exports.isUserGroupAdmin = (user, group) => group.admins.includes(user.id);

/**
 * Checks whether a user is a member of a group.
 * @param {Object} user - The user object.
 * @param {Object} group - The group object.
 * @returns {boolean} - `true` if the user is member of the group, `false` otherwise.
 */
exports.isUserGroupMember = (user, group) => group.members.includes(user.id);
