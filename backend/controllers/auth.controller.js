const User = require('../models/user.model');
const authService = require('../services/auth.service');
const userService = require('../services/user.service');
const redisClient = require('../config/redis');
const { env, constants } = require('../config/constants');

exports.signup = async (req, res, next) => {
  await authService.signup(req.body);

  next();
};

exports.login = async (req, res, next) => {
  const userTokens = await authService.login(req.body);

  if (userTokens instanceof Error) {
    return next(userTokens);
  }

  const {
    user,
    tokens: { accessToken, refreshToken },
  } = userTokens;

  res.cookie('refreshToken', refreshToken, {
    maxAge: constants.REFRESH_TOKEN_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: 'strict',
    secure: env.NODE_ENV !== 'development',
  });

  res.json({
    user,
    accessToken,
  });
};

exports.logout = async (req, res, next) => {
  const user = req.user;

  await redisClient.del(`refresh-token_${user.id}`);
  await redisClient.set(`BL-token_${user.id}`, req.accessToken);

  res.sendStatus(204);
};

exports.getAccessToken = async (req, res, next) => {
  const userId = req.userId;

  const user = await userService.getUserById(userId);
  if (user instanceof Error) {
    return next(user);
  }

  const { accessToken, refreshToken } = await authService.createTokens(userId);

  res.cookie('refreshToken', refreshToken, {
    maxAge: constants.REFRESH_TOKEN_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: 'strict',
    secure: env.NODE_ENV !== 'development',
  });

  res.json({
    accessToken,
    user,
  });
};

exports.sendConfirmationEmail = async (req, res, next) => {
  const user = req.user;

  await authService.sendConfirmationEmail(user);
  res.sendStatus(204);
};

exports.confirmUserEmail = async (req, res, next) => {
  const token = req.params.confirmationToken;

  const user = await authService.confirmUserEmail(token);
  if (user instanceof Error) {
    return next(user);
  }

  res.json({ user });
};

exports.forgotPassword = async (req, res, next) => {
  const email = req.body.email;

  const error = await authService.forgetPassword(email);
  if (error instanceof Error) {
    return next(error);
  }

  res.sendStatus(204);
};

exports.resetPassword = async (req, res, next) => {
  const token = req.body.resetPasswordToken;
  const password = req.body.password;

  const error = await authService.resetPassword(token, password);
  if (error instanceof Error) {
    return next(error);
  }

  res.sendStatus(204);
};
