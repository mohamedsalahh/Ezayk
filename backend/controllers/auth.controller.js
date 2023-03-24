const { env, constants } = require('../config/constants');
const redisClient = require('../config/redis');
const authService = require('../services/auth.service');
const userService = require('../services/user.service');
const User = require('../models/user.model');

exports.signup = async (req, res, next) => {
  const user = await authService.signup(req.body);
  const userTokens = await authService.login(req.body);
  if (userTokens instanceof Error) {
    return next(userTokens);
  }

  const {
    tokens: { accessToken, refreshToken },
  } = userTokens;

  res.cookie('refreshToken', refreshToken, {
    maxAge: constants.REFRESH_TOKEN_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: 'strict',
    secure: env.NODE_ENV !== 'development',
  });

  res.status(201).json({
    message: 'Signed-up successfully',
    data: { user, accessToken },
  });
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
    message: 'Logged-in successfully',
    data: {
      user,
      accessToken,
    },
  });
};

exports.logout = async (req, res, next) => {
  await redisClient.del(`refresh-token_${req.userId}`);
  await redisClient.set(`BL-token_${req.userId}`, req.accessToken);

  res.json({ message: 'Logged-out successfully', data: { userId: req.userId } });
};

exports.getAccessToken = async (req, res, next) => {
  const { accessToken, refreshToken } = await authService.createTokens(req.userId);
  const user = await User.findById(req.userId);

  res.cookie('refreshToken', refreshToken, {
    maxAge: constants.REFRESH_TOKEN_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: 'strict',
    secure: env.NODE_ENV !== 'development',
  });

  res.json({
    message: 'Access token generated successfully',
    data: { accessToken, user: await userService.getProfile(user) },
  });
};

exports.sendConfirmationEmail = async (req, res, next) => {
  await authService.sendConfirmationEmail(req.user);
  res.sendStatus(204);
};

exports.confirmUserEmail = async (req, res, next) => {
  const token = req.params.confirmationToken;

  const user = await authService.confirmUserEmail(token);
  if (user instanceof Error) {
    return next(user);
  }

  res.json({ dtat: { user } });
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
