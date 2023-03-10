const User = require('../models/user.model');
const userService = require('../services/user.service');

exports.getProfile = async (req, res, next) => {
  const user = req.user;

  const userData = await userService.getProfile(user);

  return res.json({ data: { user: userData } });
};

exports.getUser = async (req, res, next) => {
  const user = req.user;
  const targetUserId = req.body.id;

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    return next(boom.notFound("Couldn't find the target user"));
  }

  const targetUserData = await userService.getUser(user, targetUser);

  res.json({ data: { user: targetUserData } });
};

exports.updateUsername = async (req, res, next) => {
  const user = req.user;
  const username = req.body.username;

  const userData = await userService.changeUsername(user, username);

  res.status(201).json({ data: { user: userData } });
};

exports.joinGroup = async (req, res, next) => {
  const user = req.user;
  const group = req.group;

  const UserData = await userService.joinGroup(user, group);
  if (UserData instanceof Error) {
    return next(UserData);
  }

  res.status(201).json({ data: { user: UserData } });
};

exports.joinGroupViaLink = async (req, res, next) => {
  const user = req.user;
  const token = req.body.token;

  const UserData = await userService.joinGroupViaLink(user, token);
  if (UserData instanceof Error) {
    return next(UserData);
  }

  res.status(201).json({ data: { user: UserData } });
};

exports.leaveGroup = async (req, res, next) => {
  const user = req.user;
  const group = req.group;

  const userData = await userService.leaveGroup(user, group);
  if (userData instanceof Error) {
    return next(userData);
  }

  res.status(201).json({ data: { user: userData } });
};
