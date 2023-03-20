const boom = require('@hapi/boom');
const multer = require('multer');

const Group = require('../models/group.model');
const User = require('../models/user.model');
const groupSevice = require('../services/group.service');
const { constants } = require('../config/constants');

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

  res.json({ data: { groups: groupsData.filter(Boolean) } });
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

exports.updateGroupImage = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/groups-images');
    },
    filename: (req, file, cb) => {
      cb(null, req.group.id + '.png');
    },
  }),
  fileFilter: (req, file, cb) => {
    if (
      (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') &&
      groupSevice.isUserGroupAdmin(req.user, req.group)
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  limits: { fileSize: constants.MAX_GROUP_IMAGE_FILE_SIZE },
});

exports.createGroupJoinLink = async (req, res, next) => {
  const user = req.user;
  const group = req.group;

  const joinLink = await groupSevice.createGroupJoinLink(group, user);
  if (joinLink instanceof Error) {
    return next(joinLink);
  }

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
    return next(boom.notFound('The admin id is invalid'));
  }

  const userData = await groupSevice.addAdminToGroup(group, user, admin);
  if (userData instanceof Error) {
    return next(userData);
  }

  res.json({ data: { user: userData } });
};
