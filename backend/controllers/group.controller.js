const boom = require('@hapi/boom');

const Group = require('../models/group.model');
const User = require('../models/user.model');
const groupSevice = require('../services/group.service');

exports.createGroup = async (req, res, next) => {
  const user = req.user;
  const groupName = req.body.groupName;

  const userData = await groupSevice.createGroup({ name: groupName }, user);

  res.status(201).json({ data: { user: userData } });
};

exports.getGroup = async (req, res, next) => {
  const user = req.user;
  const group = req.group;

  const groupData = await groupSevice.getGroup(group, user);
  if (groupData instanceof Error) {
    return next(groupData);
  }

  res.json({ data: { group: groupData } });
};

exports.getGroups = async (req, res, next) => {
  const user = req.user;
  const groups = await Promise.all(
    req.body.groups.map(async (group) => {
      return await Group.findById(group.id);
    })
  );

  const groupsData = await groupSevice.getGroups(groups, user);

  let error;
  const isThereError = groupsData.some((group) => {
    if (group instanceof Error) {
      error = group;
      return true;
    }
  });

  if (isThereError) {
    return next(error);
  }

  res.json({ data: { groups: groupsData } });
};

exports.deleteGroup = async (req, res, next) => {
  const user = req.user;
  const group = req.group;

  const userData = await groupSevice.deleteGroup(group, user);
  if (userData instanceof Error) {
    return next(userData);
  }

  res.json({ data: { user: userData } });
};

exports.createGroupJoinLink = async (req, res, next) => {
  const user = req.user;
  const group = req.group;

  const joinLink = await groupSevice.createGroupJoinLink(group, user);

  res.json({ data: { joinLink } });
};

exports.addMembersToGroup = async (req, res, next) => {
  const user = req.user;
  const group = req.group;
  const members = await Promise.all(
    req.body.members.map(async (member) => {
      return await Group.findById(member.id);
    })
  );

  const userData = await groupSevice.addMembersToGroup(group, user, members);
  if (userData instanceof Error) {
    return next(userData);
  }

  res.json({ data: { user: userData } });
};

exports.addAdminToGroup = async (req, res, next) => {
  const user = req.user;
  const group = req.group;
  const adminId = req.body.adminId;

  const admin = await User.findById(adminId);
  if (!admin) {
    return next(boom.notFound('The admin id in invalid'));
  }

  const userData = await groupSevice.addAdminToGroup(group, user, admin);
  if (userData instanceof Error) {
    return next(userData);
  }

  res.json({ data: { user: userData } });
};
