const multer = require('multer');

const userService = require('../services/user.service');
const { constants } = require('../config/constants');

exports.getUsers = async (req, res, next) => {
  const usersData = await userService.getUsers(req.body);

  res.json(usersData);
};

exports.getUser = async (req, res, next) => {
  const user = req.user;
  const username = req.body.username;

  const targetUser =
    user?.username === username
      ? userService.getUserProfile(user)
      : await userService.getUserByUsername(username);
  if (targetUser instanceof Error) {
    return next(targetUser);
  }

  res.json({ user: targetUser });
};

exports.deleteUser = async (req, res, next) => {
  const user = req.user;

  await userService.deleteUser(user?.id);

  next();
};

exports.updateUser = async (req, res, next) => {
  const user = req.user;

  const newUserData = await userService.updateUser(user, req.body);

  res.json({ user: newUserData });
};

exports.updateUserProfileImage = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join('public', 'profiles-images'));
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

exports.getUserGroups = async (req, res, next) => {
  const user = req.user;

  const groupsData = await userService.getUserGroups(user, req.body);
  if (groupsData instanceof Error) {
    return next(groupsData);
  }

  res.json(groupsData);
};

exports.joinGroupViaLink = async (req, res, next) => {
  const user = req.user;
  const token = req.body.token;

  const UserData = await userService.joinGroupViaLink(user, token);
  if (UserData instanceof Error) {
    return next(UserData);
  }

  res.sendStatus(204);
};

exports.leaveGroup = async (req, res, next) => {
  const user = req.user;
  const groupId = req.groupId;

  const userData = await userService.leaveGroup(user, groupId);
  if (userData instanceof Error) {
    return next(userData);
  }

  res.sendStatus(204);
};
