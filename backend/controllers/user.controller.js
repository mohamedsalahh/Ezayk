const multer = require('multer');

const User = require('../models/user.model');
const userService = require('../services/user.service');
const { constants } = require('../config/constants');

exports.getUsers = async (req, res, next) => {
  const users = await userService.getUsers(req.body);
  res.json({ data: users });
};

exports.getUser = async (req, res, next) => {
  const user = req.user;
  const targetUserId = req.body.id;

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    return next(boom.notFound("Couldn't find the user"));
  }

  const targetUserData = await userService.getUser(user, targetUser);

  res.json({ data: { user: targetUserData } });
};

exports.deleteUser = async (req, res, next) => {
  const targetUserId = req.body.id;

  await User.deleteOne({ _id: targetUserId });

  res.json({ message: 'Deleted successfully' });
};

exports.updateUsername = async (req, res, next) => {
  const user = req.user;
  const username = req.body.username;

  const userData = await userService.changeUsername(user, username);

  res.status(201).json({ data: { user: userData } });
};

exports.changeGroupsPrivacy = async (req, res, next) => {
  const user = req.user;
  const isGroupsPrivate = req.body.isGroupsPrivate;

  const userData = await userService.changeGroupsPrivacy(user, isGroupsPrivate);

  res.status(201).json({ data: { user: userData } });
};

exports.updateProfileImage = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/profiles-images');
    },
    filename: (req, file, cb) => {
      cb(null, req.user.id + '.png');
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  limits: { fileSize: constants.MAX_PROFILE_IMAGE_FILE_SIZE },
});

exports.joinGroup = async (req, res, next) => {
  const user = req.user;
  const group = req.group;

  const UserData = await userService.joinGroup(user, group);
  if (UserData instanceof Error) {
    return next(UserData);
  }

  res.json({ data: { user: UserData } });
};

exports.joinGroupViaLink = async (req, res, next) => {
  const user = req.user;
  const token = req.body.token;

  const UserData = await userService.joinGroupViaLink(user, token);
  if (UserData instanceof Error) {
    return next(UserData);
  }

  res.json({ data: { user: UserData } });
};

exports.leaveGroup = async (req, res, next) => {
  const user = req.user;
  const group = req.group;

  const userData = await userService.leaveGroup(user, group);
  if (userData instanceof Error) {
    return next(userData);
  }

  res.json({ data: { user: userData } });
};
